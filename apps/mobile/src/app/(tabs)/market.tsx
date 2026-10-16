import { UNIT_LABELS, type AisleGroup, type ShoppingItem } from "@sofria/shared";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Check, Share2 } from "lucide-react-native";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { IconCircleButton, PrimaryButton, Screen, ScreenHeader, SectionLabel, shoppingItemKey, TwoToneHeadline } from "../../components/ui";
import { usePlanStore } from "../../stores/plan.store";
import { useShoppingStore } from "../../stores/shopping.store";
import { colors, radius, space, tabularNums, textStyle, toTurkishUpperCase, type } from "../../theme";

function formatAmount(item: ShoppingItem): string {
  return `${item.totalAmount} ${UNIT_LABELS[item.unit]}`;
}

/**
 * Market listesi — BİLEREK açık tema: markette parlak ışıkta, tek elle
 * okunur. İşaretlenen ürün reyonun altına iner; kalan iş hep üstte.
 */
export default function MarketScreen() {
  const router = useRouter();
  const plan = usePlanStore((s) => s.currentPlan);
  // Store'un `isChecked` metodu referans olarak hiç değişmez — onu seçmek
  // ekranı yeniden render ettirmiyordu (gerçek kullanıcı testi). Veriye abone ol.
  const checkedByPlan = useShoppingStore((s) => s.checkedByPlan);
  const toggleItem = useShoppingStore((s) => s.toggleItem);

  if (!plan) {
    return (
      <Screen tone="light" withTabBar>
        <ScreenHeader tone="light" title="Market listesi" left={null} />
        <View style={styles.empty}>
          <TwoToneHeadline tone="light" muted="Liste" strong="henüz boş" />
          <Text style={styles.emptyHint}>Haftalık planını oluşturduğunda alışveriş listen reyon reyon burada hazır olur.</Text>
          <PrimaryButton label="Haftalık planımı oluştur" showArrow tone="light" onPress={() => router.push("/plan")} />
        </View>
      </Screen>
    );
  }

  const planChecks = checkedByPlan[plan.planId] ?? {};
  const allItems = plan.shoppingList.aisles.flatMap((a) => a.items);
  const inCart = allItems.filter((item) => planChecks[shoppingItemKey(item)]).length;
  const left = allItems.length - inCart;
  const percent = allItems.length === 0 ? 0 : Math.round((inCart / allItems.length) * 100);

  async function shareList() {
    if (!plan) return;
    const lines = plan.shoppingList.aisles
      .map((group) => {
        const remaining = group.items.filter((i) => !planChecks[shoppingItemKey(i)]);
        if (remaining.length === 0) return null;
        return [`${group.displayName}:`, ...remaining.map((i) => `• ${i.displayName} — ${formatAmount(i)}`)].join("\n");
      })
      .filter(Boolean);
    const message = lines.length > 0 ? `Sofria market listesi\n\n${lines.join("\n\n")}` : "Market listesindeki her şey sepette 🎉";
    await Share.share({ message });
  }

  return (
    <Screen tone="light" withTabBar>
      <ScreenHeader
        tone="light"
        title="Market listesi"
        left={null}
        right={<IconCircleButton icon={Share2} accessibilityLabel="Listeyi paylaş" variant="muted" onPress={() => void shareList()} />}
      />

      <View style={styles.headline}>
        {left === 0 ? (
          <TwoToneHeadline tone="light" size="title" muted="Her şey" strong="sepette" caption={`${allItems.length} ürünün\nhepsi tamam`} />
        ) : (
          <TwoToneHeadline
            tone="light"
            size="title"
            muted="kaldı"
            strong={`${left} ürün`}
            mutedLast
            caption={`${allItems.length} üründen\n${inCart} tanesi sepette`}
          />
        )}
      </View>

      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: allItems.length, now: inCart }}
      >
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.aisles}>
        {plan.shoppingList.aisles.map((group) => (
          <AisleSection
            key={group.aisle}
            group={group}
            planChecks={planChecks}
            onToggle={(key) => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleItem(plan.planId, key);
            }}
          />
        ))}
      </View>
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
  onToggle: (key: string) => void;
}) {
  // Kalanlar üstte, sepettekiler altta — sıra kendi içinde korunur.
  const sorted = [...group.items].sort((a, b) => Number(Boolean(planChecks[shoppingItemKey(a)])) - Number(Boolean(planChecks[shoppingItemKey(b)])));
  const remaining = group.items.filter((i) => !planChecks[shoppingItemKey(i)]).length;

  return (
    <View>
      <SectionLabel>{`${toTurkishUpperCase(group.displayName)} · ${remaining === 0 ? "TAMAM" : remaining}`}</SectionLabel>
      <View style={styles.items}>
        {sorted.map((item) => {
          const key = shoppingItemKey(item);
          const checked = Boolean(planChecks[key]);
          const amount = formatAmount(item);
          return (
            <Animated.View key={key} layout={LinearTransition.duration(240)}>
              <Pressable
                onPress={() => onToggle(key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={`${item.displayName}, ${amount}`}
                style={({ pressed }) => [styles.row, checked && styles.rowChecked, pressed && styles.pressed]}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && <Check size={16} color={colors.accent} strokeWidth={3} />}
                </View>
                <Text style={[styles.itemName, checked && styles.textChecked]}>{item.displayName}</Text>
                <Text style={[styles.itemAmount, tabularNums, checked && styles.textChecked]}>{amount}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headline: { marginTop: space.lg },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceMuted, marginTop: space.lg, overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 5, backgroundColor: colors.night },
  aisles: { marginTop: space.xl, gap: space.xl },
  items: { gap: space.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 60,
    paddingLeft: 14,
    paddingRight: 18,
    paddingVertical: space.md,
    borderRadius: radius.row,
    backgroundColor: colors.surface,
  },
  rowChecked: { backgroundColor: colors.surfaceSunken },
  pressed: { opacity: 0.7 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.night, borderColor: colors.night },
  itemName: { flex: 1, ...textStyle(type.bodyMedium), fontSize: 17, color: colors.ink },
  itemAmount: { ...textStyle(type.helper), fontSize: 15, color: colors.inkSecondary },
  textChecked: { color: colors.inkMuted, textDecorationLine: "line-through" },
  empty: { flex: 1, justifyContent: "center", gap: space.lg },
  emptyHint: { ...textStyle(type.body), color: colors.inkSecondary },
});
