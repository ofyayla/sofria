import { Redirect } from "expo-router";

/**
 * Eski adres (/plan/<id>) — plan artık "Plan" sekmesinde yaşıyor. Cihazda
 * yalnızca en son plan tutulduğu için id'ye gerek kalmadı; eski bağlantılar
 * kırılmasın diye yönlendirme olarak duruyor.
 */
export default function LegacyPlanRedirect() {
  return <Redirect href="/haftam" />;
}
