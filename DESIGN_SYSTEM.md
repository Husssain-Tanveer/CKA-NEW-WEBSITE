# CKA BuildStruct — Design System

One system, every surface. Materials, Design Services, Project Services, Live Bidding,
Suppliers, About, Contact, Basket, Checkout and any future Admin Dashboard all read from
the same tokens in `assets/css/styles.css` → `:root`.

**The rule that matters most:** never invent a colour, a radius or a spacing value at the
component level. If you need something the system doesn't have, add a token first.

---

## 1. Surfaces

Three levels, in this order. A card is only legible if it sits on a level below it.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F8F7F4` | Page background, default `.sec` |
| `--concrete` | `#ECEAE6` | Section band, `.sec--band` — use when the section is full of cards |
| `--card` | `#FCFCFA` | Cards, panels, drawers, modals, `.sec--white` |
| `--dark` | `#0f1520` | Navy brand surface — hero, `.sec--dark`, footer, topbar |

**Section rhythm.** Never place two `.sec--band` or two `.sec--white` next to each other.
The current order is paper → paper → band → paper → white → dark → paper → white → band →
white → paper. Insert new sections into that alternation, don't append to it.

**Cards on bands.** Product cards live on `--concrete` so they read as raised. If you add a
card grid to a `.sec` (paper) section, the contrast is weaker — either accept the quieter
treatment or promote the section to `.sec--band`.

## 2. Ink

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#161b26` | Body text, headings |
| `--ink-2` | `#243040` | Hover borders, secondary dark |
| `--muted` | `#67707e` | Supporting copy, labels |
| `--faint` | `#98a1ab` | Placeholders, captions, metadata |
| `--on-dark` | `#f5f2ec` | Primary text on navy |
| `--on-dark-2` | `#d8d4ca` | Secondary text on navy |

Never use `opacity` to mute text — it multiplies against whatever is behind it and drifts
between surfaces. Step down the token instead.

## 3. Accent — gold

Gold is the only decorative accent. It marks the primary action and the premium moment,
nothing else.

| Token | Value | Use |
| --- | --- | --- |
| `--gold` | `#b0871f` | Accent text and icons on light |
| `--gold-strong` | `#d0a93b` | Primary button fill (`.btn--brand`) |
| `--gold-deep` | `#8f6c14` | Pressed / deep shade |
| `--gold-tint` | `#f6efdd` | Soft fill behind gold text, selected states |
| `--gold-bright` | `#e9c56a` | Gold on navy surfaces |

**One gold-filled button per view.** Everything else is `.btn--line`, `.btn--ghost` or
`.btn--dark`. Two primary buttons competing in one viewport is the fastest way to make a
page look templated.

Copper was considered and rejected — two warm metallics fight each other.

## 4. Semantic roles

These carry meaning. Using them decoratively destroys the signal.

| Token | Value | Means |
| --- | --- | --- |
| `--green` | `#2F5D50` | Verified · success · available · paid · completed |
| `--green-deep` | `#24483E` | Hover / pressed on green |
| `--green-tint` | `#E6EFEA` | Fill behind green text |
| `--green-brt` | `#6FBFA3` | Green on navy surfaces |
| `--blue` | `#1f5aa6` | Informational only — never success |
| `--red` | `#c9443b` | Live · alerts · destructive |

Green is currently applied to: verified-supplier icons on product cards, the verified tick
list, the suppliers figure caption, the added-to-basket confirmation, and the order/payment
success screen. Add green to a new element only if it belongs to that list.

### State chips

Reusable across every surface, including the future dashboard:

```html
<span class="chip chip--verified">Verified supplier</span>
<span class="chip chip--available"><i class="dot"></i>In stock</span>
<span class="chip chip--paid">Paid</span>
<span class="chip chip--info">Indicative rate</span>
<span class="chip chip--live"><i class="dot"></i>Bidding open</span>
<span class="chip chip--neutral">Draft</span>
<span class="chip chip--dark">Verified</span>   <!-- on navy -->
```

## 5. Spacing

One scale. Use the token, not the number.

`--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 ·
`--s-8` 64 · `--s-9` 96

Section padding is `--s-9` on desktop, `--s-8` under 920px, `--s-7` under 640px. Card
padding is `--s-4`. Grid gaps are `--s-5` for cards, `--s-3` on phones.

## 6. Radius, elevation, motion

| Token | Value | Use |
| --- | --- | --- |
| `--r-sm` | 8px | Buttons, inputs, chips, small controls |
| `--r-md` | 10px | Product cards |
| `--r-lg` | 14px | Large panels, figures, modals |
| `--shadow-card` | subtle | Card at rest |
| `--shadow-hover` | lifted | Card hover / focus-within |
| `--shadow-pop` | heavy | Drawer, modal |
| `--dur-fast` | .15s | Colour and border changes |
| `--dur-base` | .22s | Standard transitions |
| `--dur-slow` | .36s | Drawer, panel slide |
| `--ease` | `cubic-bezier(.25,.8,.3,1)` | Every transition |

No single-sided rounded borders. If you use `border-left` as an accent, set
`border-radius: 0`.

## 6a. Motion language

Every animation is opacity + transform (and occasionally `filter`) — all composited,
none trigger layout or paint. Nothing animates `width`, `height`, `top` or `left`.

### Scroll reveals

One transition contract; only the starting transform differs. Assign by role, never at
random:

| Attribute | Movement | Use for |
| --- | --- | --- |
| `data-reveal` | up 18px | Default — section heads, standalone blocks |
| `data-reveal="left"` | in from left | The left half of a two-column pair |
| `data-reveal="right"` | in from right | The right half of the same pair |
| `data-reveal="scale"` | 96.5% → 100% | Media panels, video features |
| `data-reveal="blur"` | 7px blur + rise | Full-bleed bands, cinematic closers |
| `data-reveal="rise"` | up 34px | Long stacks — FAQ, toolbars |
| `data-reveal-group` | cascades children | Card grids, stat rows, service lists |

Paired columns must counter-move (`left` + `right`), or the section looks like it drifted.
Group stagger is 70ms per child on desktop, 45ms on phones, capped at 520ms — beyond that
the last card arrives after the reader has already looked at it.

A 4-second failsafe force-reveals everything, so no block can ever be stranded invisible.

### Interaction

| Element | Rest | Hover | Active |
| --- | --- | --- | --- |
| Button | — | `translateY(-1px)` | `translateY(1px)` |
| Card | `--shadow-card` | `-3px` + `--shadow-hover` + border | — |
| Card image | `scale(1)` | `scale(1.05)` over .5s | — |
| Nav link | — | underline sweep | — |

No ripples, no glows, no gradient shifts on buttons, no floating particles. Those read as
consumer-app decoration and undercut the engineering-firm positioning. Restraint is the
premium signal.

### Live data

The bidding board is the one place motion carries information rather than polish. Rows are
keyed by supplier and reordered in place, so a rank change is visible as movement. Rate
changes tint green (down) or red (up) with a delta chip for 2.2s. A new best bid gets a
one-shot `is-promoted` highlight. The ticker sleeps whenever the section is off-screen or
the tab is hidden.

### Reduced motion

`prefers-reduced-motion: reduce` kills all of it — reveals resolve instantly, the live dot
stops pulsing, videos hold on their poster frame, and counters jump to their final value.
Test this before shipping any new animation.

## 7. Typography

| Role | Family | Weight |
| --- | --- | --- |
| Headings | Space Grotesk (`--font-d`) | 600–700 |
| Body | Inter (`--font-b`) | 400–500 |
| Editorial accent | Instrument Serif italic (`--serif`) | 400 |

`h1` `clamp(2.5rem, 5.2vw, 4.1rem)` · `h2` `clamp(1.7rem, 2.9vw, 2.4rem)` ·
`h3` `clamp(1.12rem, 1.5vw, 1.32rem)` · `h4` `1.02rem` · body `16px/1.62`.

The serif italic is reserved for one or two words inside a heading (`<em>`). It is a
punctuation mark, not a body face — using it for a whole line cheapens it.

Measure is capped at `74ch` for prose and `62ch` for `.lead`. Sentence case everywhere.

## 8. Interaction contract

- Every interactive element gets `:focus-visible` — 2px gold ring, `--gold-bright` on navy.
- Minimum touch target 32px, 44px preferred on phones.
- Hover raises (`translateY(-1px)` to `-3px`), active returns to or below baseline.
- Cards respond to `:focus-within` as well as `:hover`, so keyboard users see the same state.
- Every destructive or irreversible control needs a confirm step.
- Empty states carry an action, never just a message.
- Form errors appear inline under the field with `aria-invalid` and `role="alert"`, never as a browser bubble, and clear as soon as the value becomes valid.
- All motion is disabled under `prefers-reduced-motion: reduce`.

## 9. Accessibility floor

- One `h1` per page; never skip a heading level.
- Every image has `alt`, plus `width`/`height` so nothing shifts as it loads.
- Icon-only buttons need `aria-label`.
- Skip link is the first focusable element.
- Text on any coloured fill uses the dark stop from the same family, never plain black.

## 10. Performance floor

- Photography: WebP, max 900px for cards, 1200px for full-bleed, 1600px for the hero poster.
- Every image below the fold: `loading="lazy" decoding="async"`.
- Background video: no audio track, `+faststart`, poster frame always set.
- The hero poster is preloaded with `fetchpriority="high"`; nothing else is preloaded.
- Bump the `?v=` query on CSS and JS whenever either changes, or phones serve a cached copy.

## 10a. Data access

Nothing outside `assets/js/store.js` may talk to a storage backend. Not `fetch`, not
`localStorage`, not a database client. Every read and write goes through:

```js
await CKAStore.products.list()
await CKAStore.products.save(product)
await CKAStore.products.remove(id)
await CKAStore.categories.list()
await CKAStore.files.upload(file, { folder: "boq" })
```

Two implementations exist. `LocalStore` is active and needs no backend. `SupabaseStore` is
written against `db/schema.sql` and becomes active by uncommenting two lines at the bottom
of `store.js`. Because every call site uses the same interface, that switch is the entire
migration — no page, component or handler changes.

The public site deliberately reads `PRODUCTS` directly rather than through the store, so an
admin's unpublished working copy can never leak onto the live catalogue in their own browser.

## 10b. Admin console

`admin.html` reuses `styles.css` wholesale and adds only layout in `admin.css`. It defines no
colours, radii or spacing of its own. If the console needs a component the public site
doesn't have, add it to `styles.css` so both surfaces get it.

**It has no authentication and cannot have any.** A static page cannot keep a secret. Serve
it behind HTTP basic auth, on a private path, or open it locally from disk until Supabase
Auth is connected. The row-level security policies in `db/schema.sql` are what will make it
genuinely secure — enforcement belongs in the database, never in the client.

## 11. Adding a page or a dashboard

1. Start from `index.html` — copy the `<head>`, topbar, header, footer and script tags.
2. Wrap content in `.container` (1140px) or `.container--narrow` (780px).
3. Use `.sec` / `.sec--band` / `.sec--white` / `.sec--dark` for the section rhythm.
4. Reuse `.btn`, `.card`, `.chip`, `.field`, `.input`, `.tab`, `.qty` — do not restyle them.
5. Update the canonical URL, `og:url`, `og:title` and `og:description` per page.
6. Add the page to the JSON-LD graph rather than writing a second, competing block.

If a component doesn't exist yet, add it to `styles.css` in the section where it belongs,
built from the tokens above — never as inline styles in the page.
