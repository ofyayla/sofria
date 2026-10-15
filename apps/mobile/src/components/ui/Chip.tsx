import { Plus, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { colors, radius, type as textType } from "../../theme";

export type ChipVariant = "suggested" | "selected" | "disabled";

export interface ChipProps {
  label: string;
  variant: ChipVariant;
  onPress?: () => void;
}

/**
 * design-system.md §5.4 — uygulamanın EN ÇOK kullanılan primitifi.
 * Seçili↔öneri geçişi Reanimated ile animasyonlanır — çip listeden ayrılıp
 * yukarı taşınır, aniden yer değiştirmez.
 */
export function Chip({ label, variant, onPress }: ChipProps) {
  const isSelected = variant === "selected";
  const isDisabled = variant === "disabled";

  return (
    <Animated.View layout={LinearTransition}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
        hitSlop={4}
        style={[styles.chip, isSelected && styles.selected, isDisabled && styles.disabled]}
      >
        {variant === "suggested" && <Plus size={18} color={colors.inkSecondary} />}
        <Text style={[styles.label, isSelected && styles.selectedLabel, isDisabled && styles.disabledLabel]}>{label}</Text>
        {isSelected && <X size={18} color={colors.onBrand} />}
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
    paddingHorizontal: 18,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceMuted,
  },
  selected: { backgroundColor: colors.brand },
  disabled: { backgroundColor: colors.surfaceMuted, opacity: 0.5 },
  label: {
    fontFamily: textType.chip.font,
    fontSize: textType.chip.size,
    lineHeight: textType.chip.lineHeight,
    color: colors.inkSecondary,
  },
  selectedLabel: { color: colors.onBrand },
  disabledLabel: { color: colors.inkMuted },
});
