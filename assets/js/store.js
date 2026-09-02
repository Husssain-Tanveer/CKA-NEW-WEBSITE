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
     LocalStore     — fallback backend using browser storage
     SupabaseStore  — active backend mapped to db/schema.sql
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  const DRAFT_KEY = "cka-catalogue-draft-v1";
  const PROJECT_KEY = "cka-projects-v1";
  const STOCK_LABELS = {
    in_stock: "In stock",
    low_stock: "Low stock",
    on_order: "On order",
    out_of_stock: "Out of stock",
    rate_on_request: "Rate on request"
  };
  const STOCK_VALUES = Object.fromEntries(
    Object.entries(STOCK_LABELS).map(([value, label]) => [label, value])
  );

  function stockFromDb(value) {
    return STOCK_LABELS[value] || value || "";
  }

  function stockToDb(value) {
    return STOCK_VALUES[value] || value || "in_stock";
  }

  function specsToText(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join("; ");
  }

  function specsToObject(value) {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value;
    return String(value).split(";").reduce((result, part) => {
      const separator = part.indexOf(":");
      if (separator < 1) return result;
      const key = part.slice(0, separator).trim();
      const val = part.slice(separator + 1).trim();
      if (key && val) result[key] = val;
      return result;
    }, {});
  }

  function priceRange(value) {
    const values = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/g) || [];
    return {
      min: values[0] ? Number(values[0]) : null,
      max: values[1] ? Number(values[1]) : null
    };
  }

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
      stock:      stockFromDb(p.stock),
      img:        p.img || (Array.isArray(p.images) && p.images[0]) || "",
      images:     Array.isArray(p.images) && p.images.length ? p.images.slice()
                  : (p.img ? [p.img] : []),
      featured:   !!p.featured,
      order:      Number(p.order) || 0,
      specs:      specsToText(p.specs || p.specifications),
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
     Active adapter. Column names match db/schema.sql exactly. */
  function createSupabaseStore(client, bucket, projectBucket) {
    const B = bucket || "product-images";
    const PROJECT_BUCKET = projectBucket || "project-uploads";

const fromRow = (r) => {
  const variant = Array.isArray(r.variants) && r.variants.length ? r.variants[0] : {};
  const specifications = r.specifications || {};
  return normalise({
  id: r.id, sku: r.sku, title: r.name, category: r.category_name,
  subcategory: r.parent_category ? r.category_name : "",
 brand: r.brand,
 quality: variant.label || specifications.quality,
 grade: variant.grade || specifications.grade,
 size: variant.size || specifications.size,
 badge: specifications.badge,
 description: r.description, unit: r.unit, price: r.price, oldPrice: r.old_price,
  range: r.price_min && r.price_max ? `PKR ${r.price_min} – ${r.price_max}` : "",
  stock: r.stock, supplier: r.supplier_name, rating: r.rating,
  deals: r.order_count, featured: r.is_featured, order: r.display_order,
  tags: r.tags, specs: r.specifications, img: r.main_image,
images: (r.images || []).map((i) => i.url)
});
};

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

  let supplierId = null;
  if (p.supplier) {
    const { data: supplierRow, error: supplierError } = await client
      .from("suppliers")
      .select("id")
      .eq("company_name", p.supplier)
      .limit(1)
      .maybeSingle();
    if (supplierError) throw supplierError;
    if (!supplierRow) throw new Error(`Supplier not found: ${p.supplier}`);
    supplierId = supplierRow.id;
  }

  const range = priceRange(p.range);
  const specifications = specsToObject(p.specs);
  if (p.quality) specifications.quality = p.quality;
  if (p.grade) specifications.grade = p.grade;
  if (p.size) specifications.size = p.size;
  if (p.badge) specifications.badge = p.badge;

  const payload = {
    sku: String(p.sku || "").trim() || null,
    name: p.title,
    category_id: categoryRow.id,
    supplier_id: supplierId,
    brand: p.brand,
    description: p.description,
    unit: p.unit,
    price: p.price,
    old_price: p.oldPrice || null,
    price_min: range.min,
    price_max: range.max,
    stock: stockToDb(p.stock),
    specifications,
    tags: p.tags,
    is_featured: p.featured,
    display_order: p.order,
    rating: p.rating || null,
    is_active: p.active !== false
  };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.id || "");
  let result;
  if (isUuid) {
    result = await client.from("products").update(payload).eq("id", p.id).select().single();
  } else if (payload.sku) {
    result = await client.from("products").upsert(payload, { onConflict: "sku" }).select().single();
  } else {
    result = await client.from("products").insert(payload).select().single();
  }

  const { data, error } = result;

  if (error) throw error;

  const images = (p.images || []).filter(Boolean);
  if (images.length) {
    const imageRows = images.map((url, position) => ({
      product_id: data.id,
      url,
      alt: p.title,
      position
    }));
    const { error: imageError } = await client
      .from("product_images")
      .upsert(imageRows, { onConflict: "product_id,position" });
    if (imageError) throw imageError;
    const { error: staleImageError } = await client
      .from("product_images")
      .delete()
      .eq("product_id", data.id)
      .gte("position", images.length);
    if (staleImageError) throw staleImageError;
  } else {
    const { error: imageError } = await client
      .from("product_images")
      .delete()
      .eq("product_id", data.id);
    if (imageError) throw imageError;
  }

  return normalise({ ...p, id: data.id, sku: data.sku });
},
        async remove(id) {
          const { error } = await client.from("products")
            .update({ is_active: false }).eq("id", id);   // soft delete
          if (error) throw error;
        },
        async replaceAll() {
          throw new Error("replaceAll is unavailable on the live database — import through the admin review step instead.");
        },
        async discardDraft() {},
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
    const targetBucket = meta?.folder === "projects" ? PROJECT_BUCKET : B;
    const path = `${(meta && meta.folder) || "misc"}/${Date.now()}-${file.name}`;

    const { error } = await client.storage
      .from(targetBucket)
      .upload(path, file);

    if (error) throw error;

    const publicUrl = targetBucket === B
      ? client.storage.from(targetBucket).getPublicUrl(path).data.publicUrl
      : null;

    return {
      path,
      url: publicUrl,
      bucket: targetBucket,
      size: file.size,
      name: file.name,
      type: file.type,
      persisted: true
    };
  },

async remove(path, bucketName) {
  if (!path) return;

  const { data, error } = await client.storage
    .from(bucketName || B)
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
              storage_bucket: p.file.bucket || PROJECT_BUCKET,
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

  /* ── active backend ────────────────────────────────────────── */
  global.CKA_CONFIG = global.CKA_CONFIG || {
    supabaseUrl: "https://qrjglihvjhhemqoegqmt.supabase.co",
    supabaseAnonKey: "sb_publishable_8dwB_hn54sbrDsLgZR_7HQ_GEB9yHs4",
    storageBucket: "product-images",
    projectStorageBucket: "project-uploads"
  };

 const sb = supabase.createClient(
  CKA_CONFIG.supabaseUrl,
  CKA_CONFIG.supabaseAnonKey
);

let active = createSupabaseStore(
  sb,
  CKA_CONFIG.storageBucket,
  CKA_CONFIG.projectStorageBucket
);

active.storage = sb.storage;
global.CKAStore = active;
global.CKAStore.supabase = sb;
global.CKAStore.normalise = normalise;
global.CKAStore.LocalStore = LocalStore;
global.CKAStore.createSupabaseStore = createSupabaseStore;
})(window);
