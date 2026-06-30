import type { Metadata } from "next";
import { Archivo, Saira_Condensed, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { SITE_URL } from "@/lib/site";
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

const TITLE = "Evocation — We bring back the parts they stopped making";
const DESCRIPTION =
  "Discontinued interior & trim parts for youngtimers and classics, 3D-scanned from originals and remade in automotive-grade engineering polymers with a true OEM-grain finish. Stamped Evocation. Referenced to the original.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Evocation",
    url: SITE_URL,
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Evocation",
              url: SITE_URL,
              description:
                "Discontinued interior & trim parts for classics and youngtimers, 3D-scanned from originals and remade with an OEM-grain finish.",
              email: "hello@evocation.uk",
              areaServed: "Worldwide",
            }),
          }}
        />
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
