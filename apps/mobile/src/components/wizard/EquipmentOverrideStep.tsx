import type { EquipmentConstraints } from "@sofria/shared";
import { Blend, CookingPot, Flame, Wind } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SelectionCard } from "../ui";
import { space } from "../../theme";

export interface EquipmentOverrideStepProps {
  effectiveEquipment: EquipmentConstraints;
  onOverride: (partial: Partial<EquipmentConstraints>) => void;
}

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

export function EquipmentOverrideStep({ effectiveEquipment, onOverride }: EquipmentOverrideStepProps) {
  return (
    <View>
      <View style={styles.grid}>
        {EQUIPMENT_ITEMS.map(({ key, label, icon }) => (
          <View key={key} style={styles.cell}>
            <SelectionCard icon={icon} title={label} selected={effectiveEquipment[key]} onPress={() => onOverride({ [key]: !effectiveEquipment[key] })} />
          </View>
        ))}
      </View>

      <View style={styles.cell2}>
        <SelectionCard
          icon={Flame}
          title="Sadece ocak"
          subtitle="Fırın kullanma"
          selected={effectiveEquipment.stovetopOnly}
          onPress={() =>
            onOverride({
              stovetopOnly: !effectiveEquipment.stovetopOnly,
              ...(!effectiveEquipment.stovetopOnly ? { hasOven: false } : {}),
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  cell: { width: "47%" },
  cell2: { width: "47%", marginTop: space.md },
});
