// Yeni arayüz için App Store görselleri (iPhone 6.9" — 1320×2868).
// Kullanım: node store-assets/_kaynak/compose-v2.mjs
// Girdi : store-assets/_kaynak/sim-ekranlar/*.png  (simülatör ekran görüntüleri, 1320×2868)
// Çıktı : store-assets/app-store/iphone-6.9/*.png
// Gereken: macOS'ta Google Chrome (headless ekran görüntüsü için).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const IN = path.join(HERE, "sim-ekranlar");
const OUT = path.join(ROOT, "store-assets/app-store/iphone-6.9");
const TMP = path.join(HERE, ".tmp-compose");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const W = 1320, H = 2868;
const SLIDES = [
  { id: "01-bugun", file: "01-bugun.png", muted: "Bu akşam", strong: "ne pişirsem?", sub: "Günün yemeği fotoğrafıyla hazır" },
  { id: "02-plan", file: "02-plan.png", muted: "Haftanın sofrası", strong: "tek dokunuşla", sub: "7 günlük menü, dengeli ve fotoğraflı" },
  { id: "03-tarif", file: "03-tarif.png", muted: "Fotoğraflı,", strong: "adım adım tarifler", sub: "Malzemeler ve yapılışı tek ekranda" },
  { id: "04-degistir", file: "04-degistir.png", muted: "Beğenmediğini", strong: "değiştir", sub: "Aynı kurallara uyan 3 alternatif" },
  { id: "05-sihirbaz", file: "05-sihirbaz.png", muted: "Ne yiyelim?", strong: "3 adımda planla", sub: "Öğünlerini ve mutfaklarını seç" },
  { id: "06-market", file: "06-market.png", muted: "Alışveriş listen", strong: "otomatik hazır", sub: "Reyon reyon, işaretleyerek ilerle" },
  { id: "07-kurallar", file: "07-kurallar.png", muted: "Diyetine ve alerjine", strong: "uygun", sub: "Kurallarını bir kez ayarla, her plana uygulansın" },
];

const b64 = (p) => fs.readFileSync(p).toString("base64");
const font = (rel) => `data:font/ttf;base64,${b64(path.join(ROOT, "node_modules/@expo-google-fonts", rel))}`;
const FONTS = `
@font-face{font-family:Figtree;font-weight:400;src:url(${font("figtree/400Regular/Figtree_400Regular.ttf")})}
@font-face{font-family:Figtree;font-weight:500;src:url(${font("figtree/500Medium/Figtree_500Medium.ttf")})}`;

function html(slide) {
  const img = `data:image/png;base64,${b64(path.join(IN, slide.file))}`;
  const devW = 1010, devH = Math.round((devW * H) / W), bezel = 20, rad = 150;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:#0F110E;position:relative;font-family:Figtree,sans-serif;color:#fff}
.glow{position:absolute;width:1400px;height:1400px;border-radius:50%;background:radial-gradient(closest-side,rgba(201,241,88,.20),rgba(201,241,88,0));left:-40px;top:560px}
.text{position:absolute;top:170px;left:90px;right:90px}
h1{font-weight:400;font-size:112px;line-height:1.04;letter-spacing:-4px}
h1 .m{color:rgba(255,255,255,.55);display:block}
p{margin-top:34px;font-weight:500;font-size:48px;line-height:1.3;color:rgba(255,255,255,.78)}
.dev{position:absolute;left:${(W - devW - 2 * bezel) / 2}px;top:690px;width:${devW + 2 * bezel}px;height:${devH + 2 * bezel}px;padding:${bezel}px;border-radius:${rad + bezel}px;
  background:linear-gradient(150deg,#4a504c,#1c201d 45%,#0a0c0a);box-shadow:0 60px 140px rgba(0,0,0,.55),inset 0 0 0 4px #5c635e}
.dev img{display:block;width:${devW}px;height:${devH}px;border-radius:${rad}px}
.pill{position:absolute;left:90px;top:84px;width:96px;height:14px;border-radius:7px;background:#C9F158}
</style></head><body>
<div class="glow"></div><div class="pill"></div>
<div class="text"><h1><span class="m">${slide.muted}</span>${slide.strong}</h1><p>${slide.sub}</p></div>
<div class="dev"><img src="${img}"></div>
</body></html>`;
}

fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f)); // eski arayüzün görselleri kalmasın
for (const slide of SLIDES) {
  const src = path.join(IN, slide.file);
  if (!fs.existsSync(src)) throw new Error(`Eksik ekran görüntüsü: ${src}`);
  const page = path.join(TMP, `${slide.id}.html`);
  fs.writeFileSync(page, html(slide));
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${W},${H}`, `--screenshot=${path.join(OUT, slide.id + ".png")}`, `file://${page}`,
  ], { stdio: "ignore" });
  console.log("ok", slide.id);
}
fs.rmSync(TMP, { recursive: true, force: true });
