import { Tabs } from "expo-router";
import { FloatingTabBar } from "../../components/ui";
import { colors } from "../../theme";

/** Bugün · Plan · Market — yüzen hap alt bar (bkz. FloatingTabBar). */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      // Sekme geçiş animasyonu BİLEREK yok: "fade", sekme koddan değiştirildiğinde
      // (ana sayfadaki takvim butonu → router.navigate) bazen opaklık 0'da
      // takılıp ekranı boş bırakıyordu (iPhone'da görüldü).
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.night } }}
    >
      <Tabs.Screen name="index" options={{ title: "Bugün" }} />
      <Tabs.Screen name="haftam" options={{ title: "Haftalık plan" }} />
      <Tabs.Screen name="market" options={{ title: "Market listesi" }} />
    </Tabs>
  );
}
