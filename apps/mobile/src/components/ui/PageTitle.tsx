import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, space, type as textType } from "../../theme";
import { BrandIcon } from "./BrandIcon";

/** Logoya dokununca ana sayfaya döner — plan ekranındakiyle aynı davranış. */
export function PageTitle({ children }: { children: string }) {
  return (
    <Link href="/" asChild>
      <Pressable style={styles.row}>
        <BrandIcon size={22} />
        <Text style={styles.title}>{children}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.xl },
  title: { fontFamily: textType.screenTitle.font, fontSize: 26, letterSpacing: -0.4, color: colors.ink },
});
