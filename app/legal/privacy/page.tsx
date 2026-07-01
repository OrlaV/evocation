import type { Metadata } from "next";
import DocPage, { H2, P, UL } from "@/components/DocPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Evocation",
  description:
    "How Evocation collects, uses and protects your personal data (UK GDPR).",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <DocPage kicker="Legal" title="Privacy Policy" updated="June 2026" draft>
      <P>
        This policy explains how Evocation ([legal entity], [address], UK)
        handles your personal data under UK GDPR. We are the data controller.
        Questions: contact@evocation.store.
      </P>

      <H2>What we collect</H2>
      <UL
        items={[
          "Account: email address and a hashed password (handled by our authentication provider, Supabase).",
          "Profile: optionally your name, phone number and shipping address, if you choose to save them.",
          "Orders: items, amount, billing/shipping address and contact details, processed by our payment provider, Stripe.",
          "Requests: the part and vehicle you ask us to revive, and your email, when you use the resurrection queue.",
          "Basic, privacy-friendly usage analytics (Vercel Analytics).",
        ]}
      />

      <H2>How we use it</H2>
      <UL
        items={[
          "To take payment, fulfil and ship your order, and provide support (contract).",
          "To send transactional emails — order confirmation, dispatch with tracking, refunds (contract).",
          "To notify you when a part you requested or voted for is revived, and — only if you opt in — occasional product news (consent; withdraw any time).",
          "To run and secure the site, and meet our legal and accounting obligations.",
        ]}
      />

      <H2>Who we share it with</H2>
      <P>
        Only the processors that run the service: <b>Supabase</b> (database,
        authentication, hosting of your data), <b>Stripe</b> (payments),{" "}
        <b>Resend</b> (transactional email), <b>Vercel</b> (hosting/analytics),
        and <b>Royal Mail</b> (delivery). We never sell your data.
      </P>

      <H2>Retention</H2>
      <P>
        Order records are kept as long as required for accounting and legal
        purposes. You can delete your account at any time from your profile —
        your account and saved details are removed; past order records are
        retained but unlinked from your identity where the law allows.
      </P>

      <H2>Your rights</H2>
      <P>
        You can access, correct, export or erase your data, object to or
        restrict processing, and withdraw consent. Email contact@evocation.store;
        you also have the right to complain to the UK ICO (ico.org.uk).
      </P>

      <H2>Cookies</H2>
      <P>
        We use essential cookies to keep you signed in and remember your cart.
        Analytics are privacy-friendly and do not profile you across sites.
      </P>
    </DocPage>
  );
}
