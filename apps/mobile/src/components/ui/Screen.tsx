import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, gutter } from "../../theme";

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
}

/**
 * design-system.md imza öğesi: "Tezgâh gradyanı" — zemin yukarıdan aşağıya
 * bgTop→bgBottom. Uygulamadaki TEK dekoratif gradyan yeri (bir de CTA
 * butonu) — başka hiçbir yere gradyan konmaz.
 */
export function Screen({ children, scroll = true, contentContainerStyle }: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      // Varsayılan "never" ile klavye açıkken bir butona ilk dokunuş yalnızca
      // klavyeyi kapatıyor, buton basılmıyor — ikinci dokunuş gerekiyordu
      // (gerçek kullanıcı testinde bulundu: malzeme ekle "+" butonu).
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: gutter, flexGrow: 1 },
});
