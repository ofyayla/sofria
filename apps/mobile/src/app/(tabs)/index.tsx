import type { Meal } from "@sofria/shared";
import { useRouter } from "expo-router";
import { ArrowUpRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, UserRound } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getDishImage } from "../../assets/dishImages";
import { RecipeDetailModal } from "../../components/plan/RecipeDetailModal";
import { usePlanSwap } from "../../hooks/usePlanSwap";
import { dishIcon } from "../../lib/dishIcon";
import { GlassView, IconCircleButton, PrimaryButton, Screen, SegmentedPill, TwoToneHeadline } from "../../components/ui";
import {
  featuredDish,
  findFocusDay,
  formatLongDate,
  greeting,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_MOMENT,
  mealImage,
  pickMealForNow,
  totalMinutes,
} from "../../lib/planDisplay";
import { usePlanStore } from "../../stores/plan.store";
import { colors, radius, space, textStyle, type } from "../../theme";

const MOMENT_WORD: Record<Meal["type"], string> = { kahvalti: "sabah", ogle: "öğlen", aksam: "akşam" };

/**
 * "Bugün" — uygulamanın açılış ekranı. Plan varsa bugünün (plan henüz
 * başlamadıysa ilk günün) öğününü fotoğrafıyla öne çıkarır; yoksa plan
 * oluşturmaya davet eder.
 */
export default function TodayScreen() {
  const router = useRouter();
  const plan = usePlanStore((s) => s.currentPlan);
  const focus = plan ? findFocusDay(plan) : null;
  const day = plan && focus && focus.relation !== "past" ? plan.days[focus.index] : undefined;

  const [mealType, setMealType] = useState<Meal["type"] | undefined>(undefined);
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);
  const { requestSwap, element: swapElement } = usePlanSwap();

  const meals = day?.meals ?? [];
  const meal = meals.find((m) => m.type === mealType) ?? pickMealForNow(meals);

  const header = (
    <View style={styles.topRow}>
      <View>
        <Text
          style={styles.date}
          onLongPress={__DEV__ ? () => router.push("/design-system" as never) : undefined}
        >
          {formatLongDate()}
        </Text>
        <Text style={styles.greeting}>{greeting()}</Text>
      </View>
      <GlassView style={styles.pillGroup}>
        <View style={styles.pillGroupInner}>
          <IconCircleButton icon={BookOpen} accessibilityLabel="Tariflerim" variant="ghost" size="md" onPress={() => router.push("/tariflerim")} />
          <IconCircleButton icon={UserRound} accessibilityLabel="Mutfak kurallarım" variant="white" size="md" onPress={() => router.push("/kurallarim")} />
        </View>
      </GlassView>
    </View>
  );

  if (!plan || !day || !meal) {
    const ended = Boolean(plan);
    return (
      <Screen tone="dark" withTabBar backgroundImage={getDishImage("karniyarik")}>
        {header}
        <View style={styles.headline}>
          <TwoToneHeadline
            tone="dark"
            muted={ended ? "Bu haftanın" : "Haftanı"}
            strong={ended ? "planı bitti" : "birlikte planlayalım"}
            caption={"7 gün\ndengeli menü"}
          />
        </View>
        <View style={styles.spacer} />
        <GlassView style={styles.card}>
          <View style={styles.inviteCard}>
            <View style={styles.thumbStack}>
              {["mercimek_corbasi", "karniyarik", "coban_salata"].map((slug, i) => (
                <Image key={slug} source={getDishImage(slug)} style={[styles.thumb, { marginLeft: i === 0 ? 0 : -18 }]} />
              ))}
            </View>
            <Text style={styles.cardTitle}>{ended ? "Yeni haftaya hazır mısın?" : "Bu hafta ne pişirsem?"}</Text>
            <Text style={styles.cardText}>Birkaç tercih yeter — 7 günlük menü ve reyon reyon market listesi hazır.</Text>
            <View style={styles.inviteCta}>
              <PrimaryButton
                label={ended ? "Yeni haftayı planla" : "Haftalık planımı oluştur"}
                showArrow
                onPress={() => router.push("/plan")}
              />
            </View>
          </View>
        </GlassView>
      </Screen>
    );
  }

  const featured = featuredDish(meal);
  const others = meal.subRecipes.filter((s) => s.subRecipeId !== featured.subRecipeId);
  const plateImage = others.map((s) => getDishImage(s.imageSlug)).find(Boolean) ?? getDishImage(featured.imageSlug);
  const backgroundImage = mealImage(meal);
  // Fotoğrafı olmayan öğünde (çoğu kahvaltı) plan kartındaki ikonun aynısı.
  const FallbackIcon = dishIcon(featured.role, meal.type);
  const mealIdx = meals.findIndex((m) => m.mealId === meal.mealId);

  const moment =
    focus?.relation === "today"
      ? MEAL_TYPE_MOMENT[meal.type]
      : `${focus?.index === 0 && isTomorrow(day.date) ? "Yarın" : day.dayName} ${MOMENT_WORD[meal.type]}`;

  function cycleMeal(step: 1 | -1) {
    const next = meals[(mealIdx + step + meals.length) % meals.length];
    if (next) setMealType(next.type);
  }

  return (
    <Screen
      tone="dark"
      withTabBar
      overlay={swapElement}
      backgroundImage={backgroundImage}
      backgroundFallback={
        <View style={styles.bgFallback}>
          <FallbackIcon size={260} color={colors.accent} strokeWidth={0.75} style={styles.bgFallbackIcon} />
        </View>
      }
    >
      {header}

      <View style={styles.headline}>
        <TwoToneHeadline tone="dark" muted={moment} strong={featured.name} caption={`${totalMinutes(featured)} dk\n${featured.servings} kişilik`} />
      </View>

      <View style={styles.controls}>
        {meals.length > 1 ? (
          <SegmentedPill
            surface="glass"
            options={meals.map((m) => ({ key: m.type, label: MEAL_TYPE_LABELS[m.type] }))}
            value={meal.type}
            onChange={setMealType}
            accessibilityLabel="Öğün seç"
          />
        ) : (
          <View />
        )}
        <IconCircleButton icon={CalendarDays} accessibilityLabel="Haftalık planı aç" variant="white" onPress={() => router.navigate("/haftam")} />
      </View>

      <View style={styles.spacer} />

      <View style={styles.cardWrap}>
        <GlassView style={styles.card}>
          <View style={styles.menuCard}>
            {meals.length > 1 && (
              <>
                <Pressable onPress={() => cycleMeal(-1)} accessibilityRole="button" accessibilityLabel="Önceki öğün" style={[styles.chevron, styles.chevronLeft]}>
                  <ChevronLeft size={22} color={colors.onNightSecondary} />
                </Pressable>
                <Pressable onPress={() => cycleMeal(1)} accessibilityRole="button" accessibilityLabel="Sonraki öğün" style={[styles.chevron, styles.chevronRight]}>
                  <ChevronRight size={22} color={colors.onNight} />
                </Pressable>
              </>
            )}
            <Text style={styles.cardTitle}>{MEAL_TYPE_LABELS[meal.type]} menüsü</Text>
            <Text style={styles.cardText}>{joinTurkish(meal.subRecipes.map((s) => s.name))}</Text>
            <View style={styles.cardFooter}>
              <Pressable onPress={() => router.navigate("/haftam")} accessibilityRole="button" accessibilityLabel="Haftalık planda gör" style={styles.moreLink} hitSlop={8}>
                <Text style={styles.moreText}>{meal.subRecipes.length} TARİF</Text>
                <ArrowUpRight size={16} color={colors.onNight} />
              </Pressable>
              <IconCircleButton icon={ArrowUpRight} accessibilityLabel={`${featured.name} tarifini aç`} variant="accent" size="md" onPress={() => setOpenRecipeId(featured.subRecipeId)} />
            </View>
          </View>
        </GlassView>
        {plateImage ? (
          <Image source={plateImage} style={styles.plate} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.plate, styles.plateFallback]}>
            <FallbackIcon size={56} color={colors.accent} strokeWidth={1.5} />
          </View>
        )}
      </View>

      {openRecipeId && (
        <RecipeDetailModal
          plan={plan}
          openSubRecipeId={openRecipeId}
          onClose={() => setOpenRecipeId(null)}
          onSwap={(mealId, subId) => {
            setOpenRecipeId(null);
            requestSwap(mealId, subId, 450);
          }}
        />
      )}
    </Screen>
  );
}

function isTomorrow(iso: string | undefined): boolean {
  if (!iso) return false;
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const [y, m, d] = iso.split("-").map(Number);
  return t.getFullYear() === y && t.getMonth() + 1 === m && t.getDate() === d;
}

/** "A, B ve C" */
function joinTurkish(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} ve ${parts[parts.length - 1]}`;
}

const PLATE = 128;

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.sm },
  date: { ...textStyle(type.caption), color: colors.onNightSecondary },
  greeting: { ...textStyle(type.bodyMedium), color: colors.onNight },
  pillGroup: { borderRadius: radius.pill },
  pillGroupInner: { flexDirection: "row", gap: 4, padding: 4 },
  headline: { marginTop: space.xxl - 4 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.xl + 4 },
  spacer: { flex: 1, minHeight: PLATE },
  cardWrap: { marginTop: space.xl },
  card: { borderRadius: radius.sheet },
  plate: {
    position: "absolute",
    top: -PLATE / 2,
    alignSelf: "center",
    width: PLATE,
    height: PLATE,
    borderRadius: PLATE / 2,
    borderWidth: 6,
    borderColor: colors.glassBorder,
  },
  plateFallback: { backgroundColor: colors.nightRaised, alignItems: "center", justifyContent: "center" },
  bgFallback: { flex: 1, alignItems: "center", paddingTop: 40 },
  bgFallbackIcon: { opacity: 0.18 },
  menuCard: { paddingTop: PLATE / 2 + space.lg, paddingHorizontal: space.xl, paddingBottom: space.lg, alignItems: "center", gap: 6 },
  chevron: { position: "absolute", top: PLATE / 2 + 4, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  chevronLeft: { left: space.sm },
  chevronRight: { right: space.sm },
  cardTitle: { ...textStyle(type.heading), color: colors.onNight, textAlign: "center" },
  cardText: { ...textStyle(type.helper), color: colors.onNightSecondary, textAlign: "center", maxWidth: 260 },
  cardFooter: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.sm },
  moreLink: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: space.md },
  moreText: { ...textStyle(type.eyebrow), fontSize: 13, color: colors.onNight },
  inviteCard: { padding: space.xl, gap: space.sm, alignItems: "center" },
  thumbStack: { flexDirection: "row", marginBottom: space.sm },
  thumb: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: colors.night },
  inviteCta: { alignSelf: "stretch", marginTop: space.md },
});
