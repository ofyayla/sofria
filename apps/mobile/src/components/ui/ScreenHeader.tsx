import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, size, textStyle, type, type Tone } from "../../theme";
import { IconCircleButton } from "./IconCircleButton";

export interface ScreenHeaderProps {
  tone: Tone;
  title?: string;
  /** Verilmezse sol taraf `router.back()` yapan daire geri butonudur. `null` = sol boş. */
  left?: ReactNode | null;
  right?: ReactNode;
  onBack?: () => void;
}

/**
 * [‹]  Başlık  [aksiyon] — referanstaki üst satır. Geri her zaman görünür
 * bir daire buton; logoya dokunup ana sayfaya dönmek gibi gizli
 * davranışlar yok.
 */
export function ScreenHeader({ tone, title, left, right, onBack }: ScreenHeaderProps) {
  const router = useRouter();
  const leftNode =
    left === undefined ? (
      <IconCircleButton
        icon={ChevronLeft}
        accessibilityLabel="Geri"
        variant={tone === "dark" ? "white" : "ink"}
        onPress={onBack ?? (() => router.back())}
      />
    ) : (
      left ?? <View style={styles.spacer} />
    );

  return (
    <View style={styles.row}>
      {leftNode}
      {title ? (
        <Text style={[styles.title, { color: tone === "dark" ? colors.onNight : colors.ink }]} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: size.circleLg },
  spacer: { width: size.circleLg },
  title: { ...textStyle(type.helper), fontSize: 15 },
});
