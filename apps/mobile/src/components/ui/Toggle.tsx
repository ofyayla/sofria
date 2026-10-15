import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { colors } from "../../theme";

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

const WIDTH = 62;
const HEIGHT = 34;
const THUMB_SIZE = 28;
const PADDING = 3;

/**
 * design-system.md §5.9 — native Switch YERİNE özel bileşen. iOS'un sistem
 * yeşili markadan farklı, yan yana geldiğinde kirli görünür.
 */
export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? WIDTH - THUMB_SIZE - PADDING : PADDING, { damping: 16, stiffness: 180 }) }],
  }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(value ? colors.brand : colors.divider, { damping: 20, stiffness: 200 }),
  }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: WIDTH, height: HEIGHT, borderRadius: HEIGHT / 2, justifyContent: "center" },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.surface,
  },
});
