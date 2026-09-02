-- ═══════════════════════════════════════════════════════════════
-- CKA BuildStruct — database schema
-- Target: PostgreSQL 15+ / Supabase
--
-- Run order: extensions → enums → tables → indexes → RLS → seed.
-- Everything is idempotent, so it is safe to re-run during setup.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";      -- fuzzy product search

-- ── enums ──────────────────────────────────────────────────────
do $$ begin
  create type stock_status  as enum ('in_stock','low_stock','on_order','out_of_stock','rate_on_request');
  create type quote_status  as enum ('draft','submitted','bidding','quoted','confirmed','delivered','cancelled');
  create type payment_pref  as enum ('bank_transfer','jazzcash','easypaisa','cod','credit_terms');
  create type project_status as enum ('received','under_review','estimating','quoted','awarded','in_progress','completed','archived');
  create type file_kind     as enum ('boq','drawing_dwg','drawing_pdf','architectural','structural','image','document','archive');
  create type user_role     as enum ('admin','staff','supplier','customer');
exception when duplicate_object then null; end $$;

-- ── people ─────────────────────────────────────────────────────
-- Supabase owns auth.users; this mirrors the app-level profile.
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role   not null default 'customer',
  full_name     text        not null,
  company       text,
  phone         text,
  email         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists suppliers (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid references profiles(id) on delete set null,
  company_name    text not null,
  contact_person  text,
  phone           text,
  email           text,
  address         text,
  city            text,
  rating          numeric(2,1) check (rating between 0 and 5),
  is_verified     boolean not null default false,
  verified_at     timestamptz,
  reliability_pct smallint check (reliability_pct between 0 and 100),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── catalogue ──────────────────────────────────────────────────
-- Self-referencing so a subcategory is just a category with a parent.
-- One table, arbitrary depth, no schema change when the tree grows.
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references categories(id) on delete restrict,
  slug          text not null unique,
  name          text not null,
  description   text,
  display_order smallint not null default 0,
  is_active     boolean  not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  sku            text unique,                       -- maps to the Excel "Product ID"
  category_id    uuid not null references categories(id) on delete restrict,
  supplier_id    uuid references suppliers(id) on delete set null,
  name           text not null,
  brand          text,
  description    text,
  unit           text not null,                     -- per bag, per ton, per cft…
  price          numeric(12,2) not null check (price >= 0),
  old_price      numeric(12,2) check (old_price >= 0),
  price_min      numeric(12,2),                     -- market range low
  price_max      numeric(12,2),                     -- market range high
  stock          stock_status not null default 'in_stock',
  specifications jsonb not null default '{}'::jsonb,
  tags           text[] not null default '{}',
  is_featured    boolean not null default false,
  display_order  smallint not null default 0,
  is_active      boolean not null default true,
  rating         numeric(2,1) check (rating between 0 and 5),
  order_count    integer not null default 0,
  price_checked_at timestamptz,                     -- drives "rates verified today"
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint price_range_ordered check (price_min is null or price_max is null or price_min <= price_max)
);

-- Quality / class options (Grade 60, First Class, OPC, PN16…).
-- A separate table because each option can carry its own price delta.
create table if not exists product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  label         text not null,                      -- "Grade 60", "Awwal"
  grade         text,
  size          text,                               -- 4", 16 mm, 63 mm
  price_delta   numeric(12,2) not null default 0,
  stock         stock_status not null default 'in_stock',
  display_order smallint not null default 0,
  is_default    boolean not null default false,
  unique (product_id, label)
);

-- Multiple images per product: position 0 is the main image.
create table if not exists product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  url           text not null,
  alt           text,
  position      smallint not null default 0,
  unique (product_id, position)
);

-- ── quotations ─────────────────────────────────────────────────
create table if not exists quotes (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique,              -- CKA-Q-2026-0001
  customer_id    uuid references profiles(id) on delete set null,
  contact_name   text not null,                     -- kept for guest baskets
  contact_phone  text not null,
  contact_email  text,
  delivery_city  text,
  delivery_address text,
  status         quote_status not null default 'submitted',
  payment_pref   payment_pref,
  subtotal       numeric(14,2) not null default 0,
  notes          text,
  submitted_at   timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Price and name are copied in, not joined. A quotation must still read
-- correctly in two years even if the product is renamed or delisted.
create table if not exists quote_items (
  id            uuid primary key default gen_random_uuid(),
  quote_id      uuid not null references quotes(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  variant_id    uuid references product_variants(id) on delete set null,
  name_snapshot text not null,
  unit_snapshot text not null,
  unit_price    numeric(12,2) not null,
  quantity      numeric(12,2) not null check (quantity > 0),
  line_total    numeric(14,2) generated always as (unit_price * quantity) stored
);

create table if not exists supplier_bids (
  id           uuid primary key default gen_random_uuid(),
  quote_id     uuid not null references quotes(id) on delete cascade,
  supplier_id  uuid not null references suppliers(id) on delete cascade,
  rate         numeric(12,2) not null check (rate >= 0),
  delivery_days smallint,
  terms        text,
  is_awarded   boolean not null default false,
  placed_at    timestamptz not null default now(),
  unique (quote_id, supplier_id, placed_at)
);

-- ── projects ───────────────────────────────────────────────────
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,               -- CKA-P-00001
  customer_id   uuid references profiles(id) on delete set null,
  client_name   text not null,
  company       text,
  email         text,
  phone         text not null,
  project_name  text,
  project_type  text,                               -- residential / commercial / infrastructure
  location      text,
  budget_min    numeric(14,2),
  budget_max    numeric(14,2),
  expected_completion date,
  scope         text,
  notes         text,
  status        project_status not null default 'received',
  assigned_to   uuid references profiles(id) on delete set null,
  progress_pct  smallint not null default 0 check (progress_pct between 0 and 100),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- One table for every upload, whatever it is attached to.
-- storage_path is the object key; the bucket is swappable, so moving
-- from Supabase Storage to S3 or Cloudinary never touches this schema.
create table if not exists project_files (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  quote_id      uuid references quotes(id) on delete cascade,
  kind          file_kind not null,
  original_name text not null,
  storage_bucket text not null default 'project-uploads',
  storage_path  text not null,
  mime_type     text,
  size_bytes    bigint check (size_bytes >= 0),
  uploaded_by   uuid references profiles(id) on delete set null,
  uploaded_at   timestamptz not null default now(),
  constraint attached_to_something check (project_id is not null or quote_id is not null)
);

create table if not exists inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  subject     text,
  message     text not null,
  source      text not null default 'contact_form',
  is_handled  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Editable homepage copy, so marketing changes never need a deploy.
create table if not exists site_content (
  key         text primary key,                     -- hero.headline, hero.tagline…
  value       jsonb not null,
  updated_by  uuid references profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- ── indexes ────────────────────────────────────────────────────
create index if not exists idx_products_category on products(category_id) where is_active;
create index if not exists idx_products_supplier on products(supplier_id);
create index if not exists idx_products_featured on products(is_featured) where is_active;
create index if not exists idx_products_search   on products using gin (name gin_trgm_ops);
create index if not exists idx_products_tags     on products using gin (tags);
create index if not exists idx_variants_product  on product_variants(product_id);
create index if not exists idx_images_product    on product_images(product_id);
create index if not exists idx_quote_items_quote on quote_items(quote_id);
create index if not exists idx_bids_quote        on supplier_bids(quote_id, rate);
create index if not exists idx_quotes_status     on quotes(status, submitted_at desc);
create index if not exists idx_projects_status   on projects(status, created_at desc);
create index if not exists idx_files_project     on project_files(project_id);
create index if not exists idx_categories_parent on categories(parent_id, display_order);

-- ── updated_at maintenance ─────────────────────────────────────
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['profiles','suppliers','products','quotes','projects'] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on %1$s;
       create trigger trg_touch_%1$s before update on %1$s
       for each row execute function touch_updated_at();', t);
  end loop;
end $$;

-- ── row level security ─────────────────────────────────────────
-- This is the part that makes an admin dashboard actually secure:
-- the rules live in the database, not in the JavaScript. A tampered
-- client still cannot read or write what these policies forbid.

alter table profiles        enable row level security;
alter table suppliers       enable row level security;
alter table categories      enable row level security;
alter table products        enable row level security;
alter table product_variants enable row level security;
alter table product_images  enable row level security;
alter table quotes          enable row level security;
alter table quote_items     enable row level security;
alter table supplier_bids   enable row level security;
alter table projects        enable row level security;
alter table project_files   enable row level security;
alter table inquiries       enable row level security;
alter table site_content    enable row level security;

create or replace function is_staff() returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$ language sql security definer stable;

-- Catalogue is world-readable, staff-writable.
do $$
declare t text;
begin
  foreach t in array array['categories','products','product_variants','product_images'] loop
    execute format('drop policy if exists "public read %1$s" on %1$s;
      create policy "public read %1$s" on %1$s for select using (true);', t);
    execute format('drop policy if exists "staff write %1$s" on %1$s;
      create policy "staff write %1$s" on %1$s for all using (is_staff()) with check (is_staff());', t);
  end loop;
end $$;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for select using (id = auth.uid() or is_staff());

drop policy if exists "own quotes" on quotes;
create policy "own quotes" on quotes
  for select using (customer_id = auth.uid() or is_staff());
drop policy if exists "create quotes" on quotes;
create policy "create quotes" on quotes for insert with check (true);

drop policy if exists "own projects" on projects;
create policy "own projects" on projects
  for select using (customer_id = auth.uid() or is_staff());
drop policy if exists "create projects" on projects;
create policy "create projects" on projects for insert with check (true);

drop policy if exists "staff read inquiries" on inquiries;
create policy "staff read inquiries" on inquiries for select using (is_staff());
drop policy if exists "anyone can enquire" on inquiries;
create policy "anyone can enquire" on inquiries for insert with check (true);

drop policy if exists "public read content" on site_content;
create policy "public read content" on site_content for select using (true);
drop policy if exists "staff write content" on site_content;
create policy "staff write content" on site_content
  for all using (is_staff()) with check (is_staff());

-- project_files: anyone can attach a file to a project/quote they're submitting;
-- only staff (or the owning customer, once auth exists) can read them back.
drop policy if exists "create project files" on project_files;
create policy "create project files" on project_files for insert with check (true);
drop policy if exists "read project files" on project_files;
create policy "read project files" on project_files for select using (
  is_staff()
  or project_id in (select id from projects where customer_id = auth.uid())
  or quote_id   in (select id from quotes   where customer_id = auth.uid())
);

-- quote_items: follows the parent quote — anyone can add lines while building
-- a basket/quotation; only the owning customer or staff can read them back.
drop policy if exists "create quote items" on quote_items;
create policy "create quote items" on quote_items for insert with check (true);
drop policy if exists "read quote items" on quote_items;
create policy "read quote items" on quote_items for select using (
  is_staff() or quote_id in (select id from quotes where customer_id = auth.uid())
);

-- supplier_bids: bids are shown on the public tender board (read), but only
-- staff or the bidding supplier's own linked profile may write one — this is
-- ready for when supplier accounts/bid submission ships; not wired yet.
drop policy if exists "public read bids" on supplier_bids;
create policy "public read bids" on supplier_bids for select using (true);
drop policy if exists "supplier write own bids" on supplier_bids;
create policy "supplier write own bids" on supplier_bids for all
  using (is_staff() or supplier_id in (select id from suppliers where profile_id = auth.uid()))
  with check (is_staff() or supplier_id in (select id from suppliers where profile_id = auth.uid()));

-- ── convenience view for the catalogue front end ───────────────
create or replace view v_catalogue as
select
  p.id, p.sku, p.name, p.brand, p.unit, p.price, p.old_price,
  p.price_min, p.price_max, p.stock, p.is_featured, p.display_order,
  p.rating, p.order_count, p.specifications, p.tags, p.price_checked_at,
  c.slug  as category_slug,
  c.name  as category_name,
  pc.name as parent_category,
  s.company_name as supplier_name,
  s.is_verified  as supplier_verified,
  coalesce((select url from product_images i
            where i.product_id = p.id order by i.position limit 1), null) as main_image,
  coalesce((select jsonb_agg(jsonb_build_object('url', i.url, 'alt', i.alt) order by i.position)
            from product_images i where i.product_id = p.id), '[]'::jsonb) as images,
  coalesce((select jsonb_agg(jsonb_build_object('label', v.label, 'grade', v.grade,
              'size', v.size, 'price_delta', v.price_delta, 'stock', v.stock)
              order by v.display_order)
            from product_variants v where v.product_id = p.id), '[]'::jsonb) as variants
from products p
join categories c        on c.id  = p.category_id
left join categories pc  on pc.id = c.parent_id
left join suppliers s    on s.id  = p.supplier_id
where p.is_active;

-- ═══════════════════════════════════════════════════════════════
-- Phase 2 — content & marketplace tables
-- Added ahead of first deploy so the whole schema goes live in one
-- run. Same conventions as above: idempotent, RLS everywhere, public
-- read / staff write unless noted.
-- ═══════════════════════════════════════════════════════════════

-- ── shipping / MOQ on the existing catalogue ──────────────────────
-- Per-product because rules genuinely differ by supplier and by SKU
-- (bagged cement vs a water tank), not just by category.
alter table products add column if not exists moq               numeric(12,2);
alter table products add column if not exists moq_unit          text;
alter table products add column if not exists delivery_fee      numeric(12,2);
alter table products add column if not exists delivery_fee_note text;
alter table products add column if not exists delivery_locations text[] not null default '{}';
alter table products add column if not exists delivery_eta_days smallint;
alter table products add column if not exists ships_nationwide  boolean not null default true;

-- ── client feedback & stories ──────────────────────────────────────
create table if not exists testimonials (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null,
  role_title    text,                              -- "Project owner", "Site engineer"…
  project_or_company text,
  rating        smallint check (rating between 1 and 5),
  quote         text not null,
  avatar_url    text,
  is_featured   boolean not null default false,
  display_order smallint not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── FAQs ─────────────────────────────────────────────────────────
create table if not exists faqs (
  id            uuid primary key default gen_random_uuid(),
  topic         text not null default 'general',    -- materials, delivery, design, bidding…
  question      text not null,
  answer        text not null,
  display_order smallint not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── daily updates / news ────────────────────────────────────────────
create table if not exists daily_updates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text not null,
  category      text not null default 'announcement', -- price_update, market, supplier, material, project, tip, engineering, design_trend, announcement
  cover_image_url text,
  author_id     uuid references profiles(id) on delete set null,
  is_published  boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── design services marketplace ───────────────────────────────────
-- Kept separate from the material catalogue: different shape (a
-- service with packages and a provider, not a stocked SKU).
create table if not exists design_services (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,                    -- Architectural Design, 3D Visualization…
  description     text,
  cover_image_url text,
  starting_price  numeric(12,2),
  price_unit      text,                              -- per sq ft, per drawing, per project
  provider_id     uuid references suppliers(id) on delete set null,  -- designer / design firm
  display_order   smallint not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists design_packages (
  id                uuid primary key default gen_random_uuid(),
  design_service_id uuid not null references design_services(id) on delete cascade,
  name              text not null,                   -- Basic, Standard, Premium
  description       text,
  price             numeric(12,2),
  price_unit        text,
  display_order     smallint not null default 0
);

create table if not exists design_service_images (
  id                uuid primary key default gen_random_uuid(),
  design_service_id uuid not null references design_services(id) on delete cascade,
  url               text not null,
  alt               text,
  position          smallint not null default 0,
  unique (design_service_id, position)
);

-- ── supplier media (company / product / project photos & video) ────
create table if not exists supplier_media (
  id            uuid primary key default gen_random_uuid(),
  supplier_id   uuid not null references suppliers(id) on delete cascade,
  kind          text not null default 'company',      -- company, product, project, video
  url           text not null,
  caption       text,
  position      smallint not null default 0,
  created_at    timestamptz not null default now()
);

-- ── indexes ──────────────────────────────────────────────────────
create index if not exists idx_testimonials_active   on testimonials(is_active, display_order);
create index if not exists idx_faqs_active            on faqs(is_active, topic, display_order);
create index if not exists idx_daily_updates_pub      on daily_updates(is_published, published_at desc);
create index if not exists idx_design_services_active on design_services(is_active, display_order);
create index if not exists idx_design_packages_svc    on design_packages(design_service_id);
create index if not exists idx_design_images_svc      on design_service_images(design_service_id);
create index if not exists idx_supplier_media_supplier on supplier_media(supplier_id, kind);

-- ── updated_at maintenance for the new tables ─────────────────────
do $$
declare t text;
begin
  foreach t in array array['testimonials','faqs','daily_updates','design_services'] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on %1$s;
       create trigger trg_touch_%1$s before update on %1$s
       for each row execute function touch_updated_at();', t);
  end loop;
end $$;

-- ── row level security ─────────────────────────────────────────────
alter table testimonials         enable row level security;
alter table faqs                 enable row level security;
alter table daily_updates        enable row level security;
alter table design_services      enable row level security;
alter table design_packages      enable row level security;
alter table design_service_images enable row level security;
alter table supplier_media       enable row level security;

drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (is_active or is_staff());
drop policy if exists "staff write testimonials" on testimonials;
create policy "staff write testimonials" on testimonials for all using (is_staff()) with check (is_staff());

drop policy if exists "public read faqs" on faqs;
create policy "public read faqs" on faqs for select using (is_active or is_staff());
drop policy if exists "staff write faqs" on faqs;
create policy "staff write faqs" on faqs for all using (is_staff()) with check (is_staff());

drop policy if exists "public read daily_updates" on daily_updates;
create policy "public read daily_updates" on daily_updates for select using (is_published or is_staff());
drop policy if exists "staff write daily_updates" on daily_updates;
create policy "staff write daily_updates" on daily_updates for all using (is_staff()) with check (is_staff());

do $$
declare t text;
begin
  foreach t in array array['design_services','design_packages','design_service_images'] loop
    execute format('drop policy if exists "public read %1$s" on %1$s;
      create policy "public read %1$s" on %1$s for select using (true);', t);
    execute format('drop policy if exists "staff write %1$s" on %1$s;
      create policy "staff write %1$s" on %1$s for all using (is_staff()) with check (is_staff());', t);
  end loop;
end $$;

-- Supplier media: the supplier can manage their own listing; staff can manage any.
drop policy if exists "public read supplier_media" on supplier_media;
create policy "public read supplier_media" on supplier_media for select using (true);
drop policy if exists "supplier manage own media" on supplier_media;
create policy "supplier manage own media" on supplier_media for all
  using (is_staff() or supplier_id in (select id from suppliers where profile_id = auth.uid()))
  with check (is_staff() or supplier_id in (select id from suppliers where profile_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- Storage — project-uploads bucket (BOQs, drawings, images attached
-- to a project or quote). Public bucket, but only reachable by exact
-- object path — nothing is listable, so this is fine for uploads
-- submitted through a public form with no login yet.
-- ═══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('project-uploads', 'project-uploads', true)
on conflict (id) do nothing;

drop policy if exists "public upload project-uploads" on storage.objects;
create policy "public upload project-uploads" on storage.objects for insert
  with check (bucket_id = 'project-uploads');

drop policy if exists "public read project-uploads" on storage.objects;
create policy "public read project-uploads" on storage.objects for select
  using (bucket_id = 'project-uploads');
