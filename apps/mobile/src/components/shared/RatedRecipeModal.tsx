import type { RecipeRating } from "@sofria/shared";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { colors, radius, space, type as textType } from "../../theme";
import { RecipeDetailSheet } from "./RecipeDetailSheet";

/**
 * Gerçek kullanıcı talebi: Tariflerim'de bir tarife dokununca açılmıyordu —
 * eskiden kart tıklanamazdı ve puanlama kaydı zaten yalnızca ad/yıldız
 * tutuyordu (bkz. rating.ts). Bu bileşen bu ekrandaki "aç" işlevini sağlar;
 * `recipeSnapshot` olan (bu düzeltmeden SONRA kaydedilmiş) puanlamalar için
 * tam tarif detayını gösterir, olmayanlar (eski kayıtlar) için nazik bir
 * bilgi mesajı gösterir.
 */
export function RatedRecipeModal({ rating, onClose }: { rating: RecipeRating; onClose: () => void }) {
  if (!rating.recipeSnapshot) {
    return (
      <Modal visible animationType="fade" transparent onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>{rating.recipeName}</Text>
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Kapat" hitSlop={8} style={styles.closeButton}>
                <X size={18} color={colors.inkMuted} />
              </Pressable>
            </View>
            <Text style={styles.hint}>
              Bu tarifin detayları bu cihaza kaydedilmemiş (eski bir puanlama). Yalnızca puanlama bilgisi saklı.
            </Text>
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
      imageSlug={snap.imageSlug}
      source={rating.source}
      sourceMealId={rating.sourceMealId}
      {...(rating.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: rating.sourceSubRecipeId } : {})}
      onClose={onClose}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(18,33,26,0.4)", alignItems: "center", justifyContent: "center", padding: space.xl },
  card: { width: "100%", maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.panel, padding: space.xl, gap: space.md },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: space.md },
  title: { flex: 1, fontFamily: textType.cardTitle.font, fontSize: 18, color: colors.ink },
  closeButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMuted },
  hint: { fontFamily: textType.body.font, fontSize: 14, color: colors.inkSecondary, lineHeight: 20 },
});
