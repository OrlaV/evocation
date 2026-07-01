import type { Product } from "./types";
import { getPublishedProducts } from "./products";
import { vehicleSlug } from "./vehicles";

/* Programmatic SEO landing pages, one per make+model that actually has a
   published part (e.g. /vehicles/porsche-928, /vehicles/range-rover-classic).
   These target how people in the niche search — by their car, not a part
   number — and are built entirely from catalogue data. */

export type VehiclePage = {
  slug: string;
  make: string;
  model: string;
  products: Product[];
};

function build(products: Product[]): VehiclePage[] {
  const map = new Map<string, VehiclePage>();
  for (const p of products) {
    // a product may list the same model on several fitment rows (phases) —
    // only attach it once per vehicle
    const seen = new Set<string>();
    for (const f of p.fitment) {
      if (!f.make || !f.model) continue;
      const slug = vehicleSlug(`${f.make} ${f.model}`);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      let vp = map.get(slug);
      if (!vp) {
        vp = { slug, make: f.make, model: f.model, products: [] };
        map.set(slug, vp);
      }
      vp.products.push(p);
    }
  }
  return [...map.values()].sort((a, b) =>
    `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`),
  );
}

export async function getVehiclePages(): Promise<VehiclePage[]> {
  return build(await getPublishedProducts());
}

export async function getVehiclePage(slug: string): Promise<VehiclePage | null> {
  return (await getVehiclePages()).find((v) => v.slug === slug) ?? null;
}
