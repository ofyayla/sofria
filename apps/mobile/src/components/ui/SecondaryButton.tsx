import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, type as textType } from "../../theme";

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * design-system.md §5.2 — yalnızca "Atla", "Vazgeç" gibi ikincil
 * aksiyonlarda. Ekranda birincil butonla birlikte en fazla bir tane bulunur.
 */
export function SecondaryButton({ label, onPress, disabled }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 60,
    borderRadius: radius.button,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: "transparent",
  },
  pressed: { opacity: 0.7 },
  disabled: { borderColor: colors.divider },
  label: {
    fontFamily: textType.button.font,
    fontSize: textType.button.size,
    lineHeight: textType.button.lineHeight,
    color: colors.brand,
  },
  disabledLabel: { color: colors.inkMuted },
});
