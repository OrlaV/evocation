import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getPublishedProducts } from "@/lib/products";
import { fitmentSpec, optionRefs, refLabels, normalizeRef } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import { SITE_URL, pageMeta } from "@/lib/site";
import { vehicleSlug, vehicleKey } from "@/lib/vehicles";
import ProductGallery from "@/components/ProductGallery";
import FitsYourGarage from "@/components/FitsYourGarage";
import WishlistButton from "@/components/WishlistButton";
import ReviewForm from "@/components/ReviewForm";
import { getProductReviews } from "@/lib/reviews";
import FaqList from "@/components/FaqList";
import BuyBox from "@/components/BuyBox";
import Reveal from "@/components/Reveal";
import { PartCard } from "@/components/Registry";

// refresh the static page periodically so DB edits not made through /admin
// (and the Stripe-key gate on the buy box) are picked up without a rebuild.
export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const fit = product.fitment[0];
  const refs = optionRefs(product);
  const refList = refs.join(", ");
  const status = product.badge ? ` (${product.badge})` : "";
  return pageMeta({
    title: `${product.name}${fit?.model ? ` — ${fit.model}` : ""} | Evocation`,
    description: `Replaces original part ${refs.length > 1 ? "nos." : "no."} ${refList}${status}${product.maker ? `, originally fitted to ${product.maker}` : ""}. Printed to order in the UK in ${product.material.split(",")[0]}, OEM-grain finish — fits or refunded.`,
    path: `/parts/${product.slug}`,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const fit = product.fitment[0];
  const options = product.options ?? [];
  const refs = optionRefs(product);
  const primaryRef = refs[0] ?? product.evo_no;
  const labels = refLabels(product);
  const gallery = product.gallery ?? [];
  // canonical make|model keys for "fits your garage" matching (client-side)
  const vehicleKeys = Array.from(
    new Set(
      product.fitment
        .map((f) => vehicleKey(f.make, f.model))
        .filter(Boolean),
    ),
  );
  const availability = product.in_stock
    ? "https://schema.org/InStock"
    : "https://schema.org/PreOrder";

  // other published parts that fit one of the same makes
  const makes = new Set(product.fitment.map((f) => f.make).filter(Boolean));
  const [allProducts, reviewData] = await Promise.all([
    getPublishedProducts(),
    getProductReviews(product.id),
  ]);
  const related = allProducts
    .filter(
      (p) =>
        p.slug !== product.slug &&
        p.fitment.some((f) => makes.has(f.make)),
    )
    .slice(0, 3);

  // one Offer per purchase option (each carries its own refs + price), so both
  // the left and right refs surface to search; single-piece products keep one
  // offer as before.
  const offer = (price: number, extra: Record<string, unknown> = {}) => ({
    "@type": "Offer",
    priceCurrency: "GBP",
    price: (price / 100).toFixed(2),
    availability,
    itemCondition: "https://schema.org/NewCondition",
    ...extra,
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name}${fit ? ` — ${fit.model}` : ""}`,
    sku: product.evo_no,
    mpn: primaryRef,
    // `image` is REQUIRED for Google's Product rich result — while real photos
    // are pending, fall back to the per-part dynamic OG card so Search Console
    // doesn't flag every part page.
    image: gallery.length
      ? gallery.map((g) => imageUrl(g.path))
      : [`${SITE_URL}/parts/${product.slug}/opengraph-image`],
    brand: { "@type": "Brand", name: "Evocation" },
    description: `Replaces original part ${refs.length > 1 ? "nos." : "no."} ${refs.join(", ")}${product.badge ? ` (${product.badge})` : ""}${product.maker ? `, originally fitted to ${product.maker}` : ""}. Pattern part printed to order in the UK, OEM-grain finish — fits or refunded.`,
    itemCondition: "https://schema.org/NewCondition",
    offers: options.length
      ? options.map((o) =>
          offer(o.price_pence, {
            name: o.label,
            sku: `${product.evo_no}-${o.key}`,
            mpn: o.items[0]?.ref ?? primaryRef,
          }),
        )
      : offer(product.price_pence),
    // only emit ratings when real reviews exist (Google requires genuine data)
    ...(reviewData.count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewData.average,
            reviewCount: reviewData.count,
          },
          review: reviewData.reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
            },
            author: { "@type": "Person", name: r.author_name ?? "Verified owner" },
            ...(r.title ? { name: r.title } : {}),
            ...(r.body ? { reviewBody: r.body } : {}),
            datePublished: r.created_at.slice(0, 10),
          })),
        }
      : {}),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "The Registry", item: `${SITE_URL}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/parts/${product.slug}`,
      },
    ],
  };
  // FAQ rich result — only emitted when the part actually has Q/A pairs.
  const faqLd = product.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: product.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;
  const structuredData = [jsonLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])];

  return (
    <main className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="wrap pt-8 pb-[clamp(56px,8vh,100px)]">
        {/* breadcrumb */}
        <nav className="label-mono mb-8 flex items-center gap-2.5 !text-[0.68rem] text-ink-soft">
          <a href="/shop" className="transition-colors hover:text-brg">
            Shop
          </a>
          <span aria-hidden>/</span>
          <span className="text-brass">PART NO. {product.evo_no}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-[clamp(28px,4vw,64px)] min-[981px]:grid-cols-[7fr_5fr]">
          {/* gallery */}
          <Reveal>
            <ProductGallery name={product.name} gallery={gallery} />
          </Reveal>

          {/* summary */}
          <Reveal delay={0.1}>
            {(product.badge || product.revived_year) && (
              <span className="label-mono inline-block border border-brg px-2 py-[3px] !text-[0.66rem] text-brg">
                {[
                  product.badge,
                  product.revived_year && `Revived ${product.revived_year}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
            <h1 className="font-display mt-4 text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.05] font-bold tracking-[-0.015em]">
              {product.name}
            </h1>
            {fit && (
              <div className="mt-1.5 text-[1.02rem] text-ink-soft">
                {fit.model} · {fit.years}
              </div>
            )}

            <div className="mt-5 border-l-2 border-brg bg-cream-deep px-3.5 py-3 font-mono text-[0.78rem] tracking-[0.06em] text-ink-soft">
              Replaces original part {refs.length > 1 ? "nos." : "no."}{" "}
              {refs.map((r, i) => (
                <span key={r}>
                  {i > 0 && " · "}
                  <a
                    href={`/ref/${normalizeRef(r)}`}
                    className="font-medium text-ink underline decoration-hairline underline-offset-2 transition-colors hover:text-brg"
                  >
                    {r}
                  </a>
                  {labels[r] && ` (${labels[r]})`}
                </span>
              ))}{" "}
              — discontinued by {product.maker}
            </div>

            {/* part biography */}
            <div className="mt-6 grid grid-cols-3 border-t border-hairline">
              {[
                {
                  y:
                    product.fitted_from && product.fitted_to
                      ? `${product.fitted_from}–${String(product.fitted_to).slice(-2)}`
                      : "—",
                  t: "Fitted",
                  revived: false,
                },
                {
                  y: product.discontinued_year ?? "—",
                  t: "Discontinued",
                  revived: false,
                },
                {
                  y: String(product.revived_year ?? "—"),
                  t: "Revived",
                  revived: true,
                },
              ].map((bio, i) => (
                <div
                  key={bio.t}
                  className={`pt-3 pb-4 ${i < 2 ? "border-r border-hairline pr-3" : ""} ${i > 0 ? "pl-3" : ""}`}
                >
                  <div
                    className={`font-num text-[1.5rem] leading-none ${bio.revived ? "text-brg" : ""}`}
                  >
                    {bio.y}
                  </div>
                  <div className="label-mono !text-[0.65rem] !tracking-[0.12em] text-ink-soft">
                    {bio.t}
                  </div>
                </div>
              ))}
            </div>

            <FitsYourGarage vehicleKeys={vehicleKeys} />

            <div className="mt-4">
              <WishlistButton productId={product.id} slug={product.slug} />
            </div>

            {/* price + order */}
            <BuyBox
              slug={product.slug}
              evoNo={product.evo_no}
              productName={product.name}
              basePrice={product.price_pence}
              primaryRef={primaryRef}
              usedPriceNote={product.used_price_note}
              leadTimeDays={product.lead_time_days}
              options={options}
              refLabels={labels}
              productSlots={product.slots ?? 5}
              heroImage={gallery[0]?.path}
              checkoutEnabled={Boolean(process.env.STRIPE_SECRET_KEY)}
            />

            {/* specs */}
            <table className="mt-7 w-full border-collapse border-t border-hairline">
              <tbody>
                {[
                  ["Material", product.material],
                  ["Surface", "Textured OEM-style grain, applied by hand"],
                  ["Marking", "Stamped “Evocation” — sold as a pattern part"],
                  [
                    "Availability",
                    product.in_stock
                      ? "In stock"
                      : "Printed for your order — no waiting on stock that doesn't exist",
                  ],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="label-mono w-[36%] border-b border-hairline py-3 pr-2 align-top !text-[0.7rem] !tracking-[0.12em] text-ink-soft">
                      {k}
                    </td>
                    <td className="border-b border-hairline py-3 align-top text-[0.88rem]">
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>

        {/* story + fitment + faq */}
        <div className="mt-[clamp(48px,7vh,88px)] grid grid-cols-1 gap-[clamp(32px,5vw,80px)] min-[981px]:grid-cols-[7fr_5fr]">
          <div>
            {product.story_md && (
              <Reveal>
                <div className="label-mono mb-4 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
                  The story
                </div>
                {product.story_md.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    className="mt-4 max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft first:mt-0"
                  >
                    {para}
                  </p>
                ))}
              </Reveal>
            )}

            <Reveal className="mt-10">
              <div className="label-mono mb-4 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
                Fitment
              </div>
              <table className="w-full border-collapse border-t border-hairline">
                <thead>
                  <tr>
                    {["Model", "Variant", "Years"].map((h) => (
                      <th
                        key={h}
                        className="label-mono border-b border-hairline py-2.5 pr-2 text-left !text-[0.66rem] !tracking-[0.12em] text-ink-soft"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product.fitment.map((f, i) => (
                    <tr key={i}>
                      <td className="border-b border-hairline py-3 pr-2 text-[0.9rem]">
                        {f.model}
                      </td>
                      <td className="border-b border-hairline py-3 pr-2 text-[0.9rem] text-ink-soft">
                        {fitmentSpec(f)}
                      </td>
                      <td className="border-b border-hairline py-3 font-mono text-[0.8rem]">
                        {f.years}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="label-mono mt-3 !text-[0.66rem] !tracking-[0.1em] text-ink-soft">
                Not sure it fits? Email us your chassis number — fits or
                refunded.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="label-mono mb-4 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
              Questions
            </div>
            <FaqList items={product.faq} />

            <a
              href="/shop"
              className="label-mono group mt-8 inline-flex items-center gap-1.5 text-brg"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>{" "}
              Back to the registry
            </a>
          </Reveal>
        </div>

        {/* reviews */}
        <div className="mt-[clamp(48px,7vh,88px)]">
          <div className="label-mono mb-6 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
            Reviews
          </div>
          {reviewData.count > 0 ? (
            <>
              <div className="flex items-baseline gap-3">
                <span className="font-num text-[2rem] leading-none text-brg">
                  {reviewData.average.toFixed(1)}
                </span>
                <span
                  aria-hidden
                  className="text-[1.1rem] tracking-[0.12em] text-brg"
                >
                  {"★".repeat(Math.round(reviewData.average))}
                  <span className="text-ink-soft/40">
                    {"★".repeat(5 - Math.round(reviewData.average))}
                  </span>
                </span>
                <span className="label-mono !text-[0.66rem] text-ink-soft">
                  {reviewData.count} review{reviewData.count > 1 ? "s" : ""}
                </span>
              </div>
              <ul className="mt-6 max-w-[70ch] space-y-5">
                {reviewData.reviews.map((r) => (
                  <li key={r.id} className="border-t border-hairline pt-4">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden className="tracking-[0.1em] text-brg">
                        {"★".repeat(r.rating)}
                        <span className="text-ink-soft/40">
                          {"★".repeat(5 - r.rating)}
                        </span>
                      </span>
                      {r.verified_buyer && (
                        <span className="label-mono !text-[0.56rem] !tracking-[0.1em] text-brass">
                          Verified buyer
                        </span>
                      )}
                    </div>
                    {r.title && (
                      <div className="font-display mt-1.5 text-[1rem] font-bold">
                        {r.title}
                      </div>
                    )}
                    {r.body && (
                      <p className="mt-1 text-[0.95rem] leading-[1.6] text-ink-soft">
                        {r.body}
                      </p>
                    )}
                    <div className="label-mono mt-1.5 !text-[0.58rem] text-ink-soft/70">
                      {r.author_name ?? "Verified owner"} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("en-GB")}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[0.95rem] text-ink-soft">
              No reviews yet — verified buyers can be the first.
            </p>
          )}
          <ReviewForm productId={product.id} slug={product.slug} />
        </div>

        {/* link to the vehicle landing page (SEO + navigation) */}
        {fit?.make && fit?.model && (
          <div className="mt-[clamp(40px,6vh,72px)]">
            <a
              href={`/vehicles/${vehicleSlug(`${fit.make} ${fit.model}`)}`}
              className="label-mono group inline-flex items-center gap-1.5 text-brg"
            >
              See all {fit.make} {fit.model} parts
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        )}

        {/* related parts (same make) */}
        {related.length > 0 && (
          <div className="mt-[clamp(48px,7vh,88px)]">
            <div className="label-mono mb-6 flex items-center gap-3.5 text-ink-soft after:h-px after:flex-1 after:bg-hairline after:content-['']">
              More for your {fit?.make ?? "car"}
            </div>
            <div className="grid grid-cols-2 gap-[clamp(12px,1.6vw,22px)] min-[861px]:grid-cols-3">
              {related.map((p, i) => (
                <PartCard key={p.evo_no} part={p} index={i} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
