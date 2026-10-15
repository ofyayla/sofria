import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { ArrowRight, ChefHat, CircleAlert, Star } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/ui";
import { usePlanStore } from "../stores/plan.store";
import { colors, radius, shadow, space, type as textType } from "../theme";

export default function HomeScreen() {
  const currentPlan = usePlanStore((s) => s.currentPlan);
  const planHref = currentPlan ? (`/plan/${currentPlan.planId}` as const) : ("/plan" as const);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Image
          source={require("../../assets/images/sofria-logo-icon.png")}
          style={styles.brandMark}
          resizeMode="contain"
          accessibilityLabel="Sofria"
        />
        <View style={styles.topActions}>
          <Link href="/tariflerim" asChild>
            <Pressable style={styles.iconButton} accessibilityLabel="Tariflerim" accessibilityRole="button" hitSlop={8}>
              <Star size={19} color={colors.brand} />
            </Pressable>
          </Link>
          <Link href="/kurallarim" asChild>
            <Pressable style={styles.iconButton} accessibilityLabel="Kurallarım" accessibilityRole="button" hitSlop={8}>
              <CircleAlert size={19} color={colors.brand} />
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.hero}>
        <Image
          source={require("../../assets/images/sofria-logo-full.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Sofria"
        />
        <Text style={styles.title}>Bu hafta ne pişirsem?</Text>
        <Text style={styles.subtitle}>Tercihlerine göre 7 günlük, dengeli bir yemek planı hazırlayalım.</Text>
      </View>

      <Link href={planHref} asChild>
        <Pressable style={styles.ctaOuter} accessibilityRole="button">
          <LinearGradient
            colors={[colors.ctaFrom, colors.ctaTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.ctaCard, shadow.cta]}
          >
            <View style={styles.ctaIconWrap}>
              <ChefHat size={26} color={colors.onCta} />
            </View>
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>{currentPlan ? "Bu haftaki planım" : "Haftalık Planımı Oluştur"}</Text>
              <Text style={styles.ctaHint}>
                {currentPlan ? "Planını görüntüle, tarifleri aç" : "Birkaç tercih, dengeli bir haftalık menü"}
              </Text>
            </View>
            <ArrowRight size={22} color={colors.onCta} />
          </LinearGradient>
        </Pressable>
      </Link>

      {__DEV__ && (
        // expo-router'ın typed-routes cache'i yeni eklenen rotaları yalnızca
        // canlı dev server dosya izlemesiyle güncelliyor — export/tsc tek
        // seferlik çalıştırmalarında güncellenmiyor (bilinen bir gecikme).
        // Rota gerçekte var ve çalışıyor; cast bu kozmetik gecikmeyi atlatıyor.
        <Link href={"/design-system" as never} style={styles.devLink}>
          <Text style={styles.devLinkText}>Design System (dev)</Text>
        </Link>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.md,
  },
  brandMark: { width: 30, height: 30 },
  topActions: { flexDirection: "row", gap: space.sm },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  hero: { alignItems: "center", marginTop: space.xxl, marginBottom: space.xxl },
  logo: { width: 128, height: 128 },
  title: {
    fontFamily: textType.question.font,
    fontSize: textType.question.size,
    lineHeight: textType.question.lineHeight,
    letterSpacing: textType.question.letterSpacing,
    color: colors.ink,
    marginTop: space.lg,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: textType.body.font,
    fontSize: textType.body.size,
    color: colors.inkSecondary,
    marginTop: space.sm,
    textAlign: "center",
    paddingHorizontal: space.md,
  },
  ctaOuter: { borderRadius: radius.panel },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.panel,
  },
  ctaIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTextWrap: { flex: 1 },
  ctaTitle: { fontFamily: textType.cardTitle.font, fontSize: 18, color: colors.onCta },
  ctaHint: { fontFamily: textType.body.font, fontSize: 14, color: colors.onCta, marginTop: 2, opacity: 0.85 },
  devLink: { alignSelf: "center", marginTop: space.xl, padding: space.sm },
  devLinkText: { fontFamily: textType.label.font, fontSize: 12, color: colors.inkMuted },
});
