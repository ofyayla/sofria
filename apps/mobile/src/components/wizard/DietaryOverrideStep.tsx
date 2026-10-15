import type { DietaryConstraints } from "@sofria/shared";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Chip, IngredientInput } from "../ui";
import { colors, space, type as textType } from "../../theme";

export interface DietaryOverrideStepProps {
  effectiveDietary: DietaryConstraints;
  onOverride: (partial: Partial<DietaryConstraints>) => void;
}

const DIET_FLAGS: { key: keyof Pick<DietaryConstraints, "glutenFree" | "lactoseFree" | "vegetarian" | "vegan">; label: string }[] = [
  { key: "glutenFree", label: "Glutensiz" },
  { key: "lactoseFree", label: "Laktozsuz" },
  { key: "vegetarian", label: "Vejetaryen" },
  { key: "vegan", label: "Vegan" },
];

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

/**
 * "Kurallarım"daki kalıcı profile kalıcı YAZILMAZ — yalnızca bu plan
 * isteği için geçerli oturum geçersiz kılması (bkz. mergeConstraints).
 */
export function DietaryOverrideStep({ effectiveDietary, onOverride }: DietaryOverrideStepProps) {
  const [avoidedDraft, setAvoidedDraft] = useState("");
  const [allergyDraft, setAllergyDraft] = useState("");

  return (
    <View style={{ gap: space.xxl }}>
      <Text style={styles.hint}>
        "Kurallarım"da kayıtlı tercihleriniz burada. Değişiklik yaparsanız yalnızca bu plan için geçerli olur.
      </Text>

      <View>
        <FieldLabel>Diyet</FieldLabel>
        <View style={styles.row}>
          {DIET_FLAGS.map(({ key, label }) => (
            <Chip
              key={key}
              label={label}
              variant={effectiveDietary[key] ? "selected" : "suggested"}
              onPress={() => onOverride({ [key]: !effectiveDietary[key] })}
            />
          ))}
        </View>
      </View>

      <View>
        <FieldLabel>Kaçındığın malzemeler</FieldLabel>
        <IngredientInput
          value={avoidedDraft}
          onChangeText={setAvoidedDraft}
          onSubmit={() => {
            if (avoidedDraft.trim()) onOverride({ avoidedIngredients: [...effectiveDietary.avoidedIngredients, avoidedDraft.trim()] });
            setAvoidedDraft("");
          }}
        />
        <View style={styles.chipRow}>
          {effectiveDietary.avoidedIngredients.map((item) => (
            <Chip
              key={item}
              label={item}
              variant="selected"
              onPress={() => onOverride({ avoidedIngredients: effectiveDietary.avoidedIngredients.filter((i) => i !== item) })}
            />
          ))}
        </View>
      </View>

      <View>
        <FieldLabel>Alerjilerin</FieldLabel>
        <IngredientInput
          value={allergyDraft}
          onChangeText={setAllergyDraft}
          onSubmit={() => {
            if (allergyDraft.trim()) onOverride({ allergies: [...effectiveDietary.allergies, allergyDraft.trim()] });
            setAllergyDraft("");
          }}
        />
        <View style={styles.chipRow}>
          {effectiveDietary.allergies.map((item) => (
            <Chip
              key={item}
              label={item}
              variant="selected"
              onPress={() => onOverride({ allergies: effectiveDietary.allergies.filter((i) => i !== item) })}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkSecondary, lineHeight: textType.helper.lineHeight },
  fieldLabel: { fontFamily: textType.label.font, fontSize: textType.label.size, color: colors.inkSecondary, marginBottom: space.md },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.sm },
});
