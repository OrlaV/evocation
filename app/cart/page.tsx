import type { Metadata } from "next";
import CartView from "@/components/CartView";
import SectionNo from "@/components/SectionNo";
import { getSettings } from "@/lib/settings";
import { getPublishedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Cart — Evocation",
  robots: { index: false },
};

export default async function CartPage() {
  const [settings, products] = await Promise.all([
    getSettings(),
    getPublishedProducts(),
  ]);
  return (
    <main className="flex-1 py-[clamp(40px,7vh,80px)]">
      <div className="wrap max-w-[1040px]">
        <SectionNo>Your cart</SectionNo>
        <h1 className="font-display mt-1 mb-8 text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold tracking-[-0.015em]">
          Cart
        </h1>
        <CartView shipping={settings.shipping} allProducts={products} />
      </div>
    </main>
  );
}
