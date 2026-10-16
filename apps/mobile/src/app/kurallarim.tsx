import type { DietaryConstraints, EquipmentConstraints } from "@sofria/shared";
import { Blend, CookingPot, Microwave, Wind } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Chip, IngredientInput, Screen, ScreenHeader, SectionLabel, SelectionCard, Toggle, TwoToneHeadline } from "../components/ui";
import { useRulesProfileStore } from "../stores/rulesProfile.store";
import { colors, radius, space, textStyle, type } from "../theme";

const DIETARY_TOGGLES: { key: keyof Pick<DietaryConstraints, "glutenFree" | "lactoseFree" | "vegetarian" | "vegan">; label: string }[] = [
  { key: "glutenFree", label: "Glutensiz" },
  { key: "lactoseFree", label: "Laktozsuz" },
  { key: "vegetarian", label: "Vejetaryen" },
  { key: "vegan", label: "Vegan" },
];

const EQUIPMENT_ITEMS: {
  key: keyof Pick<EquipmentConstraints, "hasOven" | "hasAirFryer" | "hasPressureCooker" | "hasBlender">;
  label: string;
  icon: typeof Microwave;
}[] = [
  { key: "hasOven", label: "Fırın", icon: Microwave },
  { key: "hasAirFryer", label: "Air fryer", icon: Wind },
  { key: "hasPressureCooker", label: "Düdüklü tencere", icon: CookingPot },
  { key: "hasBlender", label: "Blender", icon: Blend },
];

function ToggleRow({ label, hint, value, onChange, last }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.toggleRow, !last && styles.toggleDivider]}>
      <View style={styles.flex}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint && <Text style={styles.toggleHint}>{hint}</Text>}
      </View>
      <Toggle value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

/**
 * Kalıcı mutfak kuralları — kaydedildiği an geçerli olur ve her plana
 * otomatik uygulanır. Sihirbazın son adımı bunları YALNIZCA o plan için
 * geçersiz kılabilir (bkz. mergeConstraints).
 */
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
    <Screen tone="light">
      <ScreenHeader tone="light" title="Kurallarım" />
      <View style={styles.headline}>
        <TwoToneHeadline tone="light" size="title" muted="Mutfak" strong="kurallarım" caption={"Her plana\notomatik uygulanır"} />
      </View>

      <View style={styles.section}>
        <SectionLabel>DİYET</SectionLabel>
        <View style={styles.card}>
          {DIETARY_TOGGLES.map(({ key, label }, i) => (
            <ToggleRow
              key={key}
              label={label}
              value={dietary[key]}
              // Vegan seçen vejetaryendir; vejetaryeni kapatan vegan olamaz.
              onChange={(v) =>
                setDietary({
                  [key]: v,
                  ...(key === "vegan" && v ? { vegetarian: true } : {}),
                  ...(key === "vegetarian" && !v ? { vegan: false } : {}),
                })
              }
              last={i === DIETARY_TOGGLES.length - 1}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>MUTFAK EKİPMANI</SectionLabel>
        <View style={[styles.card, styles.cardSpacing]}>
          <ToggleRow
            label="Fırın kullanmıyorum"
            hint="Yalnızca ocakta pişen tarifler gelir"
            value={equipment.stovetopOnly}
            onChange={(v) => setEquipment({ stovetopOnly: v, ...(v ? { hasOven: false } : {}) })}
            last
          />
        </View>
        <View style={styles.grid}>
          {EQUIPMENT_ITEMS.map(({ key, label, icon }) => {
            const blocked = key === "hasOven" && equipment.stovetopOnly;
            return (
              <View key={key} style={[styles.cell, blocked && styles.blocked]} pointerEvents={blocked ? "none" : "auto"}>
                <SelectionCard
                  icon={icon}
                  title={label}
                  {...(blocked ? { subtitle: "Fırın kapalı" } : {})}
                  selected={equipment[key]}
                  onPress={() => setEquipment({ [key]: !equipment[key] })}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>KAÇINDIĞIM MALZEMELER</SectionLabel>
        <IngredientInput
          value={avoidedDraft}
          onChangeText={setAvoidedDraft}
          placeholder="Malzeme ekle (örn. patlıcan)"
          accessibilityLabel="Kaçındığın malzemeyi ekle"
          onSubmit={() => {
            if (avoidedDraft.trim()) addAvoidedIngredient(avoidedDraft.trim());
            setAvoidedDraft("");
          }}
        />
        <View style={styles.chipRow}>
          {dietary.avoidedIngredients.map((item) => (
            <Chip key={item} label={item} variant="removable" onPress={() => removeAvoidedIngredient(item)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>ALERJİLERİM</SectionLabel>
        <Text style={styles.sectionHint}>Alerjen içeren tarifler plana hiç girmez.</Text>
        <IngredientInput
          value={allergyDraft}
          onChangeText={setAllergyDraft}
          placeholder="Alerjen ekle (örn. fıstık)"
          accessibilityLabel="Alerjen ekle"
          onSubmit={() => {
            if (allergyDraft.trim()) addAllergy(allergyDraft.trim());
            setAllergyDraft("");
          }}
        />
        <View style={styles.chipRow}>
          {dietary.allergies.map((item) => (
            <Chip key={item} label={item} variant="danger" onPress={() => removeAllergy(item)} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { marginTop: space.lg, marginBottom: space.xl },
  section: { marginBottom: space.xl + 4 },
  sectionHint: { ...textStyle(type.helper), color: colors.inkSecondary, marginTop: -4, marginBottom: space.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.tile, paddingHorizontal: space.lg + 2 },
  cardSpacing: { marginBottom: space.md },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md + 2 },
  toggleDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  flex: { flex: 1 },
  toggleLabel: { ...textStyle(type.bodyMedium), color: colors.ink },
  toggleHint: { ...textStyle(type.caption), color: colors.inkMuted, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  cell: { width: "48%" },
  blocked: { opacity: 0.45 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md },
});
