import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, size, textStyle, type, type Tone } from "../../theme";

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: Tone;
}

/** İkincil aksiyon ("Vazgeç", "Atla") — çerçeveli hap. Ekranda birincil butonla en fazla bir tane. */
export function SecondaryButton({ label, onPress, disabled, tone = "light" }: SecondaryButtonProps) {
  const fg = tone === "dark" ? colors.onNight : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { borderColor: tone === "dark" ? colors.glassBorder : colors.divider },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: size.cta,
    borderRadius: radius.pill,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  label: textStyle(type.button),
});
