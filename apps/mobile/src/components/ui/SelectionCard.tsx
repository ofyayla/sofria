import * as Haptics from "expo-haptics";
import { Check, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, motion, radius, space, textStyle, type, type Tone } from "../../theme";

export interface SelectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  tone?: Tone;
}

/** İkonlu çoklu seçim kartı (mutfak ekipmanı). 2 sütunlu ızgarada kullanılır. */
export function SelectionCard({ icon: Icon, title, subtitle, selected, onPress, tone = "light" }: SelectionCardProps) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - pressed.value * 0.04 }] }));
  const dark = tone === "dark";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: motion.pressScaleMs });
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => (pressed.value = withTiming(0, { duration: motion.pressScaleMs }))}
      accessibilityRole="checkbox"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityState={{ checked: selected }}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: dark ? colors.nightTrack : colors.surface, borderColor: dark ? colors.glassBorder : "transparent" },
          selected && { borderColor: dark ? colors.accent : colors.ink },
          animatedStyle,
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: selected ? colors.accent : dark ? colors.glassFill : colors.canvas }]}>
          <Icon size={22} color={selected ? colors.onAccent : dark ? colors.onNight : colors.ink} />
        </View>
        <View>
          <Text style={[styles.title, { color: dark ? colors.onNight : colors.ink }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: dark ? colors.onNightMuted : colors.inkMuted }]}>{subtitle}</Text>}
        </View>
        {selected && (
          <View style={[styles.badge, { backgroundColor: dark ? colors.accent : colors.night }]}>
            <Check size={14} color={dark ? colors.onAccent : colors.accent} strokeWidth={3} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    padding: space.lg,
    borderRadius: radius.tile,
    borderWidth: 2,
    justifyContent: "space-between",
    gap: space.md,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  title: textStyle(type.cardTitle),
  subtitle: textStyle(type.caption),
  badge: {
    position: "absolute",
    top: space.md,
    right: space.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
