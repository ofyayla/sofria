import type { Meal, SubRecipe } from "@sofria/shared";
import { Link, useLocalSearchParams } from "expo-router";
import { Clock, CookingPot, RefreshCw, Salad, Soup, UtensilsCrossed, Wheat } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, SlideInLeft, SlideInRight } from "react-native-reanimated";
import { getDishImage } from "../../../assets/dishImages";
import { BrandIcon, PrimaryButton, Screen } from "../../../components/ui";
import { RecipeDetailModal } from "../../../components/plan/RecipeDetailModal";
import { usePlanStore } from "../../../stores/plan.store";
import { useUiStore } from "../../../stores/ui.store";
import { colors, radius, shadow, space, type as textType } from "../../../theme";

const SWIPE_THRESHOLD = 60;

const MEAL_TYPE_LABELS: Record<Meal["type"], string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };

const ROLE_ICON: Record<SubRecipe["role"], typeof Soup> = {
  corba: Soup,
  ana_yemek: UtensilsCrossed,
  yan_lezzet: CookingPot,
  salata: Salad,
  pilav_makarna: Wheat,
  tatli: CookingPot,
};

/**
 * "YYYY-MM-DD" -> "GG.AA" — gün adı zaten API'den (dayName) doğru geliyor,
 * bkz. weekDates.ts (API). `iso` savunmacı olarak opsiyonel: bu alan eklenmeden
 * ÖNCE cihazda kaydedilmiş eski bir plan (artık hydrateStores.ts'te temizleniyor)
 * yine de buraya kadar sızarsa çökmek yerine boş döner.
 */
function formatDayDate(iso: string | undefined): string {
  if (!iso) return "";
  const [, month, day] = iso.split("-");
  return `${day}.${month}`;
}

export default function PlanDashboardScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const plan = usePlanStore((s) => s.currentPlan);
  const activeDayIndex = useUiStore((s) => s.activeDayIndex);
  const setActiveDayIndex = useUiStore((s) => s.setActiveDayIndex);
  const openRecipeModalId = useUiStore((s) => s.openRecipeModalId);
  const openRecipeModal = useUiStore((s) => s.openRecipeModal);
  const closeRecipeModal = useUiStore((s) => s.closeRecipeModal);

  const dayListRef = useRef<FlatList>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Gerçek kullanıcı talebi: aktif gün değiştiğinde üstteki gün şeridi de o
  // güne doğru kaysın — sadece dokunarak değil kaydırarak geçince de sabit
  // kalmamalı.
  useEffect(() => {
    dayListRef.current?.scrollToIndex({ index: activeDayIndex, animated: true, viewPosition: 0.5 });
  }, [activeDayIndex]);

  function goToDay(index: number) {
    setDirection(index > activeDayIndex ? 1 : -1);
    setActiveDayIndex(index);
  }

  if (!plan || plan.planId !== planId) {
    return (
      <Screen>
        <Link href="/" asChild>
          <Pressable style={styles.homeLink}>
            <BrandIcon size={20} />
          </Pressable>
        </Link>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Bu plan artık burada değil</Text>
          <Text style={styles.emptyHint}>Cihazda yalnızca en son üretilen plan tutulur.</Text>
          <Link href="/plan" asChild>
            <PrimaryButton label="Yeni plan oluştur" onPress={() => {}} showArrow={false} />
          </Link>
        </View>
      </Screen>
    );
  }

  const activeDay = plan.days[activeDayIndex];
  const dayCount = plan.days.length;

  // Tarif modalı açıkken bu jest ARKA PLANDA hâlâ aktif kalıyordu — modal
  // içindeki kaydırmayla çakışıp bazı dokunuşları yutuyordu (gerçek kullanıcı
  // testinde bulundu: kenardan kaydırma çalışıyor, ortadan çalışmıyordu).
  const swipeGesture = Gesture.Pan()
    .enabled(!openRecipeModalId)
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD && activeDayIndex < dayCount - 1) {
        runOnJS(goToDay)(activeDayIndex + 1);
      } else if (e.translationX > SWIPE_THRESHOLD && activeDayIndex > 0) {
        runOnJS(goToDay)(activeDayIndex - 1);
      }
    });

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.titleRow}>
            <BrandIcon size={20} />
            <Text style={styles.title}>Haftalık planınız</Text>
          </Pressable>
        </Link>
        <View style={styles.actionRow}>
          <Link href="/plan" asChild>
            <Pressable style={styles.regenerateLink}>
              <RefreshCw size={14} color={colors.inkSecondary} />
              <Text style={styles.regenerateLinkText}>Yeniden oluştur</Text>
            </Pressable>
          </Link>
          <Link href={`/plan/${plan.planId}/market`} asChild>
            <Pressable style={styles.marketLink}>
              <Text style={styles.marketLinkText}>Market ({plan.shoppingList.itemCount})</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <FlatList
        ref={dayListRef}
        horizontal
        data={plan.days}
        keyExtractor={(d) => String(d.dayIndex)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: space.sm, paddingBottom: space.lg }}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item, index }) => {
          const active = activeDayIndex === index;
          return (
            <Pressable
              onPress={() => goToDay(index)}
              style={styles.dayCircle}
              accessibilityRole="button"
              accessibilityLabel={`${item.dayName}, ${formatDayDate(item.date)}`}
            >
              <View style={[styles.dayCircleInner, active && styles.dayCircleInnerActive]}>
                <Text style={[styles.dayDateText, active && styles.dayCircleTextActive]}>{formatDayDate(item.date)}</Text>
                <Text style={[styles.dayNameText, active && styles.dayCircleTextActive]} numberOfLines={1}>
                  {item.dayName}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Text style={styles.tapHint}>* Tarif için yemek adına dokunun, günler arasında kaydırarak geçin</Text>

      <GestureDetector gesture={swipeGesture}>
        <Animated.FlatList
          key={activeDayIndex}
          entering={(direction === 1 ? SlideInRight : SlideInLeft).duration(220).withInitialValues({ originX: direction * 40 })}
          data={activeDay?.meals ?? []}
          keyExtractor={(item) => (item as Meal).mealId}
          contentContainerStyle={{ gap: space.md, paddingBottom: space.xxxl }}
          renderItem={({ item }) => <MealCard meal={item as Meal} onOpenRecipe={openRecipeModal} />}
        />
      </GestureDetector>

      {plan && openRecipeModalId && (
        <RecipeDetailModal plan={plan} openSubRecipeId={openRecipeModalId} onClose={closeRecipeModal} />
      )}
    </Screen>
  );
}

function MealCard({ meal, onOpenRecipe }: { meal: Meal; onOpenRecipe: (subRecipeId: string) => void }) {
  return (
    <View style={styles.mealCard}>
      <Text style={styles.mealType}>{MEAL_TYPE_LABELS[meal.type]}</Text>
      <Text style={styles.mealTitle}>{meal.title}</Text>
      <View style={styles.dishList}>
        {meal.subRecipes.map((sub) => (
          <DishRow key={sub.subRecipeId} sub={sub} onPress={() => onOpenRecipe(sub.subRecipeId)} />
        ))}
      </View>
    </View>
  );
}

function DishRow({ sub, onPress }: { sub: SubRecipe; onPress: () => void }) {
  const Icon = ROLE_ICON[sub.role];
  const image = getDishImage(sub.imageSlug);
  const totalMinutes = sub.prepMinutes + sub.cookMinutes;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dishBlock, pressed && styles.dishBlockPressed]}>
      {/* Gerçek kullanıcı talebi: ikon yerine gerçek tarif görseli — bkz.
          dishImages.ts. Görsel yoksa (henüz üretilmemiş kahvaltılıklar gibi)
          eski rol ikonuna düşülür, boş/kırık görsel gösterilmez. */}
      {image ? (
        <Image source={image} style={styles.dishImage} resizeMode="cover" />
      ) : (
        <View style={styles.dishIconWrap}>
          <Icon size={20} color={colors.brand} />
        </View>
      )}
      <View style={styles.dishTextWrap}>
        <Text style={styles.subRecipe}>{sub.name}</Text>
        <View style={styles.dishMetaRow}>
          <Clock size={12} color={colors.inkMuted} />
          <Text style={styles.kcalText}>{totalMinutes} dk</Text>
          {sub.estimatedKcalPerServing && <Text style={styles.kcalText}>· ~{sub.estimatedKcalPerServing} kcal</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: space.xl, marginBottom: space.lg, gap: space.md },
  titleRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  title: { fontFamily: textType.screenTitle.font, fontSize: 24, color: colors.ink },
  actionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: space.sm },
  regenerateLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    height: 40,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceMuted,
  },
  regenerateLinkText: { fontFamily: textType.label.font, fontSize: 13, color: colors.inkSecondary },
  marketLink: { paddingHorizontal: space.md, height: 40, borderRadius: radius.chip, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  marketLinkText: { fontFamily: textType.label.font, fontSize: 13, color: colors.inkSecondary },
  mealCard: { padding: space.lg, borderRadius: radius.card, backgroundColor: colors.surface, gap: space.sm, ...shadow.card },
  mealType: { fontFamily: textType.label.font, fontSize: 12, color: colors.brand, textTransform: "uppercase" },
  mealTitle: { fontFamily: textType.cardTitle.font, fontSize: textType.cardTitle.size, color: colors.ink },
  tapHint: { fontFamily: textType.helper.font, fontSize: 12, color: colors.inkMuted, marginBottom: space.md },
  dishList: { gap: space.sm, marginTop: space.xs },
  dishBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceMuted,
  },
  dishBlockPressed: { opacity: 0.7 },
  dishImage: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  dishIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dishTextWrap: { flex: 1 },
  dishMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  subRecipe: { fontFamily: textType.body.font, fontSize: 15, fontWeight: "500", color: colors.inkSecondary },
  kcalText: { fontFamily: textType.helper.font, fontSize: 12, color: colors.inkMuted },
  dayCircle: { alignItems: "center", justifyContent: "center" },
  dayCircleInner: {
    width: 60,
    paddingVertical: space.sm,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dayCircleInnerActive: { backgroundColor: colors.brand },
  dayDateText: { fontFamily: textType.label.font, fontSize: 14, color: colors.ink, fontVariant: ["tabular-nums"] },
  dayNameText: { fontFamily: textType.helper.font, fontSize: 10, color: colors.inkSecondary },
  dayCircleTextActive: { color: colors.onBrand },
  homeLink: { marginTop: space.xl, alignSelf: "flex-start" },
  emptyState: { alignItems: "center", justifyContent: "center", gap: space.sm, marginTop: space.xxxl },
  emptyTitle: { fontFamily: textType.cardTitle.font, fontSize: 18, color: colors.ink },
  emptyHint: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkMuted, textAlign: "center", maxWidth: 260, marginBottom: space.md },
});
