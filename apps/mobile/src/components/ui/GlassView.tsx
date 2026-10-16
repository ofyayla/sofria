import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "../../theme";

export interface GlassViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

/**
 * Buzlu cam yüzey — referans tasarımın imza öğesi. iOS'ta gerçek blur;
 * Android'de blur hâlâ deneysel ve pahalı olduğu için opak bir dolguya
 * düşülür (görünüm aynı aileden, performans riski yok).
 * Kenar yuvarlaklığı `style` ile verilir; blur'un taşmaması için overflow kırpılır.
 */
export function GlassView({ children, style, intensity = 40 }: GlassViewProps) {
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={intensity} tint="dark" style={[styles.base, styles.fill, style]}>
        {children}
      </BlurView>
    );
  }
  return <View style={[styles.base, styles.fallback, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { overflow: "hidden", borderWidth: StyleSheet.hairlineWidth * 2, borderColor: colors.glassBorder },
  fill: { backgroundColor: colors.glassFill },
  fallback: { backgroundColor: colors.glassFallback },
});
