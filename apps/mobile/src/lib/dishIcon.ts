import type { Meal, SubRecipe } from "@sofria/shared";
import { CookingPot, EggFried, Salad, Soup, UtensilsCrossed, Wheat, type LucideIcon } from "lucide-react-native";

const ROLE_ICON: Record<SubRecipe["role"], LucideIcon> = {
  corba: Soup,
  ana_yemek: UtensilsCrossed,
  yan_lezzet: CookingPot,
  salata: Salad,
  pilav_makarna: Wheat,
  tatli: CookingPot,
};

/**
 * Görseli olmayan yemeklerin (henüz fotoğrafı üretilmemiş kahvaltılıklar)
 * yerine gösterilen ikon — plan kartı ve ana sayfa aynı ikonu kullanır.
 */
export function dishIcon(role: SubRecipe["role"], mealType?: Meal["type"]): LucideIcon {
  if (mealType === "kahvalti") return EggFried;
  return ROLE_ICON[role];
}
