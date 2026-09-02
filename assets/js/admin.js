/* ═══════════════════════════════════════════════════════════════
   CKA BuildStruct — admin.js
   Local product management console.

   Reads and writes through CKAStore only, so the day the Supabase
   adapter is switched on in store.js this file keeps working
   unchanged. Nothing here talks to localStorage directly.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pkr = (n) => "PKR " + Number(n || 0).toLocaleString("en-PK");

  function toast(msg, kind) {
    const box = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast" + (kind === "warn" ? " toast--warn" : "");
    el.innerHTML = `<span>${msg}</span>`;
    box.appendChild(el);
    setTimeout(() => { el.classList.add("is-leaving"); setTimeout(() => el.remove(), 300); }, 3600);
  }

  /* ── EXCEL COLUMN CONTRACT ───────────────────────────────────
     Single source of truth for the round trip. The template, the
     export and the import all read this list, so a column can never
     drift out of sync between them. */
  const COLUMNS = [
    ["Product ID",             "sku"],
    ["Category",               "category"],
    ["Subcategory",            "subcategory"],
    ["Product Name",           "title"],
    ["Brand",                  "brand"],
    ["Description",            "description"],
    ["Unit",                   "unit"],
    ["Quality/Class",          "quality"],
    ["Grade",                  "grade"],
    ["Size",                   "size"],
    ["Supplier",               "supplier"],
    ["Current Price",          "price"],
    ["Old Price",              "oldPrice"],
    ["Availability",           "stock"],
    ["Stock Status",           "stockNote"],
    ["Product Image Path/URL", "images"],
    ["Featured Product",       "featured"],
    ["Display Order",          "order"],
    ["Product Specifications", "specs"],
    ["Keywords/Tags",          "tags"]
  ];

  let products = [];
  let categories = [];
  let sort = { key: "order", dir: 1 };

  /* ── VIEW SWITCHING ──────────────────────────────────────── */
  $$(".adm__navlink").forEach((b) => b.addEventListener("click", () => {
    $$(".adm__navlink").forEach((x) => x.classList.toggle("is-active", x === b));
    $$(".adm__view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === b.dataset.view));
    window.scrollTo(0, 0);
  }));
  const goto = (v) => $(`.adm__navlink[data-view="${v}"]`).click();
  $("#go-publish").addEventListener("click", () => goto("data"));

  /* ── LOAD ────────────────────────────────────────────────── */
async function load() {
  console.log("CKA ADMIN: starting load");

  products = await CKAStore.products.list();
  console.log("CKA ADMIN: products loaded:", products.length);

  categories = await CKAStore.categories.list();
  console.log("CKA ADMIN: categories loaded:", categories.length);

  products = Array.isArray(products) ? products : [];
  categories = Array.isArray(categories) ? categories : [];

  products = products.map(p => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : [],
    images: Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []),
    img: p.img || (Array.isArray(p.images) ? p.images[0] : "") || ""
  }));

  categories = categories.map(g => ({
    ...g,
    children: Array.isArray(g.children) ? g.children : []
  }));

  const all = [...new Set(
    products
      .map(p => p.category)
      .filter(Boolean)
  )].sort();

  const opts = all
    .map(c => `<option value="${esc(c)}">${esc(c)}</option>`)
    .join("");

  $("#adm-cat").innerHTML =
    '<option value="">All categories</option>' + opts;

  $("#ed-cat").innerHTML = opts;

  console.log("CKA ADMIN: rendering rows");
  renderRows();

  console.log("CKA ADMIN: rendering categories");
  renderCategories();

  console.log("CKA ADMIN: rendering insights");
  renderInsights();

  console.log("CKA ADMIN: refreshing banner");
  refreshDraftBanner();

  console.log("CKA ADMIN: LOAD COMPLETE");
}

  function refreshDraftBanner() {
    const has = CKAStore.products.hasDraft();
    $("#draft-banner").hidden = !has;
    if (has) $("#draft-count").textContent = products.length + " products in the working copy.";
  }

  /* ── CATALOGUE TABLE ─────────────────────────────────────── */
  function filtered() {
    const q = $("#adm-search").value.trim().toLowerCase();
    const cat = $("#adm-cat").value;
    const stock = $("#adm-stock").value;
    let list = products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (stock && p.stock !== stock) return false;
      if (!q) return true;
      return (p.title + " " + p.brand + " " + p.category + " " + p.tags.join(" ")).toLowerCase().includes(q);
    });
    return list.sort((a, b) => {
      const A = a[sort.key], B = b[sort.key];
      if (typeof A === "number" && typeof B === "number") return (A - B) * sort.dir;
      return String(A).localeCompare(String(B)) * sort.dir;
    });
  }

  function stockChip(s) {
    if (!s) return '<span class="chip chip--neutral">Not shown</span>';
    const map = {
      "In stock": "chip--available", "Low stock": "chip--info",
      "On order": "chip--info", "Out of stock": "chip--live"
    };
    return `<span class="chip ${map[s] || "chip--neutral"}">${esc(s)}</span>`;
  }

  function renderRows() {
    const list = filtered();
    $("#cat-summary").textContent =
      `${products.length} products · ${new Set(products.map((p) => p.category)).size} categories · ` +
      `${products.filter((p) => p.featured).length} featured`;
    $("#adm-empty").hidden = list.length > 0;
    $("#adm-rows").innerHTML = list.map((p) => `
      <tr data-id="${esc(p.id)}">
        <td>
  ${(p.img || (Array.isArray(p.images) && p.images[0]))
    ? `<img class="adm__thumb" src="${esc(p.img || p.images[0])}" alt="${esc(p.title || "")}" width="40" height="40" loading="lazy" />`
    : '<span class="adm__thumb adm__thumb--none"></span>'}
</td>
        <td>
          <strong>${esc(p.title)}</strong>
          ${p.featured ? '<span class="chip chip--verified">Featured</span>' : ""}
          <small>${esc(p.unit)}${p.grade ? " · " + esc(p.grade) : ""}</small>
        </td>
        <td>${esc(p.category)}</td>
        <td>${esc(p.brand)}</td>
        <td class="num"><strong>${pkr(p.price)}</strong>${p.oldPrice ? `<small><s>${pkr(p.oldPrice)}</s></small>` : ""}</td>
        <td>${stockChip(p.stock)}</td>
        <td class="adm__rowacts">
          <button class="icon-btn" data-edit="${esc(p.id)}" aria-label="Edit ${esc(p.title)}"><svg class="ic"><use href="#i-edit"/></svg></button>
          <button class="icon-btn icon-btn--danger" data-del="${esc(p.id)}" aria-label="Delete ${esc(p.title)}"><svg class="ic"><use href="#i-trash"/></svg></button>
        </td>
      </tr>`).join("");
  }

  ["#adm-search", "#adm-cat", "#adm-stock"].forEach((s) =>
    $(s).addEventListener("input", renderRows));

  $$("th[data-sort]").forEach((th) => th.addEventListener("click", () => {
    const k = th.dataset.sort;
    sort = { key: k, dir: sort.key === k ? -sort.dir : 1 };
    $$("th[data-sort]").forEach((x) => x.removeAttribute("data-dir"));
    th.dataset.dir = sort.dir > 0 ? "asc" : "desc";
    renderRows();
  }));

  $("#adm-rows").addEventListener("click", async (e) => {
    const ed = e.target.closest("[data-edit]");
    const dl = e.target.closest("[data-del]");
    if (ed) return openEditor(products.find((p) => String(p.id) === ed.dataset.edit));
    if (dl) {
      const p = products.find((x) => String(x.id) === dl.dataset.del);
      if (!confirm(`Delete "${p.title}"?\n\nThis changes your working copy only — the live site is unaffected until you publish.`)) return;
      await CKAStore.products.remove(p.id);
      await load();
      toast("Product removed from the working copy.");
    }
  });

  /* ── EDITOR ──────────────────────────────────────────────── */
  const editor = $("#editor"), form = $("#editor-form");

  function openEditor(p) {
    const blank = { id: "", title: "", category: $("#ed-cat").value, quality: "A", images: [], tags: [] };
    const d = p || blank;
    $("#editor-title").textContent = p ? "Edit product" : "New product";
    form.reset();
    Object.entries({
      id: d.id, title: d.title, brand: d.brand, category: d.category, subcategory: d.subcategory,
      unit: d.unit, quality: d.quality || "A", grade: d.grade, size: d.size,
      price: d.price || "", oldPrice: d.oldPrice || "", range: d.range, stock: d.stock,
      supplier: d.supplier, badge: d.badge, order: d.order || "", rating: d.rating || "",
      description: d.description, specs: d.specs,
      images: (d.images || []).join("\n"), tags: (d.tags || []).join(", ")
    }).forEach(([k, v]) => { if (form[k]) form[k].value = v == null ? "" : v; });
    form.featured.checked = !!d.featured;
    drawThumbs();
    editor.classList.add("is-open");
    editor.setAttribute("aria-hidden", "false");
    setTimeout(() => form.title.focus(), 60);
  }

  function closeEditor() {
    editor.classList.remove("is-open");
    editor.setAttribute("aria-hidden", "true");
  }
  $$("[data-close-editor]").forEach((b) => b.addEventListener("click", closeEditor));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeEditor(); });

  function drawThumbs() {
    const paths = form.images.value.split("\n").map((s) => s.trim()).filter(Boolean);
    $("#ed-thumbs").innerHTML = paths.map((src, i) => `
      <figure class="adm__thumbcard">
        <img src="${esc(src)}" alt="" loading="lazy" onerror="this.closest('figure').classList.add('is-broken')" />
        <figcaption>${i === 0 ? "Main" : "Gallery " + i}</figcaption>
      </figure>`).join("");
  }
  form.images.addEventListener("input", drawThumbs);
$("#product-image-upload").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    toast("Uploading image...", "info");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `product-images/${Date.now()}-${safeName}`;

    const { error } = await CKAStore.storage
      .from("project-uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) throw error;

    const { data } = CKAStore.storage
      .from("project-uploads")
      .getPublicUrl(filePath);

    const url = data.publicUrl;

form.images.value = url;

    drawThumbs();

    toast("Image uploaded successfully.", "ok");
    console.log("IMAGE URL:", url);

  } catch (error) {
    console.error("IMAGE UPLOAD ERROR:", error);
    toast("Image upload failed.", "error");
  }

  e.target.value = "";
});

  $("#new-product").addEventListener("click", () => openEditor(null));

  $("#save-product").addEventListener("click", async () => {
    const bad = $$("input,select,textarea", form).filter((f) => f.willValidate && !f.checkValidity());
    if (bad.length) {
      bad.forEach((f) => f.setAttribute("aria-invalid", "true"));
      bad[0].focus();
      toast("Fill in the required fields first.", "warn");
      return;
    }
  const fd = Object.fromEntries(new FormData(form).entries());

const original = fd.id
  ? products.find(p => String(p.id) === String(fd.id))
  : null;

fd.category_id = original?.category_id || null;

const oldImage =
  original?.images?.[0] ||
  original?.img ||
  "";

const newImages = fd.images
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

await CKAStore.products.save({
  ...fd,
  id: fd.id || undefined,
  price: +fd.price || 0,
  oldPrice: +fd.oldPrice || 0,
  order: +fd.order || 0,
  rating: +fd.rating || 0,
  featured: form.featured.checked,
  images: newImages,
  tags: fd.tags.split(",").map((s) => s.trim()).filter(Boolean)
});

// Check whether the old image is still used by another product
if (oldImage && oldImage !== newImages[0]) {
  const stillUsed = products.some(p =>
    String(p.id) !== String(fd.id) &&
    (
      p.images?.includes(oldImage) ||
      p.img === oldImage
    )
  );

  console.log("OLD IMAGE CLEANUP CHECK:", {
    oldImage,
    newImage: newImages[0] || "",
    stillUsed
  });

  if (oldImage && oldImage !== newImages[0] && !stillUsed) {
    try {
      const oldPath = oldImage.includes("/storage/v1/object/public/")
        ? oldImage.split("/storage/v1/object/public/")[1]
        : oldImage;

      const bucketPrefix = "project-uploads/";

      const storagePath = oldPath.startsWith(bucketPrefix)
        ? oldPath.substring(bucketPrefix.length)
        : oldPath;

      await CKAStore.files.remove(storagePath);

      console.log("OLD IMAGE DELETED:", storagePath);
    } catch (err) {
      console.warn("OLD IMAGE DELETE FAILED:", err);
    }
  }
}

closeEditor();
await load();
toast("Saved to the working copy.");
  });

  /* ── CATEGORIES ──────────────────────────────────────────── */
  function renderCategories() {
    $("#cat-cards").innerHTML = categories.map((g) => `
      <article class="adm__card">
        <h3>${esc(g.name)}</h3>
        <ul class="adm__catlist">
          ${g.children.map((c) => {
            const n = products.filter((p) => p.category === c).length;
            return `<li><span>${esc(c)}</span><b>${n}</b></li>`;
          }).join("")}
        </ul>
      </article>`).join("");
  }

  /* ── INSIGHTS ────────────────────────────────────────────── */
  function renderInsights() {
    const priced = products.filter((p) => p.price > 0);
    const avg = priced.length ? priced.reduce((s, p) => s + p.price, 0) / priced.length : 0;
    const noImg = products.filter((p) => !p.img).length;
    const noStock = products.filter((p) => !p.stock).length;
    const stats = [
      ["Products", products.length],
      ["Categories", new Set(products.map((p) => p.category)).size],
      ["Featured", products.filter((p) => p.featured).length],
      ["Average price", pkr(Math.round(avg))],
      ["Missing an image", noImg],
      ["No availability set", noStock]
    ];
    $("#adm-stats").innerHTML = stats.map(([l, v]) =>
      `<div class="adm__stat"><span>${l}</span><strong>${v}</strong></div>`).join("");

    const byCat = {};
    products.forEach((p) => { byCat[p.category] = (byCat[p.category] || 0) + 1; });
    const max = Math.max(1, ...Object.values(byCat));
    $("#adm-breakdown").innerHTML = `<article class="adm__card adm__card--wide">
      <h3>Products per category</h3>
      <ul class="adm__bars">${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, n]) =>
        `<li><span>${esc(c)}</span><i style="width:${(n / max) * 100}%"></i><b>${n}</b></li>`).join("")}
      </ul></article>`;
  }

  /* ── EXCEL EXPORT ────────────────────────────────────────── */
  function toRow(p) {
    const r = {};
    COLUMNS.forEach(([header, key]) => {
      let v = p[key];
      if (key === "images") v = (p.images || []).join(" | ");
      else if (key === "tags") v = (p.tags || []).join(", ");
      else if (key === "featured") v = p.featured ? "Yes" : "No";
      else if (key === "stockNote") v = p.stockNote || "";
      r[header] = v == null ? "" : v;
    });
    return r;
  }

  $("#export-xlsx").addEventListener("click", () => {
    const ws = XLSX.utils.json_to_sheet(products.map(toRow), { header: COLUMNS.map((c) => c[0]) });
    ws["!cols"] = COLUMNS.map(([h]) => ({ wch: Math.max(12, Math.min(40, h.length + 8)) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `CKA-catalogue-${stamp}.xlsx`);
    toast("Catalogue exported.");
  });

  /* ── EXCEL IMPORT ────────────────────────────────────────────
     Validate first, show the operator exactly what will happen,
     and only apply once they confirm. An import that silently
     wipes a catalogue is the classic way these tools lose trust. */
  $("#import-xlsx").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      let rows;
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const sheet = wb.Sheets["Products"] || wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      } catch (err) {
        toast("That file could not be read as a spreadsheet.", "warn");
        return;
      }
      review(rows);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  });

  function fromRow(r) {
    const p = {};
    COLUMNS.forEach(([header, key]) => { p[key] = r[header]; });
    return {
      id: p.sku || undefined,
      sku: String(p.sku || "").trim(),
      title: String(p.title || "").trim(),
      category: String(p.category || "").trim(),
      subcategory: String(p.subcategory || "").trim(),
      brand: String(p.brand || "").trim(),
      description: String(p.description || "").trim(),
      unit: String(p.unit || "").trim(),
      quality: String(p.quality || "A").trim().toUpperCase().charAt(0) || "A",
      grade: String(p.grade || "").trim(),
      size: String(p.size || "").trim(),
      supplier: String(p.supplier || "").trim(),
      price: Number(String(p.price).replace(/[^\d.]/g, "")) || 0,
      oldPrice: Number(String(p.oldPrice).replace(/[^\d.]/g, "")) || 0,
      stock: String(p.stock || "").trim(),
      stockNote: String(p.stockNote || "").trim(),
      images: String(p.images || "").split("|").map((s) => s.trim()).filter(Boolean),
      featured: /^y/i.test(String(p.featured || "")),
      order: Number(p.order) || 0,
      specs: String(p.specs || "").trim(),
      tags: String(p.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
    };
  }

  function review(rows) {
    const known = new Set(products.map((p) => String(p.sku || p.id)));
    const validCats = new Set(products.map((p) => p.category));
    const parsed = [], errors = [];

    rows.forEach((r, i) => {
      const line = i + 2;
      const p = fromRow(r);
      const skip = !p.title && !p.category && !p.price;
      if (skip) return;                                   // blank spacer row
      const rowErrs = [];
      if (!p.title) rowErrs.push("Product Name is required");
      if (!p.category) rowErrs.push("Category is required");
      else if (validCats.size && !validCats.has(p.category)) rowErrs.push(`Unknown category “${p.category}”`);
      if (!p.unit) rowErrs.push("Unit is required");
      if (!(p.price > 0)) rowErrs.push("Current Price must be a number above zero");
      if (p.oldPrice && p.oldPrice < p.price) rowErrs.push("Old Price is below Current Price");
      if (rowErrs.length) errors.push({ line, title: p.title || "(untitled)", errs: rowErrs });
      else parsed.push(p);
    });

    const updates = parsed.filter((p) => known.has(String(p.sku)));
    const adds = parsed.filter((p) => !known.has(String(p.sku)));
    const box = $("#import-report");
    box.hidden = false;
    box.innerHTML = `
      <div class="adm__report">
        <h3>Import preview</h3>
        <div class="adm__stats">
          <div class="adm__stat"><span>Rows read</span><strong>${rows.length}</strong></div>
          <div class="adm__stat"><span>Will update</span><strong>${updates.length}</strong></div>
          <div class="adm__stat"><span>Will add</span><strong>${adds.length}</strong></div>
          <div class="adm__stat ${errors.length ? "is-bad" : ""}"><span>Rejected</span><strong>${errors.length}</strong></div>
        </div>
        ${errors.length ? `<div class="adm__errs">
          <h4>These rows will be skipped</h4>
          <ul>${errors.slice(0, 40).map((e) =>
            `<li><b>Row ${e.line}</b> — ${esc(e.title)}<small>${e.errs.map(esc).join(" · ")}</small></li>`).join("")}
          </ul>${errors.length > 40 ? `<p>…and ${errors.length - 40} more.</p>` : ""}
        </div>` : `<p class="adm__ok">Every row passed validation.</p>`}
        <div class="adm__reportacts">
          <button class="btn btn--ghost" id="cancel-import">Cancel</button>
          <button class="btn btn--brand" id="apply-merge" ${parsed.length ? "" : "disabled"}>Apply ${parsed.length} rows</button>
          <button class="btn btn--line" id="apply-replace" ${parsed.length ? "" : "disabled"}>Replace entire catalogue</button>
        </div>
        <p class="adm__note">“Apply” merges by Product ID and leaves everything else untouched. “Replace” discards any product not present in this sheet — use it only for a full catalogue rebuild.</p>
      </div>`;
    box.scrollIntoView({ behavior: "smooth", block: "start" });

    $("#cancel-import").onclick = () => { box.hidden = true; box.innerHTML = ""; };

    $("#apply-merge").onclick = async () => {
      for (const p of parsed) await CKAStore.products.save(p);
      box.hidden = true; box.innerHTML = "";
      await load();
      toast(`${updates.length} updated, ${adds.length} added.`);
    };

    $("#apply-replace").onclick = async () => {
      if (!confirm(`Replace all ${products.length} products with the ${parsed.length} rows in this sheet?\n\nAnything not in the sheet will be removed from your working copy.`)) return;
      await CKAStore.products.replaceAll(parsed);
      box.hidden = true; box.innerHTML = "";
      await load();
      toast(`Catalogue replaced with ${parsed.length} products.`);
    };
  }

  /* ── PUBLISH ─────────────────────────────────────────────────
     Rewrites data.js in the same hand-editable shape it ships in,
     so the file stays readable and diffable after every publish. */
  $("#publish").addEventListener("click", () => {
    const lines = products.map((p) => {
      const o = {
        id: isNaN(+p.id) ? p.id : +p.id, title: p.title, category: p.category,
        quality: p.quality, price: p.price
      };
      if (p.oldPrice) o.oldPrice = p.oldPrice;
      o.unit = p.unit;
      if (p.range) o.range = p.range;
      if (p.badge) o.badge = p.badge;
      if (p.brand) o.brand = p.brand;
      if (p.supplier) o.supplier = p.supplier;
      if (p.rating) o.rating = p.rating;
      if (p.deals) o.deals = p.deals;
      if (p.stock) o.stock = p.stock;
      if (p.featured) o.featured = true;
      if (p.order) o.order = p.order;
      if (p.specs) o.specs = p.specs;
      if (p.tags && p.tags.length) o.tags = p.tags;
      o.img = p.img || (p.images && p.images[0]) || "";
      if (p.images && p.images.length > 1) o.images = p.images;
      return "  " + JSON.stringify(o).replace(/","/g, '", "').replace(/^\{/, "{ ").replace(/\}$/, " }") + ",";
    });

    const header = `/* ═══════════════════════════════════════════════════════════════
   CKA BuildStruct — data.js
   Generated by the admin console on ${new Date().toISOString().slice(0, 16).replace("T", " ")}.
   Safe to hand-edit: it is plain data, one product per line.
   ═══════════════════════════════════════════════════════════════ */\n\n`;

    /* SITE, GROUPS, IMG, BID_SEED and BID_POOL are carried through
       untouched — the console only ever rewrites PRODUCTS. */
    const block = (name, val) => "const " + name + " = " + JSON.stringify(val, null, 2) + ";\n\n";
    const out = header +
      block("SITE", SITE) +
      block("GROUPS", GROUPS) +
      block("IMG", IMG) +
      "const PRODUCTS = [\n" + lines.join("\n") + "\n];\n\n" +
      block("BID_SEED", BID_SEED) +
      "const BID_POOL = " + JSON.stringify(BID_POOL, null, 2) + ";\n";

    const blob = new Blob([out], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.js";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("data.js generated — replace assets/js/data.js on your host.");
  });

  $("#discard-draft").addEventListener("click", async () => {
    if (!confirm("Discard all unpublished changes and return to the shipped catalogue?")) return;
    await CKAStore.products.discardDraft();
    await load();
    toast("Working copy discarded.");
  });

load().catch((err) => {
  console.error("CKA ADMIN LOAD ERROR:", err);
  console.error("Stack:", err.stack);
  toast("Could not load the catalogue: " + err.message, "warn");
});
})();
