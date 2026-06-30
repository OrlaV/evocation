import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/products";
import { optionRefs } from "@/lib/types";

export const alt = "Evocation part";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Per-product social-share image — name, vehicle and the original ref it
// replaces, on brand. Makes forum/marketplace links look the part.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const name = product?.name ?? "Evocation";
  const fit = product?.fitment?.[0];
  const refs = product ? optionRefs(product) : [];
  const evo = product?.evo_no ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#23272b",
          color: "#e4e3df",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 12,
              fontWeight: 700,
              color: "#b9bdc0",
            }}
          >
            EVOCATION
          </div>
          {evo ? (
            <div style={{ fontSize: 24, color: "#84898d", letterSpacing: 4 }}>
              {evo}
            </div>
          ) : (
            <div />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.03,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {name}
          </div>
          {fit && (
            <div style={{ fontSize: 30, color: "#b9bdc0", marginTop: 16 }}>
              {`${fit.model} · ${fit.years}`}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ height: 28, width: 6, background: "#d8261d" }} />
          <div style={{ fontSize: 27, color: "#e4e3df" }}>
            {refs.length
              ? `Replaces ${refs.join(" · ")}`
              : "Discontinued — revived"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
