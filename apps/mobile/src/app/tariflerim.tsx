import type { CuisineType, RecipeRating } from "@sofria/shared";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bookmark, Star, UtensilsCrossed } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getDishImage } from "../assets/dishImages";
import { RatedRecipeModal } from "../components/shared/RatedRecipeModal";
import { RecipeDetailSheet } from "../components/shared/RecipeDetailSheet";
import { Chip, PrimaryButton, Screen, ScreenHeader, TwoToneHeadline } from "../components/ui";
import { CUISINE_INFO } from "../lib/planDisplay";
import { useRatingsStore } from "../stores/ratings.store";
import { recipeKey, useSavedRecipesStore, type SavedRecipe } from "../stores/savedRecipes.store";
import { fillImage, colors, gutter, radius, space, textStyle, type } from "../theme";

/** Tarif defterindeki bir kalem: puanlanmış, kaydedilmiş ya da ikisi birden. */
interface BookEntry {
  key: string;
  recipeName: string;
  cuisineTag: CuisineType;
  imageSlug: string | undefined;
  at: string;
  rating?: RecipeRating;
  saved?: SavedRecipe;
}

function buildEntries(ratings: RecipeRating[], saved: SavedRecipe[]): BookEntry[] {
  const map = new Map<string, BookEntry>();
  for (const r of ratings) {
    const key = recipeKey(r.sourceMealId, r.sourceSubRecipeId);
    map.set(key, { key, recipeName: r.recipeName, cuisineTag: r.cuisineTag, imageSlug: r.recipeSnapshot?.imageSlug, at: r.ratedAt, rating: r });
  }
  for (const s of saved) {
    const existing = map.get(s.key);
    if (existing) {
      existing.saved = s;
      if (s.savedAt > existing.at) existing.at = s.savedAt;
    } else {
      map.set(s.key, { key: s.key, recipeName: s.recipeName, cuisineTag: s.cuisineTag, imageSlug: s.snapshot.imageSlug, at: s.savedAt, saved: s });
    }
  }
  return [...map.values()].sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Tarif defteri — puanladığın ve "kaydet" ile eklediğin tarifler birlikte.
 */
export default function TariflerimScreen() {
  const router = useRouter();
  const ratings = useRatingsStore((s) => s.ratings);
  const saved = useSavedRecipesStore((s) => s.saved);
  const [activeCuisine, setActiveCuisine] = useState<CuisineType | "hepsi">("hepsi");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const entries = buildEntries(ratings, saved);
  const open = entries.find((e) => e.key === openKey) ?? null;

  const presentCuisines = new Set(entries.map((e) => e.cuisineTag));
  const cuisineTabs = (Object.keys(CUISINE_INFO) as CuisineType[]).filter((c) => presentCuisines.has(c));
  const visible = activeCuisine === "hepsi" ? entries : entries.filter((e) => e.cuisineTag === activeCuisine);

  return (
    <Screen tone="light">
      <ScreenHeader tone="light" title="Tariflerim" />

      <View style={styles.headline}>
        <TwoToneHeadline
          tone="light"
          size="title"
          muted="Tarif"
          strong="defterim"
          caption={entries.length > 0 ? `${entries.length} tarif` : undefined}
        />
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Star size={28} color={colors.ink} />
          </View>
          <Text style={styles.emptyTitle}>Tarif defterin henüz boş</Text>
          <Text style={styles.emptyHint}>Bir tarifi açıp yer imine dokunduğunda ya da puanladığında burada birikir.</Text>
          <PrimaryButton label="Haftalık plana git" tone="light" showArrow onPress={() => router.navigate("/haftam")} />
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
            <Chip label="Hepsi" variant={activeCuisine === "hepsi" ? "filterActive" : "filter"} onPress={() => setActiveCuisine("hepsi")} />
            {cuisineTabs.map((c) => (
              <Chip
                key={c}
                label={CUISINE_INFO[c].label}
                variant={activeCuisine === c ? "filterActive" : "filter"}
                onPress={() => setActiveCuisine(c)}
              />
            ))}
          </ScrollView>

          <View style={styles.grid}>
            {visible.map((item) => (
              <View key={item.key} style={styles.cell}>
                <BookCard entry={item} onPress={() => setOpenKey(item.key)} />
              </View>
            ))}
          </View>
        </>
      )}

      {open?.rating && <RatedRecipeModal rating={open.rating} onClose={() => setOpenKey(null)} />}
      {open && !open.rating && open.saved && <SavedRecipeSheet saved={open.saved} onClose={() => setOpenKey(null)} />}
    </Screen>
  );
}

function SavedRecipeSheet({ saved, onClose }: { saved: SavedRecipe; onClose: () => void }) {
  const snap = saved.snapshot;
  return (
    <RecipeDetailSheet
      {...(saved.mealTitle !== undefined ? { mealTitle: saved.mealTitle } : {})}
      recipeName={saved.recipeName}
      servings={snap.servings}
      prepMinutes={snap.prepMinutes}
      cookMinutes={snap.cookMinutes}
      difficulty={snap.difficulty}
      ingredients={snap.ingredients}
      instructions={snap.instructions}
      cuisineTag={saved.cuisineTag}
      {...(snap.imageSlug !== undefined ? { imageSlug: snap.imageSlug } : {})}
      source="weekly_plan"
      sourceMealId={saved.sourceMealId}
      {...(saved.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: saved.sourceSubRecipeId } : {})}
      recipeSnapshot={snap}
      onClose={onClose}
    />
  );
}

function BookCard({ entry, onPress }: { entry: BookEntry; onPress: () => void }) {
  const image = getDishImage(entry.imageSlug);
  const rating = entry.rating;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        rating
          ? `${entry.recipeName}, ${rating.rating} yıldız${rating.comment ? `, yorum: ${rating.comment}` : ""}`
          : `${entry.recipeName}, kaydedildi, henüz puanlanmadı`
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {image ? (
        <Image source={image} style={fillImage} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cardFallback]}>
          <UtensilsCrossed size={40} color={colors.accent} strokeWidth={1.5} />
        </View>
      )}
      <LinearGradient colors={[colors.scrimClear, colors.scrim]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }} />
      <View style={styles.starBadge}>
        {rating ? (
          <>
            <Star size={12} color={colors.onAccent} fill={colors.onAccent} />
            <Text style={styles.starText}>{rating.rating}</Text>
          </>
        ) : (
          <Bookmark size={13} color={colors.onAccent} fill={colors.onAccent} />
        )}
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {entry.recipeName}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {CUISINE_INFO[entry.cuisineTag].label}
          {rating ? "" : " · Denenmedi"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headline: { marginTop: space.lg, marginBottom: space.xl },
  tabsScroll: { marginHorizontal: -gutter, flexGrow: 0 },
  tabs: { gap: space.sm, paddingHorizontal: gutter, paddingBottom: space.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cell: { width: "48%" },
  card: { height: 210, borderRadius: radius.tile, overflow: "hidden", backgroundColor: colors.night },
  pressed: { opacity: 0.85 },
  cardFallback: { alignItems: "center", justifyContent: "center", paddingBottom: 40 },
  starBadge: {
    position: "absolute",
    top: space.md,
    right: space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  starText: { fontFamily: type.button.font, fontSize: 13, color: colors.onAccent },
  cardText: { position: "absolute", left: 14, right: 14, bottom: 12 },
  cardTitle: { ...textStyle(type.cardTitle), color: colors.onNight },
  cardSub: { ...textStyle(type.caption), fontSize: 12, color: colors.onNightSecondary },
  empty: { alignItems: "center", gap: space.md, paddingTop: space.xxl },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  emptyTitle: { ...textStyle(type.cardTitle), color: colors.ink, textAlign: "center" },
  emptyHint: { ...textStyle(type.helper), color: colors.inkSecondary, textAlign: "center", maxWidth: 280, marginBottom: space.md },
});
