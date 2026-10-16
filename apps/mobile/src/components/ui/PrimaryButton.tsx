import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import { ArrowRight } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, motion, radius, shadow, size, textStyle, type, type Tone } from "../../theme";

export interface PrimaryButtonProps {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  /** Etiketten önce gösterilen ikon (örn. Play). */
  icon?: LucideIcon;
  /** Etiketten sonra sağa ok — "ileri" anlamı taşıyan butonlarda. */
  showArrow?: boolean;
  /** Pasif hâlin zemini ekran tonuna göre seçilir. */
  tone?: Tone;
  accessibilityLabel?: string;
}

/**
 * Ekrandaki TEK lime CTA. Pasif hâl lime'ın soluk hâli DEĞİL — nötr zemin
 * üstünde, etiket neyin eksik olduğunu söyler ("En az 1 mutfak seç").
 */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon: Icon,
  showArrow = false,
  tone = "dark",
  accessibilityLabel,
}: PrimaryButtonProps) {
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - pressed.value * 0.03 }] }));

  if (isDisabled) {
    const fg = tone === "dark" ? colors.onNightSecondary : colors.inkSecondary;
    return (
      <View
        style={[styles.button, { backgroundColor: tone === "dark" ? colors.nightTrack : colors.surfaceMuted }]}
        accessibilityRole="button"
        accessibilityState={{ disabled: true, busy: loading }}
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {loading && <ActivityIndicator color={fg} />}
        <Text style={[styles.label, { color: fg, fontFamily: type.body.font }]}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={(e) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress(e);
      }}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: motion.pressScaleMs });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: motion.pressScaleMs });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Animated.View style={[styles.button, styles.enabled, shadow.floating, animatedStyle]}>
        {Icon && <Icon size={18} color={colors.onAccent} fill={colors.onAccent} />}
        <Text style={styles.label}>{label}</Text>
        {showArrow && <ArrowRight size={20} color={colors.onAccent} />}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: size.cta,
    borderRadius: radius.pill,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  enabled: { backgroundColor: colors.accent, shadowOpacity: 0.18 },
  label: { ...textStyle(type.button), color: colors.onAccent },
});
