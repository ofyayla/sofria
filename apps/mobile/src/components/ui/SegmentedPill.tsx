import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, textStyle, type, type Tone } from "../../theme";
import { GlassView } from "./GlassView";

export interface SegmentOption<K extends string> {
  key: K;
  label: string;
}

export interface SegmentedPillProps<K extends string> {
  options: SegmentOption<K>[];
  value: K | undefined;
  onChange: (key: K) => void;
  tone?: Tone;
  /** "glass": fotoğraf üstünde; "track": düz zemin üstünde. */
  surface?: "glass" | "track";
  /** Hapların tüm genişliği eşit paylaşması (sekme gibi) — varsayılan içerik genişliği. */
  stretch?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
}

/**
 * Tek seçimli hap grubu (referanstaki 🔊/🔇 grubu). Aktif öğe lime dolgu +
 * koyu metin. Öğün seçici, çeşit seçici, sekmeler bunu kullanır.
 */
export function SegmentedPill<K extends string>({
  options,
  value,
  onChange,
  tone = "dark",
  surface = "track",
  stretch = false,
  compact = false,
  accessibilityLabel,
}: SegmentedPillProps<K>) {
  const h = compact ? 40 : 52;
  const content = options.map((o) => {
    const active = o.key === value;
    return (
      <Pressable
        key={o.key}
        onPress={() => {
          if (active) return;
          void Haptics.selectionAsync();
          onChange(o.key);
        }}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        style={[
          styles.item,
          { height: h, borderRadius: h / 2, paddingHorizontal: compact ? 12 : 16 },
          stretch && styles.stretch,
          active && styles.active,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            compact && styles.labelCompact,
            { color: tone === "dark" ? colors.onNightSecondary : colors.inkSecondary },
            active && styles.activeLabel,
          ]}
        >
          {o.label}
        </Text>
      </Pressable>
    );
  });

  const rowStyle = [styles.row, stretch && styles.rowStretch];
  if (surface === "glass") {
    return (
      <GlassView style={[rowStyle, { borderRadius: radius.pill }]}>
        <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.inner}>
          {content}
        </View>
      </GlassView>
    );
  }
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[rowStyle, styles.inner, { backgroundColor: tone === "dark" ? colors.nightTrack : colors.surfaceMuted }]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: radius.pill, alignSelf: "flex-start" },
  rowStretch: { alignSelf: "stretch" },
  inner: { flexDirection: "row", padding: 4, gap: 2, borderRadius: radius.pill },
  item: { alignItems: "center", justifyContent: "center" },
  stretch: { flex: 1 },
  active: { backgroundColor: colors.accent },
  label: textStyle(type.chip),
  labelCompact: { fontSize: 14 },
  activeLabel: { color: colors.onAccent, fontFamily: type.button.font },
});
