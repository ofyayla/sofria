import { Image } from "react-native";

export function BrandIcon({ size = 24 }: { size?: number }) {
  return (
    <Image
      source={require("../../../assets/images/sofria-logo-icon.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityElementsHidden
    />
  );
}
