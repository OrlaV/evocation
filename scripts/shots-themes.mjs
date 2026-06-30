import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "shots/themes";
mkdirSync(OUT, { recursive: true });

const themes = ["oxide", "petrol", "champagne", "slate", "ember"];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
});
const page = await ctx.newPage();

for (const t of themes) {
  // set the theme in localStorage before any paint, matching the inline script
  await ctx.addInitScript((theme) => {
    try {
      localStorage.setItem("evocation-theme", theme);
    } catch {}
  }, t);
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  // scroll through so the on-view reveals fire, then return to top
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/home-${t}.png`, fullPage: true });
  console.log(`✓ home-${t}.png`);
}

await ctx.close();
await browser.close();
console.log("done");
