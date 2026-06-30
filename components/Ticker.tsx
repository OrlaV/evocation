const ITEMS = [
  { text: "RTC3265", status: "Revived" },
  { text: "928.521.147.02", status: "Revived" },
  { text: "911.552.103.01", status: "In queue" },
  { text: "MWC7780", status: "In queue" },
  { text: "0005423718", status: "In queue" },
  { text: "Interior & trim only", status: null },
  { text: "Printed to order in the UK · Ships worldwide", status: null },
];

function Track() {
  return (
    <>
      {ITEMS.map((item, i) => (
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

export default function Ticker() {
  return (
    <div
      aria-hidden="true"
      className="marquee-mask marquee-paused overflow-hidden border-y border-hairline bg-cream-deep py-2.5 whitespace-nowrap"
    >
      <div className="animate-marquee inline-block">
        <Track />
        <Track />
      </div>
    </div>
  );
}
