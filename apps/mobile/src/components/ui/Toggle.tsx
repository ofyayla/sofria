import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet } from "react-native";
import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors } from "../../theme";

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

const WIDTH = 58;
const HEIGHT = 34;
const THUMB_SIZE = 28;
const PADDING = 3;

/**
 * Native Switch yerine özel bileşen. Açık: gece zemini + lime düğme —
 * lime açık zeminde tek başına seçilemeyecek kadar soluk olduğu için ray
 * koyu, vurgu düğmede.
 */
export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  // Konum paylaşılan değerde; renkler düz stil. Prop'u doğrudan
  // useAnimatedStyle içinde okumak web'de güncellenmiyordu (bkz. ProgressSteps).
  const x = useSharedValue(value ? WIDTH - THUMB_SIZE - PADDING : PADDING);
  useEffect(() => {
    x.value = withSpring(value ? WIDTH - THUMB_SIZE - PADDING : PADDING, { damping: 16, stiffness: 180 });
  }, [value, x]);
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onValueChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, { backgroundColor: value ? colors.night : colors.surfaceMuted }]}>
        <Animated.View style={[styles.thumb, { backgroundColor: value ? colors.accent : colors.surface }, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: WIDTH, height: HEIGHT, borderRadius: HEIGHT / 2, justifyContent: "center" },
  thumb: { position: "absolute", width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2 },
});
