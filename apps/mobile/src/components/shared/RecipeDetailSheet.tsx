import { UNIT_LABELS, type CuisineType, type Ingredient, type InstructionStep, type RatedRecipeSnapshot } from "@sofria/shared";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Bookmark, ChevronDown, Clock, Flame, RefreshCw, Share2, Users, UtensilsCrossed, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, Platform, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDishImage } from "../../assets/dishImages";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { DIFFICULTY_LABELS } from "../../lib/planDisplay";
import { useRatingsStore } from "../../stores/ratings.store";
import { recipeKey, useSavedRecipesStore } from "../../stores/savedRecipes.store";
import { fillImage, colors, gutter, radius, space, tabularNums, textStyle, toTurkishUpperCase, type } from "../../theme";
import { GlassView, IconCircleButton, SegmentedPill } from "../ui";
import { RatingForm } from "./RatingForm";

const HERO_HEIGHT = 420;
const SHEET_OVERLAP = 56;

export interface RecipeDetailSheetProps {
  /** Üst etiket — plan akışında öğün türü ("Akşam · Ana yemek"); Tariflerim'de yok. */
  mealTitle?: string;
  recipeName: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: "kolay" | "orta" | "zor";
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  cuisineTag: CuisineType;
  /** Bulunamazsa fotoğraf alanında `fallbackIcon` gösterilir. */
  imageSlug?: string;
  /** Fotoğrafı olmayan tarifte hero'da gösterilecek ikon (bkz. lib/dishIcon). */
  fallbackIcon?: LucideIcon;
  source: "weekly_plan" | "quick_meal";
  sourceMealId: string;
  sourceSubRecipeId?: string;
  /** Henüz puanlanmamışsa RatingForm bunu kayda gömer — bkz. rating.ts. */
  recipeSnapshot?: RatedRecipeSnapshot;
  onClose: () => void;
  /** Plan akışında: bu yemeğin yerine başka bir yemek seç (bkz. usePlanSwap). */
  onSwap?: () => void;
}

type Tab = "ingredients" | "steps";

/**
 * Tarif detayı — plan ekranı da Tariflerim de bunu kullanır. Tam ekran:
 * üstte fotoğraf ve yüzen daire butonlar, altında fotoğrafın üstüne binen
 * koyu içerik paneli.
 */
export function RecipeDetailSheet(props: RecipeDetailSheetProps) {
  const { mealTitle, recipeName, servings, prepMinutes, cookMinutes, difficulty, ingredients, instructions, imageSlug, onClose } = props;
  const heroImage = getDishImage(imageSlug);
  const HeroIcon = props.fallbackIcon ?? UtensilsCrossed;
  const [tab, setTab] = useState<Tab>("ingredients");
  const insets = useSafeAreaInsets();
  const saveKey = recipeKey(props.sourceMealId, props.sourceSubRecipeId);
  const isSaved = useSavedRecipesStore((s) => s.saved.some((r) => r.key === saveKey));
  const toggleSaved = useSavedRecipesStore((s) => s.toggleSaved);
  const removeSaved = useSavedRecipesStore((s) => s.remove);
  // Puanlanmış tarif de defterdedir (Tariflerim ikisini birlikte listeler) —
  // yer imi onu da "defterde" gösterir ve çıkarırken puanı da siler.
  const rating = useRatingsStore((s) =>
    s.ratings.find((r) => r.sourceMealId === props.sourceMealId && r.sourceSubRecipeId === props.sourceSubRecipeId)
  );
  const removeRating = useRatingsStore((s) => s.removeRating);
  const inBook = isSaved || Boolean(rating);
  const [toast, setToast] = useState<string | null>(null);

  // Reanimated `entering` yerine paylaşılan değer — `entering` içeriği
  // visibility:hidden başlatıyor ve bazen hiç açmıyordu (bkz. haftam.tsx).
  const toastOpacity = useSharedValue(0);
  const toastStyle = useAnimatedStyle(() => ({ opacity: toastOpacity.value, transform: [{ translateY: (1 - toastOpacity.value) * 12 }] }));
  useEffect(() => {
    if (!toast) return;
    toastOpacity.value = 0;
    toastOpacity.value = withTiming(1, { duration: 200 });
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast, toastOpacity]);

  function removeFromBook() {
    if (rating) removeRating(rating.ratingId);
    if (isSaved) removeSaved(saveKey);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToast("Tarif defterinden çıkarıldı");
  }

  function handleToggleSaved() {
    if (rating) {
      const title = "Tarif defterinden çıkarılsın mı?";
      const message = "Bu tarife verdiğin puan ve yorum da silinecek.";
      if (Platform.OS === "web") {
        // react-native-web'de Alert.alert butonsuz; tarayıcı onayına düşülür.
        if (window.confirm(`${title}\n${message}`)) removeFromBook();
      } else {
        Alert.alert(title, message, [
          { text: "Vazgeç", style: "cancel" },
          { text: "Çıkar", style: "destructive", onPress: removeFromBook },
        ]);
      }
      return;
    }
    if (!props.recipeSnapshot) return;
    const nowSaved = toggleSaved({
      sourceMealId: props.sourceMealId,
      ...(props.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: props.sourceSubRecipeId } : {}),
      recipeName,
      cuisineTag: props.cuisineTag,
      ...(mealTitle !== undefined ? { mealTitle } : {}),
      snapshot: props.recipeSnapshot,
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToast(nowSaved ? "Tarif defterine eklendi" : "Tarif defterinden çıkarıldı");
  }

  async function shareRecipe() {
    const lines = [
      recipeName,
      `${servings} kişilik · ${prepMinutes + cookMinutes} dk`,
      "",
      "Malzemeler:",
      ...ingredients.map((i) => `• ${i.amount} ${UNIT_LABELS[i.unit]} ${i.displayName}`),
      "",
      "Yapılışı:",
      ...instructions.map((s) => `${s.order}. ${s.text}`),
    ];
    await Share.share({ message: lines.join("\n") });
  }

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.hero}>
            {heroImage ? (
              <Image source={heroImage} style={fillImage} resizeMode="cover" />
            ) : (
              <View style={styles.heroFallback}>
                <HeroIcon size={120} color={colors.accent} strokeWidth={1.25} />
              </View>
            )}
            <LinearGradient colors={[colors.backdrop, colors.scrimClear]} style={styles.heroTopScrim} />
          </View>

          <View style={styles.panel}>
            <View style={styles.handle} />
            <View style={styles.titleBlock}>
              {mealTitle && <Text style={styles.eyebrow}>{toTurkishUpperCase(mealTitle)}</Text>}
              <Text style={styles.title} accessibilityRole="header">
                {recipeName}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MetaPill icon={Clock} label={`${prepMinutes + cookMinutes} dk`} />
              <MetaPill icon={Users} label={`${servings} kişi`} />
              <MetaPill icon={Flame} label={DIFFICULTY_LABELS[difficulty]} />
            </View>

            <SegmentedPill
              options={[
                { key: "ingredients", label: `Malzemeler · ${ingredients.length}` },
                { key: "steps", label: `Yapılışı · ${instructions.length}` },
              ]}
              value={tab}
              onChange={setTab}
              stretch
              accessibilityLabel="Tarif bölümü"
            />

            {tab === "ingredients" ? (
              <View>
                {ingredients.map((ing, i) => (
                  <View key={ing.slug} style={[styles.ingredientRow, i === ingredients.length - 1 && styles.lastRow]}>
                    <Text style={[styles.ingredientAmount, tabularNums]}>
                      {ing.amount} {UNIT_LABELS[ing.unit]}
                    </Text>
                    <Text style={styles.ingredientName}>{ing.displayName}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.steps}>
                {instructions.map((step) => (
                  <View key={step.order} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={[styles.stepBadgeText, tabularNums]}>{step.order}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))}
              </View>
            )}

            <RatingForm
              source={props.source}
              sourceMealId={props.sourceMealId}
              {...(props.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: props.sourceSubRecipeId } : {})}
              recipeName={recipeName}
              cuisineTag={props.cuisineTag}
              {...(props.recipeSnapshot !== undefined ? { recipeSnapshot: props.recipeSnapshot } : {})}
            />
          </View>
        </ScrollView>

        <View style={[styles.floatingBar, { paddingTop: insets.top }]} pointerEvents="box-none">
          <View style={styles.floatingRow} pointerEvents="box-none">
            <IconCircleButton icon={ChevronDown} accessibilityLabel="Tarifi kapat" variant="white" onPress={onClose} />
            <View style={styles.floatingActions}>
              {props.onSwap && (
                <IconCircleButton icon={RefreshCw} accessibilityLabel="Bu yemeği değiştir" variant="glass" size="md" onPress={props.onSwap} />
              )}
              {(props.recipeSnapshot || inBook) && (
                <IconCircleButton
                  icon={Bookmark}
                  accessibilityLabel={inBook ? "Tarif defterinden çıkar" : "Tarif defterine ekle"}
                  variant={inBook ? "accent" : "glass"}
                  iconFilled={inBook}
                  selected={inBook}
                  size="md"
                  onPress={handleToggleSaved}
                />
              )}
              <IconCircleButton icon={Share2} accessibilityLabel="Tarifi paylaş" variant="glass" size="md" onPress={() => void shareRecipe()} />
            </View>
          </View>
        </View>
        {toast && (
          <Animated.View
            style={[styles.toast, { bottom: insets.bottom + space.xl }, toastStyle]}
            pointerEvents="none"
            accessibilityLiveRegion="polite"
          >
            <Bookmark size={16} color={colors.onAccent} fill={inBook ? colors.onAccent : "transparent"} />
            <Text style={styles.toastText}>{toast}</Text>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

function MetaPill({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <GlassView style={styles.metaPill}>
      <View style={styles.metaPillInner}>
        <Icon size={16} color={colors.onNight} />
        <Text style={[styles.metaText, tabularNums]}>{label}</Text>
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  scrollContent: { paddingBottom: space.xxxl },
  hero: { height: HERO_HEIGHT, backgroundColor: colors.nightRaised },
  heroFallback: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: SHEET_OVERLAP },
  heroTopScrim: { position: "absolute", left: 0, right: 0, top: 0, height: 140 },
  panel: {
    marginTop: -SHEET_OVERLAP,
    backgroundColor: colors.night,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: gutter,
    paddingTop: space.md,
    gap: space.lg,
    minHeight: 500,
  },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.nightDivider },
  titleBlock: { gap: 2 },
  eyebrow: { ...textStyle(type.eyebrow), color: colors.onNightMuted },
  title: { ...textStyle(type.title), color: colors.onNight },
  metaRow: { flexDirection: "row", gap: space.sm, flexWrap: "wrap" },
  metaPill: { borderRadius: radius.pill },
  metaPillInner: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 14 },
  metaText: { ...textStyle(type.helper), color: colors.onNight },
  ingredientRow: {
    flexDirection: "row",
    gap: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.nightDivider,
  },
  lastRow: { borderBottomWidth: 0 },
  // Lime koyu zeminde metin olarak okunur (~14:1) — açık zeminde asla.
  ingredientAmount: { ...textStyle(type.body), color: colors.accent, minWidth: 84 },
  ingredientName: { ...textStyle(type.body), color: colors.onNight, flexShrink: 1 },
  steps: { gap: space.lg },
  stepRow: { flexDirection: "row", gap: 14 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginTop: -2 },
  stepBadgeText: { fontFamily: type.button.font, fontSize: 14, color: colors.onAccent },
  stepText: { ...textStyle(type.body), color: colors.onNightSecondary, flex: 1 },
  floatingBar: { position: "absolute", top: 0, left: 0, right: 0 },
  floatingActions: { flexDirection: "row", gap: space.sm },
  toast: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    height: 48,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  toastText: { ...textStyle(type.button), fontSize: 15, color: colors.onAccent },
  floatingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: gutter, paddingTop: space.sm },
});
