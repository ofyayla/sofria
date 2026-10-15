import { UNIT_LABELS, type AisleGroup } from "@sofria/shared";
import { Link, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandIcon, PrimaryButton, Screen } from "../../../components/ui";
import { usePlanStore } from "../../../stores/plan.store";
import { useShoppingStore } from "../../../stores/shopping.store";
import { colors, radius, space, tabularNums, type as textType } from "../../../theme";

// textTransform:"uppercase" Türkçe'yi bilmez ("Şarküteri" → "ŞARKÜTERI");
// noktalı i önce İ'ye çevrilir, ı zaten toUpperCase ile I olur.
function toTurkishUpperCase(text: string): string {
  return text.replace(/i/g, "İ").toUpperCase();
}

export default function MarketScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const plan = usePlanStore((s) => s.currentPlan);
  // KRİTİK: store'un `isChecked` metodu bir REFERANS olarak hiç değişmez
  // (zustand action'ları sabittir), bu yüzden onu seçmek bileşeni
  // checkedByPlan VERİSİNE abone etmiyordu — dokunma localStorage'a doğru
  // yazılıyordu ama ekran hiç yeniden render olmuyordu. Gerçek kullanıcı
  // testinde bulundu. Fix: gerçek veriye abone ol.
  const checkedByPlan = useShoppingStore((s) => s.checkedByPlan);
  const toggleItem = useShoppingStore((s) => s.toggleItem);

  if (!plan || plan.planId !== planId) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Bu plana ait alışveriş listesi bulunamadı</Text>
          <Link href="/plan" asChild>
            <PrimaryButton label="Yeni plan oluştur" onPress={() => {}} showArrow={false} />
          </Link>
        </View>
      </Screen>
    );
  }

  const allItems = plan.shoppingList.aisles.flatMap((a) => a.items);
  const planChecks = checkedByPlan[plan.planId] ?? {};
  const checkedCount = allItems.filter((item) => planChecks[itemKey(item)]).length;
  const percent = allItems.length === 0 ? 0 : Math.round((checkedCount / allItems.length) * 100);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <BrandIcon size={20} />
          <Text style={styles.title}>Alışveriş listesi</Text>
        </View>
        <Link href={`/plan/${plan.planId}`} asChild>
          <Pressable style={styles.backLink} hitSlop={8}>
            <Text style={styles.backLinkText}>← Plana dön</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={[styles.progressLabel, tabularNums]}>
        {checkedCount}/{allItems.length} işaretlendi
      </Text>

      <ScrollView contentContainerStyle={{ paddingTop: space.lg, paddingBottom: space.xxxl, gap: space.xl }} showsVerticalScrollIndicator={false}>
        {plan.shoppingList.aisles.map((group) => (
          <AisleSection key={group.aisle} group={group} planChecks={planChecks} onToggle={(slug) => toggleItem(plan.planId, slug)} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function AisleSection({
  group,
  planChecks,
  onToggle,
}: {
  group: AisleGroup;
  planChecks: Record<string, boolean>;
  onToggle: (slug: string) => void;
}) {
  return (
    <View style={{ gap: space.sm }}>
      <Text style={styles.aisleTitle}>{toTurkishUpperCase(group.displayName)}</Text>
      {group.items.map((item) => {
        const key = itemKey(item);
        const checked = Boolean(planChecks[key]);
        const amount = `${item.totalAmount} ${UNIT_LABELS[item.unit]}`;
        return (
          <Pressable
            key={key}
            onPress={() => onToggle(key)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={`${amount} ${item.displayName}`}
            style={({ pressed }) => [styles.itemRow, checked && styles.itemRowChecked, pressed && styles.itemRowPressed]}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked && <Check size={18} color={colors.onBrand} strokeWidth={3} />}</View>
            <Text style={[styles.itemName, checked && styles.textChecked]}>{item.displayName}</Text>
            <Text style={[styles.itemAmount, tabularNums, checked && styles.textChecked]}>{amount}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Aynı malzeme farklı birimlerde ayrı satır olabilir ("9 adet" + "1 demet" fesleğen) — işaret satır başına tutulur.
function itemKey(item: { slug: string; unit: string }): string {
  return `${item.slug}-${item.unit}`;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: space.xl },
  titleRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  title: { fontFamily: textType.screenTitle.font, fontSize: 24, color: colors.ink },
  backLink: { paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.chip, backgroundColor: colors.surfaceMuted },
  backLinkText: { fontFamily: textType.label.font, fontSize: 15, color: colors.inkSecondary },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: colors.divider, marginTop: space.lg },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: colors.brand },
  progressLabel: { fontFamily: textType.label.font, fontSize: 15, color: colors.inkSecondary, marginTop: space.sm },
  aisleTitle: { fontFamily: textType.label.font, fontSize: 15, letterSpacing: 0.5, color: colors.brand, marginTop: space.sm },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  itemRowChecked: { backgroundColor: colors.surfaceMuted },
  itemRowPressed: { opacity: 0.7 },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.brandTint, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: colors.brand, borderColor: colors.brand },
  itemName: { flex: 1, fontFamily: textType.chip.font, fontSize: 18, lineHeight: 24, color: colors.ink },
  itemAmount: { fontFamily: textType.body.font, fontSize: 16, color: colors.inkSecondary },
  textChecked: { color: colors.inkMuted, textDecorationLine: "line-through" },
  emptyState: { alignItems: "center", justifyContent: "center", gap: space.md, marginTop: space.xxxl },
  emptyTitle: { fontFamily: textType.cardTitle.font, fontSize: 18, color: colors.ink, textAlign: "center" },
});
