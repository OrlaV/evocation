import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("shots", { recursive: true });

const pages = [
  ["home", "/"],
  ["shop", "/shop"],
  ["part", "/parts/seat-back-cover-porsche-928"],
  ["admin-login", "/admin/login"],
];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const p = await ctx.newPage();
for (const [name, path] of pages) {
  await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `shots/live-${name}.png`, fullPage: true });
  console.log("ok", name);
}
await b.close();
