import * as Haptics from "expo-haptics";
import { Minus, Plus } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, space, tabularNums, textStyle, type, type Tone } from "../../theme";

export interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Satırın altında her zaman görünen sonuç cümlesi ("Toplam 4 kişilik"). */
  hint?: string;
  tone?: Tone;
}

/**
 * Satır biçimli sayaç: [etiket ............ (−) 2 (+)]. Sınırda buton
 * soluklaşır ve haptik vermez.
 */
export function Stepper({ label, value, min, max, onChange, hint, tone = "dark" }: StepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  const dark = tone === "dark";
  const fg = dark ? colors.onNight : colors.ink;

  function change(next: number) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(next);
  }

  return (
    <View style={[styles.box, { backgroundColor: dark ? colors.nightTrack : colors.surface }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
        <View style={styles.controls}>
          <Pressable
            onPress={() => !atMin && change(value - 1)}
            disabled={atMin}
            accessibilityRole="button"
            accessibilityLabel={`${label} azalt`}
            hitSlop={6}
            style={[styles.circle, { backgroundColor: dark ? colors.glassFill : colors.surfaceMuted }, atMin && styles.circleDisabled]}
          >
            <Minus size={20} color={fg} />
          </Pressable>
          <Text style={[styles.value, tabularNums, { color: fg }]} accessibilityLiveRegion="polite">
            {value}
          </Text>
          <Pressable
            onPress={() => !atMax && change(value + 1)}
            disabled={atMax}
            accessibilityRole="button"
            accessibilityLabel={`${label} artır`}
            hitSlop={6}
            style={[styles.circle, styles.plus, atMax && styles.circleDisabled]}
          >
            <Plus size={20} color={colors.onAccent} />
          </Pressable>
        </View>
      </View>
      {hint && <Text style={[styles.hint, { color: dark ? colors.onNightMuted : colors.inkMuted }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.card, paddingHorizontal: space.xl - 4, paddingVertical: space.lg, gap: space.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: textStyle(type.bodyMedium),
  controls: { flexDirection: "row", alignItems: "center", gap: space.md },
  circle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  plus: { backgroundColor: colors.accent },
  circleDisabled: { opacity: 0.35 },
  value: { ...textStyle(type.heading), minWidth: 36, textAlign: "center" },
  hint: textStyle(type.caption),
});
