import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors, motion } from "../../theme";

export interface ProgressStepsProps {
  total: number;
  current: number; // 0-indexed
}

function Segment({ state }: { state: "done" | "current" | "upcoming" }) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      state === "done" ? colors.brand : state === "current" ? colors.brandTint : colors.divider,
      { duration: motion.progressFillMs }
    ),
  }));
  return <Animated.View style={[styles.segment, animatedStyle]} />;
}

/** design-system.md §4 — 8 segment, aralarında 6pt boşluk, radius 999. */
export function ProgressSteps({ total, current }: ProgressStepsProps) {
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: current + 1 }}>
      {Array.from({ length: total }, (_, i) => (
        <Segment key={i} state={i < current ? "done" : i === current ? "current" : "upcoming"} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: 999 },
});
