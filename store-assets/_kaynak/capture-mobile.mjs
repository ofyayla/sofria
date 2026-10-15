import puppeteer from "puppeteer-core";
import fs from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:8083";
const OUT = "./ham-ekranlar";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// iPhone 6.7" ekranı 430x932 pt; üstte 54pt durum çubuğu, altta 34pt ana-ekran çubuğu.
// Uygulama güvenli alan içindeki 430x844'e render edilir; kenarları kompozisyon ekler.
const VIEW = { width: 430, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--no-sandbox"], protocolTimeout: 60000 });
const page = await browser.newPage();
page.setDefaultTimeout(30000);
await page.setViewport(VIEW);
// Reanimated'in web düzen animasyonları bu kurulumda hata veriyor; azaltılmış hareket onları atlatır.
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
page.on("pageerror", (e) => log("[pageerror]", String(e).slice(0, 200)));

async function settle(extra = 700) {
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    const timeout = new Promise((r) => setTimeout(r, 5000));
    const imgs = Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    await Promise.race([Promise.all([imgs, document.fonts.ready]), timeout]);
    document.activeElement?.blur?.();
    for (const el of document.querySelectorAll("*")) {
      if (el.children.length === 0 && el.textContent.trim() === "Design System (dev)") el.style.display = "none";
    }
  });
  await sleep(extra);
}

async function findText(text, nth = 0, contains = false) {
  const handle = await page.evaluateHandle((text, nth, contains) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    const matches = [];
    let n;
    while ((n = walker.nextNode())) {
      const own = [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join("").trim();
      if (contains ? own.includes(text) : own === text) {
        const r = n.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) matches.push(n);
      }
    }
    return (nth < 0 ? matches[matches.length + nth] : matches[nth]) ?? null;
  }, text, nth, contains);
  return handle.asElement();
}
async function tap(text, nth = 0, contains = false) {
  const el = await findText(text, nth, contains);
  if (!el) throw new Error("Bulunamadı: " + text);
  await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
  await sleep(200);
  await el.click();
  await sleep(700);
  log("dokunuldu:", text);
}
async function tapLabel(label, nth = 0) {
  const els = await page.$$(`[aria-label="${label}"]`);
  if (!els[nth]) throw new Error("aria-label bulunamadı: " + label);
  await els[nth].evaluate((e) => e.scrollIntoView({ block: "center" }));
  await sleep(200);
  await els[nth].click();
  await sleep(600);
  log("dokunuldu (aria):", label);
}
async function shot(name) {
  await settle();
  await page.screenshot({ path: `${OUT}/${name}.png` });
  log("kaydedildi:", name);
}
const bodyText = () => page.evaluate(() => document.body.innerText);

async function rateOpenRecipe(stars, comment) {
  await tap("Denedim");
  await tapLabel(`${stars} yıldız`);
  const input = await page.$("textarea, input[type=text], input:not([type])");
  if (input) { await input.click(); await page.keyboard.type(comment); }
  await tap("Kaydet");
}

// ---------- Ana sayfa
await page.goto(BASE, { waitUntil: "networkidle0", timeout: 120000 });
await sleep(1500);
await shot("m-00-home");
await tap("Haftalık Planımı Oluştur");

// ---------- 1) Hane
await tapLabel("Artır", 1);
await page.type('input[placeholder="yaş"]', "6");
await shot("m-01-hane");
await tap("İleri");

// ---------- 2) Öğünler
for (const m of ["Kahvaltı", "Öğle", "Akşam"]) await tap(m);
await shot("m-02-ogunler");
await tap("Kahvaltı"); // kapat — kahvaltıların çoğunun fotoğrafı yok
await tap("İleri");

// ---------- 3) Mutfak
for (const c of ["Kırmızı Et", "Beyaz Et", "Sebze Yemekleri", "Ortadoğu Mutfağı", "İtalyan Mutfağı"]) await tap(c);
await shot("m-03-mutfak");
await tap("İleri");

// ---------- 4) Diyet
await shot("m-04-diyet");
await tap("İleri");

// ---------- 5) Ekipman
await tap("Fırın");
await tap("Blender");
await shot("m-05-ekipman");
await tap("İleri");

// ---------- 6) Çeşit
await tap("İki çeşit", 0);
await tap("Tam menü", 1);
await shot("m-06-cesit");
await tap("İleri");

// ---------- 7) Özet
await shot("m-07-ozet");
await tap("Planımı oluştur");
await page.waitForFunction(() => /\/plan\/[0-9a-f-]{36}/.test(location.pathname), { timeout: 60000 });
await sleep(2500);
log("plan:", page.url());
const planUrl = page.url();
fs.writeFileSync(`${OUT}/_plan-url.txt`, planUrl);

await shot("m-08-plan");
fs.writeFileSync(`${OUT}/_plan-text.txt`, await bodyText());

// ---------- Tarif detayı: güzel görselli bir ana yemek seç
const PREFERRED = ["Karnıyarık", "Hünkar Beğendi", "İmam Bayıldı", "Fırında Tavuk But", "Etli Nohut", "İzmir Köfte", "Tavuk Sote", "Etsiz Musakka"];
const dayChips = async () =>
  page.$$eval("[aria-label]", (els) =>
    els.map((e) => e.getAttribute("aria-label")).filter((l) => /^(Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar), /.test(l))
  );
const chips = await dayChips();
log("gün çipleri:", chips.join(" / "));
let chosen = null;
for (let d = 0; d < chips.length && !chosen; d++) {
  if (d > 0) { await tapLabel(chips[d]); await settle(400); }
  const text = await bodyText();
  chosen = PREFERRED.find((n) => text.split("\n").some((l) => l.trim() === n));
  if (chosen) log("seçilen gün:", chips[d], "tarif:", chosen);
}
if (!chosen) throw new Error("Tercih edilen tarif yok");
await shot("m-08b-plan-gun");
await tap(chosen, -1); // ilk eşleşme öğün başlığı, son eşleşme tıklanabilir tarif satırı
await shot("m-09-tarif");
await rateOpenRecipe(5, "Çok lezzetli, ailece bayıldık!");
await shot("m-09b-tarif-puanli");
await tapLabel("Kapat");

// Ek puanlamalar (Tariflerim dolu görünsün): farklı günlerin ana yemekleri
const planJson = await page.evaluate(() => JSON.parse(localStorage.getItem("sofria:v1:plan")));
const days = planJson.state.currentPlan.days;
const REVIEWS = [
  [4, "Pratik ve hafif."],
  [5, "Çocuklar da çok sevdi."],
  [5, "Kesinlikle tekrar yapacağım!"],
  [4, "Baharatı tam kıvamında."],
];
const rated = new Set([chosen]);
let r = 0;
for (let d = 0; d < days.length && r < REVIEWS.length; d++) {
  const main = days[d].meals.flatMap((m) => m.subRecipes).find((s) => s.role === "ana_yemek" && s.imageSlug && !rated.has(s.name));
  if (!main) continue;
  await tapLabel(chips[d]);
  await settle(300);
  await tap(main.name, -1);
  await rateOpenRecipe(...REVIEWS[r]);
  await tapLabel("Kapat");
  rated.add(main.name);
  r++;
}
log("puanlanan:", [...rated].join(", "));

// ---------- Market
await tap("Market (", 0, true);
await shot("m-10-market");
fs.writeFileSync(`${OUT}/_market-text.txt`, await bodyText());

// ---------- Tariflerim & Kurallarım
await page.goto(`${BASE}/tariflerim`, { waitUntil: "networkidle0" });
await sleep(1500);
await shot("m-11-tariflerim");
await page.goto(`${BASE}/kurallarim`, { waitUntil: "networkidle0" });
await sleep(1500);
const switches = await page.$$('[role="switch"]');
log("switch sayısı:", switches.length);
if (switches[0]) { await switches[0].click(); await sleep(500); }
await tap("Fırın");
await tap("Blender");
await page.evaluate(() => window.scrollTo(0, 0));
await shot("m-12-kurallar");
fs.writeFileSync(`${OUT}/_kurallar-text.txt`, await bodyText());

await browser.close();
log("bitti");
