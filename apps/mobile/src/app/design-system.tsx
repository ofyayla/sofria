import { ChefHat, Flame } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import {
  Chip,
  IngredientInput,
  InfoBanner,
  PrimaryButton,
  ProgressSteps,
  Screen,
  SecondaryButton,
  SelectionCard,
  Stepper,
  Toggle,
} from "../components/ui";
import { colors, space, type as textType } from "../theme";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: textType.cardTitle.font, fontSize: textType.cardTitle.size, color: colors.ink, marginTop: space.xxl, marginBottom: space.md }}>
      {children}
    </Text>
  );
}

/**
 * design-system.md §11.3 — dev-only QA ekranı: tüm bileşen varyantları
 * gözle kontrol edilmeden gerçek ekranlara geçilmez. Prod build'de render
 * edilmez.
 */
export default function DesignSystemScreen() {
  const [ingredient, setIngredient] = useState("");
  const [servings, setServings] = useState(4);
  const [toggleOn, setToggleOn] = useState(true);
  const [selectedCard, setSelectedCard] = useState(false);
  const [chipSelected, setChipSelected] = useState(false);

  if (!__DEV__) return null;

  return (
    <Screen>
      <Text style={{ fontFamily: textType.screenTitle.font, fontSize: textType.screenTitle.size, color: colors.ink, marginTop: space.xl }}>
        Design System
      </Text>

      <SectionTitle>PrimaryButton</SectionTitle>
      <View style={{ gap: space.md }}>
        <PrimaryButton label="Planımı oluştur" onPress={() => {}} />
        <PrimaryButton label="Yükleniyor" onPress={() => {}} loading />
        <PrimaryButton label="Devre dışı" onPress={() => {}} disabled />
      </View>

      <SectionTitle>SecondaryButton</SectionTitle>
      <SecondaryButton label="Atla" onPress={() => {}} />

      <SectionTitle>Chip</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        <Chip label="Domates" variant="suggested" onPress={() => {}} />
        <Chip label="Soğan" variant={chipSelected ? "selected" : "suggested"} onPress={() => setChipSelected((s) => !s)} />
        <Chip label="Mantar" variant="disabled" />
      </View>

      <SectionTitle>SelectionCard</SectionTitle>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <SelectionCard icon={ChefHat} title="Türk Mutfağı" subtitle="Ev yemeği" selected={selectedCard} onPress={() => setSelectedCard((s) => !s)} />
        </View>
        <View style={{ flex: 1 }}>
          <SelectionCard icon={Flame} title="Ege" subtitle="Zeytinyağlılar" selected={false} onPress={() => {}} />
        </View>
      </View>

      <SectionTitle>ProgressSteps</SectionTitle>
      <ProgressSteps total={8} current={3} />

      <SectionTitle>Stepper</SectionTitle>
      <Stepper value={servings} min={1} max={12} onChange={setServings} resultLabel={`Her tarif ${servings} porsiyon çıkacak.`} />

      <SectionTitle>InfoBanner</SectionTitle>
      <View style={{ gap: space.sm }}>
        <InfoBanner variant="neutral" title="Nötr bilgi" description="Bilgilendirici bir açıklama." />
        <InfoBanner variant="positive" title="Her tarif 4 porsiyon olacak" />
        <InfoBanner variant="warning" title="Birkaç malzeme daha eklerseniz" description="Daha uygun tarifler önerebiliriz." />
        <InfoBanner variant="danger" title="Bağlantı kurulamadı" description="Tekrar dene." />
      </View>

      <SectionTitle>IngredientInput</SectionTitle>
      <IngredientInput value={ingredient} onChangeText={setIngredient} onSubmit={() => setIngredient("")} />

      <SectionTitle>Toggle</SectionTitle>
      <Toggle value={toggleOn} onValueChange={setToggleOn} accessibilityLabel="Çocuk var mı" />

      <View style={{ height: space.xxxl }} />
    </Screen>
  );
}
