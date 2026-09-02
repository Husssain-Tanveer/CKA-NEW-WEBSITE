/* ═══════════════════════════════════════════════════════════════
   CKA BuildStruct — data.js
   All editable site content lives here.
   · SITE      → company identity & contact details
   · GROUPS    → catalogue groupings (tabs)
   · PRODUCTS  → the full materials catalogue (prices in PKR)
   · BID_SEED  → demo bids for the live bidding board
   To add a product: copy any line, keep id unique, set category
   to an existing one (or add it to a GROUP below).
   ═══════════════════════════════════════════════════════════════ */

const SITE = {
  name: "CKA BuildStruct",
  legal: "CKA BuildStruct Private Limited",
  tagline: "Smart Materials. Trusted Designs. Competitive Procurement.",
  phone: "+92 315 5387676",
  whatsapp: "923155387676",
  email: "info@ckabuildstruct.com",
  supplierEmail: "suppliers@ckabuildstruct.com",
  designEmail: "design@ckabuildstruct.com",
  location: "Rawalpindi / Islamabad, Pakistan",
};

/* Catalogue groups — drives the tabs and category chips */
const GROUPS = {
  grey: {
    label: "Grey Structure",
    categories: ["Cement", "Steel", "Bricks", "Blocks", "Sand", "Crush / Aggregate", "Concrete Items"],
  },
  finishing: {
    label: "Finishing",
    categories: ["Tiles", "Sanitary Items", "Electrical Items", "Paint", "Doors and Windows", "Hardware and Finishing Materials"],
  },
  plumbing: {
    label: "Plumbing",
    categories: ["Plumbing Pipes", "Plumbing Fittings"],
  },
};

/* Images (local, in assets/img/) */
const IMG = {
  cement:   "assets/img/cement-bags.webp",
  steel:    "assets/img/steel-rebar.webp",
  steel2:   "assets/img/rebar-workers.webp",
  bricks:   "assets/img/bricks.webp",
  blocks:   "assets/img/blocks.webp",
  sand:     "assets/img/sand.webp",
  crush:    "assets/img/crush.webp",
  concrete: "assets/img/concrete-panels.webp",
  pipes:    "assets/img/pipes.webp",
  fittings: "assets/img/faucet.webp",
  /* Master Fit — real product photos extracted from their 2026 rate lists */
  mfPn16:        "assets/img/mf-pprc-pipes-a.webp",
  mfPn20:        "assets/img/mf-pprc-pipes-b.webp",
  mfUpvcPipe:    "assets/img/mf-upvc-pipes.webp",
  mfSocket:      "assets/img/mf-pprc-socket.webp",
  mfElbow45:     "assets/img/mf-pprc-elbow45.webp",
  mfTee:         "assets/img/mf-pprc-tee.webp",
  mfUnion:       "assets/img/mf-pprc-union.webp",
  mfEndCap:      "assets/img/mf-pprc-endcap.webp",
  mfOverCross:   "assets/img/mf-pprc-overcross.webp",
  mfThreadSock:  "assets/img/mf-pprc-thread-socket.webp",
  mfGateValve:   "assets/img/mf-pprc-gate-valve.webp",
  mfClamp:       "assets/img/mf-pprc-clamp.webp",
  mfMixerElbow:  "assets/img/mf-pprc-mixer-elbow.webp",
  mfUElbow90:    "assets/img/mf-upvc-elbow90.webp",
  mfUTee:        "assets/img/mf-upvc-tee.webp",
  mfUYee:        "assets/img/mf-upvc-yee.webp",
  mfUBend90:     "assets/img/mf-upvc-bend90.webp",
  mfUPtrap:      "assets/img/mf-upvc-ptrap.webp",
  mfUSocket:     "assets/img/mf-upvc-socket.webp",
  mfUEndCap:     "assets/img/mf-upvc-endcap.webp",
  mfUCowl:       "assets/img/mf-upvc-cowl.webp",
  mfUFloorTrap:  "assets/img/mf-upvc-floortrap.webp",
  tiles:    "assets/img/tiles.webp",
  sanitary: "assets/img/bathroom.webp",
  electric: "assets/img/electrician.webp",
  electric2:"assets/img/electrician2.webp",
  paint:    "assets/img/paint-roller.webp",
  doors:    "assets/img/house-exterior.webp",
  doors2:   "assets/img/house-modern.webp",
  hardware: "assets/img/hammer.webp",
  welding:  "assets/img/welding.webp",
};

/* ─────────────────────────────────────────────────────────────
   PRODUCTS
   id · title · category · quality (A/B/C) · price · oldPrice
   unit · range (market band shown on card) · badge · brand
   supplier · rating (of 5) · deals (completed orders)
   ───────────────────────────────────────────────────────────── */
const PRODUCTS = [
  /* ── CEMENT ── */
  { id: 1,  title: "Bestway Cement OPC – 50 kg Bag",          category: "Cement", quality: "A", price: 1450, oldPrice: 1500, unit: "per bag", range: "PKR 1,420 – 1,500", badge: "OPC", brand: "Bestway",    supplier: "Verified cement depot",    rating: 4.8, deals: "2.1k", img: IMG.cement },
  { id: 2,  title: "Bestway Cement SRC – 50 kg Bag",          category: "Cement", quality: "A", price: 1510, oldPrice: 1570, unit: "per bag", range: "PKR 1,480 – 1,570", badge: "SRC", brand: "Bestway",    supplier: "Verified cement depot",    rating: 4.8, deals: "860",  img: IMG.cement },
  { id: 3,  title: "Maple Leaf Cement OPC – 50 kg Bag",       category: "Cement", quality: "A", price: 1460, oldPrice: 1510, unit: "per bag", range: "PKR 1,430 – 1,510", badge: "OPC", brand: "Maple Leaf", supplier: "Verified cement depot",    rating: 4.9, deals: "1.9k", img: IMG.cement },
  { id: 4,  title: "DG Khan Cement OPC – 50 kg Bag",          category: "Cement", quality: "A", price: 1445, oldPrice: 1500, unit: "per bag", range: "PKR 1,415 – 1,500", badge: "OPC", brand: "DG Khan",    supplier: "Verified cement depot",    rating: 4.9, deals: "2.4k", img: IMG.cement },
  { id: 5,  title: "Lucky Cement OPC – 50 kg Bag",            category: "Cement", quality: "A", price: 1435, oldPrice: 1490, unit: "per bag", range: "PKR 1,405 – 1,490", badge: "OPC", brand: "Lucky",      supplier: "Verified cement depot",    rating: 4.7, deals: "1.7k", img: IMG.cement },
  { id: 6,  title: "Fauji Cement OPC – 50 kg Bag",            category: "Cement", quality: "A", price: 1425, oldPrice: 1485, unit: "per bag", range: "PKR 1,395 – 1,485", badge: "OPC", brand: "Fauji",      supplier: "Verified cement depot",    rating: 4.7, deals: "1.3k", img: IMG.cement },
  { id: 7,  title: "Kohat Cement OPC – 50 kg Bag",            category: "Cement", quality: "B", price: 1415, oldPrice: 1475, unit: "per bag", range: "Rate on request",     badge: "OPC", brand: "Kohat",      supplier: "Verified cement depot",    rating: 4.6, deals: "790",  img: IMG.cement },
  { id: 8,  title: "Cherat Cement OPC – 50 kg Bag",           category: "Cement", quality: "A", price: 1430, oldPrice: 1490, unit: "per bag", range: "Rate on request",     badge: "OPC", brand: "Cherat",     supplier: "Verified cement depot",    rating: 4.7, deals: "650",  img: IMG.cement },
  { id: 9,  title: "Shaheen Flying Cement OPC – 50 kg Bag",   category: "Cement", quality: "B", price: 1405, oldPrice: 1465, unit: "per bag", range: "Rate on request",     badge: "OPC", brand: "Shaheen",    supplier: "Verified cement depot",    rating: 4.5, deals: "540",  img: IMG.cement },
  { id: 10, title: "Gharibwal / Paidar Cement OPC – 50 kg",   category: "Cement", quality: "B", price: 1395, oldPrice: 1455, unit: "per bag", range: "Rate on request",     badge: "OPC", brand: "Gharibwal",  supplier: "Verified cement depot",    rating: 4.5, deals: "480",  img: IMG.cement },

  /* ── STEEL ── */
  { id: 21, title: "Grade 60 Steel Rebar / Saria",            category: "Steel", quality: "A", price: 265, oldPrice: 270, unit: "per kg",  range: "PKR 258 – 270", badge: "Grade 60", brand: "Mughal Steel", supplier: "Authorized steel dealer", rating: 4.9, deals: "3.2k", img: IMG.steel },
  { id: 22, title: "Grade 75 Steel Rebar / Saria",            category: "Steel", quality: "A", price: 278, oldPrice: 286, unit: "per kg",  range: "PKR 270 – 286", badge: "Grade 75", brand: "Mughal Steel", supplier: "Authorized steel dealer", rating: 4.8, deals: "980",  img: IMG.steel },
  { id: 23, title: "Grade 40 Steel Rebar / Saria",            category: "Steel", quality: "B", price: 255, oldPrice: 263, unit: "per kg",  range: "PKR 248 – 263", badge: "Grade 40", brand: "FF Steel",     supplier: "Authorized steel dealer", rating: 4.6, deals: "1.1k", img: IMG.steel2 },
  { id: 24, title: "Deformed Steel Bar – 10 mm",              category: "Steel", quality: "A", price: 265, oldPrice: 272, unit: "per kg",  range: "Rate on request", badge: "10 mm",  brand: "FF Steel",     supplier: "Authorized steel dealer", rating: 4.7, deals: "760",  img: IMG.steel2 },
  { id: 25, title: "Deformed Steel Bar – 12 mm",              category: "Steel", quality: "A", price: 265, oldPrice: 272, unit: "per kg",  range: "Rate on request", badge: "12 mm",  brand: "Mughal Steel", supplier: "Authorized steel dealer", rating: 4.7, deals: "820",  img: IMG.steel },
  { id: 26, title: "Deformed Steel Bar – 16 mm",              category: "Steel", quality: "A", price: 266, oldPrice: 274, unit: "per kg",  range: "Rate on request", badge: "16 mm",  brand: "FF Steel",     supplier: "Authorized steel dealer", rating: 4.6, deals: "700",  img: IMG.steel2 },

  /* ── BRICKS ── */
  { id: 31, title: "Awwal Bricks – Standard Quality",         category: "Bricks", quality: "A", price: 17000, oldPrice: 18000, unit: "per 1,000", range: "PKR 16,000 – 18,000", badge: "Awwal",       brand: "Canal kiln",   supplier: "Verified brick kiln", rating: 4.7, deals: "1.5k", img: IMG.bricks },
  { id: 32, title: "First Class Bricks (Awwal A+)",           category: "Bricks", quality: "A", price: 18500, oldPrice: 19500, unit: "per 1,000", range: "PKR 17,500 – 19,500", badge: "First Class", brand: "Premium kiln", supplier: "Verified brick kiln", rating: 4.8, deals: "2.0k", img: IMG.bricks },
  { id: 33, title: "B-Class Bricks",                          category: "Bricks", quality: "C", price: 14500, oldPrice: 15800, unit: "per 1,000", range: "Rate on request",     badge: "B Class",     brand: "Canal kiln",   supplier: "Verified brick kiln", rating: 4.4, deals: "640",  img: IMG.bricks },
  { id: 34, title: "Fly Ash Bricks",                          category: "Bricks", quality: "B", price: 15500, oldPrice: 16800, unit: "per 1,000", range: "Rate on request",     badge: "Fly Ash",     brand: "EcoBricks",    supplier: "Verified manufacturer", rating: 4.5, deals: "430", img: IMG.bricks },

  /* ── BLOCKS ── */
  { id: 35, title: "Concrete Blocks – 6 inch",                category: "Blocks", quality: "A", price: 75,  oldPrice: 85,  unit: "per block", range: "PKR 65 – 85",  badge: "6 inch", brand: "Block craft", supplier: "Verified block factory", rating: 4.7, deals: "1.8k", img: IMG.blocks },
  { id: 36, title: "Concrete Blocks – 4 inch",                category: "Blocks", quality: "B", price: 58,  oldPrice: 68,  unit: "per block", range: "PKR 50 – 68",  badge: "4 inch", brand: "Block craft", supplier: "Verified block factory", rating: 4.6, deals: "1.2k", img: IMG.blocks },
  { id: 37, title: "Hollow Blocks – 8 inch",                  category: "Blocks", quality: "B", price: 125, oldPrice: 145, unit: "per block", range: "PKR 110 – 145", badge: "8 inch", brand: "Block craft", supplier: "Verified block factory", rating: 4.6, deals: "900", img: IMG.blocks },

  /* ── SAND ── */
  { id: 41, title: "Ravi Sand",                               category: "Sand", quality: "B", price: 88,  oldPrice: 102, unit: "per cft", range: "PKR 82 – 102",   badge: "River", brand: "Ravi bed",   supplier: "Verified sand supplier", rating: 4.5, deals: "1.1k", img: IMG.sand },
  { id: 42, title: "Chenab Sand",                             category: "Sand", quality: "A", price: 98,  oldPrice: 115, unit: "per cft", range: "PKR 90 – 115",   badge: "River", brand: "Chenab bed", supplier: "Verified sand supplier", rating: 4.7, deals: "1.6k", img: IMG.sand },
  { id: 43, title: "Lawrencepur / Fine Sand",                 category: "Sand", quality: "A", price: 115, oldPrice: 130, unit: "per cft", range: "PKR 105 – 130",  badge: "Fine",  brand: "Lawrencepur", supplier: "Verified sand supplier", rating: 4.8, deals: "1.9k", img: IMG.sand },

  /* ── CRUSH / AGGREGATE ── */
  { id: 45, title: "Margalla Crush – 1/2 inch",               category: "Crush / Aggregate", quality: "A", price: 150, oldPrice: 165, unit: "per cft", range: "PKR 138 – 165", badge: "1/2 in", brand: "Margalla", supplier: "Verified crush plant", rating: 4.8, deals: "1.4k", img: IMG.crush },
  { id: 46, title: "Sargodha Crush",                          category: "Crush / Aggregate", quality: "B", price: 135, oldPrice: 155, unit: "per cft", range: "PKR 122 – 155", badge: "Mix",    brand: "Sargodha", supplier: "Verified crush plant", rating: 4.6, deals: "980", img: IMG.crush },
  { id: 47, title: "Margalla Crush – 3/4 inch",               category: "Crush / Aggregate", quality: "A", price: 152, oldPrice: 168, unit: "per cft", range: "PKR 140 – 168", badge: "3/4 in", brand: "Margalla", supplier: "Verified crush plant", rating: 4.8, deals: "1.1k", img: IMG.crush },

  /* ── CONCRETE ITEMS ── */
  { id: 48, title: "Precast Boundary Wall Panel",             category: "Concrete Items", quality: "A", price: 5200,  oldPrice: 5600,  unit: "per panel", range: "PKR 4,800 – 5,600",    badge: "Precast", brand: "CKA Precast", supplier: "Precast manufacturer", rating: 4.7, deals: "310", img: IMG.concrete },
  { id: 49, title: "Ready Mix Concrete – Standard Grade",     category: "Concrete Items", quality: "A", price: 15500, oldPrice: 16800, unit: "per m³",    range: "PKR 14,800 – 16,800",  badge: "RMC",     brand: "MetroMix",    supplier: "Batching plant",       rating: 4.8, deals: "220", img: IMG.concrete },

  /* ── PLUMBING PIPES ── */
  { id: 61, title: "PPRC Pipe PN-16 – 25 mm × 4 m",           category: "Plumbing Pipes", quality: "A", price: 1082,  oldPrice: 1145,  unit: "per length",    range: "PKR 1,020 – 1,145",  badge: "PN-16",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.8, deals: "1.3k", img: IMG.pipes },
  { id: 62, title: "PPRC Pipe PN-16 – 32 mm × 4 m",           category: "Plumbing Pipes", quality: "A", price: 1724,  oldPrice: 1825,  unit: "per length",    range: "PKR 1,640 – 1,825",  badge: "PN-16",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.8, deals: "940", img: IMG.pipes },
  { id: 63, title: "PPRC Pipe PN-20 – 25 mm × 4 m",           category: "Plumbing Pipes", quality: "A", price: 1272,  oldPrice: 1350,  unit: "per length",    range: "PKR 1,210 – 1,350",  badge: "PN-20",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.9, deals: "870", img: IMG.pipes },
  { id: 64, title: "PPRC Pipe PN-20 – 32 mm × 4 m",           category: "Plumbing Pipes", quality: "A", price: 2098,  oldPrice: 2220,  unit: "per length",    range: "Rate on request",    badge: "PN-20",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.8, deals: "610", img: IMG.pipes },
  { id: 65, title: "UPVC Pipe D-Class – 4 inch (13 rft)",     category: "Plumbing Pipes", quality: "B", price: 15876, oldPrice: 16800, unit: "13 rft length", range: "Rate on request",    badge: "D Class", brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.6, deals: "180", img: IMG.pipes },
  { id: 66, title: "UPVC Pipe B-Class – 4 inch (13 rft)",     category: "Plumbing Pipes", quality: "C", price: 9020,  oldPrice: 9600,  unit: "13 rft length", range: "Rate on request",    badge: "B Class", brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.5, deals: "240", img: IMG.pipes },

  /* ── PLUMBING FITTINGS ── */
  { id: 67, title: "PPRC Elbow 90° – 25 mm",                  category: "Plumbing Fittings", quality: "A", price: 59,  oldPrice: 65,  unit: "per piece", range: "PKR 52 – 65",      badge: "PPRC",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.7, deals: "2.6k", img: IMG.fittings },
  { id: 68, title: "PPRC Tee – 32 mm",                        category: "Plumbing Fittings", quality: "A", price: 135, oldPrice: 150, unit: "per piece", range: "PKR 120 – 150",    badge: "PPRC",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.7, deals: "1.9k", img: IMG.fittings },
  { id: 69, title: "UPVC Elbow 90° – 4 inch",                 category: "Plumbing Fittings", quality: "B", price: 285, oldPrice: 320, unit: "per piece", range: "Rate on request",  badge: "UPVC",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.6, deals: "540", img: IMG.fittings },
  { id: 70, title: "UPVC Tee – 4 inch",                       category: "Plumbing Fittings", quality: "B", price: 410, oldPrice: 460, unit: "per piece", range: "Rate on request",  badge: "UPVC",   brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.6, deals: "420", img: IMG.fittings },
  { id: 71, title: "PPRC Ball Valve – 25 mm",                 category: "Plumbing Fittings", quality: "A", price: 420, oldPrice: 480, unit: "per piece", range: "PKR 380 – 480",    badge: "Valve",  brand: "Popular Pipes", supplier: "Certified distributor", rating: 4.8, deals: "880", img: IMG.fittings },

  /* ── TILES ── */
  { id: 81, title: "Floor & Wall Tiles – 12×24 in",           category: "Tiles", quality: "A", price: 240, oldPrice: 275, unit: "per sq.ft", range: "PKR 215 – 275", badge: "Master",   brand: "Master Tiles", supplier: "Authorized showroom", rating: 4.7, deals: "1.2k", img: IMG.tiles },
  { id: 82, title: "Porcelain Floor Tiles – 24×24 in",        category: "Tiles", quality: "A", price: 320, oldPrice: 360, unit: "per sq.ft", range: "PKR 290 – 360", badge: "Porcelain", brand: "Master Tiles", supplier: "Authorized showroom", rating: 4.9, deals: "940", img: IMG.tiles },
  { id: 83, title: "Ceramic Bathroom Tiles",                  category: "Tiles", quality: "B", price: 210, oldPrice: 250, unit: "per sq.ft", range: "PKR 185 – 250", badge: "Ceramic",  brand: "Shabbir Tiles", supplier: "Authorized showroom", rating: 4.6, deals: "780", img: IMG.tiles },

  /* ── SANITARY ── */
  { id: 84, title: "WC Commode Set – European Design",        category: "Sanitary Items", quality: "A", price: 28500, oldPrice: 32000, unit: "per set", range: "PKR 26,000 – 32,000", badge: "Porta",  brand: "Porta", supplier: "Authorized showroom", rating: 4.8, deals: "260", img: IMG.sanitary },
  { id: 85, title: "Wash Basin with Pedestal",                category: "Sanitary Items", quality: "A", price: 14500, oldPrice: 16500, unit: "per set", range: "PKR 13,200 – 16,500", badge: "Porta",  brand: "Porta", supplier: "Authorized showroom", rating: 4.7, deals: "340", img: IMG.sanitary },

  /* ── ELECTRICAL ── */
  { id: 86, title: "Electrical Cable Roll – 90 m (3/029)",    category: "Electrical Items", quality: "A", price: 6800, oldPrice: 7200, unit: "per roll", range: "PKR 6,400 – 7,200", badge: "Pak Cables", brand: "Pak Cables", supplier: "Authorized distributor", rating: 4.8, deals: "920", img: IMG.electric },
  { id: 87, title: "Switch Board & Socket Set",               category: "Electrical Items", quality: "B", price: 950,  oldPrice: 1150, unit: "per set",  range: "PKR 850 – 1,150",   badge: "Clopal",     brand: "Clopal",     supplier: "Authorized distributor", rating: 4.6, deals: "1.4k", img: IMG.electric2 },

  /* ── PAINT ── */
  { id: 88, title: "Interior Emulsion Paint – 16 L",          category: "Paint", quality: "A", price: 8800,  oldPrice: 9600,  unit: "per bucket", range: "PKR 8,200 – 9,600",   badge: "Interior", brand: "Brighto", supplier: "Authorized paint dealer", rating: 4.7, deals: "560", img: IMG.paint },
  { id: 89, title: "Weather Shield Exterior Paint – 16 L",    category: "Paint", quality: "A", price: 12500, oldPrice: 13800, unit: "per bucket", range: "PKR 11,800 – 13,800", badge: "Exterior", brand: "Brighto", supplier: "Authorized paint dealer", rating: 4.8, deals: "430", img: IMG.paint },

  /* ── DOORS & WINDOWS ── */
  { id: 90, title: "Aluminium Window Frame – Anodized",       category: "Doors and Windows", quality: "A", price: 1450,  oldPrice: 1650,  unit: "per sq.ft", range: "PKR 1,300 – 1,650",   badge: "Chawla", brand: "Chawla Aluminium", supplier: "Fabrication partner", rating: 4.6, deals: "310", img: IMG.doors },
  { id: 91, title: "Solid Wood Door Shutter – Deodar",        category: "Doors and Windows", quality: "A", price: 18500, oldPrice: 22000, unit: "per door",  range: "PKR 16,500 – 22,000", badge: "Deodar", brand: "Steel Craft",          supplier: "Fabrication partner", rating: 4.8, deals: "180", img: IMG.doors2 },

  /* ── HARDWARE & FINISHING ── */
  { id: 92, title: "Door Lock Set – Mortise Handle",          category: "Hardware and Finishing Materials", quality: "B", price: 3200, oldPrice: 3800, unit: "per set",  range: "PKR 2,800 – 3,800", badge: "Imported", brand: "Dorex", supplier: "Verified hardware store", rating: 4.6, deals: "640", img: IMG.hardware },
  { id: 93, title: "Hinges & Screws Pack – Heavy Duty",       category: "Hardware and Finishing Materials", quality: "B", price: 850,  oldPrice: 1050, unit: "per pack", range: "PKR 720 – 1,050",   badge: "Steel",    brand: "HKH",   supplier: "Verified hardware store", rating: 4.5, deals: "980", img: IMG.welding },
  /* ── MASTER FIT (rate lists w.e.f. March / April 2026) ── */
  /* ── PPRC & UPVC pipes ── */
  { id: 95, title: "Master Fit PPRC Pipe PN-16 – 40 mm × 4 m", category: "Plumbing Pipes", quality: "A", price: 3042, oldPrice: 3209, unit: "per 4 m length", range: "PKR 2,890 – 3,209", badge: "PN-16", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "640", img: IMG.mfPn16 },
  { id: 96, title: "Master Fit PPRC Pipe PN-16 – 50 mm × 4 m", category: "Plumbing Pipes", quality: "A", price: 5508, oldPrice: 5811, unit: "per 4 m length", range: "PKR 5,233 – 5,811", badge: "PN-16", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "520", img: IMG.mfPn16 },
  { id: 97, title: "Master Fit PPRC Pipe PN-16 – 63 mm × 4 m", category: "Plumbing Pipes", quality: "A", price: 7932, oldPrice: 8368, unit: "per 4 m length", range: "PKR 7,535 – 8,368", badge: "PN-16", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.9, deals: "310", img: IMG.mfPn16 },
  { id: 98, title: "Master Fit PPRC Pipe PN-20 – 40 mm × 4 m", category: "Plumbing Pipes", quality: "A", price: 3207, oldPrice: 3383, unit: "per 4 m length", range: "PKR 3,047 – 3,383", badge: "PN-20", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "880", img: IMG.mfPn20 },
  { id: 99, title: "Master Fit PPRC Pipe PN-20 – 50 mm × 4 m", category: "Plumbing Pipes", quality: "A", price: 6133, oldPrice: 6470, unit: "per 4 m length", range: "PKR 5,826 – 6,470", badge: "PN-20", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "410", img: IMG.mfPn20 },
  { id: 100, title: "Master Fit PPRC Pipe PN-20 – 63 mm × 4 m", category: "Plumbing Pipes", quality: "A", price: 9367, oldPrice: 9882, unit: "per 4 m length", range: "PKR 8,899 – 9,882", badge: "PN-20", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "290", img: IMG.mfPn20 },
  { id: 101, title: "Master Fit UPVC Pipe D-Class – 3 inch (13 rft)", category: "Plumbing Pipes", quality: "A", price: 9272, oldPrice: 9782, unit: "13 rft length", range: "PKR 8,808 – 9,782", badge: "D Class", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.5, deals: "760", img: IMG.mfUpvcPipe },
  { id: 102, title: "Master Fit UPVC Pipe D-Class – 5 inch (13 rft)", category: "Plumbing Pipes", quality: "A", price: 23497, oldPrice: 24789, unit: "13 rft length", range: "PKR 22,322 – 24,789", badge: "D Class", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "350", img: IMG.mfUpvcPipe },
  { id: 103, title: "Master Fit UPVC Pipe B-Class – 3 inch (13 rft)", category: "Plumbing Pipes", quality: "B", price: 5887, oldPrice: 6211, unit: "13 rft length", range: "PKR 5,593 – 6,211", badge: "B Class", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "180", img: IMG.mfUpvcPipe },
  { id: 104, title: "Master Fit UPVC Pipe Pressure – 4 inch (13 rft)", category: "Plumbing Pipes", quality: "A", price: 7322, oldPrice: 7725, unit: "13 rft length", range: "PKR 6,956 – 7,725", badge: "Pressure", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "140", img: IMG.mfUpvcPipe },
  { id: 105, title: "Master Fit UPVC Pipe Sewerage – 2 inch (13 rft)", category: "Plumbing Pipes", quality: "C", price: 2256, oldPrice: 2380, unit: "13 rft length", range: "PKR 2,143 – 2,380", badge: "Sewerage", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.5, deals: "960", img: IMG.mfUpvcPipe },
  { id: 106, title: "Master Fit UPVC Pipe Sewerage – 4 inch (13 rft)", category: "Plumbing Pipes", quality: "B", price: 4325, oldPrice: 4563, unit: "13 rft length", range: "PKR 4,109 – 4,563", badge: "Sewerage", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "220", img: IMG.mfUpvcPipe },
  /* ── PPRC & UPVC fittings ── */
  { id: 120, title: "Master Fit PPRC Socket – 25 mm", category: "Plumbing Fittings", quality: "A", price: 40, oldPrice: 43, unit: "per piece", range: "Rate on request", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "350", img: IMG.mfSocket },
  { id: 121, title: "Master Fit PPRC Socket – 32 mm", category: "Plumbing Fittings", quality: "A", price: 73, oldPrice: 77, unit: "per piece", range: "PKR 69 – 77", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.5, deals: "180", img: IMG.mfSocket },
  { id: 122, title: "Master Fit PPRC Elbow 45° – 25 mm", category: "Plumbing Fittings", quality: "A", price: 82, oldPrice: 86, unit: "per piece", range: "PKR 77 – 86", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "140", img: IMG.mfElbow45 },
  { id: 123, title: "Master Fit PPRC Tee – 25 mm", category: "Plumbing Fittings", quality: "A", price: 69, oldPrice: 72, unit: "per piece", range: "PKR 65 – 72", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "960", img: IMG.mfTee },
  { id: 124, title: "Master Fit PPRC Union – 25 mm", category: "Plumbing Fittings", quality: "A", price: 167, oldPrice: 175, unit: "per piece", range: "PKR 157 – 175", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "220", img: IMG.mfUnion },
  { id: 125, title: "Master Fit PPRC Union – 32 mm", category: "Plumbing Fittings", quality: "A", price: 266, oldPrice: 279, unit: "per piece", range: "PKR 250 – 279", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.5, deals: "640", img: IMG.mfUnion },
  { id: 126, title: "Master Fit PPRC End Cap – 25 mm", category: "Plumbing Fittings", quality: "A", price: 39, oldPrice: 42, unit: "per piece", range: "Rate on request", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "520", img: IMG.mfEndCap },
  { id: 127, title: "Master Fit PPRC Over Cross – 25 mm", category: "Plumbing Fittings", quality: "A", price: 177, oldPrice: 186, unit: "per piece", range: "PKR 166 – 186", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "310", img: IMG.mfOverCross },
  { id: 128, title: "Master Fit PPRC Thread Socket Female – 25 × 1/2 in", category: "Plumbing Fittings", quality: "A", price: 250, oldPrice: 262, unit: "per piece", range: "PKR 235 – 262", badge: "Brass", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "880", img: IMG.mfThreadSock },
  { id: 129, title: "Master Fit PPRC Gate Valve – 25 mm", category: "Plumbing Fittings", quality: "A", price: 1185, oldPrice: 1244, unit: "per piece", range: "PKR 1,114 – 1,244", badge: "Valve", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.9, deals: "410", img: IMG.mfGateValve },
  { id: 130, title: "Master Fit PPRC Pipe Clamp – 25 mm", category: "Plumbing Fittings", quality: "B", price: 23, oldPrice: 25, unit: "per piece", range: "Rate on request", badge: "PPRC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "290", img: IMG.mfClamp },
  { id: 131, title: "Master Fit PPRC Mixer Elbow – 25 × 1/2 in", category: "Plumbing Fittings", quality: "A", price: 744, oldPrice: 781, unit: "per piece", range: "PKR 699 – 781", badge: "Brass", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "760", img: IMG.mfMixerElbow },
  { id: 132, title: "Master Fit UPVC Elbow 90° – 3 inch", category: "Plumbing Fittings", quality: "A", price: 555, oldPrice: 583, unit: "per piece", range: "PKR 522 – 583", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "350", img: IMG.mfUElbow90 },
  { id: 133, title: "Master Fit UPVC Elbow 90° – 4 inch", category: "Plumbing Fittings", quality: "A", price: 672, oldPrice: 706, unit: "per piece", range: "PKR 632 – 706", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.5, deals: "180", img: IMG.mfUElbow90 },
  { id: 134, title: "Master Fit UPVC Tee – 4 inch", category: "Plumbing Fittings", quality: "A", price: 944, oldPrice: 991, unit: "per piece", range: "PKR 887 – 991", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "140", img: IMG.mfUTee },
  { id: 135, title: "Master Fit UPVC Yee – 4 inch", category: "Plumbing Fittings", quality: "A", price: 1415, oldPrice: 1486, unit: "per piece", range: "PKR 1,330 – 1,486", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "960", img: IMG.mfUYee },
  { id: 136, title: "Master Fit UPVC Bend 90° – 4 inch", category: "Plumbing Fittings", quality: "B", price: 895, oldPrice: 940, unit: "per piece", range: "PKR 841 – 940", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "220", img: IMG.mfUBend90 },
  { id: 137, title: "Master Fit UPVC P-Trap – 4 inch", category: "Plumbing Fittings", quality: "A", price: 1485, oldPrice: 1559, unit: "per piece", range: "PKR 1,396 – 1,559", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.5, deals: "640", img: IMG.mfUPtrap },
  { id: 138, title: "Master Fit UPVC Socket – 4 inch", category: "Plumbing Fittings", quality: "A", price: 488, oldPrice: 512, unit: "per piece", range: "PKR 459 – 512", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.6, deals: "520", img: IMG.mfUSocket },
  { id: 139, title: "Master Fit UPVC End Cap – 4 inch", category: "Plumbing Fittings", quality: "B", price: 420, oldPrice: 441, unit: "per piece", range: "PKR 395 – 441", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.8, deals: "310", img: IMG.mfUEndCap },
  { id: 140, title: "Master Fit UPVC Cowl – 4 inch", category: "Plumbing Fittings", quality: "A", price: 257, oldPrice: 270, unit: "per piece", range: "PKR 242 – 270", badge: "UPVC", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.7, deals: "880", img: IMG.mfUCowl },
  { id: 141, title: "Master Fit UPVC Floor Trap – Multi (Complete)", category: "Plumbing Fittings", quality: "A", price: 2292, oldPrice: 2407, unit: "per piece", range: "PKR 2,154 – 2,407", badge: "Trap", brand: "Master Fit", supplier: "Authorized distributor", rating: 4.9, deals: "410", img: IMG.mfUFloorTrap },
];

/* Shipping / MOQ defaults by catalogue group — shown on every product
   card and in the lightbox. Real per-supplier rules will come from
   products.moq / products.delivery_* once the catalogue reads from
   Supabase; these are honest, sensible defaults until then. */
const SHIPPING_DEFAULTS = {
  grey:      { moq: "1 ton / 100 bags (varies by item)", delivery: "Rawalpindi · Islamabad · 24–48 hrs" },
  finishing: { moq: "As per pack / carton size",          delivery: "Twin cities · 2–4 working days" },
  plumbing:  { moq: "10 pieces (bulk rate above 50)",      delivery: "Twin cities · 1–3 working days" },
};

/* ── Design services marketplace — mirrors db/schema.sql design_services /
   design_packages so this can be swapped for a live Supabase read later. */
const DESIGN_SERVICES = [
  { id: "arch", name: "Architectural Design", img: "assets/img/drawing-plans.webp",
    alt: "Printed architectural floor plans on the CKA design desk",
    desc: "Floor plans, elevations and sections prepared to housing-society and CDA submission standards.",
    provider: "CKA Design Studio", startingPrice: "From PKR 25 / sq.ft",
    packages: [ { name: "Concept Design", price: "PKR 15 / sq.ft" }, { name: "Full Working Set", price: "PKR 25 / sq.ft" } ] },
  { id: "structural", name: "Structural Design", img: "assets/img/concrete-panels.webp",
    alt: "Reinforced concrete structural panels on site",
    desc: "RCC design with bar-bending schedules, checked by licensed structural engineers before execution.",
    provider: "CKA Structural Engineers", startingPrice: "From PKR 18 / sq.ft",
    packages: [ { name: "Structural Drawing Set", price: "PKR 18 / sq.ft" }, { name: "Site-verified BBS", price: "PKR 22 / sq.ft" } ] },
  { id: "interior", name: "Interior Design", img: "assets/img/interior-facade.webp",
    alt: "Modern interior design preview with warm lighting",
    desc: "Space planning, kitchens, wardrobes and finishing schedules for genuinely livable interiors.",
    provider: "CKA Design Studio", startingPrice: "From PKR 20 / sq.ft",
    packages: [ { name: "Space Planning", price: "PKR 20 / sq.ft" }, { name: "Full Interior Package", price: "PKR 35 / sq.ft" } ] },
  { id: "exterior", name: "Exterior Design", img: "assets/img/house-exterior.webp",
    alt: "Modern house exterior facade",
    desc: "Elevation design and material palettes that lock your façade before finishing begins.",
    provider: "CKA Design Studio", startingPrice: "From PKR 15,000",
    packages: [ { name: "Elevation Design", price: "PKR 15,000" }, { name: "Full Exterior Package", price: "PKR 32,000" } ] },
  { id: "2d", name: "2D Drawings", img: "assets/img/drawing-plans.webp",
    alt: "2D architectural floor plan drawing set",
    desc: "Dimensioned floor plans and layouts — the base drawing set every other service builds on.",
    provider: "CKA Design Studio", startingPrice: "From PKR 9,999",
    packages: [ { name: "Floor Plan Set", price: "PKR 9,999" } ] },
  { id: "3dmodel", name: "3D Modeling", img: "assets/img/house-modern.webp",
    alt: "3D architectural model of a modern house",
    desc: "A full 3D model of your plot — the base file used for visualisation, renders and walkthroughs.",
    provider: "CKA Design Studio", startingPrice: "From PKR 12,000",
    packages: [ { name: "3D Model", price: "PKR 12,000" } ] },
  { id: "3dviz", name: "3D Visualization", img: "assets/img/skyline.webp",
    alt: "Photo-realistic 3D visualisation of a building exterior",
    desc: "Photo-realistic exterior and interior renders so you can approve the look before construction starts.",
    provider: "CKA Design Studio", startingPrice: "From PKR 15,000",
    packages: [ { name: "Photo-real Render (per view)", price: "PKR 15,000" }, { name: "Walkthrough Animation", price: "PKR 45,000" } ] },
  { id: "working", name: "Working Drawings", img: "assets/img/drawing-plans.webp",
    alt: "Detailed working drawing set spread on a desk",
    desc: "Construction-ready drawings with full dimensions, details and schedules for the site team.",
    provider: "CKA Design Studio", startingPrice: "From PKR 25 / sq.ft",
    packages: [ { name: "Full Working Drawing Set", price: "PKR 25 / sq.ft" } ] },
  { id: "construction-dwg", name: "Construction Drawings", img: "assets/img/building-up.webp",
    alt: "Construction site being built against an approved drawing set",
    desc: "Field-verified drawing packs — checked against real site conditions before execution begins.",
    provider: "CKA Structural Engineers", startingPrice: "From PKR 20 / sq.ft",
    packages: [ { name: "Construction-ready Set", price: "PKR 20 / sq.ft" } ] },
  { id: "renovation", name: "Renovation Design", img: "assets/img/building-up.webp",
    alt: "Renovation works in progress on an existing structure",
    desc: "Concept and working drawings for extensions, retrofits and renovation of existing structures.",
    provider: "CKA Design Studio", startingPrice: "From PKR 15,000",
    packages: [ { name: "Renovation Concept", price: "PKR 15,000" }, { name: "Full Renovation Set", price: "PKR 30,000" } ] },
  { id: "landscape", name: "Landscape Design", img: "assets/img/house-exterior.webp",
    alt: "House exterior and grounds",
    desc: "Grounds, driveway and softscape planning that ties the exterior together.",
    provider: "CKA Design Studio", startingPrice: "From PKR 12,000",
    packages: [ { name: "Landscape Concept", price: "PKR 12,000" } ] },
  { id: "other", name: "Other / Custom Design", img: "assets/img/online-services.webp",
    alt: "Blueprints and laptop for a custom design consultation",
    desc: "Something else in mind — signage, boundary walls, mosque or commercial fit-out? Tell us the brief.",
    provider: "CKA Design Studio", startingPrice: "Quoted per brief",
    packages: [ { name: "Custom Consultation", price: "Free · 20 min" } ] },
];

/* ── Supplier directory — mirrors db/schema.sql `suppliers` ─────── */
const SUPPLIERS = [
  { id: 1, name: "Hassan Traders", city: "Rawalpindi", categories: ["Cement", "Steel"], rating: 4.9, verified: true,
    reliability: 97, years: 12, img: "assets/img/cement-bags.webp", alt: "Stacked cement bags at a supplier depot",
    desc: "Authorized cement & steel dealer supplying grey-structure sites across Rawalpindi and Islamabad." },
  { id: 2, name: "Babar Building Materials", city: "Islamabad", categories: ["Bricks", "Blocks", "Sand", "Crush / Aggregate"], rating: 4.7, verified: true,
    reliability: 94, years: 9, img: "assets/img/bricks.webp", alt: "Stacked bricks at a materials yard",
    desc: "Bricks, blocks, sand and crush at yard-verified quality, with same-week delivery across the twin cities." },
  { id: 3, name: "Al-Makkah Sanitary & Tiles", city: "Rawalpindi", categories: ["Tiles", "Sanitary Items"], rating: 4.6, verified: true,
    reliability: 92, years: 7, img: "assets/img/tiles.webp", alt: "Porcelain tile display at a finishing showroom",
    desc: "Finishing showroom for tiles and sanitary ware from Master Tiles, Brighto and other verified brands." },
  { id: 4, name: "Chaudhry Steel Corner", city: "Islamabad", categories: ["Steel"], rating: 4.8, verified: true,
    reliability: 96, years: 15, img: "assets/img/steel-rebar.webp", alt: "Bundled steel rebar at a steel dealer",
    desc: "Mughal Steel and FF Steel authorized dealer, stocking Grade 60 rebar in every size." },
  { id: 5, name: "Zafar Plumbing Solutions", city: "Rawalpindi", categories: ["Plumbing Pipes", "Plumbing Fittings"], rating: 4.7, verified: true,
    reliability: 93, years: 8, img: "assets/img/pipes.webp", alt: "PPRC and UPVC plumbing pipes stacked at a supplier",
    desc: "Master Fit authorized distributor for PPRC and UPVC pipes and fittings, with next-day site delivery." },
  { id: 6, name: "National Paint Gallery", city: "Islamabad", categories: ["Paint", "Hardware and Finishing Materials"], rating: 4.5, verified: false,
    reliability: 88, years: 5, img: "assets/img/paint-roller.webp", alt: "Paint roller and finishing supplies",
    desc: "Paint, hardware and finishing supplies — verification visit scheduled for this quarter." },
];

/* ── Daily updates / news feed ───────────────────────────────────── */
const DAILY_UPDATES = [
  { id: 1, category: "price", label: "Price Update", date: "2026-08-21", title: "OPC cement eases to PKR 1,390–1,420/bag",
    body: "Twin-cities depot rates softened this week on steady clinker supply. Bulk orders above 500 bags still clear the best rate through the bidding board.",
    img: "assets/img/cement-bags.webp" },
  { id: 2, category: "market", label: "Market Update", date: "2026-08-19", title: "Steel holds firm as international billet ticks up",
    body: "Grade 60 rebar rates are steady week-on-week despite a small rise in imported billet cost — mills are absorbing the difference for now.",
    img: "assets/img/steel-rebar.webp" },
  { id: 3, category: "supplier", label: "New Supplier", date: "2026-08-17", title: "Chaudhry Steel Corner joins the verified network",
    body: "A 15-year Islamabad steel dealer has completed CKA's verification process and is now live on the bidding board for Grade 60 rebar.",
    img: "assets/img/rebar-workers.webp" },
  { id: 4, category: "material", label: "New Material", date: "2026-08-14", title: "Master Fit's new PN-20 PPRC range now listed",
    body: "Higher-pressure-rated PPRC pipes from Master Fit's latest catalogue are now searchable under Plumbing Pipes.",
    img: "assets/img/mf-pprc-pipes-b.webp" },
  { id: 5, category: "tip", label: "Construction Tip", date: "2026-08-11", title: "Curing concrete in Islamabad's August heat",
    body: "High daytime temperatures accelerate surface drying. Keep slabs under wet hessian or ponded water for a full 7 days to avoid shrinkage cracking.",
    img: "assets/img/concrete-panels.webp" },
  { id: 6, category: "design", label: "Design Trend", date: "2026-08-07", title: "Exposed-concrete facades gaining ground in DHA",
    body: "More plot owners are requesting board-marked exposed concrete on boundary walls and porticos instead of painted render — we've updated our elevation packages accordingly.",
    img: "assets/img/house-modern.webp" },
  { id: 7, category: "project", label: "New Project", date: "2026-08-04", title: "Four-storey commercial tender awarded in Blue Area",
    body: "A Blue Area commercial build went to bid this week with 11 suppliers competing on structural steel — the comparison sheet closed in under 48 hours.",
    img: "assets/img/crane-site.webp" },
  { id: 8, category: "announcement", label: "Announcement", date: "2026-08-01", title: "CKA now delivers to Abbottabad and northern Punjab",
    body: "Our delivery corridor has expanded beyond Rawalpindi/Islamabad to cover Abbottabad, Haripur and northern Punjab — freight is quoted per project.",
    img: "assets/img/warehouse.webp" },
];

/* ── Live bidding demo — initial board + pool of incoming bids ── */
const BID_SEED = [
  { supplier: "Hassan Traders",      city: "Rawalpindi", rate: 1398, reliability: 97, delivery: "2 days", mins: 1  },
  { supplier: "Babar Brothers & Co", city: "Islamabad",  rate: 1405, reliability: 95, delivery: "3 days", mins: 4  },
  { supplier: "New City Materials",  city: "Taxila",     rate: 1412, reliability: 93, delivery: "2 days", mins: 7  },
  { supplier: "Saeed & Sons Depot",  city: "Rawalpindi", rate: 1418, reliability: 91, delivery: "4 days", mins: 11 },
  { supplier: "Capital Cement House",city: "Islamabad",  rate: 1425, reliability: 89, delivery: "3 days", mins: 16 },
];

const BID_POOL = [
  { supplier: "Madina Building Material", city: "Gujar Khan",  reliability: 92, delivery: "3 days" },
  { supplier: "Ittehad Cement Agency",    city: "Rawalpindi",  reliability: 96, delivery: "2 days" },
  { supplier: "Metro Supply Co.",         city: "Islamabad",   reliability: 88, delivery: "5 days" },
  { supplier: "Raja Brothers Depot",      city: "Wah Cantt",   reliability: 90, delivery: "3 days" },
  { supplier: "Al-Noor Traders",          city: "Rawalpindi",  reliability: 94, delivery: "2 days" },
  { supplier: "Zam Zam Materials",        city: "Attock",      reliability: 86, delivery: "4 days" },
];
