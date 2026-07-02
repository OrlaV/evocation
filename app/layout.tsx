import type { Metadata } from "next";
import { Archivo, Saira_Condensed, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

// Paddock / Silver Arrows livery type: extended Archivo (display),
// condensed italic Saira (race numbers), JetBrains Mono (timing data).
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-saira",
});

// kept under the --font-plex-mono name so existing var() references still resolve
const plexMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-mono",
});

const TITLE = SITE_TITLE;
const DESCRIPTION = SITE_DESCRIPTION;

/* No `alternates.canonical` or `openGraph.url` here: metadata merges shallowly,
   so a root-level canonical/og:url would leak the homepage URL onto every page
   that doesn't override the whole object (noindex pages included — a
   contradictory signal). The homepage sets its own in app/page.tsx; public
   pages build theirs with pageMeta() (lib/site.ts). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Evocation",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-ui="d"
      className={`${archivo.variable} ${saira.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Evocation",
                url: SITE_URL,
                logo: `${SITE_URL}/opengraph-image`,
                description:
                  "Discontinued interior & trim parts for classics and youngtimers, 3D-scanned from originals and remade with an OEM-grain finish.",
                email: "contact@evocation.store",
                areaServed: "Worldwide",
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "contact@evocation.store",
                  contactType: "customer support",
                  areaServed: "Worldwide",
                  availableLanguage: "English",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Evocation",
                url: SITE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <a
          href="#main-content"
          className="label-mono sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <CurrencyProvider>
          <CartProvider>
            <Header />
            {/* `contents` keeps this wrapper layout-neutral so page <main>
                elements stay direct flex children (footer still pushes down). */}
            <div id="main-content" className="contents">
              {children}
            </div>
            <Footer />
          </CartProvider>
        </CurrencyProvider>
        <Analytics />
      </body>
    </html>
  );
}
