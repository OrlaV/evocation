export type TickerItem = { text: string; status: "Revived" | "In queue" | null };

// Static brand lines always shown at the tail of the marquee.
const TAGLINES: TickerItem[] = [
  { text: "Interior & trim only", status: null },
  { text: "Printed to order in the UK · Ships worldwide", status: null },
];

function Track({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <span
          key={i}
          className="label-mono inline-block px-7 !text-[0.74rem] !tracking-[0.16em] text-ink-soft"
        >
          {item.text}
          {item.status && (
            <>
              {" — "}
              <b
                className={`font-medium ${
                  item.status === "Revived" ? "text-brass" : ""
                }`}
              >
                {item.status}
              </b>
            </>
          )}
        </span>
      ))}
    </>
  );
}

// `items` is built from real data on the server (revived parts + live queue).
// Falls back to the taglines alone when the catalogue/queue is still empty.
export default function Ticker({ items }: { items?: TickerItem[] }) {
  const track = [...(items ?? []), ...TAGLINES];
  return (
    <div
      aria-hidden="true"
      className="marquee-mask marquee-paused overflow-hidden border-y border-hairline bg-cream-deep py-2.5 whitespace-nowrap"
    >
      <div className="animate-marquee inline-block">
        <Track items={track} />
        <Track items={track} />
      </div>
    </div>
  );
}
