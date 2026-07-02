import type { NextConfig } from "next";

// Security headers applied to every route. Kept conservative (no CSP yet — a
// strict policy needs an audit of the inline JSON-LD / analytics first) but
// covers the high-value, zero-risk headers.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// Supabase Storage host, derived from the public URL so next/image can be
// enabled for real product photos without a code change.
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  experimental: {
    // Le projet vit sur un HDD (D:, Seagate SMR) : le cache disque Turbopack
    // (activé par défaut depuis Next 16.1) y écrit des Go de petits fichiers
    // et sature le disque au point de geler la machine. À retirer si le
    // projet est déplacé sur un SSD.
    turbopackFileSystemCacheForDev: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
