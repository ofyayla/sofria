import { Plus } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, radius, type as textType } from "../../theme";

export interface IngredientInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

/**
 * design-system.md §5.8 — gönderimde klavye kapanmaz (blurOnSubmit=false),
 * kullanıcı arka arkaya 5 malzeme yazabilsin diye.
 */
export function IngredientInput({ value, onChangeText, onSubmit, placeholder }: IngredientInputProps) {
  const inputRef = useRef<TextInput>(null);

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
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        accessibilityLabel="Malzeme ekle"
      />
      <Pressable onPress={handleSubmit} accessibilityRole="button" accessibilityLabel="Ekle" hitSlop={8} style={styles.addButton}>
        <Plus size={24} color={colors.brand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 18,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceMuted,
    fontFamily: textType.body.font,
    fontSize: textType.body.size,
    color: colors.ink,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: radius.input,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
