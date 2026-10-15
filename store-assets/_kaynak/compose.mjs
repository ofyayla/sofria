// Çalıştırmak için: bu klasörde `npm i puppeteer-core`, sonra `node compose.mjs` (ham-ekranlar/ → ../app-store, ../google-play)
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ROOT = path.resolve(HERE, "../..");
const SHOTS = path.join(HERE, "ham-ekranlar");
const OUT = path.resolve(HERE, "..");

const SLIDES = [
  { id: "01-haftalik-plan", file: "m-08b-plan-gun.png", title: "Haftalık menün<br><em>tek dokunuşla</em> hazır", sub: "7 günlük yemek planı saniyeler içinde" },
  { id: "02-tarif", file: "m-09-tarif.png", title: "<em>Fotoğraflı</em>,<br>adım adım tarifler", sub: "Malzemeler, süre ve yapılışı tek ekranda" },
  { id: "03-mutfak", file: "m-03-mutfak.png", title: "Sevdiğin<br><em>mutfakları</em> seç", sub: "Seçtiklerin hafta boyunca dengeli dağıtılır" },
  { id: "04-alisveris", file: "m-10-market.png", title: "Alışveriş listen<br><em>otomatik</em> hazır", sub: "Meyve, sebze, et, bakliyat… ayrı ayrı" },
  { id: "05-kurallar", file: "m-12-kurallar.png", title: "Diyetine ve<br><em>mutfağına</em> uygun", sub: "Glutensiz, vegan, alerjiler ve ekipmanına göre" },
  { id: "06-hane", file: "m-01-hane.png", title: "Hanene göre<br><em>porsiyon</em>", sub: "Tarifler hane büyüklüğüne göre ölçeklenir" },
  { id: "07-tariflerim", file: "m-11-tariflerim.png", title: "Denediklerini<br><em>puanla</em>", sub: "Beğendiğin tarifler Tariflerim'de birikir" },
];

// Uygulama 430x844 pt güvenli alana çekildi; cihaz ekranı 430x932 pt (54 üst + 34 alt).
const PT_W = 430, PT_H = 932, PT_TOP = 54, PT_BOTTOM = 34;

const FORMATS = [
  {
    key: "ios", dir: "app-store/iphone-6.9", W: 1320, H: 2868,
    padTop: 190, title: 118, sub: 50, gap: 34, deviceTop: 655, bottomMargin: 105, bezel: 22, radiusPt: 55, platform: "ios",
  },
  {
    key: "play", dir: "google-play/telefon", W: 1080, H: 1920,
    padTop: 104, title: 82, sub: 37, gap: 22, deviceTop: 430, bottomMargin: 64, bezel: 16, radiusPt: 40, platform: "android",
  },
];

const b64 = (p) => fs.readFileSync(p).toString("base64");
const font = (file) => `data:font/ttf;base64,${b64(`${ROOT}/node_modules/@expo-google-fonts/${file}`)}`;
const FONTS = `
@font-face{font-family:Figtree;font-weight:800;src:url(${font("figtree/800ExtraBold/Figtree_800ExtraBold.ttf")})}
@font-face{font-family:Inter;font-weight:500;src:url(${font("inter/500Medium/Inter_500Medium.ttf")})}
@font-face{font-family:Inter;font-weight:600;src:url(${font("inter/600SemiBold/Inter_600SemiBold.ttf")})}`;

function statusIcons(s, color) {
  // iOS benzeri sinyal / wifi / pil — s = pt→px ölçeği
  return `
  <svg width="${18 * s}" height="${12 * s}" viewBox="0 0 18 12" fill="${color}">
    <rect x="0" y="8" width="3" height="4" rx="0.8"/><rect x="5" y="5.5" width="3" height="6.5" rx="0.8"/>
    <rect x="10" y="3" width="3" height="9" rx="0.8"/><rect x="15" y="0" width="3" height="12" rx="0.8"/>
  </svg>
  <svg width="${16 * s}" height="${12 * s}" viewBox="0 0 16 12" fill="${color}">
    <path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.4C13.3 1.7 10.8.6 8 .6S2.7 1.7.7 3.6L2 5c1.6-1.5 3.7-2.4 6-2.4z"/>
    <path d="M8 6.2c1.3 0 2.5.5 3.4 1.3l1.3-1.4C11.5 5 9.8 4.2 8 4.2S4.5 5 3.3 6.1l1.3 1.4C5.5 6.7 6.7 6.2 8 6.2z"/>
    <path d="M8 9.6l2-2.1c-.5-.5-1.2-.8-2-.8s-1.5.3-2 .8z"/>
  </svg>
  <svg width="${27 * s}" height="${13 * s}" viewBox="0 0 27 13">
    <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="${color}" stroke-opacity=".4"/>
    <rect x="2" y="2" width="20" height="9" rx="2" fill="${color}"/>
    <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" fill="${color}" fill-opacity=".45"/>
  </svg>`;
}

function html(slide, f, index) {
  const deviceH = f.H - f.deviceTop - f.bottomMargin;
  const screenH = deviceH - 2 * f.bezel;
  const screenW = Math.round((screenH * PT_W) / PT_H);
  const s = screenW / PT_W;
  const deviceW = screenW + 2 * f.bezel;
  const radius = f.radiusPt * s;
  const mirror = index % 2 === 1;
  const img = `data:image/png;base64,${b64(path.join(SHOTS, slide.file))}`;
  const ios = f.platform === "ios";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${f.W}px;height:${f.H}px;overflow:hidden}
body{background:linear-gradient(180deg,#F5FAF2 0%,#E3F1E4 55%,#CFE7D6 100%);position:relative;font-family:Inter,sans-serif}
.blob{position:absolute;border-radius:50%;filter:blur(${f.W * 0.06}px);opacity:.55}
.b1{width:${f.W * 0.7}px;height:${f.W * 0.7}px;background:#A8D5B5;top:${-f.W * 0.22}px;${mirror ? "left" : "right"}:${-f.W * 0.28}px}
.b2{width:${f.W * 0.8}px;height:${f.W * 0.8}px;background:#B8DFC2;bottom:${-f.W * 0.25}px;${mirror ? "right" : "left"}:${-f.W * 0.35}px}
.text{position:absolute;top:${f.padTop}px;left:0;right:0;text-align:center;padding:0 ${f.W * 0.07}px}
h1{font-family:Figtree,sans-serif;font-weight:800;font-size:${f.title}px;line-height:1.06;letter-spacing:${-f.title * 0.022}px;color:#12211A}
h1 em{font-style:normal;color:#3E8E63}
p{margin-top:${f.gap}px;font-weight:500;font-size:${f.sub}px;line-height:1.35;color:#3D5147}
.device{position:absolute;top:${f.deviceTop}px;left:${(f.W - deviceW) / 2}px;width:${deviceW}px;height:${deviceH}px;
  padding:${f.bezel}px;border-radius:${radius + f.bezel}px;
  background:linear-gradient(150deg,#3a423d 0%,#161b18 40%,#0d100e 100%);
  box-shadow:0 ${f.W * 0.05}px ${f.W * 0.11}px rgba(23,61,42,.30),0 ${f.W * 0.01}px ${f.W * 0.025}px rgba(23,61,42,.25),inset 0 0 0 ${Math.max(2, f.bezel * 0.14)}px #4a534d}
.screen{position:relative;width:${screenW}px;height:${screenH}px;border-radius:${radius}px;overflow:hidden;background:#FAFCF9}
.status{position:absolute;top:0;left:0;right:0;height:${PT_TOP * s}px;display:flex;align-items:center;justify-content:space-between;
  padding:${ios ? `${4 * s}px ${30 * s}px 0 ${44 * s}px` : `${2 * s}px ${22 * s}px 0 ${24 * s}px`}}
.time{font-family:Inter,sans-serif;font-weight:600;font-size:${(ios ? 17 : 15) * s}px;letter-spacing:${-0.2 * s}px}
.icons{display:flex;align-items:center;gap:${6 * s}px}
.island{position:absolute;top:${11 * s}px;left:50%;transform:translateX(-50%);width:${126 * s}px;height:${37 * s}px;border-radius:${19 * s}px;background:#000}
.punch{position:absolute;top:${17 * s}px;left:50%;transform:translateX(-50%);width:${13 * s}px;height:${13 * s}px;border-radius:50%;background:#000;box-shadow:0 0 0 ${2 * s}px #1d1f1e}
.app{position:absolute;top:${PT_TOP * s}px;left:0;width:${screenW}px;height:${844 * s}px;display:block}
.bottom{position:absolute;bottom:0;left:0;right:0;height:${PT_BOTTOM * s}px}
.home{position:absolute;bottom:${8 * s}px;left:50%;transform:translateX(-50%);width:${(ios ? 139 : 110) * s}px;height:${5 * s}px;border-radius:${3 * s}px}
</style></head><body>
<div class="blob b1"></div><div class="blob b2"></div>
<div class="text"><h1>${slide.title}</h1><p>${slide.sub}</p></div>
<div class="device"><div class="screen" id="screen">
  <div class="status" id="status"><span class="time" id="time">9:41</span><span class="icons" id="icons"></span></div>
  ${ios ? '<div class="island"></div>' : '<div class="punch"></div>'}
  <img class="app" id="app" src="${img}">
  <div class="bottom" id="bottom"><div class="home" id="home"></div></div>
</div></div>
<script>window.__icons=${JSON.stringify({ dark: statusIcons(s, "#12211A"), light: statusIcons(s, "#FFFFFF") })};</script>
</body></html>`;
}

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();

for (const f of FORMATS) {
  fs.mkdirSync(`${OUT}/${f.dir}`, { recursive: true });
  await page.setViewport({ width: f.W, height: f.H, deviceScaleFactor: 1 });
  for (const [i, slide] of SLIDES.entries()) {
    await page.setContent(html(slide, f, i), { waitUntil: "load" });
    await page.evaluate(async () => {
      const img = document.getElementById("app");
      if (!img.complete) await new Promise((r) => (img.onload = r));
      // Durum çubuğu/alt şerit rengini ekran görüntüsünün kendi kenarından örnekle.
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const px = (x, y) => ctx.getImageData(x, y, 1, 1).data;
      const top = px(Math.floor(c.width / 2), 2), bot = px(6, c.height - 3);
      const rgb = (d) => `rgb(${d[0]},${d[1]},${d[2]})`;
      const lum = (d) => (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
      document.getElementById("screen").style.background = rgb(top);
      document.getElementById("status").style.background = rgb(top);
      document.getElementById("bottom").style.background = rgb(bot);
      const darkTop = lum(top) < 0.5;
      document.getElementById("time").style.color = darkTop ? "#FFFFFF" : "#12211A";
      document.getElementById("icons").innerHTML = darkTop ? window.__icons.light : window.__icons.dark;
      document.getElementById("home").style.background = lum(bot) < 0.5 ? "rgba(255,255,255,.85)" : "rgba(18,33,26,.85)";
      await document.fonts.ready;
    });
    const file = `${OUT}/${f.dir}/${slide.id}.jpg`;
    await page.screenshot({ path: file, type: "jpeg", quality: 95 });
    console.log("yazıldı:", file);
  }
}
await browser.close();
