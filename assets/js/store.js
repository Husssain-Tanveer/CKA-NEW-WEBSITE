/* ═══════════════════════════════════════════════════════════════
   CKA BuildStruct — store.js
   The only file that knows where data comes from.

   Everything else (app.js, admin.js) calls CKAStore and never touches
   localStorage, fetch, or a database client directly. Swapping the
   backend is therefore a one-line change at the bottom of this file,
   not a refactor of the application.

       CKAStore.products.list()        → Promise<Product[]>
       CKAStore.products.save(p)       → Promise<Product>
       CKAStore.products.remove(id)    → Promise<void>
       CKAStore.products.replaceAll(a) → Promise<void>
       CKAStore.categories.list()      → Promise<Category[]>
       CKAStore.files.upload(file, meta)→ Promise<{path,url,size}>
       CKAStore.projects.create(p)     → Promise<Project>   (reference is generated here)
       CKAStore.projects.list()        → Promise<Project[]> (admin use)
       CKAStore.inquiries.create(i)    → Promise<Inquiry>   (contact form)

   Two implementations ship here:
     LocalStore     — works today, no backend, browser storage
     SupabaseStore  — stubbed against db/schema.sql, ready to enable
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  const DRAFT_KEY = "cka-catalogue-draft-v1";
  const PROJECT_KEY = "cka-projects-v1";

  /* CKA-P-2026-04821 — readable, collision-safe without a server round trip */
  function genRef(prefix) {
    const y = new Date().getFullYear();
    const n = Math.floor(10000 + Math.random() * 90000);
    return prefix + "-" + y + "-" + n;
  }

  /* ── shared shape ────────────────────────────────────────────
     One canonical product shape used everywhere. The seed data in
     data.js is the older, flatter format, so it is normalised on
     the way in and denormalised on the way out. Nothing downstream
     ever has to know which format it came from. */
  function normalise(p) {
    return {
      id:         p.id,
      sku:        p.sku || String(p.id),
      title:      p.title || p.name || "",
      category:   p.category || "",
      subcategory: p.subcategory || "",
      brand:      p.brand || "",
      description: p.description || "",
      unit:       p.unit || "",
      quality:    p.quality || "A",
      grade:      p.grade || "",
      size:       p.size || "",
      badge:      p.badge || "",
      supplier:   p.supplier || "",
      price:      Number(p.price) || 0,
      oldPrice:   Number(p.oldPrice) || 0,
      range:      p.range || "",
      stock:      p.stock || "",
      img:        p.img || (Array.isArray(p.images) && p.images[0]) || "",
      images:     Array.isArray(p.images) && p.images.length ? p.images.slice()
                  : (p.img ? [p.img] : []),
      featured:   !!p.featured,
      order:      Number(p.order) || 0,
      specs:      p.specs || "",
      tags:       Array.isArray(p.tags) ? p.tags : (p.tags ? String(p.tags).split(/\s*,\s*/) : []),
      rating:     Number(p.rating) || 0,
      deals:      p.deals || "",
      active:     p.active !== false
    };
  }

  /* ── LocalStore ──────────────────────────────────────────────
     Reads the shipped catalogue from data.js, then layers any
     unsaved admin edits on top from localStorage. Nothing is lost
     if the browser is closed; nothing is published until the admin
     exports a new data.js. */
  const LocalStore = {
    name: "local",
    readonly: false,

    _draft() {
      try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); }
      catch (e) { return null; }
    },
    _writeDraft(list) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(list));
        return true;
      } catch (e) {
        // quota exceeded, or private browsing
        return false;
      }
    },
    _seed() {
      const src = (typeof PRODUCTS !== "undefined" && PRODUCTS) || [];
      return src.map(normalise);
    },

    products: {
      async list() {
        const draft = LocalStore._draft();
        return (draft ? draft.map(normalise) : LocalStore._seed());
      },
      async save(product) {
        const list = await LocalStore.products.list();
        const p = normalise(product);
        if (!p.id) p.id = Math.max(0, ...list.map((x) => +x.id || 0)) + 1;
        const i = list.findIndex((x) => String(x.id) === String(p.id));
        if (i > -1) list[i] = p; else list.push(p);
        LocalStore._writeDraft(list);
        return p;
      },
      async remove(id) {
        const list = (await LocalStore.products.list()).filter((x) => String(x.id) !== String(id));
        LocalStore._writeDraft(list);
      },
      async replaceAll(list) {
        LocalStore._writeDraft(list.map(normalise));
      },
      async discardDraft() {
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      },
      hasDraft() { return !!LocalStore._draft(); }
    },

    categories: {
      async list() {
        const groups = (typeof GROUPS !== "undefined" && GROUPS) || {};
        return Object.entries(groups).map(([slug, def], i) => ({
          slug, name: def.label, order: i, children: def.categories.slice()
        }));
      }
    },

    files: {
      /* No backend, so a file is held in memory for the length of the
         session and described honestly. Nothing is silently discarded. */
      async upload(file) {
        return {
          path: "local://" + file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          name: file.name,
          type: file.type,
          persisted: false,
          note: "Held in this browser only — connect storage to persist uploads."
        };
      }
    },

    projects: {
      async list() {
        try { return JSON.parse(localStorage.getItem(PROJECT_KEY)) || []; }
        catch (e) { return []; }
      },
      async create(p) {
        const list = await LocalStore.projects.list();
        const row = {
          id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
          reference: genRef("CKA-P"),
          status: "received",
          created_at: new Date().toISOString(),
          persisted: false,
          ...p
        };
        list.unshift(row);
        try { localStorage.setItem(PROJECT_KEY, JSON.stringify(list)); } catch (e) {}
        return row;
      }
    },

    inquiries: {
      async create(i) {
        return { id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()), persisted: false, ...i };
      }
    }
  };

  /* ── SupabaseStore ───────────────────────────────────────────
     Not active. Enable by loading the supabase-js client, filling in
     CKA_CONFIG below, and changing the export at the bottom.
     Column names match db/schema.sql exactly. */
  function createSupabaseStore(client, bucket) {
    const B = bucket || "project-uploads";

const fromRow = (r) => normalise({
  id: r.id, sku: r.sku, title: r.name, category: r.category_name,
  subcategory: r.parent_category ? r.category_name : "",
 brand: r.brand, quality: r.quality, description: r.description, unit: r.unit, price: r.price, oldPrice: r.old_price,
  range: r.price_min && r.price_max ? `PKR ${r.price_min} – ${r.price_max}` : "",
  stock: r.stock, supplier: r.supplier_name, rating: r.rating,
  deals: r.order_count, featured: r.is_featured, order: r.display_order,
  tags: r.tags, img: r.main_image,
images: (r.images || []).map((i) => i.url)
});

    return {
      name: "supabase",
      readonly: false,
      products: {
        async list() {
  const { data, error } = await client
    .from("v_catalogue")
    .select("*")
    .order("display_order");

  if (error) throw error;

 const products = data.map(fromRow);

// Load all categories once instead of querying once per product
const { data: categories, error: categoryError } = await client
  .from("categories")
  .select("id, name");

if (!categoryError && categories) {
  const categoryMap = new Map(
    categories.map(c => [c.name, c.id])
  );

  for (const product of products) {
    product.category_id = categoryMap.get(product.category) || null;
  }
}

return products;

  return products;
},
async save(p) {
  const { data: categoryRow, error: categoryError } = await client
    .from("categories")
    .select("id")
    .eq("name", p.category)
    .limit(1)
    .single();

  if (categoryError || !categoryRow) {
    console.error("CATEGORY LOOKUP ERROR:", categoryError);
    throw new Error(`Category not found: ${p.category}`);
  }

  const { data, error } = await client.from("products").upsert({
    id: p.id || undefined,
    sku: p.sku,
    name: p.title,
    category_id: categoryRow.id,
    image_url: Array.isArray(p.images) ? p.images[0] || null : null,
    brand: p.brand,
    quality: p.quality || null,
    description: p.description,
    unit: p.unit,
    price: p.price,
    old_price: p.oldPrice || null,
    stock: p.stock || "in_stock",
    tags: p.tags,
    is_featured: p.featured,
    display_order: p.order,
    is_active: p.active
  }).select().single();

  if (error) throw error;

  return fromRow(data);
},
        async remove(id) {
          const { error } = await client.from("products")
            .update({ is_active: false }).eq("id", id);   // soft delete
          if (error) throw error;
        },
        async replaceAll() {
          throw new Error("replaceAll is unavailable on the live database — import through the admin review step instead.");
        },
        hasDraft() { return false; }
      },
categories: {
  async list() {
    const { data, error } = await client
      .from("categories")
      .select("*")
      .order("display_order");

    if (error) throw error;

    const rows = data || [];

    const parents = rows
      .filter(r => !r.parent_id)
      .map((r, i) => ({
        slug: r.slug,
        name: r.name,
        order: r.display_order ?? i,
        children: rows
          .filter(c => c.parent_id === r.id)
          .sort(
            (a, b) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          )
          .map(c => c.name)
      }));

    return parents;
  }
},
     files: {
  async upload(file, meta) {
    const path = `${(meta && meta.folder) || "misc"}/${Date.now()}-${file.name}`;

    const { error } = await client.storage
      .from(B)
      .upload(path, file);

    if (error) throw error;

    const { data } = client.storage
      .from(B)
      .getPublicUrl(path);

    return {
      path,
      url: data.publicUrl,
      size: file.size,
      name: file.name,
      type: file.type,
      persisted: true
    };
  },

async remove(path) {
  if (!path) return;

  const { data, error } = await client.storage
    .from(B)
    .remove([path]);

  console.log("STORAGE REMOVE RESULT:", {
    path,
    data,
    error
  });

  if (error) throw error;

  return data;
}
},

      /* Real backend for "Post a Project": inserts into `projects`, then
         attaches the uploaded BOQ/drawing (if any) as a `project_files`
         row. Anonymous submissions are allowed by RLS (customer_id stays
         null until supplier/customer auth ships). */
      projects: {
        async create(p) {
          const reference = genRef("CKA-P");
          const scopeParts = [p.material, p.qty ? ("Qty: " + p.qty) : null].filter(Boolean);

          const { data, error } = await client.from("projects").insert({
            reference,
            client_name: p.name,
            phone: p.phone,
            email: p.email || null,
            project_type: p.ptype || null,
            location: p.city || null,
            project_name: p.material || null,
            scope: scopeParts.join(" — ") || null,
            notes: p.message || null,
            status: "received"
          }).select().single();

          if (error) throw error;

          if (p.file && p.file.persisted) {
            const kind = /\.dwg$/i.test(p.file.name || "") ? "drawing_dwg" : "boq";
            const { error: fileErr } = await client.from("project_files").insert({
              project_id: data.id,
              kind,
              original_name: p.file.name || "attachment",
              storage_bucket: B,
              storage_path: p.file.path,
              mime_type: p.file.type || null,
              size_bytes: p.file.size || null
            });
            if (fileErr) console.error("project_files insert failed:", fileErr);
          }

          return { ...data, persisted: true };
        },
        async list() {
          const { data, error } = await client.from("projects")
            .select("*").order("created_at", { ascending: false });
          if (error) throw error;
          return data || [];
        }
      },

      inquiries: {
        async create(i) {
          const { data, error } = await client.from("inquiries").insert({
            name: i.name,
            email: i.email || null,
            phone: i.phone || null,
            subject: i.topic || null,
            message: i.message,
            source: i.source || "contact_form"
          }).select().single();
          if (error) throw error;
          return { ...data, persisted: true };
        }
      }
    };
  }

  /* ── active backend ──────────────────────────────────────────
     To go live:
       1. run db/schema.sql on your Supabase project
       2. load @supabase/supabase-js before this file
       3. set CKA_CONFIG below
       4. change the line marked ACTIVE */
  global.CKA_CONFIG = global.CKA_CONFIG || { supabaseUrl: "https://qrjglihvjhhemqoegqmt.supabase.co", supabaseAnonKey: "sb_publishable_8dwB_hn54sbrDsLgZR_7HQ_GEB9yHs4", storageBucket: "project-uploads" };

 const sb = supabase.createClient(
  CKA_CONFIG.supabaseUrl,
  CKA_CONFIG.supabaseAnonKey
);

let active = createSupabaseStore(
  sb,
  CKA_CONFIG.storageBucket
);

active.storage = sb.storage;
global.CKAStore = active;
global.CKAStore.supabase = sb;
global.CKAStore.normalise = normalise;
global.CKAStore.LocalStore = LocalStore;
global.CKAStore.createSupabaseStore = createSupabaseStore;
})(window);
