import * as Haptics from "expo-haptics";
import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { colors, space, type Tone } from "../../theme";

export interface RatingStarsProps {
  value: number;
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
  /** Koyu zeminde lime dolgu, açık zeminde gece dolgu (lime açıkta okunmaz). */
  tone?: Tone;
}

/** Hem yazılabilir (RatingForm) hem salt-okunur (Tariflerim) modda kullanılır. */
export function RatingStars({ value, onChange, size = 22, tone = "dark" }: RatingStarsProps) {
  const readOnly = !onChange;
  const on = tone === "dark" ? colors.accent : colors.ink;
  const off = tone === "dark" ? colors.onNightMuted : colors.inkMuted;

  return (
    <View style={{ flexDirection: "row", gap: readOnly ? 2 : space.sm }} accessible={readOnly} accessibilityLabel={`Puan: ${value}/5`}>
      {([1, 2, 3, 4, 5] as const).map((star) => {
        const filled = star <= value;
        const icon = <Star size={size} color={filled ? on : off} fill={filled ? on : "transparent"} />;
        if (readOnly) return <View key={star}>{icon}</View>;
        return (
          <Pressable
            key={star}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(star);
            }}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${star} yıldız`}
            accessibilityState={{ selected: star === value }}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}
