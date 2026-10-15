import * as Haptics from "expo-haptics";
import { Minus, Plus } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, tabularNums, type as textType } from "../../theme";

export interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** "Her tarif {value} porsiyon çıkacak." gibi sonuç cümlesi — altında HER ZAMAN gösterilir. */
  resultLabel: string;
}

/** design-system.md §5.5 — kişi sayısı. Sınırda buton %35 opaklığa düşer, haptik vermez. */
export function Stepper({ value, min, max, onChange, resultLabel }: StepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  function decrement() {
    if (atMin) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(value - 1);
  }
  function increment() {
    if (atMax) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(value + 1);
  }

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          onPress={decrement}
          disabled={atMin}
          accessibilityRole="button"
          accessibilityLabel="Azalt"
          hitSlop={8}
          style={[styles.circle, atMin && styles.circleDisabled]}
        >
          <Minus size={22} color={colors.brand} />
        </Pressable>
        <Text style={[styles.value, tabularNums]}>{value}</Text>
        <Pressable
          onPress={increment}
          disabled={atMax}
          accessibilityRole="button"
          accessibilityLabel="Artır"
          hitSlop={8}
          style={[styles.circle, atMax && styles.circleDisabled]}
        >
          <Plus size={22} color={colors.brand} />
        </Pressable>
      </View>
      <Text style={styles.resultLabel}>{resultLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 },
  circle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" },
  circleDisabled: { opacity: 0.35 },
  value: {
    fontFamily: textType.hero.font,
    fontSize: textType.hero.size,
    lineHeight: textType.hero.lineHeight,
    letterSpacing: textType.hero.letterSpacing,
    color: textType.hero.color,
    minWidth: 80,
    textAlign: "center",
  },
  resultLabel: {
    marginTop: 12,
    textAlign: "center",
    fontFamily: textType.helper.font,
    fontSize: textType.helper.size,
    lineHeight: textType.helper.lineHeight,
    color: textType.helper.color,
  },
});
