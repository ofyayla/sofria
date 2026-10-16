import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { ChevronLeft, X } from "lucide-react-native";
import { useCallback, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gutter, size, space, tabularNums, textStyle, type } from "../../theme";
import { IconCircleButton } from "./IconCircleButton";
import { ProgressSteps } from "./ProgressSteps";
import { TwoToneHeadline } from "./TwoToneHeadline";

const SCRIM_HEIGHT = 48;

export interface WizardScreenProps {
  stepIndex: number; // 0-indexed
  totalSteps: number;
  headline: { muted: string; strong: string; caption?: string };
  onBack: () => void;
  onClose: () => void;
  /** Sabit alt CTA — içerik hiçbir zaman butonun altında kesilmez. */
  cta: ReactNode;
  children: ReactNode;
}

/**
 * Tüm sihirbaz adımlarının tek iskeleti (koyu ton). Üstte [‹] Adım x/y [✕],
 * ilerleme çubuğu, iki tonlu başlık; altta sabit CTA ve karartma.
 */
export function WizardScreen({ stepIndex, totalSteps, headline, onBack, onClose, cta, children }: WizardScreenProps) {
  const insets = useSafeAreaInsets();
  const ctaBottom = insets.bottom + space.lg;
  const ctaBlockHeight = size.cta + ctaBottom;

  useFocusEffect(useCallback(() => setStatusBarStyle("light"), []));

  return (
    <View style={styles.root}>
      {/* SafeAreaView yerine hook: tam ekran modal İLK açıldığında SafeAreaView
          bir kare boyunca 0 inset okuyup başlığı durum çubuğunun altına itiyordu. */}
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.top}>
          <View style={styles.nav}>
            <IconCircleButton icon={ChevronLeft} accessibilityLabel="Geri" variant="white" onPress={onBack} />
            <Text style={[styles.counter, tabularNums]}>
              Adım {stepIndex + 1} / {totalSteps}
            </Text>
            <IconCircleButton icon={X} accessibilityLabel="Sihirbazı kapat" variant="glass" onPress={onClose} />
          </View>
          <ProgressSteps total={totalSteps} current={stepIndex} />
        </View>

        <ScrollView
          // Her adımda ScrollView yeniden kurulur — yeni adım önceki adımın
          // kaydırma konumundan başlamasın (gerçek kullanıcı testi).
          key={stepIndex}
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: ctaBlockHeight + space.xxl, gap: space.xl }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TwoToneHeadline tone="dark" size="title" muted={headline.muted} strong={headline.strong} {...(headline.caption ? { caption: headline.caption } : {})} />
          {children}
        </ScrollView>

        <LinearGradient
          colors={[colors.scrimClear, colors.night]}
          locations={[0, 0.45]}
          style={[styles.scrim, { height: ctaBlockHeight + SCRIM_HEIGHT }]}
          pointerEvents="none"
        />
        <View style={[styles.ctaContainer, { bottom: ctaBottom }]}>{cta}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safeArea: { flex: 1 },
  top: { paddingHorizontal: gutter, paddingTop: space.sm, gap: space.lg, marginBottom: space.lg },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counter: { ...textStyle(type.helper), fontSize: 15, color: colors.onNightSecondary },
  scroll: { flex: 1, paddingHorizontal: gutter },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0 },
  ctaContainer: { position: "absolute", left: gutter, right: gutter },
});
