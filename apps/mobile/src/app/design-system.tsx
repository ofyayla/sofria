import { ArrowUpRight, ChefHat, ChevronLeft, Microwave, UserRound } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getDishImage } from "../assets/dishImages";
import {
  Chip,
  IconCircleButton,
  InfoBanner,
  IngredientInput,
  PhotoCard,
  PhotoTile,
  PrimaryButton,
  ProgressSteps,
  Screen,
  ScreenHeader,
  SecondaryButton,
  SectionLabel,
  SegmentedPill,
  SelectionCard,
  Stepper,
  Toggle,
  TwoToneHeadline,
} from "../components/ui";
import { colors, radius, space } from "../theme";

/**
 * Dev-only QA ekranı: tüm bileşen varyantları gözle kontrol edilmeden gerçek
 * ekranlara geçilmez. Ana sayfada tarihe uzun basınca açılır; prod'da render edilmez.
 */
export default function DesignSystemScreen() {
  const [ingredient, setIngredient] = useState("");
  const [servings, setServings] = useState(4);
  const [toggleOn, setToggleOn] = useState(true);
  const [selected, setSelected] = useState(false);
  const [meal, setMeal] = useState<"kahvalti" | "ogle" | "aksam">("aksam");

  if (!__DEV__) return null;

  return (
    <Screen tone="light">
      <ScreenHeader tone="light" title="Design System" />
      <View style={styles.block}>
        <TwoToneHeadline tone="light" muted="Sofria" strong="tasarım dili" caption={"v2\nfotoğraf önde"} />
      </View>

      <SectionLabel>KOYU YÜZEY</SectionLabel>
      <View style={styles.darkPanel}>
        <View style={styles.row}>
          <IconCircleButton icon={ChevronLeft} accessibilityLabel="Beyaz" variant="white" />
          <IconCircleButton icon={UserRound} accessibilityLabel="Cam" variant="glass" />
          <IconCircleButton icon={ArrowUpRight} accessibilityLabel="Lime" variant="accent" />
        </View>
        <SegmentedPill
          surface="glass"
          options={[
            { key: "kahvalti", label: "Kahvaltı" },
            { key: "ogle", label: "Öğle" },
            { key: "aksam", label: "Akşam" },
          ]}
          value={meal}
          onChange={setMeal}
        />
        <ProgressSteps total={3} current={1} />
        <Stepper label="Yetişkin" value={servings} min={1} max={12} onChange={setServings} hint={`Toplam ${servings} kişilik`} />
        <View style={styles.wrap}>
          <Chip tone="dark" label="Akşam" variant="on" onPress={() => {}} />
          <Chip tone="dark" label="Kahvaltı" variant="off" onPress={() => {}} />
          <Chip tone="dark" label="Fıstık" variant="danger" onPress={() => {}} />
        </View>
        <PhotoTile image={getDishImage("risotto")} label="İtalyan" sublabel="Makarna, risotto" selected={selected} onPress={() => setSelected((s) => !s)} />
        <PrimaryButton label="Planımı oluştur" onPress={() => {}} />
        <PrimaryButton label="En az 1 mutfak seç" onPress={() => {}} disabled />
      </View>

      <SectionLabel>AÇIK YÜZEY</SectionLabel>
      <View style={styles.block}>
        <PhotoCard image={getDishImage("karniyarik")} eyebrow="Akşam · Tam menü" title="Karnıyarık" meta="45 dk · ~420 kcal" onPress={() => {}} />
        <PhotoCard image={undefined} fallbackIcon={ChefHat} eyebrow="Kahvaltı" title="Menemen" meta="20 dk" height={220} onPress={() => {}} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <SelectionCard icon={Microwave} title="Fırın" selected={selected} onPress={() => setSelected((s) => !s)} />
          </View>
          <View style={styles.flex}>
            <SelectionCard icon={Microwave} title="Fırın" subtitle="Fırın kapalı" selected={false} onPress={() => {}} />
          </View>
        </View>
        <View style={styles.wrap}>
          <Chip label="Hepsi" variant="filterActive" onPress={() => {}} />
          <Chip label="Balık" variant="filter" onPress={() => {}} />
          <Chip label="patlıcan" variant="removable" onPress={() => {}} />
          <Chip label="fıstık" variant="danger" onPress={() => {}} />
        </View>
        <Toggle value={toggleOn} onValueChange={setToggleOn} accessibilityLabel="Örnek" />
        <IngredientInput value={ingredient} onChangeText={setIngredient} onSubmit={() => setIngredient("")} />
        <SecondaryButton label="Vazgeç" onPress={() => {}} />
        <InfoBanner variant="neutral" title="Nötr bilgi" description="Bilgilendirici bir açıklama." />
        <InfoBanner variant="danger" title="Plan oluşturulamadı" description="Lütfen tekrar deneyin." />
      </View>
      <Text style={styles.footer}>—</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: space.md, marginVertical: space.lg },
  darkPanel: { backgroundColor: colors.night, borderRadius: radius.card, padding: space.lg, gap: space.lg, marginBottom: space.xl },
  row: { flexDirection: "row", gap: space.md },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  flex: { flex: 1 },
  footer: { textAlign: "center", color: colors.inkMuted },
});
