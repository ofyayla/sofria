import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, type ReactNode } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gutter, space, TAB_BAR_CLEARANCE, type Tone } from "../../theme";

export interface ScreenProps {
  children: ReactNode;
  tone: Tone;
  scroll?: boolean;
  /** Koyu ekranlarda tam genişlik fotoğraf zemini; üst kısmı karartılır. */
  backgroundImage?: ImageSourcePropType | undefined;
  /** Fotoğraf yoksa aynı alana çizilecek dekoratif zemin (ör. büyük ikon). */
  backgroundFallback?: ReactNode;
  /** Fotoğrafın başladığı y — üstünde düz gece zemini kalır (başlık okunur). */
  backgroundTop?: number;
  /** Yüzen alt barın altında içerik kesilmesin diye alt boşluk ekler. */
  withTabBar?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  /** Kaydırılmayan, en üstte duran içerik (ör. sabit başlık). */
  overlay?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Her ekranın iskeleti. Ton (koyu/açık) zemin rengini ve durum çubuğunu
 * belirler; durum çubuğu ODAKTA olan ekrana göre ayarlanır (sekmelerde
 * arkadaki ekranlar da mount'lu kaldığı için `<StatusBar>` yeterli değil).
 */
export function Screen({
  children,
  tone,
  scroll = true,
  backgroundImage,
  backgroundFallback,
  backgroundTop = 240,
  withTabBar = false,
  contentContainerStyle,
  overlay,
  style,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(tone === "dark" ? "light" : "dark");
    }, [tone])
  );

  const bottomPad = withTabBar ? TAB_BAR_CLEARANCE : space.xxl;
  const containerStyle = [styles.content, { paddingBottom: bottomPad }, contentContainerStyle];

  return (
    <View style={[styles.root, { backgroundColor: tone === "dark" ? colors.night : colors.canvas }, style]}>
      {!backgroundImage && backgroundFallback && (
        <View style={[StyleSheet.absoluteFill, { top: backgroundTop }]} pointerEvents="none">
          {backgroundFallback}
        </View>
      )}
      {backgroundImage && (
        <View style={[StyleSheet.absoluteFill, { top: backgroundTop }]} pointerEvents="none">
          <Image source={backgroundImage} style={styles.bgImage} resizeMode="cover" />
          <LinearGradient colors={[colors.night, colors.scrimClear]} style={styles.bgScrim} />
        </View>
      )}
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={containerStyle}
            showsVerticalScrollIndicator={false}
            // Klavye açıkken bir butona ilk dokunuş yalnızca klavyeyi
            // kapatmasın, buton da çalışsın (gerçek kullanıcı testi).
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[containerStyle, styles.fill]}>{children}</View>
        )}
        {overlay}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  fill: { flex: 1 },
  content: { paddingHorizontal: gutter, paddingTop: space.sm, flexGrow: 1 },
  bgImage: { position: "absolute", top: 0, left: -40, right: -40, bottom: 0, width: undefined, height: undefined },
  bgScrim: { position: "absolute", top: 0, left: 0, right: 0, height: 240 },
});
