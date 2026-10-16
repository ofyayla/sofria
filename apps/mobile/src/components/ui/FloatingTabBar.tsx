import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { CalendarDays, House, Plus, ShoppingBag, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlanStore } from "../../stores/plan.store";
import { useShoppingStore } from "../../stores/shopping.store";
import { colors, fonts, gutter, radius, shadow, size, space } from "../../theme";
import { GlassView } from "./GlassView";

const TABS: Record<string, { icon: LucideIcon; label: string }> = {
  index: { icon: House, label: "Bugün" },
  haftam: { icon: CalendarDays, label: "Haftalık plan" },
  market: { icon: ShoppingBag, label: "Market listesi" },
};

/** Aynı malzeme farklı birimlerde ayrı satırdır — bkz. market ekranı. */
export function shoppingItemKey(item: { slug: string; unit: string }): string {
  return `${item.slug}-${item.unit}`;
}

/**
 * Yüzen hap alt bar: Bugün · Plan · Market · (+) Yeni plan. "Bugün" koyu
 * fotoğraflı ekranın üstünde cam; açık ekranlarda gece zemini.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plan = usePlanStore((s) => s.currentPlan);
  const checkedByPlan = useShoppingStore((s) => s.checkedByPlan);

  const activeName = state.routes[state.index]?.name;
  const onPhoto = activeName === "index";

  let remaining: number | undefined;
  if (plan) {
    const checks = checkedByPlan[plan.planId] ?? {};
    const items = plan.shoppingList.aisles.flatMap((a) => a.items);
    remaining = items.filter((i) => !checks[shoppingItemKey(i)]).length;
  }

  const items = (
    <View style={styles.inner}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const Icon = tab.icon;
        const badge = route.name === "market" && remaining ? remaining : undefined;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                void Haptics.selectionAsync();
                navigation.navigate(route.name, route.params);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={badge ? `${tab.label}, ${badge} ürün kaldı` : tab.label}
            style={[styles.item, focused && styles.itemActive]}
          >
            <Icon size={22} color={focused ? colors.onAccent : colors.onNight} />
            {badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/plan");
        }}
        accessibilityRole="button"
        accessibilityLabel="Yeni plan oluştur"
        style={styles.item}
      >
        <Plus size={24} color={colors.onNight} />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.wrap, { bottom: insets.bottom > 0 ? insets.bottom : space.xl }]} pointerEvents="box-none">
      {/* Her ekranda cam: fotoğraflı "Bugün"de saf cam, açık zeminli ekranlarda
          içerik altından kayarken görünsün diye koyu tonlu cam. */}
      <GlassView intensity={onPhoto ? 40 : 70} style={[styles.bar, !onPhoto && styles.onLight, shadow.floating]}>
        {items}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: gutter, right: gutter },
  bar: { height: size.tabBar, borderRadius: radius.pill },
  onLight: { backgroundColor: colors.glassNight },
  inner: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10 },
  item: { width: size.circleMd, height: size.circleMd, borderRadius: size.circleMd / 2, alignItems: "center", justifyContent: "center" },
  itemActive: { backgroundColor: colors.accent },
  badge: {
    position: "absolute",
    top: 6,
    right: 2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.ink, fontVariant: ["tabular-nums"] },
});
