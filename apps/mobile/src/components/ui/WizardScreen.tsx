import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gutter, space, type as textType } from "../../theme";
import { BrandIcon } from "./BrandIcon";
import { ProgressSteps } from "./ProgressSteps";

const CTA_HEIGHT = 60;
const SCRIM_HEIGHT = 32;

export interface WizardScreenProps {
  title: string;
  label?: string;
  stepIndex: number; // 0-indexed
  totalSteps: number;
  onBack?: () => void;
  /** Verilmezse sabit CTA alanı/scrim hiç render edilmez (örn. Özet adımı kendi butonunu içerikte gösterir). */
  cta?: ReactNode;
  children: ReactNode;
}

/**
 * design-system.md §4 "Ekran iskeleti" — TÜM sihirbaz ekranları bu tek
 * bileşeni kullanır; her ekranın kendi SafeAreaView + ScrollView kurgusunu
 * yazması yasaktır. CTA sabit, üstünde 32pt scrim, içerik hiçbir zaman
 * butonun altında kesilmez.
 */
export function WizardScreen({ title, label, stepIndex, totalSteps, onBack, cta, children }: WizardScreenProps) {
  const insets = useSafeAreaInsets();
  const ctaBottom = insets.bottom + space.lg;
  const ctaBlockHeight = cta ? CTA_HEIGHT + ctaBottom : 0;

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.nav}>
          {onBack ? (
            <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Geri" hitSlop={8} style={styles.backButton}>
              <ChevronLeft size={22} color={colors.ink} />
              <Text style={styles.backLabel}>Geri</Text>
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
          <Text style={[styles.stepCounter]} accessibilityElementsHidden>
            {stepIndex + 1} / {totalSteps}
          </Text>
        </View>

        <View style={styles.progressWrap}>
          <ProgressSteps total={totalSteps} current={stepIndex} />
        </View>

        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.titleRow}>
          <BrandIcon size={20} />
          <Text style={styles.title}>{title}</Text>
        </View>

        <ScrollView
          // Gerçek kullanıcı talebi: bu ScrollView TÜM adımlar arasında AYNI
          // örnek olarak kalıyordu — bir adımda aşağı kaydırıp "İleri"ye
          // basınca yeni adım da önceki kaydırma konumundan (bazen en alttan)
          // başlıyordu. `key={stepIndex}` her adımda ScrollView'i yeniden
          // kurar, kaydırma konumu adım değişince otomatik sıfırlanır.
          key={stepIndex}
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: ctaBlockHeight + space.xxl }}
          showsVerticalScrollIndicator={false}
          // bkz. Screen.tsx — aynı düzeltme: klavye açıkken bir butona ilk
          // dokunuş yalnızca klavyeyi kapatmasın, buton da hemen çalışsın.
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {cta && (
          <>
            <LinearGradient
              colors={[colors.bgBottom, `${colors.bgBottom}00`]}
              style={[styles.scrim, { bottom: ctaBlockHeight }]}
              pointerEvents="none"
            />
            <View style={[styles.ctaContainer, { bottom: ctaBottom }]}>{cta}</View>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingHorizontal: gutter,
  },
  backButton: { flexDirection: "row", alignItems: "center", minWidth: 44, minHeight: 44 },
  backLabel: {
    fontFamily: textType.body.font,
    fontSize: textType.body.size,
    color: colors.ink,
  },
  stepCounter: {
    fontFamily: textType.label.font,
    fontSize: textType.label.size,
    color: colors.inkSecondary,
    fontVariant: ["tabular-nums"],
  },
  progressWrap: { paddingHorizontal: gutter, marginBottom: space.lg },
  label: {
    paddingHorizontal: gutter,
    fontFamily: textType.label.font,
    fontSize: textType.label.size,
    lineHeight: textType.label.lineHeight,
    color: colors.inkSecondary,
    marginBottom: space.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: gutter,
    marginBottom: space.lg,
  },
  title: {
    fontFamily: textType.screenTitle.font,
    fontSize: textType.screenTitle.size,
    lineHeight: textType.screenTitle.lineHeight,
    letterSpacing: textType.screenTitle.letterSpacing,
    color: textType.screenTitle.color,
  },
  scroll: { flex: 1, paddingHorizontal: gutter },
  scrim: { position: "absolute", left: 0, right: 0, height: SCRIM_HEIGHT },
  ctaContainer: { position: "absolute", left: gutter, right: gutter },
});
