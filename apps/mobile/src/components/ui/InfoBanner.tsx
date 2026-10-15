import { AlertTriangle, CircleAlert, Info, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, type as textType } from "../../theme";

export type InfoBannerVariant = "neutral" | "positive" | "warning" | "danger";

export interface InfoBannerProps {
  title: string;
  description?: string;
  variant?: InfoBannerVariant;
  icon?: LucideIcon;
}

const VARIANT_STYLES: Record<InfoBannerVariant, { bg: string; fg: string; defaultIcon: LucideIcon }> = {
  neutral: { bg: colors.surfaceMuted, fg: colors.inkSecondary, defaultIcon: Info },
  positive: { bg: colors.brandSoft, fg: colors.brand, defaultIcon: Info },
  warning: { bg: colors.warningSoft, fg: colors.warning, defaultIcon: AlertTriangle },
  danger: { bg: colors.dangerSoft, fg: colors.danger, defaultIcon: CircleAlert },
};

/** design-system.md §5.7 — kenarlık yok, gölge yok; tıklanabilir değil. */
export function InfoBanner({ title, description, variant = "neutral", icon }: InfoBannerProps) {
  const { bg, fg, defaultIcon } = VARIANT_STYLES[variant];
  const Icon = icon ?? defaultIcon;

  return (
    <View style={[styles.container, { backgroundColor: bg }]} accessibilityRole="text">
      <Icon size={24} color={fg} style={styles.icon} />
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radius.panel,
    padding: 16,
    gap: 12,
  },
  icon: { marginTop: 2 },
  textColumn: { flex: 1, gap: 2 },
  title: {
    fontFamily: textType.cardTitle.font,
    fontSize: textType.cardTitle.size,
    lineHeight: textType.cardTitle.lineHeight,
  },
  description: {
    fontFamily: textType.helper.font,
    fontSize: textType.helper.size,
    lineHeight: textType.helper.lineHeight,
    color: colors.inkSecondary,
  },
});
