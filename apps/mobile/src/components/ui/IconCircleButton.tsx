import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, fonts, motion, size as sizes } from "../../theme";
import { GlassView } from "./GlassView";

export type IconCircleVariant = "white" | "ink" | "glass" | "accent" | "muted" | "ghost";

export interface IconCircleButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: IconCircleVariant;
  size?: "lg" | "md" | "sm";
  /** Sağ üstte küçük rozet (örn. kalan market ürünü sayısı). */
  badge?: string | number;
  selected?: boolean;
  /** İkonun içini doldurur (ör. kaydedilmiş yer imi). */
  iconFilled?: boolean;
  children?: ReactNode;
}

const DIAMETER = { lg: sizes.circleLg, md: sizes.circleMd, sm: sizes.circleSm } as const;
const ICON = { lg: 22, md: 22, sm: 18 } as const;

const FG: Record<IconCircleVariant, string> = {
  white: colors.ink,
  ink: colors.onNight,
  glass: colors.onNight,
  accent: colors.onAccent,
  muted: colors.ink,
  ghost: colors.onNight,
};

const BG: Partial<Record<IconCircleVariant, string>> = {
  white: colors.surface,
  ink: colors.night,
  accent: colors.accent,
  muted: colors.surfaceMuted,
};

/**
 * Referanstaki dairesel ikon butonu (geri, profil, aksiyon). Her ekranda
 * navigasyon bu bileşenle yapılır — metin oku ("← Plana dön") kullanılmaz.
 * `Link asChild` ile sarılabilir: onPress'i olduğu gibi iletir.
 */
export function IconCircleButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  variant = "white",
  size = "lg",
  badge,
  selected,
  iconFilled,
}: IconCircleButtonProps) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - pressed.value * 0.06 }] }));
  const d = DIAMETER[size];
  const shape = { width: d, height: d, borderRadius: d / 2 };

  const inner = (
    <View style={[styles.center, shape]}>
      <Icon size={ICON[size]} color={FG[variant]} strokeWidth={2} {...(iconFilled ? { fill: FG[variant] } : {})} />
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: motion.pressScaleMs });
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: motion.pressScaleMs });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={size === "sm" ? 6 : 0}
    >
      <Animated.View style={animatedStyle}>
        {variant === "glass" ? (
          <GlassView style={shape}>{inner}</GlassView>
        ) : (
          <View style={[shape, BG[variant] ? { backgroundColor: BG[variant] } : null]}>{inner}</View>
        )}
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.ink, fontVariant: ["tabular-nums"] },
});
