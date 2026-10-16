import type { CuisineType, DietaryConstraints, EquipmentConstraints, MealComplexity } from "@sofria/shared";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COMPLEXITY_LABELS, CUISINE_INFO, MEAL_TYPE_LABELS } from "../../lib/planDisplay";
import type { MealType } from "../../stores/preferences.store";
import { colors, radius, space, textStyle, type } from "../../theme";
import { Chip, GeneratingIndicator, IngredientInput, InfoBanner, SectionLabel } from "../ui";

export interface SummaryStepProps {
  householdAdults: number;
  householdChildren: number;
  childAges: (number | undefined)[];
  includedMeals: MealType[];
  cuisinePreferences: CuisineType[];
  mealComplexity: { lunch: MealComplexity | undefined; dinner: MealComplexity | undefined };
  effectiveDietary: DietaryConstraints;
  effectiveEquipment: EquipmentConstraints;
  onDietaryOverride: (partial: Partial<DietaryConstraints>) => void;
  onEquipmentOverride: (partial: Partial<EquipmentConstraints>) => void;
  onEditStep: (step: number) => void;
  isPending: boolean;
  errorMessage?: string | undefined;
}

const DIET_FLAGS: { key: keyof Pick<DietaryConstraints, "glutenFree" | "lactoseFree" | "vegetarian" | "vegan">; label: string }[] = [
  { key: "glutenFree", label: "Glutensiz" },
  { key: "lactoseFree", label: "Laktozsuz" },
  { key: "vegetarian", label: "Vejetaryen" },
  { key: "vegan", label: "Vegan" },
];

const EQUIPMENT_FLAGS: { key: keyof Pick<EquipmentConstraints, "hasOven" | "hasAirFryer" | "hasPressureCooker" | "hasBlender">; label: string }[] = [
  { key: "hasOven", label: "Fırın" },
  { key: "hasAirFryer", label: "Air fryer" },
  { key: "hasPressureCooker", label: "Düdüklü" },
  { key: "hasBlender", label: "Blender" },
];

function SummaryRow({ label, value, onEdit, last }: { label: string; value: string; onEdit: () => void; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={styles.flex}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel={`${label} düzenle`} hitSlop={8} style={styles.editButton}>
        <Text style={styles.editText}>Düzenle</Text>
      </Pressable>
    </View>
  );
}

/**
 * Adım 3 — "Son kontrol". Eski diyet ve ekipman adımları buraya katlandı:
 * değerler "Kurallarım"dan gelir; buradaki değişiklik YALNIZCA bu plan
 * için geçerlidir (kalıcı profile yazılmaz — bkz. mergeConstraints).
 * Alerjiler güvenlik açısından kritik olduğu için burada her zaman görünür.
 */
export function SummaryStep(props: SummaryStepProps) {
  const [avoidedDraft, setAvoidedDraft] = useState("");
  const [allergyDraft, setAllergyDraft] = useState("");
  const { effectiveDietary: diet, effectiveEquipment: eq } = props;

  const ages = props.childAges.filter((a): a is number => a != null);
  const household =
    `${props.householdAdults} yetişkin` +
    (props.householdChildren > 0 ? `, ${props.householdChildren} çocuk${ages.length ? ` (${ages.join(", ")} yaş)` : ""}` : "");

  const meals = props.includedMeals
    .map((m) => {
      const c = m === "ogle" ? props.mealComplexity.lunch : m === "aksam" ? props.mealComplexity.dinner : undefined;
      return c ? `${MEAL_TYPE_LABELS[m]} (${COMPLEXITY_LABELS[c].toLocaleLowerCase("tr")})` : MEAL_TYPE_LABELS[m];
    })
    .join(", ");

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <SummaryRow label="Hane" value={household} onEdit={() => props.onEditStep(0)} />
        <SummaryRow label="Öğünler" value={meals} onEdit={() => props.onEditStep(1)} />
        <SummaryRow
          label="Mutfaklar"
          value={props.cuisinePreferences.map((c) => CUISINE_INFO[c].label).join(", ")}
          onEdit={() => props.onEditStep(1)}
          last
        />
      </View>

      <View>
        <SectionLabel tone="dark">BU PLAN İÇİN KURALLAR</SectionLabel>
        <Text style={styles.hint}>"Kurallarım"dan geldi. Buradaki değişiklik yalnızca bu planı etkiler.</Text>

        <Text style={styles.groupLabel}>Diyet</Text>
        <View style={styles.chips}>
          {DIET_FLAGS.map(({ key, label }) => (
            <Chip
              key={key}
              tone="dark"
              label={label}
              variant={diet[key] ? "on" : "off"}
              onPress={() =>
                props.onDietaryOverride({
                  [key]: !diet[key],
                  ...(key === "vegan" && !diet.vegan ? { vegetarian: true } : {}),
                  ...(key === "vegetarian" && diet.vegetarian ? { vegan: false } : {}),
                })
              }
            />
          ))}
        </View>

        <Text style={styles.groupLabel}>Ekipman</Text>
        <View style={styles.chips}>
          {EQUIPMENT_FLAGS.map(({ key, label }) => (
            <Chip
              key={key}
              tone="dark"
              label={label}
              variant={key === "hasOven" && eq.stovetopOnly ? "disabled" : eq[key] ? "on" : "off"}
              onPress={() => props.onEquipmentOverride({ [key]: !eq[key] })}
            />
          ))}
          <Chip
            tone="dark"
            label="Sadece ocak"
            variant={eq.stovetopOnly ? "on" : "off"}
            onPress={() => props.onEquipmentOverride({ stovetopOnly: !eq.stovetopOnly, ...(!eq.stovetopOnly ? { hasOven: false } : {}) })}
          />
        </View>

        <Text style={styles.groupLabel}>Alerjiler</Text>
        <IngredientInput
          tone="dark"
          value={allergyDraft}
          onChangeText={setAllergyDraft}
          placeholder="Alerjen ekle (örn. fıstık)"
          accessibilityLabel="Bu plan için alerjen ekle"
          onSubmit={() => {
            if (allergyDraft.trim()) props.onDietaryOverride({ allergies: [...diet.allergies, allergyDraft.trim()] });
            setAllergyDraft("");
          }}
        />
        {diet.allergies.length > 0 && (
          <View style={[styles.chips, styles.chipsAfterInput]}>
            {diet.allergies.map((item) => (
              <Chip
                key={item}
                tone="dark"
                label={item}
                variant="danger"
                onPress={() => props.onDietaryOverride({ allergies: diet.allergies.filter((i) => i !== item) })}
              />
            ))}
          </View>
        )}

        <Text style={styles.groupLabel}>Kaçındıkların</Text>
        <IngredientInput
          tone="dark"
          value={avoidedDraft}
          onChangeText={setAvoidedDraft}
          placeholder="Malzeme ekle (örn. patlıcan)"
          accessibilityLabel="Bu plan için kaçınılacak malzeme ekle"
          onSubmit={() => {
            if (avoidedDraft.trim()) props.onDietaryOverride({ avoidedIngredients: [...diet.avoidedIngredients, avoidedDraft.trim()] });
            setAvoidedDraft("");
          }}
        />
        {diet.avoidedIngredients.length > 0 && (
          <View style={[styles.chips, styles.chipsAfterInput]}>
            {diet.avoidedIngredients.map((item) => (
              <Chip
                key={item}
                tone="dark"
                label={item}
                variant="removable"
                onPress={() => props.onDietaryOverride({ avoidedIngredients: diet.avoidedIngredients.filter((i) => i !== item) })}
              />
            ))}
          </View>
        )}
      </View>

      {props.errorMessage && <InfoBanner variant="danger" title="Plan oluşturulamadı" description={props.errorMessage} />}
      {props.isPending && <GeneratingIndicator label="Haftalık planın hazırlanıyor…" />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xl },
  card: { backgroundColor: colors.nightTrack, borderRadius: radius.tile, paddingHorizontal: space.lg + 2, borderWidth: 1, borderColor: colors.nightDivider },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md + 2 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.nightDivider },
  flex: { flex: 1 },
  rowLabel: { ...textStyle(type.caption), color: colors.onNightMuted },
  rowValue: { ...textStyle(type.body), color: colors.onNight },
  editButton: { paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: colors.glassFill },
  editText: { ...textStyle(type.caption), fontFamily: type.cardTitle.font, color: colors.onNight },
  hint: { ...textStyle(type.helper), color: colors.onNightSecondary, marginTop: -4 },
  groupLabel: { ...textStyle(type.helper), fontFamily: type.bodyMedium.font, color: colors.onNight, marginTop: space.lg, marginBottom: space.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  chipsAfterInput: { marginTop: space.sm },
});
