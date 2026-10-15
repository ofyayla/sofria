import type { DietaryConstraints, EquipmentConstraints } from "@sofria/shared";
import { Blend, CookingPot, Flame, Wind } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Chip, IngredientInput, PageTitle, Screen, SelectionCard, Toggle } from "../components/ui";
import { useRulesProfileStore } from "../stores/rulesProfile.store";
import { colors, space, type as textType } from "../theme";

const DIETARY_TOGGLES: { key: keyof Pick<DietaryConstraints, "glutenFree" | "lactoseFree" | "vegetarian" | "vegan">; label: string }[] = [
  { key: "glutenFree", label: "Glutensiz" },
  { key: "lactoseFree", label: "Laktozsuz" },
  { key: "vegetarian", label: "Vejetaryen" },
  { key: "vegan", label: "Vegan" },
];

const EQUIPMENT_ITEMS: {
  key: keyof Pick<EquipmentConstraints, "hasOven" | "hasAirFryer" | "hasPressureCooker" | "hasBlender">;
  label: string;
  icon: typeof Flame;
}[] = [
  { key: "hasOven", label: "Fırın", icon: Flame },
  { key: "hasAirFryer", label: "Air fryer", icon: Wind },
  { key: "hasPressureCooker", label: "Düdüklü tencere", icon: CookingPot },
  { key: "hasBlender", label: "Blender", icon: Blend },
];

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export default function KurallarimScreen() {
  const dietary = useRulesProfileStore((s) => s.dietary);
  const equipment = useRulesProfileStore((s) => s.equipment);
  const setDietary = useRulesProfileStore((s) => s.setDietary);
  const setEquipment = useRulesProfileStore((s) => s.setEquipment);
  const addAvoidedIngredient = useRulesProfileStore((s) => s.addAvoidedIngredient);
  const removeAvoidedIngredient = useRulesProfileStore((s) => s.removeAvoidedIngredient);
  const addAllergy = useRulesProfileStore((s) => s.addAllergy);
  const removeAllergy = useRulesProfileStore((s) => s.removeAllergy);

  const [avoidedDraft, setAvoidedDraft] = useState("");
  const [allergyDraft, setAllergyDraft] = useState("");

  return (
    <Screen>
      <PageTitle>Mutfak kurallarım</PageTitle>
      <Text style={styles.subtitle}>
        Buradaki kurallar kaydedildiği an geçerli olur ve Haftalık Planla tariflerine otomatik uygulanır.
      </Text>

      <View style={styles.section}>
        <FieldLabel>Diyet</FieldLabel>
        {DIETARY_TOGGLES.map(({ key, label }) => (
          <View key={key} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{label}</Text>
            <Toggle value={dietary[key]} onValueChange={(v) => setDietary({ [key]: v })} accessibilityLabel={label} />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <FieldLabel>Mutfak ekipmanı</FieldLabel>
        <View style={styles.grid}>
          {EQUIPMENT_ITEMS.map(({ key, label, icon }) => (
            <View key={key} style={styles.cell}>
              <SelectionCard icon={icon} title={label} selected={equipment[key]} onPress={() => setEquipment({ [key]: !equipment[key] })} />
            </View>
          ))}
        </View>
        <View style={styles.cell2}>
          <SelectionCard
            icon={Flame}
            title="Sadece ocak"
            subtitle="Fırın kullanma"
            selected={equipment.stovetopOnly}
            onPress={() => setEquipment({ stovetopOnly: !equipment.stovetopOnly, ...(!equipment.stovetopOnly ? { hasOven: false } : {}) })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <FieldLabel>Kaçındığım malzemeler</FieldLabel>
        <IngredientInput
          value={avoidedDraft}
          onChangeText={setAvoidedDraft}
          onSubmit={() => {
            if (avoidedDraft.trim()) addAvoidedIngredient(avoidedDraft.trim());
            setAvoidedDraft("");
          }}
        />
        <View style={styles.chipRow}>
          {dietary.avoidedIngredients.map((item) => (
            <Chip key={item} label={item} variant="selected" onPress={() => removeAvoidedIngredient(item)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <FieldLabel>Alerjilerim</FieldLabel>
        <IngredientInput
          value={allergyDraft}
          onChangeText={setAllergyDraft}
          onSubmit={() => {
            if (allergyDraft.trim()) addAllergy(allergyDraft.trim());
            setAllergyDraft("");
          }}
        />
        <View style={styles.chipRow}>
          {dietary.allergies.map((item) => (
            <Chip key={item} label={item} variant="selected" onPress={() => removeAllergy(item)} />
          ))}
        </View>
      </View>

      <View style={{ height: space.xxxl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: textType.body.font,
    fontSize: textType.helper.size,
    lineHeight: textType.helper.lineHeight,
    color: colors.inkSecondary,
    marginTop: space.xs,
    marginBottom: space.xxl,
  },
  section: { marginBottom: space.xxl },
  fieldLabel: { fontFamily: textType.label.font, fontSize: textType.label.size, color: colors.inkSecondary, marginBottom: space.md },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  toggleLabel: { fontFamily: textType.body.font, fontSize: 15, color: colors.ink },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  cell: { width: "47%" },
  cell2: { width: "47%", marginTop: space.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md },
});
