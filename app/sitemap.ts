import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/products";
import { getVehiclePages } from "@/lib/vehicle-pages";
import { SITE_URL as base } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, vehicles] = await Promise.all([
    getPublishedProducts(),
    getVehiclePages(),
  ]);
  const now = new Date();
  const staticPages: [string, number][] = [
    ["/shop", 0.9],
    ["/vehicles", 0.7],
    ["/process", 0.7],
    ["/about", 0.6],
    ["/contact", 0.5],
    ["/legal/shipping", 0.4],
    ["/legal/returns", 0.4],
    ["/legal/terms", 0.3],
    ["/legal/privacy", 0.3],
  ];
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...staticPages.map(([path, priority]) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...vehicles.map((v) => ({
      url: `${base}/vehicles/${v.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/parts/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
