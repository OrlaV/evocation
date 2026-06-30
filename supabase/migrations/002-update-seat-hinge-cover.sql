-- 002 — Update the Porsche Seat Hinge Cover (EVO-POR-001) with accurate copy,
-- multi-model fitment, honest badge, and left/right + bundle options (2026-06-29).
-- Prices preserved from the current live row (£59 / £59 / £99 / £179).
-- The product trigger recomputes search_refs + fitment_keys + updated_at on update.
-- Idempotent (targets by slug). Run in the Supabase SQL Editor after 001.

update public.products set
  name = 'Seat Hinge Cover',
  badge = 'Hard to find',
  fitted_from = 1985,
  fitted_to = 1995,
  discontinued_year = null,
  fitment = $fit$[
    {"make":"Porsche","model":"928","phase":"S4 / GT / GTS","years":"1987–1995"},
    {"make":"Porsche","model":"928","phase":"S","years":"1985–1986"},
    {"make":"Porsche","model":"911 (classic)","phase":"Carrera / Turbo","years":"1985–1986"},
    {"make":"Porsche","model":"944","phase":"944 / 944S / Turbo","years":"1985.5–1988"},
    {"make":"Porsche","model":"968","years":"1994–1995"}
  ]$fit$::jsonb,
  options = $opt$[
    {"key":"left","label":"Left side","price_pence":5900,"items":[{"ref":"928.521.147.02","qty":1}]},
    {"key":"right","label":"Right side","price_pence":5900,"items":[{"ref":"928.521.148.02","qty":1}]},
    {"key":"pair","label":"Pair — one seat (L + R)","price_pence":9900,"items":[{"ref":"928.521.147.02","qty":1},{"ref":"928.521.148.02","qty":1}]},
    {"key":"set-4","label":"Full set ×4 — both seats","price_pence":17900,"items":[{"ref":"928.521.147.02","qty":2},{"ref":"928.521.148.02","qty":2}]}
  ]$opt$::jsonb,
  story_md = $story$The Seat Hinge Cover is the rigid plastic shroud over the front seat's recliner hinge — not a fabric cover, the hard trim piece you see and touch every time you fold the seat forward. Porsche moulded it in ABS, and four decades of sun and cabin heat do to ABS what they always do: it turns brittle, then it cracks, chips and crumbles at the edges. It's one of the most recognised cosmetic faults in an 80s–90s Porsche interior — harmless to how the seat works, impossible to ignore once you've seen it.

It's a shared Porsche part, fitted to the front seats of the 911, 928, 944 and 968 from the mid-80s to the mid-90s, and it comes in two distinct mouldings. 928.521.147.02 is the left-hand cover; 928.521.148.02 is the right. They are mirror parts from different moulds — not interchangeable — so each seat takes one of each, and a full pair of fronts needs four.

We 3D-scanned undamaged originals of both sides, redrew them to factory geometry and print them in UV-stable, automotive-grade ASA — the same family of engineering plastic, formulated not to go brittle the way the originals did. The factory grain is finished by hand: no visible layers, no '3D-printed look'. Supplied in black to match the original 01C shade (other factory colours to order), stamped Evocation, referenced to the original part numbers.$story$,
  faq = $faq$[
    {"q":"Left or right — which one do I need?","a":"928.521.147.02 is the left-hand cover and 928.521.148.02 is the right — different mouldings, not interchangeable. Check the number moulded into the back of your old cover. Doing both front seats? You need two of each, so choose the full set of four."},
    {"q":"Why do the originals crack?","a":"They're moulded in ABS, which turns brittle under years of UV and cabin heat and then chips and crumbles — a well-known Porsche interior fault. It's purely cosmetic; the seat still works. Ours is printed in UV-stable ASA specifically so it won't go the same way."},
    {"q":"What colour is it?","a":"Black as standard, matched to the original 01C shade. Porsche offered it in other colours (including brown), specified by a colour suffix at order — we can match those on request, so ask us before you order."},
    {"q":"Which Porsches does it fit?","a":"The front seats of the 911 Carrera/Turbo (1985–86), 944 / 944S / Turbo (1985.5–88), 928 S then S4 / GT / GTS (1985–95) and 968 (1994–95). If your old cover is stamped 928.521.147.02 or 928.521.148.02, this is the part."},
    {"q":"What if it breaks?","a":"If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right."}
  ]$faq$::jsonb
where slug = 'seat-hinge-cover-porsche-928';
