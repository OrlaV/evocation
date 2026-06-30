-- 003 — Correct the mis-identified "Interior Cup Handle" into the real part:
-- the Range Rover Classic Door Pocket Pull (MXC1306), and renumber to EVO-LR-0001
-- (2026-06-29). Source: matos/pieces_auto_validees.md #1.
-- The product trigger recomputes search_refs + fitment_keys + updated_at.
-- Targets by the current slug. Run in the Supabase SQL Editor.

update public.products set
  evo_no = 'EVO-LR-0001',
  slug = 'door-pocket-pull-range-rover-classic',
  name = 'Door Pocket Pull',
  badge = 'NLA',
  maker = 'Land Rover',
  oem_refs = array['MXC1306'],
  fitted_from = 1986,
  fitted_to = 1995,
  discontinued_year = null,
  fitment = $fit$[
    {"make":"Land Rover","model":"Range Rover Classic","years":"1986–1995"}
  ]$fit$::jsonb,
  options = $opt$[]$opt$::jsonb,
  story_md = $story$The Door Pocket Pull is the moulded grab handle set into the door card — the one you hook your fingers under to pull the door shut. Every Range Rover Classic has four of them, one per door, all moulded in the same plastic that cracks, splits and snaps clean off with age. It's the single most common piece of broken trim in a Classic's cabin.

The original is MXC1306, fitted from around 1986 to the end of Classic production in 1995, across every variant — two- and four-door, County, Vogue, LSE. It was colour-keyed to the interior (Tan, Ash/Winchester Grey, Sorrell Beige, Black and more, each with its own suffix) and clipped to a bracket behind the door card with two screw concealers (MXC1309). Land Rover stopped supplying it long ago; good originals are scarce and usually cracked.

We 3D-scanned an undamaged original, redrew it to factory geometry and print it in UV-stable, automotive-grade ASA so it won't go brittle the way the original does. The factory grain is finished by hand — no visible layers. Tell us your interior colour and we match the shade; stamped Evocation, referenced to MXC1306.$story$,
  faq = $faq$[
    {"q":"Does it fit all four doors?","a":"Yes — it's the same handle on all four doors of every Range Rover Classic (two- and four-door, County, Vogue, LSE), 1986–1995. Order as many as you need."},
    {"q":"What colour will it be?","a":"We match your interior trim colour. The original came in Tan, Ash/Winchester Grey, Sorrell Beige, Black, Lightstone and Walnut Brown, each with its own suffix on MXC1306 — tell us yours, or send a photo, before you order."},
    {"q":"Do I need the screw covers too?","a":"The handle clips to a bracket and is finished with two small screw concealers (Land Rover MXC1309). Reuse your originals if they're intact — ask us if you need replacements."},
    {"q":"What if it breaks?","a":"If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right."}
  ]$faq$::jsonb
where slug = 'interior-cup-handle-range-rover-classic';
