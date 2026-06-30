export default function GhostNumeral({
  n,
  dark = false,
}: {
  n: string;
  dark?: boolean;
}) {
  // big outlined race number, top-right of the section — matches /design (.ghost-no)
  return (
    <span
      aria-hidden
      className="font-num pointer-events-none absolute right-0 -top-[clamp(18px,3vh,44px)] z-0 select-none"
      style={{
        fontSize: "clamp(5rem,12vw,10.5rem)",
        lineHeight: 0.8,
        color: "transparent",
        WebkitTextStroke: `1.5px ${
          dark
            ? "rgba(255,255,255,0.14)"
            : "color-mix(in srgb, var(--ink) 18%, transparent)"
        }`,
        transform: "skewX(-6deg)",
      }}
    >
      {n}
    </span>
  );
}
