# @sofria/mobile

React Native (Expo) uygulaması — F9.5'te kuruldu (Mobil Kabuk).

## Kurulum

```powershell
cd sofria
pnpm install
pnpm --filter @sofria/shared build
pnpm --filter @sofria/mobile dev
```

Backend'in (`apps/api`) ayrıca çalışıyor olması gerekir. Android emülatöründe
API'ye `10.0.2.2:4000` üzerinden, iOS simülatöründe `localhost:4000` üzerinden
otomatik bağlanılır (bkz. `src/lib/apiClient.ts`). Gerçek cihazda test
ederken `EXPO_PUBLIC_API_BASE_URL` ortam değişkeniyle LAN IP'si verilmeli.

### KRİTİK: kök `.npmrc` — Windows'ta silinip unutulursa Metro bozulur

Kök dizindeki `.npmrc` iki ayar içeriyor: `node-linker=hoisted` ve
`package-import-method=copy`. Bu **Windows'a özgü, gerçek bir Metro hatası**
için zorunlu — olmadan `expo start`/`expo export` "Unable to resolve module
react/jsx-runtime" veya "Failed to get the SHA-1" hatalarıyla çöküyor
(pnpm'in normal sembolik link + sabit bağlantı (hardlink) yapısı, Metro'nun
Windows'taki dosya tarayıcısıyla uyumsuz — dosya gerçekte var olduğu hâlde
"yok"/"izlenmiyor" sanılıyor). macOS/Linux'ta muhtemelen gerekmez ama
zararı da yok — dokunmayın. Kök `node_modules` silinip `pnpm install`
tekrar çalıştırılırsa bu ayarlar sayesinde otomatik doğru kurulur; asıl
risk `.npmrc`'nin kendisinin silinmesi/unutulmasıdır.

## Durum

- **F9.5:** Expo Router iskeleti, AsyncStorage tabanlı store persist katmanı
  (`src/lib/storage.adapter.ts`), `@sofria/shared` bağlantısı, web ile aynı
  mantığı taşıyan store/hook/apiClient portu.
- **F9.6 (bu faz, tamamlandı):** `pisir-ai-design-system.md` uygulandı.
  - `src/theme/` — colors/type/space/shadow/motion token'ları, dokümana
    birebir port.
  - `src/components/ui/` — Screen, WizardScreen, PrimaryButton,
    SecondaryButton, Chip, SelectionCard, ProgressSteps, Stepper,
    BudgetSlider (gesture-handler + Reanimated), InfoBanner,
    IngredientInput, Toggle, GeneratingIndicator ("sakin nefes" animasyonu,
    dönen spinner yok).
  - Gerçek fontlar (`@expo-google-fonts/figtree`, `.../inter`) root layout'ta
    yükleniyor; yüklenene kadar splash ekranı tutuluyor (sistem fontuna asla
    düşülmüyor).
  - `src/app/design-system.tsx` — dev-only QA ekranı (`__DEV__` guard'lı),
    tüm bileşen varyantlarını gösterir.
  - Sihirbaz (`src/app/plan.tsx`) `WizardScreen` üzerinden 6 adımlı olarak
    yeniden kuruldu (Hane&Bütçe / Mutfak / Diyet&Alerji / Ekipman / Çeşit /
    Özet — web'in `PreferenceWizard` akışıyla birebir aynı alan mantığı,
    bkz. `src/components/wizard/`). Tüm diğer ekranlar da bu bileşen
    kütüphanesiyle yeniden temalandı.
  - **Gerçek Gemini API'ye karşı uçtan uca doğrulandı:** tarayıcıda
    (`expo start --web`) 6 adımlık sihirbaz tamamlanıp gerçek bir 7 günlük
    plan üretildi (~101sn), dashboard ve market ekranları gerçek veriyle
    sorunsuz render edildi, konsolda hata yok.
  - **Bilinen, ayrı görev olarak flaglenmiş bir backend hatası bulundu:**
    alışveriş listesi aynı `slug`'a sahip malzemeleri birleştirmiyor (örn.
    "Kuru soğan" aynı reyonda 11 kez ayrı satır olarak görünüyor — hem
    web'i hem mobili etkiliyor, kaynağı `apps/api`'deki shopping list
    builder). Mobil tarafta React key uyarısını önlemek için geçici olarak
    `key={`${slug}-${index}`}` kullanıldı; asıl düzeltme backend'de.

## Kalan (F9.7 mobil parçası, F12)

- `RatingStars`/`RecipeRatingForm` gibi web'deki ayrı bileşenlerin mobil
  karşılığı şu an ekranlara gömülü (basit yıldız metni) — ayrı bileşene
  çıkarılabilir ama işlevsel olarak çalışıyor.
- `MatchRateRing` (SVG halka) yerine şu an düz "Uyum: %X" metni kullanılıyor.
- Native `Modal`/`BottomSheet` ile tarif detay sayfası (web'deki slide-over
  sheet'in mobil karşılığı) henüz ayrı bir ekran/modal olarak çıkarılmadı.
- Haptics yalnızca SelectionCard/Stepper/BudgetSlider'da var (doküman
  spesifik olarak bunları istiyor); diğer dokunuşlarda bilinçli olarak yok.

Bkz. proje devir dokümanının §3 ve §5 (F9.5/F9.6) bölümleri.
