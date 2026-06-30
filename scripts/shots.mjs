import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const pages = [
  ["home", "/"],
  ["shop", "/shop"],
  ["part", "/parts/seat-back-cover-porsche-928"],
  ["account-login", "/account/login"],
  ["admin-login", "/admin/login"],
];

const browser = await chromium.launch();

for (const [vp, width] of [["desktop", 1440], ["mobile", 390]]) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    await page.goto("http://localhost:3000" + path, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `${OUT}/${name}-${vp}.png`,
      fullPage: true,
    });
    console.log(`✓ ${name}-${vp}.png`);
  }
  await ctx.close();
}

await browser.close();
console.log("done");
