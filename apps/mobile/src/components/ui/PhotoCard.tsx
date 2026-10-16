import { LinearGradient } from "expo-linear-gradient";
import { ArrowUpRight, UtensilsCrossed, type LucideIcon } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { fillImage, colors, motion, radius, size, space, textStyle, type } from "../../theme";
import { GlassView } from "./GlassView";

export interface PhotoCardProps {
  image: ImageSourcePropType | undefined;
  title: string;
  meta?: string;
  /** Sol üstte cam etiket ("Akşam · Tam menü"). */
  eyebrow?: string;
  onPress: () => void;
  height?: number;
  /** Görsel yoksa (bazı kahvaltılıklar) gösterilecek ikon. */
  fallbackIcon?: LucideIcon;
  accessibilityLabel?: string;
}

/**
 * Fotoğraf önde kart — başlık fotoğrafın üstünde, altta karartma (scrim)
 * zorunlu, sağ altta lime "aç" dairesi. Görsel yoksa düz gece zemini +
 * büyük ikon; kırık/boş görsel asla gösterilmez.
 */
export function PhotoCard({
  image,
  title,
  meta,
  eyebrow,
  onPress,
  height = 320,
  fallbackIcon: FallbackIcon = UtensilsCrossed,
  accessibilityLabel,
}: PhotoCardProps) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - pressed.value * 0.02 }] }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (pressed.value = withTiming(1, { duration: motion.pressScaleMs }))}
      onPressOut={() => (pressed.value = withTiming(0, { duration: motion.pressScaleMs }))}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}${meta ? `, ${meta}` : ""}. Tarifi aç`}
    >
      <Animated.View style={[styles.card, { height }, animatedStyle]}>
        {image ? (
          <Image source={image} style={fillImage} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.fallback]}>
            <FallbackIcon size={72} color={colors.accent} strokeWidth={1.5} />
          </View>
        )}
        <LinearGradient colors={[colors.scrimClear, colors.scrim]} style={styles.scrim} />

        {eyebrow && (
          <GlassView style={styles.eyebrow}>
            <Text style={styles.eyebrowText}>{eyebrow}</Text>
          </GlassView>
        )}

        <View style={styles.bottom}>
          <View style={styles.textCol}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {meta && <Text style={styles.meta}>{meta}</Text>}
          </View>
          <View style={styles.action}>
            <ArrowUpRight size={24} color={colors.onAccent} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, overflow: "hidden", backgroundColor: colors.nightRaised },
  fallback: { backgroundColor: colors.nightRaised, alignItems: "center", justifyContent: "center", paddingBottom: 60 },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "62%" },
  eyebrow: { position: "absolute", top: space.lg, left: space.lg, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  eyebrowText: { ...textStyle(type.caption), fontFamily: type.cardTitle.font, color: colors.onNight },
  bottom: {
    position: "absolute",
    left: space.xl - 4,
    right: space.lg,
    bottom: space.lg + 2,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.md,
  },
  textCol: { flex: 1, gap: 4 },
  title: { ...textStyle(type.title), color: colors.onNight },
  meta: { ...textStyle(type.helper), color: colors.onNightSecondary },
  action: {
    width: size.circleLg,
    height: size.circleLg,
    borderRadius: size.circleLg / 2,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
