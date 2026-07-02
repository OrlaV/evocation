import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/products";
import { getVehiclePages } from "@/lib/vehicle-pages";
import { GUIDES } from "@/lib/guides";
import { SITE_URL as base } from "@/lib/site";

/* No lastModified on static/vehicle/guide entries: stamping them with
   new Date() at every generation says "everything changed just now", which
   teaches crawlers to distrust the site's lastmod entirely. Products keep
   their real created_at. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, vehicles] = await Promise.all([
    getPublishedProducts(),
    getVehiclePages(),
  ]);
  const staticPages: [string, number][] = [
    ["/shop", 0.9],
    ["/vehicles", 0.7],
    ["/requests", 0.6],
    ["/donors", 0.5],
    ["/guides", 0.6],
    ["/process", 0.7],
    ["/about", 0.6],
    ["/contact", 0.5],
    ["/legal/shipping", 0.4],
    ["/legal/returns", 0.4],
    ["/legal/terms", 0.3],
    ["/legal/privacy", 0.3],
  ];
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...staticPages.map(([path, priority]) => ({
      url: `${base}${path}`,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...vehicles.map((v) => ({
      url: `${base}/vehicles/${v.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...GUIDES.map((g) => ({
      url: `${base}/guides/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...products.map((p) => ({
      url: `${base}/parts/${p.slug}`,
      ...(p.created_at ? { lastModified: new Date(p.created_at) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
