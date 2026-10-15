import type { CuisineType } from "@sofria/shared";
import { Beef, Carrot, Drumstick, Fish, Landmark, Pizza } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { SelectionCard } from "../ui";
import { colors, radius, space, type as textType } from "../../theme";

const CUISINE_INFO: Record<CuisineType, { label: string; subtitle: string; icon: typeof Beef }> = {
  kirmizi_et: { label: "Kırmızı Et", subtitle: "Dana, kuzu ağırlıklı", icon: Beef },
  beyaz_et: { label: "Beyaz Et", subtitle: "Tavuk ve hindi", icon: Drumstick },
  balik_urunleri: { label: "Balık Ürünleri", subtitle: "Balık ve deniz ürünleri", icon: Fish },
  sebze_yemekleri: { label: "Sebze Yemekleri", subtitle: "Etsiz, sebze ağırlıklı", icon: Carrot },
  ortadogu_mutfagi: { label: "Ortadoğu Mutfağı", subtitle: "Humus, kebap, baharatlı", icon: Landmark },
  italyan_mutfagi: { label: "İtalyan Mutfağı", subtitle: "Makarna, risotto", icon: Pizza },
};

export interface CuisineStepProps {
  selected: CuisineType[];
  onToggle: (cuisine: CuisineType) => void;
}

export function CuisineStep({ selected, onToggle }: CuisineStepProps) {
  const cuisines = Object.keys(CUISINE_INFO) as CuisineType[];

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.hint}>Birden fazla seçebilirsiniz — hafta boyunca dengeli dağıtılır.</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{selected.length} seçili</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {cuisines.map((cuisine) => (
          <View key={cuisine} style={styles.cell}>
            <SelectionCard
              icon={CUISINE_INFO[cuisine].icon}
              title={CUISINE_INFO[cuisine].label}
              subtitle={CUISINE_INFO[cuisine].subtitle}
              selected={selected.includes(cuisine)}
              onPress={() => onToggle(cuisine)}
            />
          </View>
        ))}
      </View>
      {selected.length === 0 && <Text style={styles.warning}>En az bir mutfak seçmelisiniz.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: space.md, marginBottom: space.lg },
  hint: { flex: 1, fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkSecondary },
  countBadge: { paddingHorizontal: space.md, paddingVertical: 5, borderRadius: radius.chip, backgroundColor: colors.brandSoft },
  countText: { fontFamily: textType.label.font, fontSize: 13, color: colors.brand, fontVariant: ["tabular-nums"] },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  cell: { width: "47%" },
  warning: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.warning, marginTop: space.md },
});
