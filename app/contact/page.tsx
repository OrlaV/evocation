import DocPage, { H2, P } from "@/components/DocPage";
import { ContactForm } from "@/components/Contact";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact | Evocation",
  description:
    "Get in touch with Evocation — fitment questions, orders, returns, or a part you can't find.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <DocPage
      kicker="Get in touch"
      title="Contact"
      intro="Real people, in the UK. We usually reply within one working day."
    >
      <a
        href="mailto:contact@evocation.store"
        className="font-display mt-2 inline-block text-[clamp(1.4rem,3vw,2rem)] font-bold text-brg hover:underline"
      >
        contact@evocation.store
      </a>

      <H2>Send us a message</H2>
      <ContactForm className="mt-4" />

      <H2>Before you buy</H2>
      <P>
        Not sure a part fits? Email your model and chassis/VIN number and
        we&rsquo;ll confirm before you order — fits or refunded either way.
      </P>

      <H2>Can&rsquo;t find your part?</H2>
      <P>
        Tell us what your car is missing on the{" "}
        <a className="text-brg hover:underline" href="/#queue">
          resurrection queue
        </a>
        . When enough owners ask for the same part, we revive it — and if you
        have the original, you can lend it to us to scan and get a free printed
        copy back.
      </P>

      <H2>Orders &amp; returns</H2>
      <P>
        Track an order from{" "}
        <a className="text-brg hover:underline" href="/account">
          your account
        </a>
        . For returns and the guarantee, see{" "}
        <a className="text-brg hover:underline" href="/legal/returns">
          Returns &amp; Refunds
        </a>
        .
      </P>
    </DocPage>
  );
}
