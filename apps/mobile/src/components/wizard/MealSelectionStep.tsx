import { StyleSheet, Text, View } from "react-native";
import { Chip } from "../ui";
import type { MealType } from "../../stores/preferences.store";
import { colors, space, type as textType } from "../../theme";

export interface MealSelectionStepProps {
  includedMeals: MealType[];
  onToggleMeal: (meal: MealType) => void;
}

const MEAL_LABELS: Record<MealType, string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };

/**
 * Gerçek kullanıcı talebi: "hangi öğünler dahil olsun?" seçimi kendi
 * BAĞIMSIZ sayfası olsun — hane seçiminden hemen sonra, Çeşit adımına
 * karıştırılmadan (bkz. ComplexityStep.tsx, artık yalnızca seçilen
 * öğünlerin çeşidini soruyor).
 */
export function MealSelectionStep({ includedMeals, onToggleMeal }: MealSelectionStepProps) {
  return (
    <View style={{ gap: space.xxl }}>
      <View>
        <Text style={styles.fieldLabel}>Hangi öğünler dahil olsun?</Text>
        <View style={styles.row}>
          {(Object.keys(MEAL_LABELS) as MealType[]).map((meal) => (
            <Chip
              key={meal}
              label={MEAL_LABELS[meal]}
              variant={includedMeals.includes(meal) ? "selected" : "suggested"}
              onPress={() => onToggleMeal(meal)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: textType.label.font, fontSize: textType.label.size, color: colors.inkSecondary, marginBottom: space.md },
  // Gerçek kullanıcı talebi: mobilde öğün seçenekleri yan yana değil ALT ALTA
  // (Kahvaltı / Öğle / Akşam) listelensin. alignItems:"flex-start" olmadan
  // column flex varsayılan olarak "stretch" uygular ve her çip tam genişlik
  // kaplardı — bu yüzden burada özellikle belirtildi.
  row: { flexDirection: "column", alignItems: "flex-start", gap: space.sm },
});
