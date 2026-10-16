import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { fillImage, colors, motion, radius, space, textStyle, type } from "../../theme";

export interface PhotoTileProps {
  image: ImageSourcePropType | undefined;
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
  height?: number;
}

/** Fotoğraflı çoklu seçim karesi (mutfak seçimi). Seçili: lime çerçeve + ✓ rozet. */
export function PhotoTile({ image, label, sublabel, selected, onPress, height = 100 }: PhotoTileProps) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - pressed.value * 0.04 }] }));

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      onPressIn={() => (pressed.value = withTiming(1, { duration: motion.pressScaleMs }))}
      onPressOut={() => (pressed.value = withTiming(0, { duration: motion.pressScaleMs }))}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
    >
      <Animated.View style={[styles.tile, { height }, selected && styles.selected, animatedStyle]}>
        {image && <Image source={image} style={fillImage} resizeMode="cover" />}
        <LinearGradient colors={[colors.scrimClear, colors.scrim]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0.2 }} end={{ x: 0, y: 1 }} />
        <View style={styles.textWrap}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {sublabel && (
            <Text style={styles.sublabel} numberOfLines={1}>
              {sublabel}
            </Text>
          )}
        </View>
        {selected && (
          <View style={styles.badge}>
            <Check size={16} color={colors.onAccent} strokeWidth={3} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.tile,
    overflow: "hidden",
    backgroundColor: colors.nightRaised,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: { borderColor: colors.accent },
  textWrap: { position: "absolute", left: 14, right: 14, bottom: 10 },
  label: { ...textStyle(type.cardTitle), fontSize: 15, color: colors.onNight },
  sublabel: { ...textStyle(type.caption), fontSize: 12, color: colors.onNightSecondary },
  badge: {
    position: "absolute",
    top: space.sm + 2,
    right: space.sm + 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
