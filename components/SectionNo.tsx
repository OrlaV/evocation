import Reveal from "./Reveal";

export default function SectionNo({
  children,
  dark = false,
}: {
  children: string;
  dark?: boolean;
}) {
  return (
    <Reveal
      className={`label-mono mb-[18px] flex items-center gap-3.5 ${
        dark ? "text-cream/75" : "text-ink-soft"
      } after:h-px after:flex-1 ${
        dark ? "after:bg-hairline-dark" : "after:bg-hairline"
      } after:content-['']`}
    >
      {children}
    </Reveal>
  );
}
