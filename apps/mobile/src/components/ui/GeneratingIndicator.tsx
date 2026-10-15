import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors, motion, space, type as textType } from "../../theme";

export interface GeneratingIndicatorProps {
  label: string;
}

/**
 * design-system.md §7 — "Plan oluşturuluyor: tek bir sakin nefes animasyonu
 * (opaklık 0.6↔1), 1400ms döngü." Dönen spinner YASAK.
 */
export function GeneratingIndicator({ label }: GeneratingIndicatorProps) {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: motion.breathingCycleMs / 2, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Animated.View style={[styles.dot, animatedStyle]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: space.sm, justifyContent: "center", paddingVertical: space.lg },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  label: {
    fontFamily: textType.helper.font,
    fontSize: textType.helper.size,
    color: colors.inkSecondary,
    textAlign: "center",
  },
});
