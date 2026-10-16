import * as Haptics from "expo-haptics";
import { Check, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { colors, radius, textStyle, type, type Tone } from "../../theme";

/**
 * - `on` / `off`: aç-kapa seçimi (öğün, diyet). Açıkken ✓ — ✕ DEĞİL; ✕
 *   kullanıcıya "sil" der.
 * - `filter`: tek seçimli filtre sekmesi (Tariflerim) — ikon yok.
 * - `removable`: kullanıcının eklediği etiket (kaçınılan malzeme) — ✕ siler.
 * - `danger`: alerji etiketi — güvenlik kritik, ayrı renkte.
 */
export type ChipVariant = "on" | "off" | "filter" | "filterActive" | "removable" | "danger" | "disabled";

export interface ChipProps {
  label: string;
  variant: ChipVariant;
  onPress?: () => void;
  tone?: Tone;
}

export function Chip({ label, variant, onPress, tone = "light" }: ChipProps) {
  const dark = tone === "dark";
  const isActive = variant === "on" || variant === "filterActive";
  const isDisabled = variant === "disabled";

  const bg = isActive
    ? colors.accent
    : variant === "danger"
      ? colors.dangerSoft
      : variant === "removable"
        ? dark
          ? colors.glassFill
          : colors.surface
        : dark
          ? colors.nightTrack
          : colors.surfaceMuted;
  const fg = isActive
    ? colors.onAccent
    : variant === "danger"
      ? colors.danger
      : dark
        ? colors.onNight
        : colors.ink;

  return (
    <Animated.View layout={LinearTransition}>
      <Pressable
        onPress={
          isDisabled
            ? undefined
            : () => {
                void Haptics.selectionAsync();
                onPress?.();
              }
        }
        disabled={isDisabled}
        accessibilityRole={variant === "removable" || variant === "danger" ? "button" : "checkbox"}
        accessibilityLabel={variant === "removable" || variant === "danger" ? `${label}, kaldır` : label}
        accessibilityState={{ checked: variant === "on" || undefined, selected: variant === "filterActive" || undefined, disabled: isDisabled }}
        hitSlop={4}
        style={[
          styles.chip,
          { backgroundColor: bg },
          dark && !isActive && variant !== "danger" && styles.darkBorder,
          isDisabled && styles.disabled,
        ]}
      >
        {variant === "on" && <Check size={16} color={fg} strokeWidth={3} />}
        <Text style={[styles.label, { color: fg }, isActive && styles.activeLabel]}>{label}</Text>
        {(variant === "removable" || variant === "danger") && <X size={16} color={fg} />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  darkBorder: { borderWidth: 1, borderColor: colors.glassBorder },
  disabled: { opacity: 0.45 },
  label: textStyle(type.chip),
  activeLabel: { fontFamily: type.button.font },
});
