import type { CuisineType } from "@sofria/shared";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Chip, PageTitle, Screen } from "../components/ui";
import { RatedRecipeModal } from "../components/shared/RatedRecipeModal";
import { useRatingsStore } from "../stores/ratings.store";
import { colors, radius, shadow, space, type as textType } from "../theme";

const CUISINE_LABELS: Record<CuisineType, string> = {
  kirmizi_et: "Kırmızı Et",
  beyaz_et: "Beyaz Et (Tavuk ve Hindi)",
  balik_urunleri: "Balık Ürünleri",
  sebze_yemekleri: "Sebze Yemekleri",
  ortadogu_mutfagi: "Ortadoğu Mutfağı",
  italyan_mutfagi: "İtalyan Mutfağı",
};

export default function TariflerimScreen() {
  const ratings = useRatingsStore((s) => s.ratings);
  const [activeCuisine, setActiveCuisine] = useState<CuisineType | "hepsi">("hepsi");
  const [openRatingId, setOpenRatingId] = useState<string | null>(null);
  const openRating = ratings.find((r) => r.ratingId === openRatingId) ?? null;

  const presentCuisines = new Set(ratings.map((r) => r.cuisineTag));
  const cuisineTabs = (Object.keys(CUISINE_LABELS) as CuisineType[]).filter((c) => presentCuisines.has(c));
  const visible = activeCuisine === "hepsi" ? ratings : ratings.filter((r) => r.cuisineTag === activeCuisine);

  return (
    <Screen>
      <PageTitle>Tariflerim</PageTitle>
      <Text style={styles.subtitle}>Denediğin ve puanladığın tarifler burada birikir.</Text>

      {ratings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Henüz tarif kaydetmedin</Text>
          <Text style={styles.emptyHint}>İlk planını oluştur veya bir tarifi deneyip puanla.</Text>
        </View>
      ) : (
        <>
          <View style={styles.tabRow}>
            <Chip label="Hepsi" variant={activeCuisine === "hepsi" ? "selected" : "suggested"} onPress={() => setActiveCuisine("hepsi")} />
            {cuisineTabs.map((c) => (
              <Chip key={c} label={CUISINE_LABELS[c]} variant={activeCuisine === c ? "selected" : "suggested"} onPress={() => setActiveCuisine(c)} />
            ))}
          </View>

          <FlatList
            data={visible}
            keyExtractor={(r) => r.ratingId}
            scrollEnabled={false}
            contentContainerStyle={{ gap: space.md }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setOpenRatingId(item.ratingId)}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.recipeName}</Text>
                  <Text style={styles.stars}>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </Text>
                </View>
                <View style={styles.cuisineTag}>
                  <Text style={styles.cuisineTagText}>{CUISINE_LABELS[item.cuisineTag]}</Text>
                </View>
                {item.comment && <Text style={styles.comment}>“{item.comment}”</Text>}
              </Pressable>
            )}
          />
        </>
      )}

      {openRating && <RatedRecipeModal rating={openRating} onClose={() => setOpenRatingId(null)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontFamily: textType.body.font, fontSize: textType.helper.size, color: colors.inkSecondary, marginTop: space.xs, marginBottom: space.xl },
  emptyState: { alignItems: "center", gap: space.sm, paddingVertical: space.xxxl },
  emptyTitle: { fontFamily: textType.cardTitle.font, fontSize: textType.cardTitle.size, color: colors.ink },
  emptyHint: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkMuted, textAlign: "center", maxWidth: 260 },
  tabRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginBottom: space.lg },
  card: { padding: space.lg, borderRadius: radius.card, backgroundColor: colors.surface, gap: space.xs, ...shadow.card },
  cardPressed: { opacity: 0.92 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: space.sm },
  cardTitle: { flex: 1, fontFamily: textType.cardTitle.font, fontSize: textType.cardTitle.size, color: colors.ink },
  stars: { fontFamily: textType.label.font, fontSize: 13, color: colors.brand },
  cuisineTag: { alignSelf: "flex-start", paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.chip, backgroundColor: colors.brandSoft },
  cuisineTagText: { fontFamily: textType.label.font, fontSize: 12, color: colors.brand },
  comment: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkSecondary, fontStyle: "italic" },
});
