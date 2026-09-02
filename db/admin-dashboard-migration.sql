-- CKA BuildStruct — admin dashboard migration
-- Run once in the Supabase SQL editor before using admin product writes/uploads.

begin;

-- The admin product editor resolves supplier names before saving.
drop policy if exists "staff manage suppliers" on public.suppliers;
create policy "staff manage suppliers" on public.suppliers
  for all
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.categories, public.suppliers, public.v_catalogue to authenticated;
grant select, insert, update, delete on public.products, public.product_images to authenticated;

-- Public catalogue images and private customer submissions must not share a bucket.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('project-uploads', 'project-uploads', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read project-uploads" on storage.objects;

drop policy if exists "public upload project-uploads" on storage.objects;
create policy "public upload project-uploads" on storage.objects for insert
  with check (
    bucket_id = 'project-uploads'
    and (storage.foldername(name))[1] = 'projects'
  );

drop policy if exists "staff manage project-uploads" on storage.objects;
create policy "staff manage project-uploads" on storage.objects for all
  using (bucket_id = 'project-uploads' and public.is_staff())
  with check (bucket_id = 'project-uploads' and public.is_staff());

drop policy if exists "public read product-images" on storage.objects;
create policy "public read product-images" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "staff manage product-images" on storage.objects;
create policy "staff manage product-images" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

commit;
