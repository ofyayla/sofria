import { Stepper } from "../ui";
import { colors, radius, space, type as textType } from "../../theme";
import { StyleSheet, Text, TextInput, View } from "react-native";

export interface HouseholdBudgetStepProps {
  householdAdults: number;
  householdChildren: number;
  childAges: (number | undefined)[];
  onHouseholdAdultsChange: (value: number) => void;
  onHouseholdChildrenChange: (value: number) => void;
  onChildAgeChange: (index: number, age: number) => void;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

/**
 * Gerçek kullanıcı talebi: pişirme becerisi ve öğün başına hazırlık süresi
 * artık burada SORULMUYOR — beceri her zaman "orta", hazırlık süresi genelde
 * ~1 saatte hazırlanabilecek tarifleri hedefleyecek şekilde sabit gönderiliyor
 * (bkz. plan.tsx FIXED_COOKING_SKILL/FIXED_MAX_PREP_MINUTES). "Hangi öğünler
 * dahil olsun?" seçimi de ComplexityStep'e taşındı — bu adım artık yalnızca
 * hane büyüklüğünü soruyor.
 */
export function HouseholdBudgetStep(props: HouseholdBudgetStepProps) {
  return (
    <View style={{ gap: space.xxl }}>
      <View>
        <FieldLabel>Yetişkin sayısı</FieldLabel>
        <Stepper
          value={props.householdAdults}
          min={1}
          max={12}
          onChange={props.onHouseholdAdultsChange}
          resultLabel={`Toplam ${props.householdAdults + props.householdChildren} kişilik tarif hazırlanacak.`}
        />
      </View>

      <View>
        <FieldLabel>Çocuk sayısı</FieldLabel>
        <Stepper
          value={props.householdChildren}
          min={0}
          max={12}
          onChange={props.onHouseholdChildrenChange}
          resultLabel={props.householdChildren > 0 ? `${props.householdChildren} çocuk için porsiyonlar küçültülecek.` : "Çocuk yoksa 0 bırakın."}
        />
      </View>

      {props.householdChildren > 0 && (
        <View>
          <FieldLabel>Çocukların yaşları — porsiyonlar buna göre küçültülür</FieldLabel>
          <View style={styles.ageRow}>
            {Array.from({ length: props.householdChildren }).map((_, index) => (
              <View key={index} style={styles.ageField}>
                <Text style={styles.ageFieldLabel}>{index + 1}. çocuk</Text>
                <TextInput
                  value={props.childAges[index] == null ? "" : String(props.childAges[index])}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, "");
                    if (cleaned !== "") props.onChildAgeChange(index, Number(cleaned));
                  }}
                  keyboardType="numeric"
                  placeholder="yaş"
                  placeholderTextColor={colors.inkMuted}
                  style={styles.ageInput}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontFamily: textType.label.font,
    fontSize: textType.label.size,
    color: colors.inkSecondary,
    marginBottom: space.md,
  },
  ageRow: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  ageField: { gap: 6 },
  ageFieldLabel: { fontFamily: textType.helper.font, fontSize: 12, color: colors.inkMuted },
  ageInput: {
    width: 64,
    height: 44,
    paddingHorizontal: space.sm,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceMuted,
    fontFamily: textType.body.font,
    fontSize: 16,
    color: colors.ink,
  },
});
