import type { Meal, SubRecipe } from "@sofria/shared";
import { useRouter } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActionSheetIOS, Alert, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { getDishImage } from "../../assets/dishImages";
import { RecipeDetailModal } from "../../components/plan/RecipeDetailModal";
import { dishIcon } from "../../lib/dishIcon";
import { IconCircleButton, PhotoCard, PrimaryButton, Screen, ScreenHeader, TwoToneHeadline } from "../../components/ui";
import {
  COMPLEXITY_LABELS,
  dayOfMonth,
  featuredDish,
  findFocusDay,
  formatPlanRange,
  localISODate,
  MEAL_TYPE_LABELS,
  ROLE_LABELS,
  shortDayName,
  totalMinutes,
} from "../../lib/planDisplay";
import { usePlanStore } from "../../stores/plan.store";
import { colors, radius, space, tabularNums, TAB_BAR_CLEARANCE, textStyle, type } from "../../theme";

const SWIPE_THRESHOLD = 60;

export default function WeekScreen() {
  const router = useRouter();
  const plan = usePlanStore((s) => s.currentPlan);
  const [activeDayIndex, setActiveDayIndex] = useState(() => (plan ? findFocusDay(plan).index : 0));
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);
  const dayListRef = useRef<FlatList>(null);
  // Gün değişince liste kayarak gelir. Reanimated `entering` KULLANILMIYOR:
  // içeriği visibility:hidden başlatıp animasyon başlayınca açıyor; sekmeye
  // doğrudan gelindiğinde animasyon başlamayıp liste görünmez kalıyordu.
  const slideX = useSharedValue(0);
  const fade = useSharedValue(1);
  const slideStyle = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ translateX: slideX.value }] }));

  // Yeni plan gelince odak bugüne (ya da planın ilk gününe) döner.
  const planId = plan?.planId;
  useEffect(() => {
    if (plan) setActiveDayIndex(findFocusDay(plan).index);
  }, [planId]);

  // Aktif gün değişince gün şeridi o güne kayar — kaydırarak geçince de.
  useEffect(() => {
    dayListRef.current?.scrollToIndex({ index: activeDayIndex, animated: true, viewPosition: 0.5 });
  }, [activeDayIndex]);

  if (!plan) {
    return (
      <Screen tone="light" withTabBar>
        <ScreenHeader tone="light" title="Haftalık plan" left={null} />
        <View style={styles.empty}>
          <TwoToneHeadline tone="light" muted="Henüz bir" strong="planın yok" />
          <Text style={styles.emptyHint}>Birkaç tercihle 7 günlük menünü ve market listeni hazırlayalım.</Text>
          <PrimaryButton label="Haftalık planımı oluştur" showArrow tone="light" onPress={() => router.push("/plan")} />
        </View>
      </Screen>
    );
  }

  const today = localISODate();
  const activeDay = plan.days[activeDayIndex];
  const dayCount = plan.days.length;

  function goToDay(index: number) {
    const dir = index > activeDayIndex ? 1 : -1;
    slideX.value = dir * 40;
    fade.value = 0.4;
    slideX.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    fade.value = withTiming(1, { duration: 220 });
    setActiveDayIndex(index);
  }

  function openMoreMenu() {
    const regenerate = () => router.push("/plan");
    const message = "Yeni plan oluşturulunca bu haftanın planı ve market işaretlerin değişir.";
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Yeni plan oluştur", "Vazgeç"], destructiveButtonIndex: 0, cancelButtonIndex: 1, message },
        (i) => i === 0 && regenerate()
      );
    } else {
      Alert.alert("Yeni plan oluşturulsun mu?", message, [
        { text: "Vazgeç", style: "cancel" },
        { text: "Yeni plan oluştur", style: "destructive", onPress: regenerate },
      ]);
    }
  }

  // Tarif modalı açıkken jest arka planda dokunuşları yutmasın (gerçek kullanıcı testi).
  const swipeGesture = Gesture.Pan()
    .enabled(!openRecipeId)
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
    <Screen tone="light" scroll={false} contentContainerStyle={styles.noPad}>
      <View style={styles.top}>
        <ScreenHeader
          tone="light"
          title="Haftalık plan"
          left={null}
          right={<IconCircleButton icon={Ellipsis} accessibilityLabel="Diğer seçenekler" variant="muted" onPress={openMoreMenu} />}
        />
        <TwoToneHeadline tone="light" layout="split" size="title" muted="Bu haftanın" strong="sofrası" caption={formatPlanRange(plan.days)} />
      </View>

      <FlatList
        ref={dayListRef}
        horizontal
        data={plan.days}
        keyExtractor={(d) => String(d.dayIndex)}
        showsHorizontalScrollIndicator={false}
        style={styles.dayList}
        contentContainerStyle={styles.dayListContent}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item, index }) => {
          const active = activeDayIndex === index;
          const isToday = item.date === today;
          return (
            <Pressable
              onPress={() => goToDay(index)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${item.dayName} ${dayOfMonth(item.date)}${isToday ? ", bugün" : ""}`}
              style={[styles.dayPill, active && styles.dayPillActive]}
            >
              {isToday && <Text style={[styles.todayTag, active && styles.dayTextActive]}>BUGÜN</Text>}
              <Text style={[styles.dayText, tabularNums, active && styles.dayTextActive]}>
                {shortDayName(item.dayName)} {dayOfMonth(item.date)}
              </Text>
            </Pressable>
          );
        }}
      />

      <GestureDetector gesture={swipeGesture}>
        <Animated.ScrollView
          key={activeDayIndex}
          style={[styles.mealScroll, slideStyle]}
          contentContainerStyle={styles.meals}
          showsVerticalScrollIndicator={false}
        >
          {(activeDay?.meals ?? []).map((meal) => (
            <MealBlock key={meal.mealId} meal={meal} onOpenRecipe={setOpenRecipeId} />
          ))}
        </Animated.ScrollView>
      </GestureDetector>

      {openRecipeId && <RecipeDetailModal plan={plan} openSubRecipeId={openRecipeId} onClose={() => setOpenRecipeId(null)} />}
    </Screen>
  );
}

function MealBlock({ meal, onOpenRecipe }: { meal: Meal; onOpenRecipe: (subRecipeId: string) => void }) {
  const featured = featuredDish(meal);
  const sides = meal.subRecipes.filter((s) => s.subRecipeId !== featured.subRecipeId);
  const kcal = featured.estimatedKcalPerServing ? ` · ~${featured.estimatedKcalPerServing} kcal` : "";

  return (
    <View style={styles.mealBlock}>
      <PhotoCard
        image={getDishImage(featured.imageSlug)}
        fallbackIcon={dishIcon(featured.role, meal.type)}
        eyebrow={`${MEAL_TYPE_LABELS[meal.type]} · ${COMPLEXITY_LABELS[meal.complexity]}`}
        title={featured.name}
        meta={`${totalMinutes(featured)} dk${kcal}`}
        height={meal.type === "aksam" ? 320 : 260}
        onPress={() => onOpenRecipe(featured.subRecipeId)}
      />
      {sides.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sides} style={styles.sidesScroll}>
          {sides.map((sub) => (
            <SideDish key={sub.subRecipeId} sub={sub} onPress={() => onOpenRecipe(sub.subRecipeId)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function SideDish({ sub, onPress }: { sub: SubRecipe; onPress: () => void }) {
  const image = getDishImage(sub.imageSlug);
  const Icon = dishIcon(sub.role);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sub.name}, ${ROLE_LABELS[sub.role]}, ${totalMinutes(sub)} dakika. Tarifi aç`}
      style={({ pressed }) => [styles.side, pressed && styles.pressed]}
    >
      {image ? (
        <Image source={image} style={styles.sideImage} />
      ) : (
        <View style={[styles.sideImage, styles.sideIcon]}>
          <Icon size={20} color={colors.ink} />
        </View>
      )}
      <View style={styles.sideText}>
        <Text style={styles.sideName} numberOfLines={1}>
          {sub.name}
        </Text>
        <Text style={styles.sideMeta}>
          {ROLE_LABELS[sub.role]} · {totalMinutes(sub)} dk
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  noPad: { paddingHorizontal: 0 },
  top: { paddingHorizontal: 20, gap: space.lg },
  // flexShrink:0 — yoksa uzun öğün listesi şeridi sıkıştırıp kartı gün haplarının üstüne bindiriyor (iPhone'da görüldü).
  dayList: { flexGrow: 0, flexShrink: 0, marginTop: space.lg },
  mealScroll: { flex: 1 },
  dayListContent: { gap: space.sm, paddingHorizontal: 20, paddingBottom: space.lg },
  dayPill: {
    height: 60,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPillActive: { backgroundColor: colors.accent },
  dayText: { ...textStyle(type.bodyMedium), color: colors.ink },
  dayTextActive: { color: colors.onAccent, fontFamily: type.button.font },
  todayTag: { ...textStyle(type.eyebrow), fontSize: 10, lineHeight: 12, color: colors.inkSecondary },
  meals: { paddingHorizontal: 20, gap: space.xl, paddingBottom: TAB_BAR_CLEARANCE },
  mealBlock: { gap: space.md },
  sidesScroll: { marginHorizontal: -20 },
  sides: { gap: 10, paddingHorizontal: 20 },
  side: {
    height: 64,
    paddingLeft: space.sm,
    paddingRight: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: 240,
  },
  pressed: { opacity: 0.7 },
  sideImage: { width: 48, height: 48, borderRadius: 24 },
  sideIcon: { backgroundColor: colors.canvas, alignItems: "center", justifyContent: "center" },
  sideText: { flexShrink: 1 },
  sideName: { ...textStyle(type.helper), fontFamily: type.bodyMedium.font, color: colors.ink },
  sideMeta: { ...textStyle(type.caption), fontSize: 12, color: colors.inkMuted },
  empty: { flex: 1, justifyContent: "center", gap: space.lg },
  emptyHint: { ...textStyle(type.body), color: colors.inkSecondary },
});
