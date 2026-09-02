# CKA BuildStruct — Rebuilt Static Site (v20)

A complete rebuild of the CKA BuildStruct website as a **hand-written static site** — no
build step, no framework runtime, fully readable and easy to improve.

## What changed vs. the old bundle

**Design & realism**
- Full professional redesign: announcement bar, hero with live rate card + stats,
  brand marquee, process steps, testimonials, FAQ, CTA banner and a complete footer.
- **Fixed broken product imagery** — the old bundle showed unrelated photos for
  bricks, steel and sand (including non-construction images). Every category now has
  a correct, consistent, locally-hosted photo (`assets/img/`).
- Correct trust details: ratings, order counts, market price ranges, quality classes,
  verified-supplier labels, daily rate timestamps.

**Functionality (all original features kept)**
- Grey Structure / Finishing / Plumbing panels that deep-link into the catalogue.
- Materials marketplace: search, group tabs, category chips, quality-class tabs and sorting.
- Quotation basket with quantity +/−, remove, subtotal and localStorage persistence.
- Fast checkout drawer with payment method selection (Bank Transfer / JazzCash /
  EasyPaisa / COD) and a reference-number success screen.
- Post-a-Project form with BOQ/drawing upload + **live managed bidding board**
  (suppliers undercut each other in real time, best bid highlighted).
- Supplier registration, contact form, newsletter, Privacy & Terms modals, FAQ accordion.

**Engineering**
- Plain HTML + CSS + vanilla JS. No React, no bundler, no npm — open and edit any file.
- Product catalogue lives in one readable file: `assets/js/data.js`.
- All images are local in `assets/img/` (nothing hot-linked that can 404).
- All photography is **WebP** (≈40 % lighter than the old JPGs); the hero ships in
  two video sizes so the whole package is ~13 MB instead of ~28 MB.
- Motion polish: one-time gold sheen across the hero headline, a poster-blend
  crossfade that hides the video loop cut, scroll reveals, Ken Burns photography —
  all disabled automatically for `prefers-reduced-motion` users.
- v7 polish: cinematic hero vignette + scroll cue, card elevation on hover, gold
  stat rules, pull-quote glyphs, quiet custom scrollbar, and a professional
  language pass across all copy.
- v8: cinematic video CTA band (crane timelapse, lazy-loaded with the same
  loop-fade as the hero), and the catalogue "Browse all" links moved to their
  own separated row so they no longer collide with category links.
- v9: new **Construction** segment above the materials catalogue — Site /
  Design / Online Services cards, a blueprint-review video panel and a
  "drawing desk" photo gallery. Nav entry added; sections renumbered 01–11.
- Note: drawing/office photos in the Construction segment are search-sourced
  placeholders — replace with your own or licensed stock before going live.
- v10: hero stats fixed and polished — a CSS selector leak had been shrinking
  the animated figures next to the "+" sign; counters now use tabular figures,
  reserved widths (no sideways jump), decimals (98.4%), staggered starts and a
  gentle scale-grow, with gold full-size suffixes.
- v11: Construction segment imagery corrected after manual review — the Site
  card had shown glass skyscrapers (now a real RCC slab-fixing crew), the
  Design card had an AI-style render with garbled baked-in text (now a clean
  photo of printed plans), and the drafting gallery crop was fixed to fully
  remove a title banner. All Construction images visually verified.
- v12: 29 Master Fit SKUs added to the catalogue from the official rate lists
  (PPRC pipes 40–63 mm, UPVC 13-rft classes Pressure/Sewerage/B/D, PPRC +
  UPVC fittings — see `PRODUCTS` under "MASTER FIT"). On-screen footage
  credits removed; Construction video is now a single full-width panel
  (gallery strip retired per client request).
- v13: **Real Master Fit product photos.** The pictures were extracted from
  the official rate-list PDF the client supplied, each one manually cropped,
  cleaned (table grid/text removed, backgrounds whitened, panels framed) and
  exported as 800×600 WebP (`assets/img/mf-*.webp`, 22 images). All 34
  Master Fit SKUs in Plumbing Pipes and Plumbing Fittings now show the
  actual product — green PPRC on white, white uPVC in their blue catalog
  panels — instead of the generic placeholders. Every image was visually
  verified before shipping.
- v14: Real business details wired in — phone/WhatsApp `0315 5387676` (all `tel:`
  and `wa.me` links), head office updated to Police Khidmat Markaz, G-14/4,
  Islamabad, official Instagram linked (Contact section + footer), unused
  dead social icons removed.
- v15: **Mobile menu fixed.** The header's backdrop blur made the slide-in
  menu render transparent on phones (links unreadable over the page). Header
  now uses a solid background on small screens; the menu panel is fully
  opaque and scrollable, and a dark tap-to-close overlay sits behind it.
- v16: **Mobile spacing + blank-section fix.** Scroll-reveal animation is now
  skipped on phones (tall sections could stay invisible on small screens),
  section padding tightened (was leaving giant white gaps), hero eyebrow and
  rating line wrap cleanly. CSS/JS links now carry a version tag so phones
  always load the latest files instead of a cached copy.
- v17: **App-style mobile taskbar.** A fixed bottom bar (Home, Materials,
  raised gold Post-Project button, Design, Contact) with icons and live
  section highlighting. Hides while the full menu is open; WhatsApp bubble
  moved above it; page gets bottom padding so nothing is covered.

- v18: **Warm palette + system pass.** Backgrounds moved to warm architectural
  neutrals (`--paper` #F8F7F4, `--concrete` #ECEAE6 section band, `--card`
  #FCFCFA, `--line` #D9DCDD); gold, navy, Space Grotesk and Instrument Serif
  unchanged. Forest green `#2F5D50` added as a semantic role for verified
  suppliers, success, availability and payment confirmation only. Section
  rhythm reworked to paper/band/white/dark so card grids sit on the concrete
  band. Added h3/h4 type scale, a spacing scale, reusable `.chip` state
  components, skip link, focus rings on dark surfaces, 32px touch targets,
  hover+focus-within parity, an actionable empty state, and fixed an inverted
  mobile section-padding rule (640px screens had more padding than 920px).
  SEO: canonical, Open Graph, Twitter card, theme-color and a JSON-LD graph
  (Organization/HomeAndConstructionBusiness + WebSite + FAQPage).
  Performance: every image carries width/height/decoding, photography
  re-encoded (4.4 MB → 2.2 MB), background video stripped of its dead audio
  tracks and re-encoded with +faststart (21 MB → 9 MB). Whole package
  27 MB → 12 MB. See `DESIGN_SYSTEM.md` for the token contract.

- v19: **Motion system + code audit.** Scroll reveals gained six role-assigned
  variants (up / left / right / scale / blur / rise) with paired columns
  counter-moving, and were **restored on phones** — v16 had disabled them
  entirely, so mobile had no motion at all; a 4s failsafe now prevents the
  blank-section bug that caused it. Two identical IntersectionObservers merged
  into one. Photography fades in on decode instead of popping.
  **Live bidding board rewritten**: rows are keyed by supplier and reordered in
  place instead of being rebuilt via innerHTML, so rank changes read as
  movement; rates tint green/red with a delta chip; a new best bid gets a
  promotion highlight. The ticker now sleeps when the section is off-screen or
  the tab is hidden (previously it ran forever, on every tab, on battery).
  Removed dead `bids.forEach(b => b.mins += 0)` no-op.
  **Forms**: browser validation bubbles replaced with inline messages carrying
  `aria-invalid`, `aria-describedby` and `role="alert"`, clearing as soon as the
  field becomes valid; submit shows a sending state; success tick draws itself in.
  Added `robots.txt` and `sitemap.xml`. Unused CSS swept.

- v20: **Phase 2 — admin console, data layer, schema.** New `admin.html`
  (product CRUD, search/sort/filter, Excel import with a validating preview,
  Excel export, category and insight views) built entirely from the existing
  design tokens. New `assets/js/store.js` is the only file that knows where
  data lives — `LocalStore` works today, `SupabaseStore` is written and one
  line from active. New `db/schema.sql`: normalised Postgres/Supabase schema
  with products, variants, images, categories, suppliers, profiles, quotes,
  quote_items, supplier_bids, projects, project_files, inquiries and
  site_content, plus indexes, updated_at triggers and row-level security.
  New `docs/CKA-Product-Import-Template.xlsx` with all 20 requested columns,
  dropdown validation, a field guide and the live category list.
  Public site: product lightbox with gallery navigation, keyboard and focus
  handling; multi-image support via a product `images` array.
  Branding: the wordmark is now a single typeface (Space Grotesk), hierarchy
  carried by weight and tracking instead of a second face.
  **Not built:** authentication, file uploads, quotation inbox and live bidding
  all require a backend — see the “Not built yet” tab in the console.

## File map

```
index.html                  page structure + copy
assets/css/styles.css       design system (tokens at the top)
assets/js/data.js           ← EDIT THIS: contact info, products, prices, bid demo
assets/js/app.js            rendering + interactivity (commented, sectioned)
DESIGN_SYSTEM.md            ← READ BEFORE ADDING A PAGE: tokens, rules, components, motion
admin.html                  local admin console (do not expose publicly as-is)
assets/js/store.js          ← THE DATA LAYER: swap backends here, nowhere else
assets/js/admin.js          admin console logic
assets/css/admin.css        admin console styles (reuses styles.css tokens)
db/schema.sql               Postgres / Supabase schema for the real backend
docs/CKA-Product-Import-Template.xlsx   product import template
robots.txt                  crawler rules + sitemap pointer
sitemap.xml                 update the <loc> host before going live
assets/img/                 all photography used by the site
```

## Common edits

| Task | Where |
| --- | --- |
| Change phone / WhatsApp / emails | `assets/js/data.js` → `SITE` (and the 4 `wa.me`/`tel:` links in `index.html`) |
| Add / edit a product | `assets/js/data.js` → `PRODUCTS` (copy a line, keep `id` unique) |
| Update prices | `assets/js/data.js` → `price` / `oldPrice` / `range` |
| Add a category | `assets/js/data.js` → add products, then list the category in the right `GROUPS` entry |
| Change colors | `assets/css/styles.css` → `:root` tokens (`--gold`, `--blue`, `--red`, `--ink`, `--paper`, …) |
| Update the logo | Replace files in `assets/img/`: `logo-mark.png` (header, transparent), `logo-light.png` (footer/dark), `logo.png` (full lockup), `favicon.png` |
| Change the hero video | Replace `assets/video/hero-720.mp4` / `hero-540.mp4` (same names; JS picks per screen — 540 on mobile/data-saver, 720 otherwise). Poster frame: `assets/img/hero-site.webp` |
| Change the CTA band video | Replace `assets/video/site-720.mp4` / `site-360.mp4` (720 desktop, 360 mobile; lazy-loaded on scroll). Poster: `assets/img/crane-site.webp` |
| Change the Construction video | Replace `assets/video/design-720.mp4` / `design-360.mp4` (blueprint review on site; lazy-loaded). Poster: `assets/img/con-poster.webp` |
| Edit policy text | `index.html` → `#modal-privacy` / `#modal-terms` |

## Deployment (unchanged from before)

Upload everything in this folder (keep the structure) to your static host.
Vercel settings stay the same:

- Framework Preset: **Other**
- Build Command: *(empty)*
- Install Command: *(empty)*
- Output Directory: `.`

No `node_modules`, `package.json` or `src/` needed anywhere.

## Notes

- Live contact details are in place: phone/WhatsApp `+92 315 5387676`, head office
  Police Khidmat Markaz, G-14/4, Islamabad, and the official Instagram
  (@ckabuildstructofficial) linked in the footer and the Contact section.
- Forms are front-end only (no backend): they validate and show confirmation. To receive
  submissions by email, connect a form service (e.g. Formspree/Web3Forms) or your API.
