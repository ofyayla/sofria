import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 430, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.goto("http://localhost:8083/kurallarim", { waitUntil: "networkidle0", timeout: 120000 });
await sleep(1500);

const switches = await page.$$('[role="switch"]');
await switches[0].click(); // Glutensiz
await sleep(400);
for (const label of ["Fırın", "Blender"]) {
  const el = (await page.evaluateHandle((t) => [...document.querySelectorAll("*")].find((n) => n.children.length === 0 && n.textContent.trim() === t), label)).asElement();
  await el.click();
  await sleep(400);
}
await page.evaluate(() => {
  for (const el of document.querySelectorAll("*")) {
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) el.scrollTop = 0;
  }
  document.activeElement?.blur?.();
});
await sleep(800);
const states = await page.$$eval('[role="switch"]', (els) => els.map((e) => e.getAttribute("aria-checked") ?? String(e.checked)));
console.log("switch durumları:", states.join(","));
await page.screenshot({ path: "./ham-ekranlar/m-12-kurallar.png" });
await browser.close();
console.log("ok");
