import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors, motion, space, textStyle, type, type Tone } from "../../theme";

export interface GeneratingIndicatorProps {
  label: string;
  tone?: Tone;
}

/** Plan hazırlanırken tek, sakin bir "nefes" animasyonu — dönen spinner yok. */
export function GeneratingIndicator({ label, tone = "dark" }: GeneratingIndicatorProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: motion.breathingCycleMs / 2, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: 0.8 + opacity.value * 0.2 }] }));

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Animated.View style={[styles.dot, animatedStyle]} />
      <Text style={[styles.label, { color: tone === "dark" ? colors.onNightSecondary : colors.inkSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: space.sm, justifyContent: "center", paddingVertical: space.md },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  label: { ...textStyle(type.helper), textAlign: "center" },
});
