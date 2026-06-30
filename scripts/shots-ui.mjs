import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "shots/ui";
mkdirSync(OUT, { recursive: true });

const pages = [
  ["home", "/"],
  ["shop", "/shop"],
  ["part", "/parts/seat-back-cover-porsche-928"],
];
const directions = ["a", "b", "c", "d"];

const browser = await chromium.launch();

for (const ui of directions) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  // seed the saved direction so the inline no-flash script applies it
  await ctx.addInitScript((val) => {
    try {
      localStorage.setItem("evocation-ui", val);
    } catch {}
  }, ui);
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    await page.goto("http://localhost:3000" + path, {
      waitUntil: "networkidle",
    });
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
    await page.screenshot({
      path: `${OUT}/${name}-${ui}.png`,
      fullPage: true,
    });
    console.log(`✓ ${name}-${ui}.png`);
  }
  await ctx.close();
}

await browser.close();
console.log("done");
