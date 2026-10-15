import type { CuisineType, DietaryConstraints, EquipmentConstraints, MealComplexity } from "@sofria/shared";
import { StyleSheet, Text, View } from "react-native";
import { GeneratingIndicator, PrimaryButton } from "../ui";
import { colors, radius, space, type as textType } from "../../theme";

export interface SummaryStepProps {
  householdAdults: number;
  householdChildren: number;
  childAges: (number | undefined)[];
  includedMeals: string[];
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

const MEAL_LABELS: Record<string, string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };
const COMPLEXITY_LABELS: Record<MealComplexity, string> = { tek_cesit: "Tek çeşit", iki_cesit: "İki çeşit", tam_menu: "Tam menü" };

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
    <View style={{ gap: space.xl }}>
      <View style={styles.card}>
        <SummaryRow
          label="Hane"
          value={`${props.householdAdults} yetişkin${props.householdChildren > 0 ? `, ${props.householdChildren} çocuk` : ""}`}
        />
        {props.householdChildren > 0 && (
          <SummaryRow label="Çocuk yaşları" value={props.childAges.filter((a): a is number => a != null).join(", ")} />
        )}
        <SummaryRow label="Öğünler" value={props.includedMeals.map((m) => MEAL_LABELS[m] ?? m).join(", ")} />
        <SummaryRow label="Mutfaklar" value={props.cuisinePreferences.map((c) => CUISINE_LABELS[c]).join(", ")} />
        {complexityRow && <SummaryRow label={complexityRow.label} value={complexityRow.value} />}
      </View>

      {constraintTags.length > 0 && (
        <View style={styles.tagRow}>
          {constraintTags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {props.errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{props.errorMessage}</Text>
        </View>
      )}

      <PrimaryButton label={props.isPending ? "Plan hazırlanıyor…" : "Planımı oluştur"} onPress={props.onGenerate} disabled={props.isPending} showArrow={false} />

      {props.isPending && <GeneratingIndicator label="Haftalık plan hazırlanıyor, bu biraz sürebilir.." />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceMuted, borderRadius: radius.panel, paddingHorizontal: space.lg },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLabel: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkMuted },
  rowValue: { fontFamily: textType.body.font, fontSize: textType.helper.size, color: colors.ink, flexShrink: 1, textAlign: "right" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  tag: { paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.chip, backgroundColor: colors.brandSoft },
  tagText: { fontFamily: textType.label.font, fontSize: 13, color: colors.brand },
  errorBanner: { paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.panel, backgroundColor: colors.dangerSoft },
  errorText: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.danger },
});
