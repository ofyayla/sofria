import { StyleSheet, Text } from "react-native";
import { colors, space, textStyle, type, type Tone } from "../../theme";

/**
 * Bölüm başlığı ("ÖĞÜNLER", "MANAV"). Metin kaynakta BÜYÜK HARFLE yazılır —
 * dinamik metinler için `toTurkishUpperCase` kullanılır (textTransform
 * Türkçe İ/ı'yı bilmez).
 */
export function SectionLabel({ children, tone = "light" }: { children: string; tone?: Tone }) {
  return (
    <Text style={[styles.label, { color: tone === "dark" ? colors.onNightMuted : colors.inkSecondary }]} accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: { ...textStyle(type.eyebrow), marginBottom: space.sm + 2 },
});
