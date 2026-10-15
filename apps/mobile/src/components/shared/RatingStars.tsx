import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { colors, space } from "../../theme";

export interface RatingStarsProps {
  value: number;
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
}

/** Hem yazılabilir (RatingForm) hem salt-okunur (Tariflerim) modda kullanılır. */
export function RatingStars({ value, onChange, size = 22 }: RatingStarsProps) {
  const readOnly = !onChange;

  return (
    <View style={{ flexDirection: "row", gap: space.xs }} accessibilityLabel={`Puan: ${value}/5`}>
      {([1, 2, 3, 4, 5] as const).map((star) => {
        const filled = star <= value;
        const icon = <Star size={size} color={colors.brand} fill={filled ? colors.brand : "transparent"} />;
        if (readOnly) return <View key={star}>{icon}</View>;
        return (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${star} yıldız`}>
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}
