import type { Metadata } from "next";
import { archivo, sairaCond, mono } from "./fonts";
import "./paddock.css";

export const metadata: Metadata = {
  title: "Evocation — Paddock · Design System",
  robots: { index: false, follow: false },
};

const fontVars = [archivo.variable, sairaCond.variable, mono.variable].join(" ");

const CHIPS = [
  { name: "Aluminium", hex: "#E4E3DF", fill: "var(--track)", role: "Ground" },
  { name: "Graphite", hex: "#2C3137", fill: "var(--graphite)", role: "Bezel · blocks" },
  { name: "Corsa red", hex: "#D8261D", fill: "var(--signal)", role: "Action · live" },
  { name: "Brushed alu", hex: "#B9BDC0", fill: "var(--alu)", role: "Metal accent" },
];

const STANDINGS = [
  { pos: "01", no: "001", name: "Interior Cup Handle", chassis: "Range Rover Classic · RTC4655", status: "NLA · REVIVED", price: "£48" },
  { pos: "02", no: "002", name: "Seat Trim Cover", chassis: "Porsche 928 · 928.521.147.02", status: "NLA · REVIVED", price: "£64" },
  { pos: "03", no: "003", name: "Ashtray Surround", chassis: "Range Rover Classic · MWC7780", status: "PRINTED TO ORDER", price: "£39" },
];

const FITMENT = [
  { make: "Land Rover", model: "Range Rover Classic", variant: "2-door / 4-door", years: "1970–1996" },
  { make: "Land Rover", model: "Range Rover Classic", variant: "CSK", years: "1990–1991" },
];

const FAQ = [
  { q: "Won't a printed part look like plastic?", a: "No. Each part is 3D-scanned from an original, then printed in automotive-grade engineering polymer and finished with an OEM-grain texture — no visible print layers. Side by side with a worn original, most people can't tell which is which." },
  { q: "What if it doesn't fit?", a: "Fits or refunded. We check every part against reference dimensions before dispatch. If it doesn't fit your car, send it back." },
  { q: "How long does it take?", a: "Each part is printed to order. Lead time is shown on every part and is typically 5 working days before it ships from the UK." },
];

const QUEUE = [
  { ref: "MWC7780", name: "Range Rover Classic ashtray", on: 4, sectors: ["p", "g", "y"] },
  { ref: "944.552.111", name: "Porsche 944 vent slider", on: 3, sectors: ["g", "y", ""] },
  { ref: "XR3-CONS", name: "Ford Escort RS console", on: 2, sectors: ["y", "", ""] },
];

export default function DesignSystem() {
  return (
    <div className={`pad pad-page ${fontVars}`}>
      <div className="hazard" />

      {/* ============ MASTHEAD ============ */}
      <header className="pad-wrap" style={{ paddingTop: "clamp(32px,6vh,64px)", paddingBottom: "clamp(34px,6vh,68px)" }}>
        <div className="decalbar reveal d1" style={{ marginBottom: "clamp(28px,5vh,52px)" }}>
          <span>Evocation Racing Dept.</span><span className="sep">/</span>
          <span>3D-Scanned</span><span className="sep">/</span>
          <span>Engineering Polymer</span><span className="sep">/</span>
          <span>OEM-Grain Finish</span><span className="sep">/</span>
          <span>Newcastle UK</span><span className="sep">/</span>
          <span>Ships Worldwide</span>
        </div>

        <div className="reveal d2" style={{ display: "flex", alignItems: "center", gap: "0.7ch", marginBottom: "0.7rem" }}>
          <span className="decal decal-live"><span className="pip" />LIVE TIMING</span>
          <span className="pad-label">Round 01 · Paddock · Rev A</span>
        </div>
        <h1 className="pad-display reveal d2" style={{ fontSize: "clamp(3rem,12vw,9.5rem)" }}>Evocation</h1>

        <div className="reveal d3" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.2rem", marginTop: "1rem" }}>
          <p className="pad-body" style={{ fontSize: "clamp(1rem,2.2vw,1.35rem)", maxWidth: "40ch" }}>
            The parts they stopped making, back on the grid. A timing-screen interface — asphalt black, signal yellow, livery numbers.
          </p>
          <div className="lights" aria-hidden>
            <i className="on" /><i className="on" /><i className="on" /><i /><i />
          </div>
        </div>
      </header>

      {/* ============ §01 LIVERY COLOURS ============ */}
      <section className="pad-section pad-wrap">
        <div className="section-head">
          <div><span className="kicker pad-label signal">§ 01</span><h2 className="h2">Livery colours</h2></div>
          <span className="ghost-no">01</span>
        </div>
        <div className="chips g sm-2 lg-4 reveal" style={{ background: "transparent", boxShadow: "none", gap: "clamp(1rem,2.5vw,1.5rem)" }}>
          {CHIPS.map((c) => (
            <figure key={c.name} className="chip" style={{ boxShadow: "0 0 0 1px var(--line)" }}>
              <div className="fill" style={{ background: c.fill }} />
              <figcaption className="meta">
                <div>
                  <div className="pad-display" style={{ fontSize: "0.9rem", fontStretch: "108%" }}>{c.name}</div>
                  <div className="pad-label" style={{ fontSize: "0.56rem", marginTop: "0.25rem" }}>{c.role}</div>
                </div>
                <span className="pad-mono" style={{ fontSize: "0.72rem", color: "var(--paint-2)" }}>{c.hex}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="reveal" style={{ marginTop: "1.2rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span className="pad-label">Sector timing</span>
          <span className="sectors"><b className="g" /><b className="y" /><b className="p" /></span>
          <span className="pad-mono" style={{ fontSize: "0.68rem", color: "var(--paint-3)" }}>green · yellow · purple (fastest)</span>
        </div>
      </section>

      {/* ============ §02 TYPOGRAPHY ============ */}
      <section className="pad-section pad-wrap">
        <div className="section-head">
          <div><span className="kicker pad-label signal">§ 02</span><h2 className="h2">Typography</h2></div>
          <span className="ghost-no">02</span>
        </div>
        <div className="g" style={{ gap: 0 }}>
          {[
            { tag: "Display — Archivo Extended 800", node: <span className="pad-display" style={{ fontSize: "clamp(2.2rem,6vw,4rem)" }}>They stopped making it.</span> },
            { tag: "Number — Saira Condensed Italic", node: <span className="pad-num signal" style={{ fontSize: "clamp(3.5rem,11vw,7rem)" }}>001</span> },
            { tag: "Body — Archivo Regular", node: <span className="pad-body" style={{ fontSize: "1.02rem", maxWidth: "60ch" }}>Discontinued interior &amp; trim parts for youngtimers and classics, 3D-scanned from originals and remade in automotive-grade engineering polymers with a true OEM-grain finish.</span> },
            { tag: "Data — JetBrains Mono", node: <span className="pad-data" style={{ fontSize: "0.86rem", letterSpacing: "0.06em" }}>EVO·001 — REF 928.521.147.02 — LAP £48.00</span> },
          ].map((r) => (
            <div key={r.tag} className="reveal" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1.5rem 0", borderTop: "1px solid var(--line)" }}>
              <span className="pad-label signal" style={{ color: "var(--paint-3)" }}>{r.tag}</span>
              {r.node}
            </div>
          ))}
        </div>
      </section>

      {/* ============ §03 CONTROLS & MARKS ============ */}
      <section className="pad-section pad-wrap">
        <div className="section-head">
          <div><span className="kicker pad-label signal">§ 03</span><h2 className="h2">Controls &amp; marks</h2></div>
          <span className="ghost-no">03</span>
        </div>
        <div className="g sm-2" style={{ alignItems: "start" }}>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <span className="pad-label">Buttons</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem", alignItems: "center" }}>
              <button className="rbtn">Order the part <span className="arrow">→</span></button>
              <button className="rbtn rbtn-outline">Browse the grid</button>
              <button className="rbtn rbtn-ghost">How it&apos;s made <span className="arrow">→</span></button>
              <button className="rbtn rbtn-icon" aria-label="Search">⌕</button>
            </div>
            <span className="pad-label" style={{ marginTop: "0.5rem" }}>Search by part number</span>
            <form className="field" action="#">
              <input placeholder="e.g. 928.521.147.02" aria-label="Part number" />
              <button className="field-btn" type="button">Find</button>
            </form>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              <span className="pad-label">Start lights · sector bars</span>
              <div style={{ display: "flex", alignItems: "center", gap: "1.4rem", flexWrap: "wrap" }}>
                <span className="lights"><i className="on" /><i className="on" /><i className="on" /><i className="on" /><i /></span>
                <span className="sectors"><b className="g" /><b className="g" /><b className="p" /></span>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <span className="pad-label">Decals, numbers &amp; status</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
              <span className="pad-num" style={{ fontSize: "2.4rem" }}>001</span>
              <span className="decal"><span className="pip" />NLA · REVIVED</span>
              <span className="decal decal-signal">PRINTED TO ORDER</span>
              <span className="decal decal-live"><span className="pip" />LIVE</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span className="pad-label">Accent rule</span>
              <div className="hazard" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span className="pad-label">Decal ticker</span>
              <div className="decalbar"><span>Fits or refunded</span><span className="sep">/</span><span>Checked before dispatch</span><span className="sep">/</span><span>No time limit</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §04 THE REGISTRY — STANDINGS ============ */}
      <section className="pad-section pad-wrap">
        <div className="section-head">
          <div>
            <span className="kicker pad-label signal">§ 04</span>
            <h2 className="h2">The Registry — Standings</h2>
            <p className="pad-body" style={{ marginTop: "0.5rem" }}>Every revived part takes a place on the grid. Position = order of revival.</p>
          </div>
          <span className="ghost-no">04</span>
        </div>

        <div className="g" style={{ gridTemplateColumns: "1fr", gap: "clamp(1.4rem,3vw,2.2rem)" }}>
          {/* hero livery card */}
          <div className="reveal" style={{ display: "grid", gap: "clamp(1.4rem,3vw,2.2rem)", gridTemplateColumns: "1fr", alignItems: "start" }}>
            <div className="g" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
              <article className="livery" style={{ maxWidth: 520 }}>
                <div className="plate">
                  <span className="evo">EVO·RRC·001</span>
                  <span className="bignum">1</span>
                </div>
                <div className="body">
                  <span className="decal" style={{ alignSelf: "flex-start" }}><span className="pip" />NLA · REVIVED</span>
                  <span className="name">Interior Cup Handle</span>
                  <span className="sub">RANGE ROVER CLASSIC · 1970–1996 · REPLACES RTC4655</span>
                  <div className="foot">
                    <span className="price">£48</span>
                    <button className="rbtn">Order <span className="arrow">→</span></button>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* standings board */}
          <div className="board reveal">
            <div className="board-head">
              <span>POS</span><span>NO.</span><span>PART / CHASSIS</span><span>STATUS</span><span style={{ textAlign: "right", display: "block" }}>PRICE</span><span />
            </div>
            {STANDINGS.map((s) => (
              <div className="standing" key={s.no}>
                <span className="pos">{s.pos}</span>
                <span className="no">{s.no}</span>
                <div className="part">
                  <div className="name">{s.name}</div>
                  <div className="chassis">{s.chassis}</div>
                </div>
                <span className="status">
                  <span className={`decal ${s.status.includes("PRINTED") ? "decal-signal" : ""}`}>
                    {!s.status.includes("PRINTED") && <span className="pip" />}{s.status}
                  </span>
                </span>
                <span className="price">{s.price}</span>
                <span className="go">→</span>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ marginTop: "1.6rem", padding: "1rem 1.2rem", background: "var(--track-2)", boxShadow: "0 0 0 1px var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.8rem" }}>
          <span className="pad-body" style={{ color: "var(--paint-2)" }}>Your car isn&apos;t on the grid yet?</span>
          <span className="pad-display signal" style={{ fontSize: "0.85rem", fontStretch: "108%" }}>Most revivals start as a request →</span>
        </div>
      </section>

      {/* ============ §05 SCRUTINEERING + FAQ ============ */}
      <section className="pad-section pad-wrap">
        <div className="section-head">
          <div><span className="kicker pad-label signal">§ 05</span><h2 className="h2">Scrutineering &amp; FAQ</h2></div>
          <span className="ghost-no">05</span>
        </div>
        <div className="g sm-2" style={{ alignItems: "start", gap: "clamp(2rem,5vw,3.5rem)" }}>
          <div className="reveal">
            <span className="pad-label" style={{ display: "block", marginBottom: "0.8rem" }}>Eligibility — fits or refunded</span>
            <table className="scrutiny">
              <thead><tr><th>Make</th><th>Model</th><th>Variant</th><th>Years</th></tr></thead>
              <tbody>
                {FITMENT.map((f, i) => (
                  <tr key={i}>
                    <td>{f.make}</td><td>{f.model}</td>
                    <td className="muted" style={{ fontWeight: 400 }}>{f.variant}</td>
                    <td className="ref">{f.years}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="scrutiny" style={{ marginTop: "1.2rem" }}>
              <tbody>
                <tr><td style={{ width: "42%", color: "var(--paint-3)" }}>Material</td><td>ASA — automotive grade</td></tr>
                <tr><td style={{ color: "var(--paint-3)" }}>Finish</td><td>OEM-grain texture, no print layers</td></tr>
                <tr><td style={{ color: "var(--paint-3)" }}>Lead time</td><td>5 working days · ships worldwide from the UK</td></tr>
              </tbody>
            </table>
          </div>
          <div className="reveal">
            <span className="pad-label" style={{ display: "block", marginBottom: "0.4rem" }}>FAQ</span>
            {FAQ.map((f, i) => (
              <details className="acc" key={i} open={i === 0}>
                <summary>{f.q}<span className="pm" /></summary>
                <div className="acc-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ §06 GRID QUEUE + GUARANTEE ============ */}
      <section className="pad-section pad-wrap">
        <div className="section-head">
          <div><span className="kicker pad-label signal">§ 06</span><h2 className="h2">The grid &amp; the pit board</h2></div>
          <span className="ghost-no">06</span>
        </div>
        <div className="g sm-2" style={{ alignItems: "start", gap: "clamp(2rem,5vw,3.5rem)" }}>
          <div className="reveal">
            <span className="pad-label" style={{ display: "block", marginBottom: "0.8rem" }}>Resurrection queue — waiting on the grid</span>
            <div>
              {QUEUE.map((q) => (
                <div className="q-row" key={q.ref}>
                  <span className="q-ref">{q.ref}</span>
                  <span className="q-name">{q.name}</span>
                  <span className="sectors" aria-hidden>
                    {q.sectors.map((s, n) => <b key={n} className={s} />)}
                  </span>
                  <span className="q-count">{q.on} on</span>
                </div>
              ))}
            </div>
            <form className="field" style={{ marginTop: "1.2rem" }} action="#">
              <input placeholder="Your email — notify me" aria-label="Email" />
              <button className="field-btn" type="button">Join</button>
            </form>
          </div>

          <div className="reveal pitboard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pad-label">Pit board · the guarantee</span>
              <span className="pad-mono signal" style={{ fontSize: "0.74rem" }}>P1 · EVO-∞</span>
            </div>
            <div className="seal signal" style={{ margin: "0.7rem 0 0.5rem" }}>Fits,<br />or refunded.</div>
            <p className="pad-body" style={{ maxWidth: "42ch" }}>
              Every part is checked against reference dimensions before dispatch. If it doesn&apos;t fit, send it back. Replaced free if the fault is ours.
            </p>
            <div className="hazard" style={{ margin: "1.3rem 0 0.9rem" }} />
            <div className="decalbar"><span>Applies to every part</span><span className="sep">/</span><span>No time limit</span><span className="sep">/</span><span>Checked before dispatch</span></div>
          </div>
        </div>
      </section>

      {/* ============ COLOPHON ============ */}
      <div className="hazard" />
      <footer className="pad-wrap" style={{ paddingBlock: "clamp(36px,6vh,72px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="pad-display" style={{ fontSize: "1.1rem" }}>Paddock</span>
            <p className="pad-body" style={{ marginTop: "0.3rem" }}>Evocation design system · filed for review · propagate to the live site on approval.</p>
          </div>
          <span className="pad-mono" style={{ fontSize: "0.72rem", color: "var(--paint-3)" }}>NEWCASTLE UPON TYNE · 54.97°N 1.61°W</span>
        </div>
      </footer>
    </div>
  );
}
