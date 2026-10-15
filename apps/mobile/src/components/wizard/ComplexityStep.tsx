import type { MealComplexity } from "@sofria/shared";
import { StyleSheet, Text, View } from "react-native";
import { Chip } from "../ui";
import type { MealType } from "../../stores/preferences.store";
import { colors, space, type as textType } from "../../theme";

export interface ComplexityStepProps {
  lunch: MealComplexity | undefined;
  dinner: MealComplexity | undefined;
  includedMeals: MealType[];
  onChange: (part: Partial<{ lunch: MealComplexity; dinner: MealComplexity }>) => void;
}

const COMPLEXITY_LABELS: Record<MealComplexity, string> = {
  tek_cesit: "Tek çeşit",
  iki_cesit: "İki çeşit",
  tam_menu: "Tam menü",
};

function ComplexityPicker({ label, value, onSelect }: { label: string; value: MealComplexity | undefined; onSelect: (v: MealComplexity) => void }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.row}>
        {(Object.keys(COMPLEXITY_LABELS) as MealComplexity[]).map((c) => (
          <Chip key={c} label={COMPLEXITY_LABELS[c]} variant={value === c ? "selected" : "suggested"} onPress={() => onSelect(c)} />
        ))}
      </View>
    </View>
  );
}

export function ComplexityStep({ lunch, dinner, includedMeals, onChange }: ComplexityStepProps) {
  const showLunch = includedMeals.includes("ogle");
  const showDinner = includedMeals.includes("aksam");

  return (
    <View style={{ gap: space.xxl }}>
      {showLunch && <ComplexityPicker label="Öğle yemeği" value={lunch} onSelect={(v) => onChange({ lunch: v })} />}
      {showDinner && <ComplexityPicker label="Akşam yemeği" value={dinner} onSelect={(v) => onChange({ dinner: v })} />}
      {!showLunch && !showDinner && (
        <Text style={styles.emptyHint}>Sadece kahvaltı seçtiğiniz için bu adımda ayarlanacak bir şey yok.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: textType.label.font, fontSize: textType.label.size, color: colors.inkSecondary, marginBottom: space.md },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  emptyHint: { fontFamily: textType.body.font, fontSize: textType.helper.size, color: colors.inkSecondary },
});
