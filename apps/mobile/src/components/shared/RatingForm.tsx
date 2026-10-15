import type { CuisineType, RatedRecipeSnapshot } from "@sofria/shared";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRatingsStore } from "../../stores/ratings.store";
import { colors, radius, space, type as textType } from "../../theme";
import { RatingStars } from "./RatingStars";

export interface RatingFormProps {
  source: "weekly_plan" | "quick_meal";
  sourceMealId: string;
  sourceSubRecipeId?: string;
  recipeName: string;
  cuisineTag: CuisineType;
  /** Tarifin tamamı — Tariflerim'den kaynak plan gitse bile tekrar açılabilsin diye kayda gömülür. */
  recipeSnapshot?: RatedRecipeSnapshot;
}

/**
 * Web'deki RecipeRatingForm ile aynı üç hâl: henüz denenmemiş ("Denedim"
 * butonu) → puanlama formu açık (yıldız + opsiyonel yorum) → zaten
 * puanlanmış (salt-okunur). Otomatik 5 yıldız YOK — kullanıcı seçer.
 */
export function RatingForm(props: RatingFormProps) {
  const ratings = useRatingsStore((s) => s.ratings);
  const addRating = useRatingsStore((s) => s.addRating);
  const existing = ratings.find(
    (r) => r.sourceMealId === props.sourceMealId && r.sourceSubRecipeId === props.sourceSubRecipeId
  );

  const [expanded, setExpanded] = useState(false);
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");

  if (existing) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>Denediniz</Text>
        <RatingStars value={existing.rating} size={18} />
        {existing.comment && <Text style={styles.comment}>“{existing.comment}”</Text>}
      </View>
    );
  }

  if (!expanded) {
    return (
      <View style={styles.wrap}>
        <Pressable style={styles.triedButton} onPress={() => setExpanded(true)}>
          <Text style={styles.triedButtonLabel}>Denedim</Text>
        </Pressable>
      </View>
    );
  }

  function handleSubmit() {
    addRating({
      ratingId: `${props.sourceMealId}-${props.sourceSubRecipeId ?? "meal"}-${Date.now()}`,
      source: props.source,
      sourceMealId: props.sourceMealId,
      ...(props.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: props.sourceSubRecipeId } : {}),
      recipeName: props.recipeName,
      cuisineTag: props.cuisineTag,
      rating: stars,
      ...(comment.trim().length > 0 ? { comment: comment.trim() } : {}),
      ratedAt: new Date().toISOString(),
      ...(props.recipeSnapshot !== undefined ? { recipeSnapshot: props.recipeSnapshot } : {}),
    });
    setExpanded(false);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Bu tarifi nasıl buldunuz?</Text>
      <RatingStars value={stars} onChange={setStars} />
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Yorumunuz (opsiyonel)"
        placeholderTextColor={colors.inkMuted}
        multiline
        style={styles.input}
      />
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonLabel}>Kaydet</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.divider, gap: space.sm },
  label: { fontFamily: textType.label.font, fontSize: textType.label.size, color: colors.inkSecondary },
  comment: { fontFamily: textType.body.font, fontSize: 14, color: colors.inkSecondary, fontStyle: "italic", marginTop: 2 },
  triedButton: { height: 44, borderRadius: radius.button, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  triedButtonLabel: { fontFamily: textType.label.font, fontSize: 15, color: colors.inkSecondary },
  input: {
    minHeight: 60,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceMuted,
    padding: space.md,
    fontFamily: textType.body.font,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: "top",
  },
  submitButton: { height: 44, borderRadius: radius.button, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  submitButtonLabel: { fontFamily: textType.label.font, fontSize: 15, fontWeight: "600", color: colors.onBrand },
});
