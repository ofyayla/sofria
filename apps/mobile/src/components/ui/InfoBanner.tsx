import { AlertTriangle, CircleAlert, Info, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, space, textStyle, type } from "../../theme";

export type InfoBannerVariant = "neutral" | "positive" | "warning" | "danger";

export interface InfoBannerProps {
  title: string;
  description?: string;
  variant?: InfoBannerVariant;
  icon?: LucideIcon;
}

const VARIANT_STYLES: Record<InfoBannerVariant, { bg: string; fg: string; defaultIcon: LucideIcon }> = {
  neutral: { bg: colors.surface, fg: colors.inkSecondary, defaultIcon: Info },
  positive: { bg: colors.successSoft, fg: colors.success, defaultIcon: Info },
  warning: { bg: colors.warningSoft, fg: colors.warning, defaultIcon: AlertTriangle },
  danger: { bg: colors.dangerSoft, fg: colors.danger, defaultIcon: CircleAlert },
};

/** Bilgi/uyarı kutusu — tıklanamaz; kenarlık ve gölge yok. */
export function InfoBanner({ title, description, variant = "neutral", icon }: InfoBannerProps) {
  const { bg, fg, defaultIcon } = VARIANT_STYLES[variant];
  const Icon = icon ?? defaultIcon;

  return (
    <View style={[styles.container, { backgroundColor: bg }]} accessibilityRole={variant === "danger" ? "alert" : "text"}>
      <Icon size={22} color={fg} style={styles.icon} />
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", borderRadius: radius.tile, padding: space.lg, gap: space.md },
  icon: { marginTop: 1 },
  textColumn: { flex: 1, gap: 2 },
  title: { ...textStyle(type.cardTitle), fontSize: 15, color: colors.ink },
  description: { ...textStyle(type.helper), color: colors.inkSecondary },
});
