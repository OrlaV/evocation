import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const [vp, width] of [["desktop", 1440], ["mobile", 390]]) {
  const ctx = await browser.newContext({
    viewport: { width, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/design", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200); // let draw-on + reveals settle
  await page.screenshot({ path: `${OUT}/design-${vp}.png`, fullPage: true });
  console.log(`✓ design-${vp}.png`);
  await ctx.close();
}
await browser.close();
console.log("done");
