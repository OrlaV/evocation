import { ImageResponse } from "next/og";

export const alt = "Evocation — we bring back the parts they stopped making";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social-share image for the homepage (and default for the site).
// Note: Satori requires display:flex on any element with >1 child, and prefers
// single text children — hence the split lines below.
export default function Image() {
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
        <div style={{ height: 8, width: 160, background: "#d8261d" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 14,
              fontWeight: 700,
              color: "#b9bdc0",
            }}
          >
            EVOCATION
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -2,
              marginTop: 24,
              maxWidth: 980,
            }}
          >
            <div>We bring back the parts they</div>
            <div style={{ color: "#d8261d" }}>stopped making.</div>
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#b9bdc0" }}>
          Discontinued interior and trim, 3D-scanned, OEM-grain finish, printed
          in the UK
        </div>
      </div>
    ),
    size,
  );
}
