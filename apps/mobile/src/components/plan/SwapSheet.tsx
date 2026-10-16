import type { SubRecipe, UserPreferencesPayload, WeeklyPlanResponse } from "@sofria/shared";
import * as Haptics from "expo-haptics";
import { Check, ChevronRight, RefreshCw, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDishImage } from "../../assets/dishImages";
import { findCatalogRecipe, suggestReplacements } from "../../engine";
import { dishIcon } from "../../lib/dishIcon";
import { CUISINE_INFO, MEAL_TYPE_LABELS, ROLE_LABELS, totalMinutes } from "../../lib/planDisplay";
import { colors, gutter, radius, space, tabularNums, textStyle, toTurkishUpperCase, type } from "../../theme";
import { IconCircleButton, SecondaryButton } from "../ui";

export interface SwapSheetProps {
  plan: WeeklyPlanResponse;
  payload: UserPreferencesPayload;
  mealId: string;
  subRecipeId: string;
  /** "Bir daha önerme" listesi — alternatiflerde de çıkmaz. */
  dislikedSlugs: ReadonlySet<string>;
  onPick: (replacement: SubRecipe, dislikeCurrent: boolean) => void;
  onClose: () => void;
}

/**
 * "Bunun yerine…" paneli — beğenilmeyen yemek için planla AYNI kurallara uyan
 * 3 alternatif. Rastgele tek dokunuşla değiştirmek yerine kullanıcı görerek
 * seçer; "Başka öner" yeni 3'lü getirir, mutfakta seçenek kalmazsa diğer
 * mutfaklara bakılabilir.
 */
export function SwapSheet({ plan, payload, mealId, subRecipeId, dislikedSlugs, onPick, onClose }: SwapSheetProps) {
  const insets = useSafeAreaInsets();
  const meal = plan.days.flatMap((d) => d.meals).find((m) => m.mealId === mealId);
  const current = meal?.subRecipes.find((s) => s.subRecipeId === subRecipeId);

  const [shown, setShown] = useState<Set<string>>(new Set());
  const [allowOtherCuisines, setAllowOtherCuisines] = useState(false);
  const [dislike, setDislike] = useState(false);
  // Öneriler rastgele sıralanır — her render'da değişmesin diye yalnızca
  // "Başka öner" / "Diğer mutfaklar" ile yeniden hesaplanır.
  const [round, setRound] = useState(0);
  const options = useMemo(
    () =>
      suggestReplacements({
        days: plan.days,
        mealId,
        subRecipeId,
        payload,
        excludedSlugs: new Set([...dislikedSlugs, ...shown]),
        allowOtherCuisines,
      }),
    // `round` bilerek bağımlılıkta: aynı girdilerle yeni bir 3'lü istenir.
    [round, allowOtherCuisines, plan.planId, mealId, subRecipeId]
  );

  if (!meal || !current) return null;

  const exhausted = options.length === 0 && shown.size > 0;
  const noneAtAll = options.length === 0 && shown.size === 0;

  function showMore() {
    const next = new Set(shown);
    for (const o of options) {
      const slug = findCatalogRecipe(o)?.slug;
      if (slug) next.add(slug);
    }
    setShown(next);
    setRound((r) => r + 1);
  }

  function restart() {
    setShown(new Set());
    setRound((r) => r + 1);
  }

  const isBreakfast = meal.type === "kahvalti";
  const label = isBreakfast ? MEAL_TYPE_LABELS[meal.type] : `${MEAL_TYPE_LABELS[meal.type]} · ${ROLE_LABELS[current.role]}`;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityLabel="Kapat" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.eyebrow}>{toTurkishUpperCase(label)} · DEĞİŞTİR</Text>
              <Text style={styles.title} accessibilityRole="header">
                Bunun yerine…
              </Text>
              <Text style={styles.current} numberOfLines={1}>
                Şu an: {current.name}
              </Text>
            </View>
            <IconCircleButton icon={X} accessibilityLabel="Kapat" variant="glass" size="sm" onPress={onClose} />
          </View>

          <View style={styles.options}>
            {options.map((opt) => (
              <OptionRow
                key={opt.subRecipeId}
                sub={opt}
                mealType={meal.type}
                mealCuisine={meal.cuisineTag}
                onPress={() => {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onPick(opt, dislike);
                }}
              />
            ))}

            {noneAtAll && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {allowOtherCuisines
                    ? "Kurallarına uyan başka bir tarif bulamadık."
                    : "Bu mutfakta kurallarına uyan başka bir tarif yok."}
                </Text>
                {!allowOtherCuisines && !isBreakfast && (
                  <SecondaryButton label="Diğer mutfaklardan göster" tone="dark" onPress={() => setAllowOtherCuisines(true)} />
                )}
              </View>
            )}
            {exhausted && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Başka seçenek kalmadı.</Text>
                <SecondaryButton label="Baştan göster" tone="dark" onPress={restart} />
                {!allowOtherCuisines && !isBreakfast && (
                  <SecondaryButton label="Diğer mutfaklardan göster" tone="dark" onPress={() => setAllowOtherCuisines(true)} />
                )}
              </View>
            )}
          </View>

          {options.length > 0 && (
            <Pressable onPress={showMore} accessibilityRole="button" style={styles.moreButton} hitSlop={6}>
              <RefreshCw size={16} color={colors.onNight} />
              <Text style={styles.moreText}>Başka öner</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              setDislike((d) => !d);
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: dislike }}
            style={styles.dislikeRow}
          >
            <View style={[styles.checkbox, dislike && styles.checkboxOn]}>
              {dislike && <Check size={14} color={colors.onAccent} strokeWidth={3} />}
            </View>
            <View style={styles.flex}>
              <Text style={styles.dislikeTitle}>"{current.name}" bir daha önerilmesin</Text>
              <Text style={styles.dislikeHint}>Sonraki planlarda çıkmaz. Kurallarım'dan geri alabilirsin.</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function OptionRow({
  sub,
  mealType,
  mealCuisine,
  onPress,
}: {
  sub: SubRecipe;
  mealType: "kahvalti" | "ogle" | "aksam";
  mealCuisine: keyof typeof CUISINE_INFO;
  onPress: () => void;
}) {
  const image = getDishImage(sub.imageSlug);
  const Icon = dishIcon(sub.role, mealType);
  const recipe = findCatalogRecipe(sub);
  const otherCuisine = mealType !== "kahvalti" && recipe && !recipe.cuisineTags.includes(mealCuisine) ? recipe.cuisineTags[0] : undefined;
  const kcal = sub.estimatedKcalPerServing ? ` · ~${sub.estimatedKcalPerServing} kcal` : "";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sub.name}, ${totalMinutes(sub)} dakika. Bununla değiştir`}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
    >
      {image ? (
        <Image source={image} style={styles.optionImage} />
      ) : (
        <View style={[styles.optionImage, styles.optionIcon]}>
          <Icon size={26} color={colors.accent} />
        </View>
      )}
      <View style={styles.flex}>
        <Text style={styles.optionName} numberOfLines={2}>
          {sub.name}
        </Text>
        <Text style={[styles.optionMeta, tabularNums]}>
          {totalMinutes(sub)} dk{kcal}
          {otherCuisine ? ` · ${CUISINE_INFO[otherCuisine].label}` : ""}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.onNightMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: "flex-end" },
  backdropTap: { flex: 1 },
  sheet: {
    backgroundColor: colors.night,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: gutter,
    paddingTop: space.md,
    gap: space.lg,
  },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.nightDivider },
  header: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  flex: { flex: 1 },
  eyebrow: { ...textStyle(type.eyebrow), color: colors.onNightMuted },
  title: { ...textStyle(type.title), color: colors.onNight, marginTop: 2 },
  current: { ...textStyle(type.helper), color: colors.onNightSecondary, marginTop: 2 },
  options: { gap: space.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.sm,
    paddingRight: space.lg,
    borderRadius: radius.tile,
    backgroundColor: colors.nightTrack,
    borderWidth: 1,
    borderColor: colors.nightDivider,
  },
  pressed: { opacity: 0.75 },
  optionImage: { width: 64, height: 64, borderRadius: 18 },
  optionIcon: { backgroundColor: colors.nightRaised, alignItems: "center", justifyContent: "center" },
  optionName: { ...textStyle(type.cardTitle), color: colors.onNight },
  optionMeta: { ...textStyle(type.caption), color: colors.onNightSecondary, marginTop: 2 },
  empty: { gap: space.md, paddingVertical: space.sm },
  emptyText: { ...textStyle(type.body), color: colors.onNightSecondary },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  moreText: { ...textStyle(type.button), fontSize: 15, color: colors.onNight },
  dislikeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.nightDivider,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.onNightMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  dislikeTitle: { ...textStyle(type.helper), fontFamily: type.bodyMedium.font, color: colors.onNight },
  dislikeHint: { ...textStyle(type.caption), fontSize: 12, color: colors.onNightMuted },
});
