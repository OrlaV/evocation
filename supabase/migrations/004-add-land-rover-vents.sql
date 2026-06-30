-- 004 — Add two Range Rover Classic dash vents (2026-06-29).
-- Source: matos/pieces_auto_validees.md #3 (BTR7071) & #4 (390699).
-- Inserted as DRAFT with placeholder prices — set the real price in /admin and
-- publish. Idempotent (on conflict on evo_no do nothing).

-- EVO-LR-0002 — Facia Vent Louvre (rectangular, soft dash) — BTR7071
insert into public.products
  (evo_no, slug, name, status, badge, maker, oem_refs,
   fitted_from, fitted_to, revived_year, fitment, material,
   price_pence, lead_time_days, in_stock, story_md, faq)
values (
  'EVO-LR-0002',
  'facia-vent-louvre-range-rover-classic',
  'Facia Vent Louvre',
  'draft',
  'Cracks with age',
  'Land Rover',
  array['BTR7071'],
  1987, 2006, 2026,
  $fit$[
    {"make":"Land Rover","model":"Range Rover Classic","phase":"Soft dash (non-wood)","years":"1987–1991"},
    {"make":"Land Rover","model":"Defender","phase":"With air-conditioning","years":"1987–2006"}
  ]$fit$::jsonb,
  'ASA, automotive grade — UV-stable',
  2500, -- TODO placeholder price (£25) — set before publishing
  5, false,
  $story$The Facia Vent Louvre is the adjustable slatted vent set into the Range Rover Classic's soft dash — the louvre you swivel to aim the air. A dash takes several of them, and the plastic ages badly: the slats snap and the mounting clips break, so a tired dash ends up with vents that rattle, won't aim, or won't stay in at all.

The original is BTR7071, fitted to the soft-dash Classic (RRC NAS from 1987) and to the air-conditioned Defender. One important catch: the later wood-dash cars use a different louvre, BTR7072, with clips top and bottom — a BTR7071 won't hold properly in a wood dash. This is the non-wood-dash part.

We 3D-scan an undamaged original and reprint it in UV-stable ASA, slats and clips redrawn to factory geometry so they actually grip. Finished in the factory grain, stamped Evocation, referenced to BTR7071. You'll likely want more than one — a full dash uses around five.$story$,
  $faq$[
    {"q":"How many does my dash use?","a":"Around five — the two centre vents and the outer ones, all the same part. Order as many as you need to refresh the dash."},
    {"q":"BTR7071 or BTR7072 — which do I need?","a":"BTR7071 is the earlier non-wood-dash louvre (clips at the top). The later wood-dash cars (~1994–95) use BTR7072, which clips top and bottom — a BTR7071 won't hold in a wood dash. Check your dash before ordering; ask us if you're unsure."},
    {"q":"Does it fit a Defender?","a":"Yes — the air-conditioned Defender uses the same louvre, from VIN XA159807 (1987 on)."},
    {"q":"What if it breaks?","a":"If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right."}
  ]$faq$::jsonb
)
on conflict (evo_no) do nothing;

-- EVO-LR-0003 — Demister Vent (round, hard dash) — 390699
insert into public.products
  (evo_no, slug, name, status, badge, maker, oem_refs,
   fitted_from, fitted_to, revived_year, fitment, material,
   price_pence, lead_time_days, in_stock, story_md, faq)
values (
  'EVO-LR-0003',
  'demister-vent-range-rover-classic',
  'Demister Vent',
  'draft',
  'NLA',
  'Land Rover',
  array['390699'],
  1970, 1994, 2026,
  $fit$[
    {"make":"Land Rover","model":"Range Rover Classic","phase":"Hard dash (original)","years":"1970–1994"}
  ]$fit$::jsonb,
  'ASA, automotive grade — UV-stable',
  1900, -- TODO placeholder price (£19) — set before publishing
  5, false,
  $story$The Demister Vent is the round, fixed-slat vent with the cross-hair centre that push-fits into the top of the Range Rover Classic's original 'hard' dash — four of them across the screen for demisting and high-level airflow. Decades of heat and sun make the brittle original crack and the retaining lugs break, so they end up loose or missing.

The original is Land Rover 390699, fitted to the hard-dash Classic from 1970 until the soft dash arrived around 1993–94, four to a car. It's long NLA. Don't confuse it with the rectangular soft-dash louvres (BTR7071 / BTR7072) or the early vent surround (AEU3051) — this is the round push-fit demister vent.

We 3D-scan an undamaged original and reprint it in UV-stable ASA, with the peripheral retaining lugs redrawn so it push-fits and holds. Factory grain, stamped Evocation, referenced to 390699. Most cars need the full set of four.$story$,
  $faq$[
    {"q":"How many do I need?","a":"Four per car — they push-fit into the round holes across the original hard dash. We can supply singles or the full set of four."},
    {"q":"Will it fit my dash?","a":"It's for the original 'hard' dash (1970 to ~1993–94), not the later soft dash with rectangular louvres. If your vents are round with a cross-hair centre, this is the part."},
    {"q":"Is it the same as the rectangular vents?","a":"No — those are the soft-dash louvres (BTR7071 / BTR7072). This is the round push-fit demister vent (390699), a different part again from the early AEU3051 surround."},
    {"q":"What if it breaks?","a":"If it fails because of how it was made — not how it was used — we exchange it. Send us photos and your order date, and we put it right."}
  ]$faq$::jsonb
)
on conflict (evo_no) do nothing;
