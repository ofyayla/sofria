import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, motion, radius, shadow, type as textType } from "../../theme";

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  showArrow?: boolean;
  accessibilityLabel?: string;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * design-system.md §5.1 — Hap formu, sola hizalı ok + ortalanmış etiket,
 * yatay pastel gradyan. Disabled buton BİLEREK soluk yeşil değil,
 * gradyansız surfaceMuted — soluk yeşil kullanıcıya basılabilir gibi gelir.
 */
export function PrimaryButton({ label, onPress, disabled, loading, showArrow = true, accessibilityLabel }: PrimaryButtonProps) {
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    shadowOpacity: shadow.cta.shadowOpacity * (1 - pressed.value * 0.5),
  }));

  function handlePressIn() {
    if (isDisabled) return;
    pressed.value = withTiming(1, { duration: motion.pressScaleMs });
  }
  function handlePressOut() {
    pressed.value = withTiming(0, { duration: motion.pressScaleMs });
  }

  if (isDisabled) {
    return (
      <View
        style={[styles.button, styles.disabled]}
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel={accessibilityLabel ?? label}
      >
        <Text style={styles.disabledLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={8}
    >
      <AnimatedLinearGradient
        colors={[colors.ctaFrom, colors.ctaTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, shadow.cta, animatedStyle]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onCta} />
        ) : (
          <View style={styles.content}>
            {showArrow && <ArrowRight size={20} color={colors.onCta} style={styles.arrow} />}
            <Text style={styles.label}>{label}</Text>
          </View>
        )}
      </AnimatedLinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 60,
    borderRadius: radius.button,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    height: 60,
    borderRadius: radius.button,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  arrow: { position: "absolute", left: 0 },
  label: {
    fontFamily: textType.button.font,
    fontSize: textType.button.size,
    lineHeight: textType.button.lineHeight,
    color: colors.onCta,
  },
  disabledLabel: {
    fontFamily: textType.button.font,
    fontSize: textType.button.size,
    lineHeight: textType.button.lineHeight,
    color: colors.inkMuted,
  },
});
