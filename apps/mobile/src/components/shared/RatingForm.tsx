import type { CuisineType, RatedRecipeSnapshot } from "@sofria/shared";
import { Star } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRatingsStore } from "../../stores/ratings.store";
import { colors, radius, space, textStyle, type } from "../../theme";
import { PrimaryButton, SecondaryButton } from "../ui";
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
 * Üç hâl: henüz denenmemiş ("Denedim" butonu) → puanlama formu açık
 * (yıldız + opsiyonel yorum) → zaten puanlanmış (salt-okunur).
 * Otomatik yıldız YOK — kullanıcı seçmeden kaydedilemez. Tarif detayının
 * koyu panelinde yaşar.
 */
export function RatingForm(props: RatingFormProps) {
  const ratings = useRatingsStore((s) => s.ratings);
  const addRating = useRatingsStore((s) => s.addRating);
  const existing = ratings.find(
    (r) => r.sourceMealId === props.sourceMealId && r.sourceSubRecipeId === props.sourceSubRecipeId
  );

  const [expanded, setExpanded] = useState(false);
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [comment, setComment] = useState("");

  if (existing) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>Denediniz</Text>
        <RatingStars value={existing.rating} size={20} />
        {existing.comment && <Text style={styles.comment}>“{existing.comment}”</Text>}
      </View>
    );
  }

  if (!expanded) {
    return (
      <View style={styles.wrap}>
        <SecondaryButton label="Denedim, puanla" tone="dark" onPress={() => setExpanded(true)} />
      </View>
    );
  }

  function handleSubmit() {
    if (stars === null) return;
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
      <RatingStars value={stars ?? 0} onChange={setStars} size={30} />
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Yorumunuz (opsiyonel)"
        placeholderTextColor={colors.onNightMuted}
        multiline
        style={styles.input}
        accessibilityLabel="Yorumunuz"
      />
      <PrimaryButton
        label={stars === null ? "Önce yıldız seçin" : "Kaydet"}
        {...(stars === null ? {} : { icon: Star })}
        disabled={stars === null}
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.md,
    paddingTop: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.nightDivider,
    gap: space.md,
  },
  label: { ...textStyle(type.helper), fontFamily: type.bodyMedium.font, color: colors.onNightSecondary },
  comment: { ...textStyle(type.helper), color: colors.onNightSecondary, fontStyle: "italic" },
  input: {
    minHeight: 72,
    borderRadius: radius.input,
    backgroundColor: colors.nightTrack,
    padding: space.lg,
    ...textStyle(type.helper),
    color: colors.onNight,
    textAlignVertical: "top",
  },
});
