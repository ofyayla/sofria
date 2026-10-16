# App Review yanıtı — Guideline 2.1 (Information Needed)

Bu dosya iki yerde kullanılır:
1. **App Store Connect › Resolution Center** → "Reply to App Review" kutusuna **A bölümü**.
2. **App Information › App Review Information › Notes** alanına **B bölümü** (Apple aynı bilgiyi orada da istiyor; 4000 karakter sınırı var, B ~2000).

Ekran kaydı (madde 1) simülatörde (iPhone 17 Pro Max, iOS 26.1) çekilip eklendi; Apple fiziksel cihaz istiyorsa **C bölümündeki** senaryoyu iPhone'da tekrar çekin.

---

## A. Resolution Center yanıtı (İngilizce)

Hello App Review team,

Thank you for the review. Below is the information you requested for Sofria (build 1.0.0 (2)).

**1. Screen recording**
A screen recording of the app is attached. It starts from launching the app from the home screen and shows the typical user flow: creating a weekly plan, opening a recipe, swapping a dish, using the shopping list, the recipe book and the kitchen rules. It was recorded on an iPhone 17 Pro Max (iOS 26.1 simulator); the same build was also installed and run on a physical iPhone 14 (iOS 26.6.1), and we can provide a physical-device recording on request. The app has **no account registration, login or account deletion**, **no user-generated content** (nothing is shared with other users, so no reporting/blocking applies) and **no paid content or in-app purchases**.

**2. Purpose and target audience**
Sofria is a weekly meal-planning app for Turkish-speaking households. People who cook at home usually spend time every week deciding what to cook and then writing a shopping list. Sofria solves both: the user answers three short steps (who is eating, which meals and cuisines, a final check of dietary rules), and the app instantly builds a 7-day menu with photos and step-by-step recipes, plus a shopping list grouped by supermarket aisle. Users can set permanent kitchen rules (vegetarian, vegan, gluten-free, lactose-free, allergies, avoided ingredients, available equipment); every suggested recipe respects them. If a user dislikes a suggested dish, they can swap it for one of three alternatives that follow the same rules, and can mark a dish as "never suggest again". The audience is adults and families who cook at home, including people with dietary restrictions.

**3. How to access the main features**
No login, account, sample file or special setup is required. Launch the app and tap "Haftalık planımı oluştur" (Create my weekly plan) on the home screen. Choose household size (if a child is added, pick the child's age), then at least one meal (for lunch/dinner also the number of courses) and at least one cuisine, then on the final check screen select at least one kitchen equipment (e.g. "Fırın" = oven; this is empty on a fresh install and the button tells what is missing) and tap "Planımı oluştur". The plan opens in the "Plan" tab. From there: tap a dish photo to open the recipe; tap the ↻ button on a dish to swap it; open the "Market" tab for the shopping list (tap items to check them off); open the book icon on the home screen for the recipe book and the person icon for kitchen rules. The app works fully offline.

**4. External services, tools and platforms**
None. Sofria does not contact any server: all recipes, photos, the planning logic and the shopping-list logic are bundled in the app and run on the device. There is no authentication service, analytics, advertising, payment processor, data provider or AI/LLM service at runtime. User preferences, plans, shopping progress and the recipe book are stored locally on the device only. The app uses only Apple platform frameworks and open-source React Native/Expo libraries (no network functionality). Our privacy policy: https://ofyayla.github.io/sofria/

**5. Regional differences**
The app is the same in all regions. The interface and recipe content are in Turkish and focus on Turkish home cooking; there are no region-specific features, content or restrictions.

**6. Regulated industry / third-party material**
Sofria does not operate in a regulated industry and does not provide medical, financial or legal services. Nutrition values are rough estimates and not medical advice. The app contains no protected third-party material: the recipes and dish photos are original content prepared by the developer.

We have also updated the app and its App Store screenshots with the latest version of the interface; all screenshots show the app in actual use. Please let us know if you need anything else.

Thank you,
Ömer Faruk Yayla

---

## B. Notes alanı (App Review Information › Notes) — İngilizce

```
No login, account or setup is needed; the app works fully offline and does not contact any server.

PURPOSE: Sofria builds a 7-day meal plan (with photos and step-by-step recipes) and a supermarket-aisle shopping list for Turkish-speaking households, respecting the user's dietary rules (vegetarian, vegan, gluten-free, lactose-free, allergies, avoided ingredients, equipment). Dislikes can be swapped for 3 rule-compliant alternatives.

HOW TO USE: Home screen > "Haftalık planımı oluştur" > 3 steps (household size; meals + cuisines; final check, where at least one kitchen equipment such as "Fırın"/oven must be selected on a fresh install) > "Planımı oluştur". Then: "Plan" tab (tap a dish for the recipe, tap the refresh icon to swap a dish), "Market" tab (shopping list, tap to check off), book icon on Home (recipe book), person icon on Home (kitchen rules).

EXTERNAL SERVICES: None. All recipes, images and planning logic are bundled and run on-device. No authentication, analytics, ads, payments or AI services. Data stays on the device.

NO accounts / user-generated content / in-app purchases, so no sign-in, deletion, reporting or blocking flows exist.

REGIONS: Identical in all regions (Turkish-language UI and Turkish cuisine content).

REGULATED INDUSTRY / THIRD-PARTY MATERIAL: None. Recipes and images are original content prepared by the developer. Nutrition values are estimates, not medical advice.

SCREEN RECORDING: Attached to the Resolution Center reply and to this notes section (launch to typical user flow).
```

---

## C. Ekran kaydı senaryosu (fiziksel iPhone isterse tekrar çekmek için, ~60–90 sn)

Apple kaydın **uygulamayı açmakla başlamasını** ve tipik akışı göstermesini istiyor. Fiziksel cihaz + son iOS şart; simülatör kaydı yetmez.

Hazırlık: uygulamayı silip temiz kurun (boş durum görünsün) → Ayarlar › Denetim Merkezi'ne **Ekran Kaydı** ekleyin → Denetim Merkezi'nden kaydı başlatın, ana ekrana dönüp **Sofria ikonuna dokunarak** açın.

1. Uygulama açılır → boş "Bugün" ekranı (davet kartı).
2. "Haftalık planımı oluştur" → **Adım 1**: çocuk sayısını 1 yapıp yaş seçin, Devam.
3. **Adım 2**: Akşam + Kahvaltı seçin, akşam için "Tam menü", iki mutfak seçin, Devam.
4. **Adım 3**: özet; **ekipmandan en az birini (ör. Fırın) seçin** (taze kurulumda boş gelir, düğme "En az 1 ekipman seç" der), isterseniz bir alerji ekleyin, "Planımı oluştur".
5. **Plan** sekmesi: günler arasında kayın, bir yemek fotoğrafına dokunup tarifi açın (Malzemeler ↔ Yapılışı), yer imine basın, kapatın.
6. Bir yemeğin ↻ butonuna basın → "Bunun yerine…" → bir alternatif seçin → "Geri al".
7. **Market** sekmesi: birkaç ürünü işaretleyin; paylaş butonunu gösterin.
8. **Bugün** sekmesi: öğün fotoğrafı ve menü kartı.
9. Kitap ikonu → **Tarif defterim**; kişi ikonu → **Kurallarım** (bir diyet anahtarını açıp kapatın).

Ses/anlatım gerekmez. Hesap, içerik paylaşımı ve satın alma olmadığı için bu akışlar kayıtta yoktur (A bölümü 1. maddede belirtildi).
