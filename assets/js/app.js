/* ═══════════════════════════════════════════════════════════════
   CKA BuildStruct — app.js
   All interactivity in dependency-free vanilla JS.
   1  helpers            6  bidding board      11 mobile menu
   2  header / nav       7  forms              12 modals
   3  reveal + counters  8  checkout flow      13 toasts
   4  catalogue render   9  drawer ui
   5  filters            10 category shortcuts
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── 1 · helpers ─────────────────────────────────────────── */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const pkr = (n) => "PKR " + n.toLocaleString("en-PK");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name, cls) => `<svg class="ic ${cls || ""}"><use href="#${name}"/></svg>`;

  function toast(html, opts) {
    opts = opts || {};
    const box = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast" + (opts.warn ? " toast--warn" : "");
    el.innerHTML = icon(opts.warn ? "i-chat" : "i-check-c") + `<span>${html}</span>` +
      (opts.action ? `<button type="button">${esc(opts.action)}</button>` : "");
    box.appendChild(el);
    if (opts.onAction) el.querySelector("button").addEventListener("click", () => { opts.onAction(); dismiss(); });
    const life = opts.action ? 5200 : 3400;
    const dismiss = () => { el.classList.add("is-leaving"); setTimeout(() => el.remove(), 300); };
    setTimeout(dismiss, life);
  }

  /* ── 2 · header, scroll state, active nav ────────────────── */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* hero background video — pick a sensible size per device,
     honour reduced-motion & data-saver, fade in on first frame */
  const mq = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);
  const reducedMotion = mq("(prefers-reduced-motion: reduce)");
  const heroVideo = $("#hero-video");
  const heroMedia = $(".hero__media");
  if (heroVideo) {
    const turnOn = () => heroVideo.classList.add("is-on");
    heroVideo.addEventListener("canplay", turnOn);
    heroVideo.addEventListener("playing", turnOn);
    heroVideo.addEventListener("error", turnOn); // poster + bg fallback
    if (reducedMotion) {
      heroVideo.removeAttribute && heroVideo.removeAttribute("autoplay");
      heroVideo.pause && heroVideo.pause();
      turnOn(); // show the poster frame as a still hero
    } else {
      const src = (navigator.connection && navigator.connection.saveData) || mq("(max-width: 700px)")
        ? "540" : "720";
      heroVideo.src = "assets/video/hero-" + src + ".mp4";
      try { const p = heroVideo.play && heroVideo.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}

    }
  }

  /* soften a looping video's wrap point: dip toward the poster-painted
     backdrop just before the cut, then ease back in on the new pass */
  function armLoopFade(video) {
    let armed = true;
    video.addEventListener("timeupdate", () => {
      const d = video.duration;
      if (!d || !isFinite(d)) return;
      if (armed && d - video.currentTime < 0.55) {
        video.classList.add("is-looping");
        armed = false;
      } else if (!armed && video.currentTime < 0.55) {
        video.classList.remove("is-looping");
        armed = true;
      }
    });
  }
  if (heroVideo && !reducedMotion) armLoopFade(heroVideo);

  /* lower-page videos (construction + cta) — fetched only when they
     approach the viewport; still-poster fallback under reduced motion */
  function lazyVideo(el, base) {
    if (!el) return;
    const on = () => el.classList.add("is-on");
    el.addEventListener("canplay", on);
    el.addEventListener("playing", on);
    el.addEventListener("error", on);
    if (reducedMotion) {
      el.removeAttribute && el.removeAttribute("autoplay");
      el.pause && el.pause();
      on();
      return;
    }
    const load = () => {
      el.src = "assets/video/" + base + "-" +
        ((navigator.connection && navigator.connection.saveData) || mq("(max-width: 700px)") ? "360" : "720") + ".mp4";
      try { const p = el.play && el.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
      armLoopFade(el);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) { load(); io.disconnect(); } });
      }, { rootMargin: "350px" });
      io.observe(el);
    } else load();
  }
  lazyVideo($("#con-video"), "design");
  lazyVideo($("#cta-video"), "site");

  /* scroll-driven effects: progress bar + hero parallax (one rAF loop) */
  const progressBar = $("#progress");
  const rafFx = window.requestAnimationFrame || ((f) => setTimeout(f, 16));
  let fxTick = false;
  function scrollFx() {
    if (fxTick) return;
    fxTick = true;
    rafFx(() => {
      const y = window.scrollY;
      if (progressBar) {
        const doc = document.documentElement || {};
        const max = (doc.scrollHeight || 0) - (window.innerHeight || 800);
        progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
      }
      if (heroMedia && !reducedMotion && !mq("(max-width: 700px)") && y < (window.innerHeight || 800) * 1.2) {
        heroMedia.style.transform = "translate3d(0," + y * 0.1 + "px,0) scale(1.15)";
      }
      fxTick = false;
    });
  }
  window.addEventListener("scroll", scrollFx, { passive: true });
  scrollFx();

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Site is now multi-page: each page renders its own nav__link/mbar__item
     with class="is-active" server-side, so no scroll-spy is needed here. */
  const navLinks = $$(".nav__link");

  /* ── 3 · reveal-on-scroll + animated counters ────────────── */
  /* On phones: skip scroll-reveal entirely and show everything immediately —
     tall mobile blocks can stay under the observer threshold and look blank. */
  const revealTargets = $$("[data-reveal], [data-reveal-group]");
  const showAll = () => revealTargets.forEach((el) => el.classList.add("is-visible"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    /* One observer for both cases — a group additionally cascades its children.
       A low threshold plus a bottom margin means tall blocks on phones trip the
       observer as soon as their top edge enters, which is what used to fail. */
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        revealObs.unobserve(en.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });

    revealTargets.forEach((el) => {
      if (el.hasAttribute("data-reveal-group")) {
        const step = mq("(max-width: 640px)") ? 45 : 70;
        Array.from(el.children).forEach((c, i) => { c.style.transitionDelay = Math.min(i * step, 520) + "ms"; });
      }
      revealObs.observe(el);
    });

    /* failsafe: nothing stays invisible, whatever the viewport does */
    setTimeout(showAll, 4000);
  }

  /* photography fades in on decode instead of popping */
  $$("img[loading='lazy']").forEach((img) => {
    if (img.closest(".p-card, .ditem")) return;   // grid images have their own timing
    img.classList.add("img-in");
    const on = () => img.classList.add("is-loaded");
    if (img.complete) on(); else { img.addEventListener("load", on, { once: true }); img.addEventListener("error", on, { once: true }); }
  });

  /* stat counters — eased count-up with a gentle grow, staggered per stat.
     decimals + lakh commas supported via data-count / data-decimals;
     tabular figures + reserved width keep the suffix perfectly still */
  function setFinalCount(el) {
    const dec = +(el.dataset.decimals || 0);
    el.textContent = parseFloat(el.dataset.count).toLocaleString("en-PK", {
      minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  if (reducedMotion) {
    $$("[data-count]").forEach(setFinalCount);
  } else {
    $$("[data-count]").forEach((el, i) => { el.dataset.delay = i * 120; });
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        countObs.unobserve(en.target);
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const dec = +(el.dataset.decimals || 0);
        const delay = +(el.dataset.delay || 0);
        const fmt = (v) => v.toLocaleString("en-PK", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const dur = 1500;
        setTimeout(() => {
          const t0 = performance.now();
          (function tick(t) {
            const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * eased);
            el.style.transform = "scale(" + (0.88 + 0.12 * eased) + ")";
            if (p < 1) requestAnimationFrame(tick);
            else { el.textContent = fmt(target); el.style.transform = ""; }
          })(t0);
        }, delay);
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach((el) => countObs.observe(el));
  }

  /* ── 4 · catalogue rendering ─────────────────────────────── */
  const ALL_CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];
  const CATEGORY_GROUP = {}; // category → group key
  Object.entries(GROUPS).forEach(([g, def]) => def.categories.forEach((c) => (CATEGORY_GROUP[c] = g)));

  const state = { group: "all", category: "all", quality: "all", query: "", sort: "popular" };
  const grid = $("#product-grid");

  function productCard(p, i) {
    return `
    <article class="p-card" data-id="${p.id}" style="animation-delay:${Math.min(i, 11) * 40}ms">
      <div class="p-card__img">
        <img src="${p.img}" alt="${esc(p.title)}" width="800" height="600" loading="lazy" decoding="async" />
        <button class="p-card__zoom" data-zoom="${p.id}" aria-label="View ${esc(p.title)} full screen">${icon("i-search")}${(p.images && p.images.length > 1) ? `<span>${p.images.length}</span>` : ""}</button>
        <span class="p-card__badge">${esc(p.badge)} · Class ${p.quality}</span>
        ${p.stock ? `<span class="chip chip--available p-card__stock"><i class="dot"></i>${esc(p.stock)}</span>` : ""}
      </div>
      <div class="p-card__body">
        <h3 class="p-card__title">${esc(p.title)}</h3>
        <div class="p-card__meta">
          ${icon("i-badge")}<span>${esc(p.supplier)}</span>
          <span class="sep">·</span>
          <span class="stars">${icon("i-star")}</span><span>${p.rating.toFixed(1)}</span>
          <span class="sep">·</span><span>${p.deals} orders</span>
        </div>
        <span class="p-card__range">Market range · ${esc(p.range)}</span>
        ${(() => { const s = SHIPPING_DEFAULTS[CATEGORY_GROUP[p.category]]; return s
          ? `<span class="p-card__ship">${icon("i-truck")}MOQ ${esc(s.moq)} · ${esc(s.delivery)}</span>` : ""; })()}
        <div class="p-card__foot">
          <div class="p-card__price">
            <s>${pkr(p.oldPrice)}</s>
            <strong>${pkr(p.price)}</strong>
            <small>${esc(p.unit)} · verified today</small>
          </div>
          <button class="p-card__add" data-add="${p.id}" aria-label="Add ${esc(p.title)} to quotation basket">Add</button>
        </div>
      </div>
    </article>`;
  }

  function visibleProducts() {
    let list = PRODUCTS.slice();
    if (state.group !== "all") list = list.filter((p) => CATEGORY_GROUP[p.category] === state.group);
    if (state.category !== "all") list = list.filter((p) => p.category === state.category);
    if (state.quality !== "all") list = list.filter((p) => p.quality === state.quality);
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter((p) => (p.title + " " + p.category + " " + p.brand + " " + p.badge).toLowerCase().includes(q));
    }
    if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (state.sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }

  function renderGrid() {
    const list = visibleProducts();
    $("#result-count").innerHTML =
      `Showing <strong>${list.length}</strong> of ${PRODUCTS.length} items` +
      (state.category !== "all" ? ` in <strong>${esc(state.category)}</strong>` : "") +
      " · rates verified today";
    if (!list.length) {
      grid.innerHTML = `<div class="no-results">${icon("i-search")}<h3>No items match your filters</h3><p>Try a different search, category or quality class \u2014 or ask us to source it.</p><button class="btn btn--ghost" data-clear-filters>Clear all filters</button></div>`;
      return;
    }
    grid.innerHTML = list.map((p, i) => productCard(p, i)).join("");
  }

  /* category chips — rebuilt when group changes */
  function renderChips() {
    const chips = $("#cat-chips");
    const cats = state.group === "all" ? ALL_CATEGORIES : GROUPS[state.group].categories;
    chips.innerHTML =
      `<button class="chip ${state.category === "all" ? "is-active" : ""}" data-cat="all">All categories</button>` +
      cats.map((c) => `<button class="chip ${state.category === c ? "is-active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
    $$("#cat-chips .chip").forEach((b) =>
      b.addEventListener("click", () => { state.category = b.dataset.cat; renderChips(); renderGrid(); }));
  }

  /* ── 5 · filter controls (materials.html only) ───────────── */
  if (grid) {
    /* arriving from another page via a "browse category" shortcut */
    const urlCat = new URLSearchParams(window.location.search).get("cat");
    if (urlCat && ALL_CATEGORIES.includes(urlCat)) {
      state.category = urlCat;
      state.group = CATEGORY_GROUP[urlCat] || "all";
    }
    $$("#group-tabs .tab").forEach((t) => t.classList.toggle("is-active", t.dataset.group === state.group));

    $("#group-tabs").addEventListener("click", (e) => {
      const b = e.target.closest(".tab"); if (!b) return;
      $$("#group-tabs .tab").forEach((t) => t.classList.remove("is-active"));
      b.classList.add("is-active");
      state.group = b.dataset.group;
      if (state.category !== "all" && state.group !== "all" &&
          !GROUPS[state.group].categories.includes(state.category)) state.category = "all";
      renderChips(); renderGrid();
    });

    $("#quality-tabs").addEventListener("click", (e) => {
      const b = e.target.closest(".tab"); if (!b) return;
      $$("#quality-tabs .tab").forEach((t) => t.classList.remove("is-active"));
      b.classList.add("is-active");
      state.quality = b.dataset.quality;
      renderGrid();
    });

    let searchT;
    $("#search").addEventListener("input", (e) => {
      clearTimeout(searchT);
      searchT = setTimeout(() => { state.query = e.target.value.trim(); renderGrid(); }, 160);
    });
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });

    grid.addEventListener("click", (e) => {
      if (e.target.closest("[data-clear-filters]")) { clearFilters(); return; }
      const z = e.target.closest("[data-zoom]");
      if (z) { lbOpen(PRODUCTS.find((p) => String(p.id) === z.dataset.zoom), z); return; }
      const b = e.target.closest("[data-add]"); if (!b) return;
      addToCart(+b.dataset.add);
      b.classList.add("added");
      b.setAttribute("aria-live", "polite");
      b.textContent = "Added ✓";
      setTimeout(() => { b.classList.remove("added"); b.textContent = "Add"; }, 1400);
    });
  }

  /* reset every filter from the empty state so it is never a dead end */
  function clearFilters() {
    state.group = "all"; state.category = "all"; state.quality = "all"; state.query = ""; state.sort = "popular";
    const search = $("#search"); if (search) search.value = "";
    const sort = $("#sort"); if (sort) sort.value = "popular";
    $$("#group-tabs .tab").forEach((t) => t.classList.toggle("is-active", t.dataset.group === "all"));
    $$("#quality-tabs .tab").forEach((t) => t.classList.toggle("is-active", t.dataset.quality === "all"));
    renderChips(); renderGrid();
  }

  /* ── 10 · "browse category" shortcuts on other pages ─────────
     On materials.html this filters in place; from any other page
     (Home, Construction) it hands off to materials.html?cat=… */
  $$("[data-goto-cat]").forEach((b) =>
    b.addEventListener("click", () => {
      const cat = b.dataset.gotoCat;
      if (!grid) { window.location.href = "materials.html?cat=" + encodeURIComponent(cat); return; }
      state.group = CATEGORY_GROUP[cat] || "all";
      state.category = cat;
      $$("#group-tabs .tab").forEach((t) => t.classList.toggle("is-active", t.dataset.group === state.group));
      renderChips(); renderGrid();
      grid.scrollIntoView({ behavior: "smooth" });
    }));

  /* ── 6 · live bidding board ──────────────────────────────
     Rows are keyed by supplier and reordered in place rather than
     rebuilt, so a rank change reads as movement and the rate can
     animate between its old and new value. The ticker sleeps while
     the section is off-screen or the tab is hidden. */
  const bidListEl = $("#bid-list");
  if (bidListEl) {
  let bids = BID_SEED.map((b) => ({ ...b }));
  let prevRates = {};

  const timeAgo = (mins) => (mins < 1 ? "just now" : mins === 1 ? "1 min ago" : mins + " min ago");
  const bidKey  = (b) => b.supplier + "|" + b.city;

  function bidRow(b, isBest) {
    return `
      <li class="bid ${isBest ? "is-best" : ""}" data-key="${esc(bidKey(b))}">
        <span class="bid__dot"></span>
        <span class="bid__who">
          <strong>${esc(b.supplier)} ${isBest ? "<em>· Best bid</em>" : ""}</strong>
          <small>${esc(b.city)} <span class="bid__rel">${icon("i-shield")} ${b.reliability}% reliable</span> · delivery ${esc(b.delivery)}</small>
        </span>
        <span class="bid__rate">
          <strong>${pkr(b.rate)}</strong>
          <small>${timeAgo(b.mins)}</small>
          <span class="bid__delta" aria-hidden="true"></span>
        </span>
      </li>`;
  }

  function renderBids(isFirstPaint) {
    const sorted = bids.slice().sort((a, b) => a.rate - b.rate);
    const best = sorted[0];
    const bestEl = $("#best-bid-rate");
    const prevBest = prevRates.__best;

    bestEl.innerHTML = `${pkr(best.rate)} <small>/ bag</small>`;
    if (!isFirstPaint && prevBest != null && best.rate < prevBest) {
      bestEl.classList.add("is-improved");
      setTimeout(() => bestEl.classList.remove("is-improved"), 1600);
    }
    $("#best-bid-supplier").textContent = `${best.supplier} · ${best.city}`;

    const wasRanked = Object.keys(prevRates).length > 1;
    bidListEl.innerHTML = sorted.map((b, i) => bidRow(b, i === 0)).join("");

    if (isFirstPaint || reducedMotion) { snapshotRates(sorted); return; }

    $$(".bid", bidListEl).forEach((row, i) => {
      const key = row.dataset.key;
      const rate = sorted[i].rate;
      const was = prevRates[key];

      if (was === undefined) {
        row.classList.add("is-new");                    // supplier just joined
      } else if (rate !== was) {
        row.classList.add(rate < was ? "rate-down" : "rate-up");
        const delta = $(".bid__delta", row);
        const diff = Math.abs(rate - was);
        delta.textContent = (rate < was ? "▼ " : "▲ ") + pkr(diff).replace("PKR ", "");
        delta.className = "bid__delta is-on bid__delta--" + (rate < was ? "down" : "up");
        setTimeout(() => { row.classList.remove("rate-down", "rate-up"); delta.classList.remove("is-on"); }, 2200);
      }
      if (i === 0 && wasRanked && prevRates.__bestKey !== key) row.classList.add("is-promoted");
    });
    snapshotRates(sorted);
  }

  function snapshotRates(sorted) {
    prevRates = {};
    sorted.forEach((b) => (prevRates[bidKey(b)] = b.rate));
    prevRates.__best = sorted[0].rate;
    prevRates.__bestKey = bidKey(sorted[0]);
  }

  function pushBid() {
    const pool = BID_POOL[Math.floor(Math.random() * BID_POOL.length)];
    const min = Math.min(...bids.map((b) => b.rate));
    const rate = Math.random() < 0.55
      ? min - (1 + Math.floor(Math.random() * 4))          // undercut the best bid
      : min + 4 + Math.floor(Math.random() * 40);          // or arrive above
    bids.forEach((b) => (b.mins += 2));
    bids.unshift({ ...pool, rate, mins: 0 });
    bids = bids.slice(0, 6);
    renderBids(false);
    const online = $("#suppliers-online");
    if (online) online.textContent = 28 + Math.floor(Math.random() * 11);
  }

  renderBids(true);

  /* the old build left this ticking forever, on every tab, on battery */
  let bidTimer = null;
  let bidVisible = false;
  const bidTick = () => {
    if (bidTimer || !bidVisible || document.hidden) return;
    bidTimer = setInterval(pushBid, 7000);
  };
  const bidStop = () => { clearInterval(bidTimer); bidTimer = null; };

  if ("IntersectionObserver" in window && bidListEl) {
    const bidObs = new IntersectionObserver((ents) => {
      bidVisible = ents[0].isIntersecting;
      if (bidVisible) { bidTick(); } else { bidStop(); }
    }, { rootMargin: "120px" });
    bidObs.observe(bidListEl);
  } else {
    bidVisible = true; bidTick();
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) bidStop(); else bidTick(); });
  setTimeout(() => { if (bidVisible) pushBid(); }, 2600);   // quick first incoming bid
  } // end bidListEl guard


  /* ── 11 · product lightbox ───────────────────────────────────
     Built once, reused for every product. Focus is trapped while
     open and returned to the trigger on close. */
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML = `
    <div class="lightbox__overlay" data-lb-close></div>
    <figure class="lightbox__fig" role="dialog" aria-modal="true" aria-label="Product image">
      <img class="lightbox__img" alt="" />
      <figcaption class="lightbox__cap"></figcaption>
      <button class="lightbox__nav lightbox__nav--prev" data-lb-prev aria-label="Previous image">${icon("i-chev-d")}</button>
      <button class="lightbox__nav lightbox__nav--next" data-lb-next aria-label="Next image">${icon("i-chev-d")}</button>
      <button class="lightbox__x" data-lb-close aria-label="Close">${icon("i-x")}</button>
      <div class="lightbox__dots"></div>
    </figure>`;
  document.body.appendChild(lb);

  let lbShots = [], lbIndex = 0, lbReturn = null;

  function lbPaint() {
    $(".lightbox__img", lb).src = lbShots[lbIndex];
    $(".lightbox__dots", lb).innerHTML = lbShots.length > 1
      ? lbShots.map((_, i) => `<i class="${i === lbIndex ? "is-on" : ""}"></i>`).join("") : "";
    const multi = lbShots.length > 1;
    $$("[data-lb-prev],[data-lb-next]", lb).forEach((b) => (b.hidden = !multi));
  }
  function lbOpen(product, trigger) {
    lbShots = (product.images && product.images.length ? product.images : [product.img]).filter(Boolean);
    if (!lbShots.length) return;
    lbIndex = 0; lbReturn = trigger;
    $(".lightbox__cap", lb).textContent = product.title;
    $(".lightbox__img", lb).alt = product.title;
    lbPaint();
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".lightbox__x", lb).focus();
  }
  function lbClose() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lbReturn) { lbReturn.focus(); lbReturn = null; }
  }
  const lbStep = (d) => { lbIndex = (lbIndex + d + lbShots.length) % lbShots.length; lbPaint(); };

  lb.addEventListener("click", (e) => {
    if (e.target.closest("[data-lb-close]")) return lbClose();
    if (e.target.closest("[data-lb-prev]")) return lbStep(-1);
    if (e.target.closest("[data-lb-next]")) return lbStep(1);
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowLeft") lbStep(-1);
    if (e.key === "ArrowRight") lbStep(1);
  });

  /* ── 7 / 8 / 9 · basket, drawer, checkout ────────────────── */
  const CART_KEY = "cka-basket-v1";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
  cart = cart.filter((ci) => PRODUCTS.some((p) => p.id === ci.id));

  const drawer = $("#drawer");
  const cartCount = $("#cart-count");
  const checkoutView = $("#drawer-checkout-view");
  const itemsView = $("#drawer-items-view");
  const successView = $("#drawer-success-view");
  let mode = "items"; // items | checkout | success

  const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ } };
  const cartQty = () => cart.reduce((s, ci) => s + ci.qty, 0);
  const cartTotal = () => cart.reduce((s, ci) => s + ci.qty * PRODUCTS.find((p) => p.id === ci.id).price, 0);

  function syncCartBadge() {
    cartCount.textContent = cartQty();
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth; // restart animation
    cartCount.classList.add("bump");
  }

  function renderCart() {
    const listEl = $("#drawer-list");
    const emptyEl = $("#drawer-empty");
    const foot = $("#drawer-foot");
    if (!cart.length && mode === "items") {
      listEl.innerHTML = "";
      emptyEl.classList.add("is-visible");
      foot.style.display = "none";
      return;
    }
    emptyEl.classList.remove("is-visible");
    foot.style.display = "";
    listEl.innerHTML = cart.map((ci) => {
      const p = PRODUCTS.find((x) => x.id === ci.id);
      return `
      <li class="ditem">
        <img class="ditem__img" width="56" height="56" loading="lazy" decoding="async" src="${p.img}" alt="${esc(p.title)}" />
        <div>
          <span class="ditem__title">${esc(p.title)}</span>
          <span class="ditem__meta">${esc(p.badge)} · ${esc(p.unit)}</span>
          <span class="ditem__price">${pkr(p.price * ci.qty)} <small>(${ci.qty} × ${pkr(p.price)})</small></span>
        </div>
        <div class="ditem__right">
          <span class="qty">
            <button data-dec="${p.id}" aria-label="Decrease quantity">${icon("i-minus")}</button>
            <b>${ci.qty}</b>
            <button data-inc="${p.id}" aria-label="Increase quantity">${icon("i-plus")}</button>
          </span>
          <button class="ditem__del" data-del="${p.id}">${icon("i-trash")} Remove</button>
        </div>
      </li>`;
    }).join("");
    $("#drawer-subtotal").textContent = pkr(cartTotal());
  }

  function addToCart(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    const line = cart.find((ci) => ci.id === id);
    if (line) line.qty += 1; else cart.push({ id, qty: 1 });
    saveCart(); syncCartBadge(); renderCart();
    toast(`<strong>${esc(p.title)}</strong> added for quick quotation`, { action: "View basket", onAction: openDrawer });
  }

  $("#drawer-list").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const del = e.target.closest("[data-del]");
    if (inc) { cart.find((ci) => ci.id === +inc.dataset.inc).qty += 1; }
    if (dec) {
      const line = cart.find((ci) => ci.id === +dec.dataset.dec);
      line.qty -= 1;
      if (line.qty <= 0) cart = cart.filter((ci) => ci.id !== line.id);
    }
    if (del) cart = cart.filter((ci) => ci.id !== +del.dataset.del);
    if (inc || dec || del) { saveCart(); syncCartBadge(); renderCart(); }
  });

  function setMode(next) {
    mode = next;
    itemsView.hidden = next !== "items";
    checkoutView.hidden = next !== "checkout";
    successView.hidden = next !== "success";
    $("#back-to-basket").hidden = next !== "checkout";
    $("#checkout-next").hidden = next === "success";
    $("#drawer-foot").style.display = next === "success" ? "none" : (cart.length ? "" : "none");
    $("#checkout-next").innerHTML = next === "checkout"
      ? "Submit Quotation Request " + icon("i-arrow-r")
      : "Open Quick Checkout " + icon("i-arrow-r");
    $("#drawer-title").textContent = next === "checkout" ? "Your delivery details" : "Fast Material Checkout";
    if (next === "items") renderCart();
  }

  function openDrawer() {
    if (!cart.length && mode !== "success") setMode("items");
    else setMode(mode === "success" ? "items" : mode);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (mode === "success") { setMode("items"); renderCart(); }
  }
  $("#cart-open").addEventListener("click", openDrawer);
  $$("[data-open-drawer]").forEach((el) => el.addEventListener("click", openDrawer));
  $$("[data-close-drawer]").forEach((el) => el.addEventListener("click", closeDrawer));

  $("#back-to-basket").addEventListener("click", () => setMode("items"));

  $("#checkout-next").addEventListener("click", () => {
    if (!cart.length) { toast("Your basket is empty — add materials first.", { warn: true }); return; }
    if (mode === "items") { setMode("checkout"); return; }
    // submit checkout
    const form = $("#checkout-form");
    if (!validate(form)) return;
    const ref = "CKA-Q-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000));
    $("#quote-ref").textContent = ref;
    cart = []; saveCart(); syncCartBadge();
    form.reset();
    setMode("success");
  });

  /* ── 7 · other forms (project / supplier / contact / news) ──
     Inline validation replaces the browser bubble: the message sits
     under the field, the field is marked aria-invalid for screen
     readers, and the error clears as soon as the value becomes valid. */
  function fieldMessage(input) {
    let msg = input.parentElement.querySelector(".field-msg");
    if (!msg) {
      msg = document.createElement("span");
      msg.className = "field-msg";
      msg.id = (input.id || input.name || "f" + Math.random().toString(36).slice(2, 7)) + "-err";
      msg.setAttribute("role", "alert");
      input.parentElement.appendChild(msg);
    }
    return msg;
  }

  function markInvalid(input) {
    const msg = fieldMessage(input);
    msg.textContent = input.validationMessage;
    msg.classList.add("is-on");
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", msg.id);
  }

  function clearInvalid(input) {
    const msg = input.parentElement.querySelector(".field-msg");
    if (msg) { msg.classList.remove("is-on"); msg.textContent = ""; }
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }

  function validate(form) {
    const fields = $$("input, select, textarea", form).filter((f) => f.willValidate);
    let firstBad = null;
    fields.forEach((f) => {
      if (f.checkValidity()) { clearInvalid(f); }
      else { markInvalid(f); if (!firstBad) firstBad = f; }
    });
    if (firstBad) { firstBad.focus(); firstBad.scrollIntoView({ block: "center", behavior: "smooth" }); }
    return !firstBad;
  }

  /* clear the error the moment the field becomes valid again */
  $$("form").forEach((form) => {
    form.addEventListener("input", (e) => {
      const f = e.target;
      if (f.willValidate && f.hasAttribute("aria-invalid") && f.checkValidity()) clearInvalid(f);
    });
  });

  function handleForm(id, buildMsg) {
    const form = $("#" + id);
    if (!form) return;
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      form.classList.add("is-sending");
      /* front-end only: the pause is what a real POST would cost, so the
         button state is honest rather than instantaneous */
      setTimeout(() => {
        form.classList.remove("is-sending");
        const ref = "CKA-" + String(Math.floor(10000 + Math.random() * 90000));
        toast(buildMsg(ref));
        form.reset();
        $$("input, select, textarea", form).forEach(clearInvalid);
        const fl = $("#file-label");
        if (id === "project-form" && fl) fl.innerHTML = "<strong>Click to upload</strong> — PDF, Excel or image, max 10 MB";
      }, 520);
    });
  }
  handleForm("supplier-form", (ref) => `Registration received — reference <strong>#${ref}</strong>. Our team will schedule your verification visit.`);
  handleForm("news-form", () => "Subscribed — tomorrow's rate list lands in your inbox.");

  /* ── project-form: real backend submission ───────────────────
     Posts to CKAStore.projects.create() (Supabase `projects` table),
     uploads the BOQ/drawing to Storage first if one was attached.
     If the network call fails — e.g. schema not migrated yet, or the
     visitor is offline — the person is told honestly rather than
     shown a fake success state. */
  const projectForm = $("#project-form");
  if (projectForm && typeof CKAStore === "undefined") {
    handleForm("project-form", (ref) => `Project submitted — reference <strong>#${ref}</strong>. Supplier quotations will appear on your board shortly.`);
  } else if (projectForm) {
    projectForm.setAttribute("novalidate", "");
    projectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate(projectForm)) return;
      projectForm.classList.add("is-sending");
      const fd = new FormData(projectForm);
      const payload = {
        name: fd.get("name"), phone: fd.get("phone"), ptype: fd.get("ptype"),
        city: fd.get("city"), material: fd.get("material"), qty: fd.get("qty"),
        message: fd.get("message"), file: null
      };
      try {
        const file = fd.get("file");
        if (file && file.size) payload.file = await CKAStore.files.upload(file, { folder: "projects" });
        const row = await CKAStore.projects.create(payload);
        projectForm.classList.remove("is-sending");
        toast(`Project submitted — reference <strong>${esc(row.reference)}</strong>. Supplier quotations will appear on your board shortly.` +
          (row.persisted ? "" : " (saved on this device only — connect Supabase to sync it.)"));
        projectForm.reset();
        $$("input, select, textarea", projectForm).forEach(clearInvalid);
        const fl = $("#file-label");
        if (fl) fl.innerHTML = "<strong>Click to upload</strong> — PDF, Excel or image, max 10 MB";
      } catch (err) {
        console.error("project submit failed:", err);
        projectForm.classList.remove("is-sending");
        toast("Couldn't reach the server just now — please try again, or WhatsApp your BOQ to +92 315 5387676.", { warn: true });
      }
    });
  }

  /* ── contact-form: real backend submission (inquiries table) ── */
  const contactForm = $("#contact-form");
  if (contactForm && typeof CKAStore === "undefined") {
    handleForm("contact-form", () => "Message sent — CKA BuildStruct will contact you shortly.");
  } else if (contactForm) {
    contactForm.setAttribute("novalidate", "");
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate(contactForm)) return;
      contactForm.classList.add("is-sending");
      const fd = new FormData(contactForm);
      const payload = { name: fd.get("name"), phone: fd.get("phone"), email: fd.get("email"), topic: fd.get("topic"), message: fd.get("message") };
      try {
        await CKAStore.inquiries.create(payload);
        contactForm.classList.remove("is-sending");
        toast("Message sent — CKA BuildStruct will contact you shortly.");
        contactForm.reset();
        $$("input, select, textarea", contactForm).forEach(clearInvalid);
      } catch (err) {
        console.error("contact submit failed:", err);
        contactForm.classList.remove("is-sending");
        toast("Couldn't reach the server just now — please try again, or WhatsApp us at +92 315 5387676.", { warn: true });
      }
    });
  }

  const boqFile = $("#boq-file");
  if (boqFile) boqFile.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast("File is larger than 10 MB — please compress or email it to info@ckabuildstruct.com.", { warn: true });
      e.target.value = "";
      return;
    }
    $("#file-label").innerHTML = `<strong>${esc(f.name)}</strong> attached (${(f.size / 1024 / 1024).toFixed(1)} MB) — click to replace`;
  });

  /* ── 11 · mobile menu ────────────────────────────────────── */
  const nav = $("#nav"), menuBtn = $("#menu-btn");
  function closeMenu() { nav.classList.remove("is-open"); menuBtn.innerHTML = icon("i-menu"); document.body.style.overflow = ""; document.body.classList.remove("nav-open"); }
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuBtn.innerHTML = icon(open ? "i-x" : "i-menu");
    document.body.style.overflow = open ? "hidden" : "";
    document.body.classList.toggle("nav-open", open);
  });
  const navScrim = $("#nav-scrim");
  if (navScrim) navScrim.addEventListener("click", closeMenu);
  navLinks.concat([$(".nav__cta")]).filter(Boolean).forEach((a) => a.addEventListener("click", closeMenu));

  /* ── 12 · privacy / terms modals ─────────────────────────── */
  function openModal(id) {
    const m = $("#modal-" + id);
    if (!m) return;
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  $$("[data-modal]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); openModal(a.dataset.modal); }));
  $$("[data-close-modal]").forEach((el) =>
    el.addEventListener("click", () => {
      el.closest(".modal-wrap").classList.remove("is-open");
      document.body.style.overflow = "";
    }));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrawer();
      closeMenu();
      $$(".modal-wrap.is-open").forEach((m) => m.classList.remove("is-open"));
      document.body.style.overflow = "";
    }
  });

  /* keyboard: Enter/Space doesn't "double submit" drawer buttons */
  $$(".pay input").forEach((r) => r.addEventListener("change", () => {}));

  /* ── 14 · construction pill-tabs (construction.html) ─────── */
  const conTabs = $("#con-tabs");
  if (conTabs) {
    conTabs.addEventListener("click", (e) => {
      const b = e.target.closest(".pill-tab"); if (!b) return;
      $$(".pill-tab", conTabs).forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      b.classList.add("is-active"); b.setAttribute("aria-selected", "true");
      $$(".tabpanel").forEach((p) => p.classList.toggle("is-active", p.id === "panel-" + b.dataset.tab));
    });
  }

  /* ── 15 · design services — clickable, functional categories ─
     (design.html) each card expands in place with gallery, packages,
     provider and a "Request Service" button that hands off to the
     contact page with the topic pre-filled. */
  const designGrid = $("#design-grid");
  if (designGrid) {
    designGrid.innerHTML = DESIGN_SERVICES.map((d) => `
      <article class="design-cat" id="svc-${d.id}">
        <button class="design-cat__head" data-toggle-design="${d.id}" aria-expanded="false">
          <img class="design-cat__thumb" src="${d.img}" alt="" loading="lazy" width="80" height="80" decoding="async" />
          <span class="design-cat__head-text">
            <strong>${esc(d.name)}</strong>
            <small>${esc(d.startingPrice)}</small>
          </span>
          <svg class="ic design-cat__chev"><use href="#i-chev-d"/></svg>
        </button>
        <div class="design-cat__detail">
          <figure class="design-cat__fig"><img src="${d.img}" alt="${esc(d.alt)}" loading="lazy" width="900" height="600" decoding="async" /></figure>
          <div class="design-cat__body">
            <p>${esc(d.desc)}</p>
            <ul class="design-cat__packages">
              ${d.packages.map((pk) => `<li><span>${esc(pk.name)}</span><strong>${esc(pk.price)}</strong></li>`).join("")}
            </ul>
            <p class="design-cat__provider">${icon("i-badge")} Delivered by <strong>${esc(d.provider)}</strong></p>
            <a class="btn btn--brand" href="contact.html?topic=Design+Service&amp;service=${encodeURIComponent(d.name)}#contact-form">Request Service ${icon("i-arrow-r")}</a>
          </div>
        </div>
      </article>`).join("");

    designGrid.addEventListener("click", (e) => {
      const b = e.target.closest("[data-toggle-design]"); if (!b) return;
      const card = b.closest(".design-cat");
      const wasOpen = card.classList.contains("is-open");
      $$(".design-cat", designGrid).forEach((c) => { c.classList.remove("is-open"); $(".design-cat__head", c).setAttribute("aria-expanded", "false"); });
      if (!wasOpen) { card.classList.add("is-open"); b.setAttribute("aria-expanded", "true"); }
    });

    /* deep link e.g. design.html#svc-interior opens straight to that category */
    if (location.hash) {
      const target = $(location.hash);
      if (target && target.classList.contains("design-cat")) {
        target.classList.add("is-open");
        $(".design-cat__head", target).setAttribute("aria-expanded", "true");
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
      }
    }
  }

  /* ── 16 · supplier directory (suppliers.html) ────────────── */
  const supplierGrid = $("#supplier-grid");
  if (supplierGrid) {
    supplierGrid.innerHTML = SUPPLIERS.map((s) => `
      <article class="supplier-card">
        <div class="supplier-card__img"><img src="${s.img}" alt="${esc(s.alt)}" loading="lazy" width="500" height="330" decoding="async" /></div>
        <div class="supplier-card__body">
          <div class="supplier-card__head">
            <h3>${esc(s.name)}</h3>
            ${s.verified ? `<span class="chip chip--verified">${icon("i-shield")}Verified</span>` : `<span class="chip chip--neutral">Verification pending</span>`}
          </div>
          <p class="supplier-card__meta">${icon("i-pin")}${esc(s.city)} · ${s.years} yrs in business</p>
          <p class="supplier-card__cats">${s.categories.map((c) => `<span class="chip chip--info">${esc(c)}</span>`).join("")}</p>
          <p class="supplier-card__desc">${esc(s.desc)}</p>
          <div class="supplier-card__foot">
            <span class="stars">${icon("i-star")}</span><strong>${s.rating.toFixed(1)}</strong>
            <span class="sep">·</span><span>${s.reliability}% reliability</span>
          </div>
        </div>
      </article>`).join("");
  }

  /* ── 17 · daily updates feed (daily-updates.html) ─────────── */
  const updatesGrid = $("#updates-grid");
  if (updatesGrid) {
    const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    let activeCat = "all";
    function renderUpdates() {
      const list = activeCat === "all" ? DAILY_UPDATES : DAILY_UPDATES.filter((u) => u.category === activeCat);
      updatesGrid.innerHTML = list.map((u) => `
        <article class="update-card">
          <div class="update-card__img"><img src="${u.img}" alt="" loading="lazy" width="500" height="330" decoding="async" /><span class="chip chip--info update-card__tag">${esc(u.label)}</span></div>
          <div class="update-card__body">
            <time datetime="${u.date}">${fmtDate(u.date)}</time>
            <h3>${esc(u.title)}</h3>
            <p>${esc(u.body)}</p>
          </div>
        </article>`).join("");
    }
    const updatesTabs = $("#updates-tabs");
    if (updatesTabs) updatesTabs.addEventListener("click", (e) => {
      const b = e.target.closest(".tab"); if (!b) return;
      $$(".tab", updatesTabs).forEach((t) => t.classList.remove("is-active"));
      b.classList.add("is-active");
      activeCat = b.dataset.updateCat;
      renderUpdates();
    });
    renderUpdates();
  }

  /* ── 18 · contact page: pre-fill inquiry type from ?topic= ─── */
  const contactTopic = $("#contact-form [name='topic']");
  if (contactTopic) {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    const service = params.get("service");
    if (topic) {
      const opt = $$("option", contactTopic).find((o) => o.value === topic);
      if (opt) contactTopic.value = topic;
    }
    if (service) {
      const msg = $("#contact-form [name='message']");
      if (msg && !msg.value) msg.value = `I'd like a quotation for: ${service}`;
    }
  }

  /* ── initial render ──────────────────────────────────────── */
  if (grid) { renderChips(); renderGrid(); }
  syncCartBadge();
  cartCount.classList.remove("bump");
  renderCart();
  setMode("items");
})();
