import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, gutter, radius, space, tabularNums, textStyle, type } from "../../theme";
import { SectionLabel, Stepper } from "../ui";

export interface HouseholdStepProps {
  householdAdults: number;
  householdChildren: number;
  childAges: (number | undefined)[];
  onHouseholdAdultsChange: (value: number) => void;
  onHouseholdChildrenChange: (value: number) => void;
  onChildAgeChange: (index: number, age: number | undefined) => void;
}

const AGES = Array.from({ length: 18 }, (_, i) => i);

/**
 * Adım 1 — "Kim yiyor?". Çocuk yaşı klavyeyle değil hap seçiciyle girilir:
 * serbest metin alanı hatalı değerlere ve silinemeyen rakamlara yol açıyordu.
 */
export function HouseholdStep(props: HouseholdStepProps) {
  const total = props.householdAdults + props.householdChildren;
  return (
    <View style={styles.wrap}>
      <Stepper
        label="Yetişkin"
        value={props.householdAdults}
        min={1}
        max={12}
        onChange={props.onHouseholdAdultsChange}
        hint={`Toplam ${total} kişilik tarif hazırlanacak.`}
      />
      <Stepper
        label="Çocuk"
        value={props.householdChildren}
        min={0}
        max={12}
        onChange={props.onHouseholdChildrenChange}
        hint={props.householdChildren > 0 ? "Porsiyonlar yaşa göre küçültülür." : "Çocuk yoksa 0 bırakın."}
      />

      {props.householdChildren > 0 && (
        <View>
          <SectionLabel tone="dark">ÇOCUKLARIN YAŞI</SectionLabel>
          <View style={styles.ages}>
            {Array.from({ length: props.householdChildren }).map((_, index) => {
              const selected = props.childAges[index];
              return (
                <View key={index} style={styles.childRow}>
                  <Text style={styles.childLabel}>
                    {index + 1}. çocuk{selected == null ? "" : ` · ${selected} yaş`}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.ageScroll}
                    contentContainerStyle={styles.ageList}
                  >
                    {AGES.map((age) => {
                      const active = selected === age;
                      return (
                        <Pressable
                          key={age}
                          onPress={() => {
                            void Haptics.selectionAsync();
                            props.onChildAgeChange(index, age);
                          }}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: active }}
                          accessibilityLabel={`${index + 1}. çocuk ${age} yaş`}
                          style={[styles.agePill, active && styles.agePillActive]}
                        >
                          <Text style={[styles.ageText, tabularNums, active && styles.ageTextActive]}>{age}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  ages: { gap: space.lg },
  childRow: { gap: space.sm },
  childLabel: { ...textStyle(type.helper), color: colors.onNightSecondary },
  ageScroll: { marginHorizontal: -gutter },
  ageList: { gap: 6, paddingHorizontal: gutter },
  agePill: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.nightTrack,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  agePillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  ageText: { ...textStyle(type.chip), color: colors.onNight },
  ageTextActive: { color: colors.onAccent, fontFamily: type.button.font },
});
