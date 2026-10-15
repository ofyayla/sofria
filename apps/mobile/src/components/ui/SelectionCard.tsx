import * as Haptics from "expo-haptics";
import { Check, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, motion, radius, shadow, space, type as textType } from "../../theme";

export interface SelectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * design-system.md §5.3 — 2 sütunlu ızgarada kullanılır (mutfak seçimi,
 * diyet, alerji, ekipman). Basış: scale 0.96, 100ms, Haptics.impactAsync(Light).
 */
export function SelectionCard({ icon: Icon, title, subtitle, selected, onPress }: SelectionCardProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }));

  function handlePressIn() {
    pressed.value = withTiming(1, { duration: motion.pressScaleMs });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  function handlePressOut() {
    pressed.value = withTiming(0, { duration: motion.pressScaleMs });
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityState={{ selected }}
    >
      <Animated.View style={[styles.card, selected && styles.selected, animatedStyle]}>
        {selected && (
          <View style={styles.badge}>
            <Check size={14} color={colors.onBrand} strokeWidth={3} />
          </View>
        )}
        <Icon size={40} color={colors.brand} strokeWidth={2} />
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1.05,
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    justifyContent: "center",
    gap: space.xs,
    ...shadow.card,
  },
  selected: {
    backgroundColor: colors.brandSoft,
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  badge: {
    position: "absolute",
    top: -space.xs,
    right: -space.xs,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: textType.cardTitle.font,
    fontSize: textType.cardTitle.size,
    lineHeight: textType.cardTitle.lineHeight,
    color: colors.ink,
  },
  titleSelected: { color: colors.brand },
  subtitle: {
    fontFamily: textType.cardSub.font,
    fontSize: textType.cardSub.size,
    lineHeight: textType.cardSub.lineHeight,
    color: colors.inkMuted,
  },
});
