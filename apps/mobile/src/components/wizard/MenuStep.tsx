import type { CuisineType, MealComplexity } from "@sofria/shared";
import { StyleSheet, Text, View } from "react-native";
import { getDishImage } from "../../assets/dishImages";
import { COMPLEXITY_LABELS, CUISINE_INFO, MEAL_TYPE_LABELS } from "../../lib/planDisplay";
import type { MealType } from "../../stores/preferences.store";
import { colors, space, textStyle, type } from "../../theme";
import { Chip, PhotoTile, SectionLabel, SegmentedPill } from "../ui";

export interface MenuStepProps {
  includedMeals: MealType[];
  onToggleMeal: (meal: MealType) => void;
  lunch: MealComplexity | undefined;
  dinner: MealComplexity | undefined;
  onComplexityChange: (part: Partial<{ lunch: MealComplexity; dinner: MealComplexity }>) => void;
  cuisines: CuisineType[];
  onToggleCuisine: (cuisine: CuisineType) => void;
}

const MEALS: MealType[] = ["kahvalti", "ogle", "aksam"];
const COMPLEXITY_OPTIONS = (Object.keys(COMPLEXITY_LABELS) as MealComplexity[]).map((key) => ({ key, label: COMPLEXITY_LABELS[key] }));

/**
 * Adım 2 — "Ne yiyelim?". Eskiden üç ayrı adımdı (öğünler, mutfak, çeşit).
 * Çeşit seçimi, öğün seçilince hemen altında açılır — bağlam kopmaz.
 * Hiçbir alanın varsayılan seçimi yok (gerçek kullanıcı testi).
 */
export function MenuStep(props: MenuStepProps) {
  const cuisines = Object.keys(CUISINE_INFO) as CuisineType[];
  const showLunch = props.includedMeals.includes("ogle");
  const showDinner = props.includedMeals.includes("aksam");

  return (
    <View style={styles.wrap}>
      <View>
        <SectionLabel tone="dark">ÖĞÜNLER</SectionLabel>
        <View style={styles.row}>
          {MEALS.map((meal) => (
            <Chip
              key={meal}
              tone="dark"
              label={MEAL_TYPE_LABELS[meal]}
              variant={props.includedMeals.includes(meal) ? "on" : "off"}
              onPress={() => props.onToggleMeal(meal)}
            />
          ))}
        </View>
        {(showLunch || showDinner) && (
          <View style={styles.complexity}>
            {showLunch && (
              <ComplexityRow label="Öğle" value={props.lunch} onChange={(v) => props.onComplexityChange({ lunch: v })} />
            )}
            {showDinner && (
              <ComplexityRow label="Akşam" value={props.dinner} onChange={(v) => props.onComplexityChange({ dinner: v })} />
            )}
          </View>
        )}
      </View>

      <View>
        <SectionLabel tone="dark">{`MUTFAKLAR · ${props.cuisines.length} SEÇİLİ`}</SectionLabel>
        <View style={styles.grid}>
          {cuisines.map((c) => (
            <View key={c} style={styles.cell}>
              <PhotoTile
                image={getDishImage(CUISINE_INFO[c].imageSlug)}
                label={CUISINE_INFO[c].label}
                sublabel={CUISINE_INFO[c].subtitle}
                selected={props.cuisines.includes(c)}
                onPress={() => props.onToggleCuisine(c)}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ComplexityRow({ label, value, onChange }: { label: string; value: MealComplexity | undefined; onChange: (v: MealComplexity) => void }) {
  return (
    <View style={styles.complexityRow}>
      <Text style={styles.complexityLabel}>{label} yemeğinde kaç çeşit?</Text>
      <SegmentedPill options={COMPLEXITY_OPTIONS} value={value} onChange={onChange} stretch compact accessibilityLabel={`${label} yemeği çeşidi`} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xl + 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  complexity: { marginTop: space.lg, gap: space.md },
  complexityRow: { gap: space.sm },
  complexityLabel: { ...textStyle(type.helper), color: colors.onNightSecondary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "48.5%" },
});
