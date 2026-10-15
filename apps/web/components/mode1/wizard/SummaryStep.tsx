import type { CuisineType, DietaryConstraints, EquipmentConstraints, MealComplexity } from "@sofria/shared";
import type { MealType } from "../../../stores/preferences.store";
import { Button } from "../../ui/Button";
import { GeneratingIndicator } from "../../shared/GeneratingIndicator";

export interface SummaryStepProps {
  householdAdults: number;
  householdChildren: number;
  childAges: (number | undefined)[];
  includedMeals: MealType[];
  cuisinePreferences: CuisineType[];
  effectiveDietary: DietaryConstraints;
  effectiveEquipment: EquipmentConstraints;
  mealComplexity: { lunch: MealComplexity | undefined; dinner: MealComplexity | undefined };
  isPending: boolean;
  errorMessage?: string | undefined;
  onGenerate: () => void;
}

const CUISINE_LABELS: Record<CuisineType, string> = {
  kirmizi_et: "Kırmızı Et",
  beyaz_et: "Beyaz Et (Tavuk ve Hindi)",
  balik_urunleri: "Balık Ürünleri",
  sebze_yemekleri: "Sebze Yemekleri",
  ortadogu_mutfagi: "Ortadoğu Mutfağı",
  italyan_mutfagi: "İtalyan Mutfağı",
};

const MEAL_LABELS: Record<MealType, string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };
const COMPLEXITY_LABELS: Record<MealComplexity, string> = { tek_cesit: "Tek çeşit", iki_cesit: "İki çeşit", tam_menu: "Tam menü" };

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span className="text-[14px] font-medium text-ink text-right">{value}</span>
    </div>
  );
}

export function SummaryStep(props: SummaryStepProps) {
  const constraintTags = [
    props.effectiveDietary.glutenFree && "Glutensiz",
    props.effectiveDietary.vegetarian && "Vejetaryen",
    props.effectiveDietary.vegan && "Vegan",
    props.effectiveEquipment.stovetopOnly && "Sadece ocak",
    ...props.effectiveDietary.avoidedIngredients.map((i) => `${i} hariç`),
  ].filter(Boolean) as string[];

  const showLunch = props.includedMeals.includes("ogle");
  const showDinner = props.includedMeals.includes("aksam");
  const complexityRow =
    showLunch && showDinner
      ? {
          label: "Öğle / akşam",
          value: `${props.mealComplexity.lunch ? COMPLEXITY_LABELS[props.mealComplexity.lunch] : ""} / ${props.mealComplexity.dinner ? COMPLEXITY_LABELS[props.mealComplexity.dinner] : ""}`,
        }
      : showLunch
        ? { label: "Öğle yemeği", value: props.mealComplexity.lunch ? COMPLEXITY_LABELS[props.mealComplexity.lunch] : "" }
        : showDinner
          ? { label: "Akşam yemeği", value: props.mealComplexity.dinner ? COMPLEXITY_LABELS[props.mealComplexity.dinner] : "" }
          : null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Özet</h2>

      <div className="bg-surface-muted rounded-panel px-5 divide-y divide-divider">
        <SummaryRow
          label="Hane"
          value={`${props.householdAdults} yetişkin${props.householdChildren > 0 ? `, ${props.householdChildren} çocuk` : ""}`}
        />
        {props.householdChildren > 0 && (
          <SummaryRow label="Çocuk yaşları" value={props.childAges.filter((a): a is number => a != null).join(", ")} />
        )}
        <SummaryRow label="Öğünler" value={props.includedMeals.map((m) => MEAL_LABELS[m]).join(", ")} />
        <SummaryRow label="Mutfaklar" value={props.cuisinePreferences.map((c) => CUISINE_LABELS[c]).join(", ")} />
        {complexityRow && <SummaryRow label={complexityRow.label} value={complexityRow.value} />}
      </div>

      {constraintTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {constraintTags.map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-chip text-[13px] font-medium bg-brand-soft text-brand">
              {tag}
            </span>
          ))}
        </div>
      )}

      {props.errorMessage && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-panel bg-danger-soft">
          <span className="text-[14px] text-danger">{props.errorMessage}</span>
        </div>
      )}

      <Button variant="primary" onClick={props.onGenerate} disabled={props.isPending} className="w-full py-3.5">
        {props.isPending ? "Plan hazırlanıyor…" : "Planımı oluştur"}
      </Button>

      {props.isPending && (
        <GeneratingIndicator label="Haftalık plan hazırlanıyor, bu biraz sürebilir.." />
      )}
    </div>
  );
}
