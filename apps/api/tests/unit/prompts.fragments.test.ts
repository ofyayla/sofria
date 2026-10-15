import { describe, expect, it } from "vitest";
import { buildComplexityFragment } from "../../src/prompts/fragments/complexity.fragment.js";
import { buildCuisineFragment } from "../../src/prompts/fragments/cuisine.fragment.js";
import { buildDietaryFragment } from "../../src/prompts/fragments/dietary.fragment.js";
import { buildEquipmentFragment } from "../../src/prompts/fragments/equipment.fragment.js";

describe("dietary.fragment", () => {
  it("glutenFree=true iken glutensiz talimatı içerir", () => {
    const fragment = buildDietaryFragment({
      glutenFree: true,
      lactoseFree: false,
      vegetarian: false,
      vegan: false,
      avoidedIngredients: [],
      allergies: [],
    });
    expect(fragment).toContain("GLUTENSİZ");
    expect(fragment).toContain("mısır nişastası");
  });

  it("avoidedIngredients listesindeki malzemeler metne dahil edilir", () => {
    const fragment = buildDietaryFragment({
      glutenFree: false,
      lactoseFree: false,
      vegetarian: false,
      vegan: false,
      avoidedIngredients: ["mantar", "kereviz"],
      allergies: [],
    });
    expect(fragment).toContain("mantar");
    expect(fragment).toContain("kereviz");
  });

  // SDD §3.2: allergies, avoidedIngredients'tan farklı sertlikte vurgulanmalı ("KRİTİK, İSTİSNASIZ")
  it("allergies avoidedIngredients'tan daha sert bir dille yazılır", () => {
    const fragment = buildDietaryFragment({
      glutenFree: false,
      lactoseFree: false,
      vegetarian: false,
      vegan: false,
      avoidedIngredients: ["mantar"],
      allergies: ["fıstık"],
    });
    expect(fragment).toContain("KRİTİK, İSTİSNASIZ");
    expect(fragment).toContain("fıstık");
  });

  it("hiçbir kısıt yoksa nötr bir mesaj döner", () => {
    const fragment = buildDietaryFragment({
      glutenFree: false,
      lactoseFree: false,
      vegetarian: false,
      vegan: false,
      avoidedIngredients: [],
      allergies: [],
    });
    expect(fragment).toContain("Özel bir diyet kısıtı yok");
  });
});

describe("equipment.fragment", () => {
  it("stovetopOnly=true iken fırın yasağı metni içerir", () => {
    const fragment = buildEquipmentFragment({
      hasOven: false,
      hasAirFryer: false,
      hasPressureCooker: false,
      hasBlender: false,
      stovetopOnly: true,
    });
    expect(fragment).toContain("FIRIN YOK");
  });

  it("hasOven=true ve stovetopOnly=false iken fırın yasağı metni İÇERMEZ", () => {
    const fragment = buildEquipmentFragment({
      hasOven: true,
      hasAirFryer: false,
      hasPressureCooker: false,
      hasBlender: false,
      stovetopOnly: false,
    });
    expect(fragment).not.toContain("FIRIN YOK");
  });
});

describe("complexity.fragment", () => {
  it("tam_menu için 3 alt tarif talimatı verir", () => {
    const fragment = buildComplexityFragment({ lunch: "tam_menu", dinner: "tek_cesit", includedMeals: ["ogle", "aksam"] });
    expect(fragment).toContain("tam olarak 3 eleman");
    expect(fragment).toContain("tam olarak 1 eleman");
  });

  // Gerçek kullanıcı testinde bulundu: öğle dahil edilmediği hâlde öğle
  // çeşit talimatı LLM'e "KISIT" olarak veriliyor, öğle üretilmesine
  // sebep oluyordu.
  it("includedMeals'ta olmayan öğün için talimat ÜRETMEZ", () => {
    const fragment = buildComplexityFragment({ lunch: "tam_menu", dinner: "tek_cesit", includedMeals: ["aksam"] });
    expect(fragment).not.toContain("Öğle yemeği");
    expect(fragment).toContain("Akşam yemeği");
  });
});

describe("cuisine.fragment", () => {
  it("tek mutfak seçiliyse dağıtım talimatı VERMEZ", () => {
    const fragment = buildCuisineFragment(["kirmizi_et"]);
    expect(fragment).not.toContain("DENGELİ");
  });

  // Gerçek kullanıcı testinde bulundu: dağıtım GÜN bazında değil ÖĞÜN
  // bazında olmalı — "bir gün baştan sona İtalyan" gibi bloklu bir his istenmiyor.
  it("çoklu mutfakta öğün bazında dengeli dağıtım + art arda tekrar sınırı talimatı verir", () => {
    const fragment = buildCuisineFragment(["balik_urunleri", "italyan_mutfagi"]);
    expect(fragment).toContain("DENGELİ");
    expect(fragment).toContain("ÖĞÜN bazında");
    expect(fragment).toContain("3 öğünden fazla");
    expect(fragment).toContain("Balık Ürünleri");
    expect(fragment).toContain("İtalyan Mutfağı");
  });

  it("kahvaltının mutfak dağıtım kısıtından bağımsız olduğu her durumda belirtilir", () => {
    const single = buildCuisineFragment(["kirmizi_et"]);
    const multi = buildCuisineFragment(["kirmizi_et", "italyan_mutfagi"]);
    expect(single).toContain("Kahvaltı");
    expect(single).toContain("BAĞIMSIZDIR");
    expect(multi).toContain("Kahvaltı");
    expect(multi).toContain("BAĞIMSIZDIR");
  });

  // Gerçek kullanıcı talebi: balık ürünleri çorbası deniz ürünü veya yoğurtlu/sütlü olmasın.
  it("balik_urunleri seçiliyse çorba kısıtı talimatı verir", () => {
    const single = buildCuisineFragment(["balik_urunleri"]);
    const multi = buildCuisineFragment(["balik_urunleri", "kirmizi_et"]);
    expect(single).toContain("çorba");
    expect(single).toContain("yoğurtlu/sütlü");
    expect(multi).toContain("çorba");
    expect(multi).toContain("yoğurtlu/sütlü");
  });

  it("balik_urunleri seçili DEĞİLSE çorba kısıtı talimatı verilmez", () => {
    const fragment = buildCuisineFragment(["kirmizi_et"]);
    expect(fragment).not.toContain("yoğurtlu/sütlü");
  });
});
