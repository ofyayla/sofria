// v2: yüzeyler gölgeyle değil kontrast ve camla ayrışır. Gölge yalnızca
// içeriğin ÜSTÜNDE yüzen öğelerde (alt bar, birincil CTA) kullanılır.
export const shadow = {
  floating: {
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;
