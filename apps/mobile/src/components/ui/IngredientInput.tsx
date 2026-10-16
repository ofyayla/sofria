import { Plus } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, radius, textStyle, type, type Tone } from "../../theme";

export interface IngredientInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  accessibilityLabel?: string;
  tone?: Tone;
}

/**
 * Gönderimde klavye kapanmaz (blurOnSubmit=false) — kullanıcı arka arkaya
 * birkaç malzeme yazabilsin diye.
 */
export function IngredientInput({ value, onChangeText, onSubmit, placeholder, accessibilityLabel, tone = "light" }: IngredientInputProps) {
  const inputRef = useRef<TextInput>(null);
  const dark = tone === "dark";

  function handleSubmit() {
    onSubmit();
    inputRef.current?.focus();
  }

  return (
    <View style={styles.row}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        blurOnSubmit={false}
        returnKeyType="done"
        placeholder={placeholder ?? "Malzeme ekle (örn. patlıcan)"}
        placeholderTextColor={dark ? colors.onNightMuted : colors.inkMuted}
        style={[
          styles.input,
          dark ? { backgroundColor: colors.nightTrack, color: colors.onNight } : { backgroundColor: colors.surface, color: colors.ink },
        ]}
        accessibilityLabel={accessibilityLabel ?? placeholder ?? "Malzeme ekle"}
      />
      <Pressable
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="Ekle"
        hitSlop={6}
        style={[styles.addButton, { backgroundColor: dark ? colors.accent : colors.night }]}
      >
        <Plus size={22} color={dark ? colors.onAccent : colors.onNight} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  input: { flex: 1, height: 52, paddingHorizontal: 20, borderRadius: radius.pill, ...textStyle(type.body), lineHeight: undefined },
  addButton: { width: 52, height: 52, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
