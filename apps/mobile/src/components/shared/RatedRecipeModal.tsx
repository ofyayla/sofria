import type { RecipeRating } from "@sofria/shared";
import { X } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, space, textStyle, type } from "../../theme";
import { useRatingsStore } from "../../stores/ratings.store";
import { IconCircleButton, SecondaryButton } from "../ui";
import { RatingStars } from "./RatingStars";
import { RecipeDetailSheet } from "./RecipeDetailSheet";

/**
 * Tariflerim'de bir tarife dokununca açılır. `recipeSnapshot` olan
 * puanlamalar tam tarif detayını gösterir; olmayanlar (eski kayıtlar)
 * için nazik bir bilgi kartı.
 */
export function RatedRecipeModal({ rating, onClose }: { rating: RecipeRating; onClose: () => void }) {
  const removeRating = useRatingsStore((s) => s.removeRating);
  if (!rating.recipeSnapshot) {
    return (
      <Modal visible animationType="fade" transparent onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat">
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>{rating.recipeName}</Text>
              <IconCircleButton icon={X} accessibilityLabel="Kapat" variant="muted" size="sm" onPress={onClose} />
            </View>
            <RatingStars value={rating.rating} tone="light" size={18} />
            <Text style={styles.hint}>Bu tarifin detayları bu cihaza kaydedilmemiş (eski bir puanlama). Yalnızca puanlama bilgisi saklı.</Text>
            <SecondaryButton
              label="Defterden çıkar"
              onPress={() => {
                removeRating(rating.ratingId);
                onClose();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  const snap = rating.recipeSnapshot;
  return (
    <RecipeDetailSheet
      recipeName={rating.recipeName}
      servings={snap.servings}
      prepMinutes={snap.prepMinutes}
      cookMinutes={snap.cookMinutes}
      difficulty={snap.difficulty}
      ingredients={snap.ingredients}
      instructions={snap.instructions}
      cuisineTag={rating.cuisineTag}
      {...(snap.imageSlug !== undefined ? { imageSlug: snap.imageSlug } : {})}
      source={rating.source}
      sourceMealId={rating.sourceMealId}
      recipeSnapshot={snap}
      {...(rating.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: rating.sourceSubRecipeId } : {})}
      onClose={onClose}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, alignItems: "center", justifyContent: "center", padding: space.xl },
  card: { width: "100%", maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.card, padding: space.xl, gap: space.md },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md },
  title: { flex: 1, ...textStyle(type.heading), color: colors.ink },
  hint: { ...textStyle(type.helper), color: colors.inkSecondary },
});
