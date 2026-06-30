import type { Product } from "./types";

/* Local catalogue — powers the site until the Supabase project exists.
   Mirrors the products table 1:1 so the swap is invisible. */
export const SEED_PRODUCTS: Product[] = [
  {
    id: "seed-evo-001",
    evo_no: "EVO-LR-0001",
    slug: "door-pocket-pull-range-rover-classic",
    name: "Door Pocket Pull",
    status: "published",
    badge: "NLA",
    oem_refs: ["MXC1306"],
    maker: "Land Rover",
    fitted_from: 1986,
    fitted_to: 1995,
    discontinued_year: null,
    revived_year: 2026,
    fitment: [
      { make: "Land Rover", model: "Range Rover Classic", years: "1986–1995" },
    ],
    material: "ASA, automotive grade — UV-stable",
    price_pence: 3900,
    lead_time_days: 5,
    in_stock: false,
    used_price_note: "£80+",
    story_md:
      "The Door Pocket Pull is the moulded grab handle set into the door card — the one you hook your fingers under to pull the door shut. Every Range Rover Classic has four of them, one per door, all moulded in the same plastic that cracks, splits and snaps clean off with age. It's the single most common piece of broken trim in a Classic's cabin.\n\nThe original is MXC1306, fitted from around 1986 to the end of Classic production in 1995, across every variant — two- and four-door, County, Vogue, LSE. It was colour-keyed to the interior (Tan, Ash/Winchester Grey, Sorrell Beige, Black and more, each with its own suffix) and clipped to a bracket behind the door card with two screw concealers (MXC1309). Land Rover stopped supplying it long ago; good originals are scarce and usually cracked.\n\nWe 3D-scanned an undamaged original, redrew it to factory geometry and print it in UV-stable, automotive-grade ASA so it won't go brittle the way the original does. The factory grain is finished by hand — no visible layers. Tell us your interior colour and we match the shade; stamped Evocation, referenced to MXC1306.",
    faq: [
      {
        q: "Does it fit all four doors?",
        a: "Yes — it's the same handle on all four doors of every Range Rover Classic (two- and four-door, County, Vogue, LSE), 1986–1995. Order as many as you need.",
      },
      {
        q: "What colour will it be?",
        a: "We match your interior trim colour. The original came in Tan, Ash/Winchester Grey, Sorrell Beige, Black, Lightstone and Walnut Brown, each with its own suffix on MXC1306 — tell us yours, or send a photo, before you order.",
      },
      {
        q: "Do I need the screw covers too?",
        a: "The handle clips to a bracket and is finished with two small screw concealers (Land Rover MXC1309). Reuse your originals if they're intact — ask us if you need replacements.",
      },
      {
        q: "What if it breaks?",
        a: "If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right.",
      },
    ],
    gallery: [],
  },
  {
    id: "seed-evo-002",
    evo_no: "EVO-POR-001",
    slug: "seat-hinge-cover-porsche-928",
    name: "Seat Hinge Cover",
    status: "published",
    badge: "Hard to find",
    oem_refs: ["928.521.147.02", "928.521.148.02"],
    maker: "Porsche",
    fitted_from: 1985,
    fitted_to: 1995,
    discontinued_year: null,
    revived_year: 2026,
    fitment: [
      { make: "Porsche", model: "928", phase: "S4 / GT / GTS", years: "1987–1995" },
      { make: "Porsche", model: "928", phase: "S", years: "1985–1986" },
      { make: "Porsche", model: "911 (classic)", phase: "Carrera / Turbo", years: "1985–1986" },
      { make: "Porsche", model: "944", phase: "944 / 944S / Turbo", years: "1985.5–1988" },
      { make: "Porsche", model: "968", years: "1994–1995" },
    ],
    material: "ASA, automotive grade — UV-stable",
    price_pence: 5900,
    // left & right are separate parts; sold individually, as a pair (one seat)
    // or as a full set of 4 (both seats). Explicit per-option pricing.
    options: [
      { key: "left", label: "Left side", price_pence: 5900, items: [{ ref: "928.521.147.02", qty: 1 }] },
      { key: "right", label: "Right side", price_pence: 5900, items: [{ ref: "928.521.148.02", qty: 1 }] },
      {
        key: "pair",
        label: "Pair — both sides (one seat)",
        price_pence: 9900,
        items: [
          { ref: "928.521.147.02", qty: 1 },
          { ref: "928.521.148.02", qty: 1 },
        ],
      },
      {
        key: "set-4",
        label: "Full set ×4 (both seats)",
        price_pence: 17900,
        items: [
          { ref: "928.521.147.02", qty: 2 },
          { ref: "928.521.148.02", qty: 2 },
        ],
      },
    ],
    lead_time_days: 5,
    in_stock: false,
    used_price_note: "£120+",
    story_md:
      "The Seat Hinge Cover is the rigid plastic shroud over the front seat's recliner hinge — not a fabric cover, the hard trim piece you see and touch every time you fold the seat forward. Porsche moulded it in ABS, and four decades of sun and cabin heat do to ABS what they always do: it turns brittle, then it cracks, chips and crumbles at the edges. It's one of the most recognised cosmetic faults in an 80s–90s Porsche interior — harmless to how the seat works, impossible to ignore once you've seen it.\n\nIt's a shared Porsche part, fitted to the front seats of the 911, 928, 944 and 968 from the mid-80s to the mid-90s, and it comes in two distinct mouldings. 928.521.147.02 is the left-hand cover; 928.521.148.02 is the right. They are mirror parts from different moulds — not interchangeable — so each seat takes one of each, and a full pair of fronts needs four.\n\nWe 3D-scanned undamaged originals of both sides, redrew them to factory geometry and print them in UV-stable, automotive-grade ASA — the same family of engineering plastic, formulated not to go brittle the way the originals did. The factory grain is finished by hand: no visible layers, no '3D-printed look'. Supplied in black to match the original 01C shade (other factory colours to order), stamped Evocation, referenced to the original part numbers.",
    faq: [
      {
        q: "Left or right — which one do I need?",
        a: "928.521.147.02 is the left-hand cover and 928.521.148.02 is the right — different mouldings, not interchangeable. Check the number moulded into the back of your old cover. Doing both front seats? You need two of each, so choose the full set of four.",
      },
      {
        q: "Why do the originals crack?",
        a: "They're moulded in ABS, which turns brittle under years of UV and cabin heat and then chips and crumbles — a well-known Porsche interior fault. It's purely cosmetic; the seat still works. Ours is printed in UV-stable ASA specifically so it won't go the same way.",
      },
      {
        q: "What colour is it?",
        a: "Black as standard, matched to the original 01C shade. Porsche offered it in other colours (including brown), specified by a colour suffix at order — we can match those on request, so ask us before you order.",
      },
      {
        q: "Which Porsches does it fit?",
        a: "The front seats of the 911 Carrera/Turbo (1985–86), 944 / 944S / Turbo (1985.5–88), 928 S then S4 / GT / GTS (1985–95) and 968 (1994–95). If your old cover is stamped 928.521.147.02 or 928.521.148.02, this is the part.",
      },
      {
        q: "What if it breaks?",
        a: "If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right.",
      },
    ],
    gallery: [],
  },
  {
    id: "seed-evo-lr-0002",
    evo_no: "EVO-LR-0002",
    slug: "facia-vent-louvre-range-rover-classic",
    name: "Facia Vent Louvre",
    status: "draft",
    badge: "Cracks with age",
    oem_refs: ["BTR7071"],
    maker: "Land Rover",
    fitted_from: 1987,
    fitted_to: 2006,
    discontinued_year: null,
    revived_year: 2026,
    fitment: [
      { make: "Land Rover", model: "Range Rover Classic", phase: "Soft dash (non-wood)", years: "1987–1991" },
      { make: "Land Rover", model: "Defender", phase: "With air-conditioning", years: "1987–2006" },
    ],
    material: "ASA, automotive grade — UV-stable",
    price_pence: 2500,
    lead_time_days: 5,
    in_stock: false,
    used_price_note: null,
    story_md:
      "The Facia Vent Louvre is the adjustable slatted vent set into the Range Rover Classic's soft dash — the louvre you swivel to aim the air. A dash takes several of them, and the plastic ages badly: the slats snap and the mounting clips break, so a tired dash ends up with vents that rattle, won't aim, or won't stay in at all.\n\nThe original is BTR7071, fitted to the soft-dash Classic (RRC NAS from 1987) and to the air-conditioned Defender. One important catch: the later wood-dash cars use a different louvre, BTR7072, with clips top and bottom — a BTR7071 won't hold properly in a wood dash. This is the non-wood-dash part.\n\nWe 3D-scan an undamaged original and reprint it in UV-stable ASA, slats and clips redrawn to factory geometry so they actually grip. Finished in the factory grain, stamped Evocation, referenced to BTR7071. You'll likely want more than one — a full dash uses around five.",
    faq: [
      {
        q: "How many does my dash use?",
        a: "Around five — the two centre vents and the outer ones, all the same part. Order as many as you need to refresh the dash.",
      },
      {
        q: "BTR7071 or BTR7072 — which do I need?",
        a: "BTR7071 is the earlier non-wood-dash louvre (clips at the top). The later wood-dash cars (~1994–95) use BTR7072, which clips top and bottom — a BTR7071 won't hold in a wood dash. Check your dash before ordering; ask us if you're unsure.",
      },
      {
        q: "Does it fit a Defender?",
        a: "Yes — the air-conditioned Defender uses the same louvre, from VIN XA159807 (1987 on).",
      },
      {
        q: "What if it breaks?",
        a: "If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right.",
      },
    ],
    gallery: [],
  },
  {
    id: "seed-evo-lr-0003",
    evo_no: "EVO-LR-0003",
    slug: "demister-vent-range-rover-classic",
    name: "Demister Vent",
    status: "draft",
    badge: "NLA",
    oem_refs: ["390699"],
    maker: "Land Rover",
    fitted_from: 1970,
    fitted_to: 1994,
    discontinued_year: null,
    revived_year: 2026,
    fitment: [
      { make: "Land Rover", model: "Range Rover Classic", phase: "Hard dash (original)", years: "1970–1994" },
    ],
    material: "ASA, automotive grade — UV-stable",
    price_pence: 1900,
    lead_time_days: 5,
    in_stock: false,
    used_price_note: null,
    story_md:
      "The Demister Vent is the round, fixed-slat vent with the cross-hair centre that push-fits into the top of the Range Rover Classic's original 'hard' dash — four of them across the screen for demisting and high-level airflow. Decades of heat and sun make the brittle original crack and the retaining lugs break, so they end up loose or missing.\n\nThe original is Land Rover 390699, fitted to the hard-dash Classic from 1970 until the soft dash arrived around 1993–94, four to a car. It's long NLA. Don't confuse it with the rectangular soft-dash louvres (BTR7071 / BTR7072) or the early vent surround (AEU3051) — this is the round push-fit demister vent.\n\nWe 3D-scan an undamaged original and reprint it in UV-stable ASA, with the peripheral retaining lugs redrawn so it push-fits and holds. Factory grain, stamped Evocation, referenced to 390699. Most cars need the full set of four.",
    faq: [
      {
        q: "How many do I need?",
        a: "Four per car — they push-fit into the round holes across the original hard dash. We can supply singles or the full set of four.",
      },
      {
        q: "Will it fit my dash?",
        a: "It's for the original 'hard' dash (1970 to ~1993–94), not the later soft dash with rectangular louvres. If your vents are round with a cross-hair centre, this is the part.",
      },
      {
        q: "Is it the same as the rectangular vents?",
        a: "No — those are the soft-dash louvres (BTR7071 / BTR7072). This is the round push-fit demister vent (390699), a different part again from the early AEU3051 surround.",
      },
      {
        q: "What if it breaks?",
        a: "If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right.",
      },
    ],
    gallery: [],
  },
];
