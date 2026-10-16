import { StyleSheet, Text, View } from "react-native";
import { colors, space, textStyle, type, type Tone } from "../../theme";

export interface TwoToneHeadlineProps {
  tone: Tone;
  /** Soluk ilk satır ("Bu akşam"). */
  muted: string;
  /** Tam renkli ikinci satır ("Karnıyarık"). */
  strong: string;
  /** Sağ altta küçük açıklama ("45 dk\n4 kişilik"). */
  caption?: string;
  /** "stack": iki satır sola yaslı. "split": ilk satır sağa, ikincisi sola (referans 3. ekran). */
  layout?: "stack" | "split";
  /** Soluk satırın ikinci satırdan sonra gelmesi ("22 ürün / kaldı"). */
  mutedLast?: boolean;
  size?: "display" | "title";
}

/**
 * Referans tasarımın başlık dili: büyük, ince, iki tonlu; vurgu kalın
 * yazıyla değil renkle. Yanında küçük bir açıklama.
 */
export function TwoToneHeadline({
  tone,
  muted,
  strong,
  caption,
  layout = "stack",
  mutedLast = false,
  size = "display",
}: TwoToneHeadlineProps) {
  const t = size === "display" ? type.display : type.title;
  const strongColor = tone === "dark" ? colors.onNight : colors.ink;
  const mutedColor = tone === "dark" ? colors.onNightMuted : colors.inkMuted;
  const captionColor = tone === "dark" ? colors.onNightSecondary : colors.inkSecondary;
  const base = textStyle(t);

  const captionNode = caption ? <Text style={[styles.caption, { color: captionColor }]}>{caption}</Text> : null;

  if (layout === "split") {
    return (
      <View accessibilityRole="header" accessible accessibilityLabel={`${muted} ${strong}`}>
        <Text style={[base, { color: strongColor, textAlign: "right" }]}>{muted}</Text>
        <View style={styles.bottomRow}>
          <Text style={[base, { color: mutedColor }]}>{strong}</Text>
          {captionNode}
        </View>
      </View>
    );
  }

  const first = mutedLast ? strong : muted;
  const second = mutedLast ? muted : strong;
  return (
    <View style={styles.bottomRow}>
      <Text style={[base, styles.flex]} accessibilityRole="header">
        <Text style={{ color: mutedLast ? strongColor : mutedColor }}>{first}</Text>
        {"\n"}
        <Text style={{ color: mutedLast ? mutedColor : strongColor }}>{second}</Text>
      </Text>
      {captionNode}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: space.md },
  flex: { flexShrink: 1 },
  caption: { ...textStyle(type.caption), textAlign: "right", paddingBottom: 6 },
});
