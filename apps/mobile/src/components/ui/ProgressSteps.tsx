import { StyleSheet, View } from "react-native";
import { colors } from "../../theme";

export interface ProgressStepsProps {
  total: number;
  current: number; // 0-indexed
}

/**
 * Sihirbaz ilerlemesi — koyu zemin üstünde; geçilen ve mevcut adım lime.
 * Renk prop'tan düz stil olarak gelir: useAnimatedStyle + withTiming,
 * prop değişince web'de yeniden hesaplanmıyordu (çubuk ilerlemiyordu).
 */
export function ProgressSteps({ total, current }: ProgressStepsProps) {
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: current + 1 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.segment, { backgroundColor: i <= current ? colors.accent : colors.nightDivider }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});
