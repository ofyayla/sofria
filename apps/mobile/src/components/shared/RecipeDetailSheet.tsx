import { UNIT_LABELS, type CuisineType, type Ingredient, type InstructionStep, type RatedRecipeSnapshot } from "@sofria/shared";
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { getDishImage } from "../../assets/dishImages";
import { RatingForm } from "./RatingForm";
import { colors, radius, space, type as textType } from "../../theme";

const HERO_IMAGE_HEIGHT = 200;

// Yüzde tabanlı maxHeight yerine SABİT bir piksel yüksekliği: üst View'in
// gerçekten "rijit" bir boyu olmadan ScrollView'in kırpma/kaydırma davranışı
// bazı cihazlarda tutarsız çalışıyordu (gerçek kullanıcı testinde tekrar
// tekrar bulundu). Sabit yükseklik + ScrollView'e flex:1 en güvenilir kombinasyon.
const SHEET_HEIGHT_PERCENT = 88;
const SHEET_HEIGHT = Math.round((Dimensions.get("window").height * SHEET_HEIGHT_PERCENT) / 100);

export interface RecipeDetailSheetProps {
  /** Plan akışında öğün başlığı (örn. "Kahvaltı"); Tariflerim akışında yok. */
  mealTitle?: string;
  recipeName: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: "kolay" | "orta" | "zor";
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  cuisineTag: CuisineType;
  /** bkz. dishImages.ts — bulunamazsa görsel alanı hiç gösterilmez (ikona düşülmez, sade kalır). */
  imageSlug?: string;
  source: "weekly_plan" | "quick_meal";
  sourceMealId: string;
  sourceSubRecipeId?: string;
  /** Henüz puanlanmamışsa RatingForm bunu kayda gömer — bkz. rating.ts. */
  recipeSnapshot?: RatedRecipeSnapshot;
  onClose: () => void;
}

/**
 * Hem haftalık plan ekranındaki tarif modalı hem Tariflerim'deki puanlanmış
 * tarif görünümü BU bileşeni kullanır — ikisi de aynı "tarif detayı" sunumunu
 * gösterir, farkları yalnızca veri kaynağıdır (canlı plan vs. kaydedilmiş
 * puanlama anlık görüntüsü).
 */
export function RecipeDetailSheet({
  mealTitle,
  recipeName,
  servings,
  prepMinutes,
  cookMinutes,
  difficulty,
  ingredients,
  instructions,
  cuisineTag,
  imageSlug,
  source,
  sourceMealId,
  sourceSubRecipeId,
  recipeSnapshot,
  onClose,
}: RecipeDetailSheetProps) {
  const heroImage = getDishImage(imageSlug);
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Sayfanın üstündeki boş alan — buraya dokununca kapanır. Kart'ın
            KENDİSİ artık bir Pressable DEĞİL, bu yüzden içindeki ScrollView'la
            dokunuş sahipliği için rekabet etmiyor (gerçek kullanıcı testinde
            bulundu: ekranın ortasından kaydırma bazen çalışmıyordu). */}
        <Pressable style={styles.backdropTapArea} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Gerçek kullanıcı talebi: tarif açılınca malzemeler kısmının
                ÜSTÜNDE gerçek tarif görseli olsun. Görsel ScrollView'in
                PADDINGSIZ doğrudan çocuğu — kenar boşluğu bu View'e değil,
                aşağıdaki contentPad'e ait. Negatif margin + flex `gap`
                kombinasyonu bazı cihazlarda görseli tam kenara oturtmuyordu
                (gerçek kullanıcı testinde bulundu) — bu yapı o sorunu kökten
                ortadan kaldırıyor. */}
            {heroImage && <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />}

            <View style={styles.contentPad}>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  {mealTitle && <Text style={styles.mealTitle}>{mealTitle}</Text>}
                  <Text style={styles.subRecipeName}>{recipeName}</Text>
                </View>
                <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Kapat" hitSlop={8} style={styles.closeButton}>
                  <X size={20} color={colors.inkMuted} />
                </Pressable>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{servings} porsiyon</Text>
                <Text style={styles.metaText}>{prepMinutes + cookMinutes} dk</Text>
                <Text style={styles.metaText}>{difficulty}</Text>
              </View>

              <Text style={styles.sectionTitle}>Malzemeler</Text>
              <View>
                {ingredients.map((ing) => (
                  <View key={ing.slug} style={styles.ingredientRow}>
                    <Text style={styles.ingredientAmount}>
                      {ing.amount} {UNIT_LABELS[ing.unit]}
                    </Text>
                    <Text style={styles.ingredientName}>{ing.displayName}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Yapılışı</Text>
              <View style={{ gap: space.sm }}>
                {instructions.map((step) => (
                  <View key={step.order} style={styles.instructionRow}>
                    <Text style={styles.instructionOrder}>{step.order}.</Text>
                    <Text style={styles.instructionText}>{step.text}</Text>
                  </View>
                ))}
              </View>

              <RatingForm
                source={source}
                sourceMealId={sourceMealId}
                {...(sourceSubRecipeId !== undefined ? { sourceSubRecipeId } : {})}
                recipeName={recipeName}
                cuisineTag={cuisineTag}
                {...(recipeSnapshot !== undefined ? { recipeSnapshot } : {})}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(18,33,26,0.4)" },
  backdropTapArea: { height: `${100 - SHEET_HEIGHT_PERCENT}%` },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    overflow: "hidden", // heroImage'ın negatif margin'le taştığı köşeleri sheet'in yuvarlak hattına kırpar
  },
  scroll: { flex: 1 },
  // Kenar boşluğu BİLEREK burada yok — heroImage'ın tam genişlikte, tam
  // kenara oturması gerekiyor. Metin/liste içeriğinin kenar boşluğu contentPad'de.
  scrollContent: { paddingBottom: space.xl },
  heroImage: {
    width: "100%",
    height: HERO_IMAGE_HEIGHT,
    backgroundColor: colors.surfaceMuted,
  },
  contentPad: { paddingHorizontal: space.xl, paddingTop: space.xl, gap: space.lg },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: space.md },
  mealTitle: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkMuted, marginBottom: 2 },
  subRecipeName: { fontFamily: textType.cardTitle.font, fontSize: 20, color: colors.ink },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  metaRow: { flexDirection: "row", gap: space.md },
  metaText: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.inkMuted },
  sectionTitle: { fontFamily: textType.label.font, fontSize: textType.label.size, color: colors.inkSecondary, marginTop: space.sm },
  ingredientRow: {
    flexDirection: "row",
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  ingredientAmount: { fontFamily: textType.body.font, fontSize: 14, color: colors.brand, fontVariant: ["tabular-nums"], minWidth: 72 },
  ingredientName: { fontFamily: textType.body.font, fontSize: 15, color: colors.inkSecondary, flexShrink: 1 },
  instructionRow: { flexDirection: "row", gap: space.sm },
  instructionOrder: { fontFamily: textType.body.font, fontSize: 15, color: colors.inkMuted, minWidth: 18 },
  instructionText: { fontFamily: textType.body.font, fontSize: 15, color: colors.inkSecondary, flex: 1 },
});
