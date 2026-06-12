/** Bonus crédité à la création de la carte Visa M-Pesa (USD) */
export const MPESA_VISA_WELCOME_BONUS_USD = 50;

export const VODACOM_MARKET_NAME = "M-pesa Mall";

/** @deprecated Alias interne — préférer VODACOM_MARKET_NAME */
export const CARREFOUR_MARKET_NAME = VODACOM_MARKET_NAME;

export type MarketMenuSection = "sans_alcool" | "avec_alcool" | "accessoires";

export const MARKET_MENU_SECTIONS: { id: MarketMenuSection; label: string }[] =
  [
    { id: "sans_alcool", label: "Sans alcool" },
    { id: "avec_alcool", label: "Avec alcool" },
    { id: "accessoires", label: "Accessoires" },
  ];

/** Prix stable pseudo-aléatoire dans [min, max] selon l'id produit. */
function stablePriceUsd(id: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

export const CARREFOUR_PRODUCTS = [
  {
    id: "bora_bora",
    name: "Bora Bora",
    menuSection: "sans_alcool" as const,
    priceUsd: stablePriceUsd("bora_bora", 10, 25),
  },
  {
    id: "virginia_mojito",
    name: "Virginia Mojito",
    menuSection: "sans_alcool" as const,
    priceUsd: stablePriceUsd("virginia_mojito", 10, 25),
  },
  {
    id: "sunset",
    name: "Sunset",
    menuSection: "sans_alcool" as const,
    priceUsd: stablePriceUsd("sunset", 10, 25),
  },
  {
    id: "granite_pasteque",
    name: "Granité à la pastèque",
    menuSection: "sans_alcool" as const,
    priceUsd: stablePriceUsd("granite_pasteque", 10, 25),
  },
  {
    id: "t_peach",
    name: "T-Peach",
    menuSection: "avec_alcool" as const,
    priceUsd: stablePriceUsd("t_peach", 12, 20),
  },
  {
    id: "mojito",
    name: "Mojito",
    menuSection: "avec_alcool" as const,
    priceUsd: stablePriceUsd("mojito", 12, 20),
  },
  {
    id: "jagerbomb",
    name: "Jägerbomb",
    menuSection: "avec_alcool" as const,
    priceUsd: stablePriceUsd("jagerbomb", 12, 20),
  },
  {
    id: "sex_on_the_beach",
    name: "Sex on the Beach",
    menuSection: "avec_alcool" as const,
    priceUsd: stablePriceUsd("sex_on_the_beach", 12, 20),
  },
  {
    id: "negroni",
    name: "Negroni",
    menuSection: "avec_alcool" as const,
    priceUsd: stablePriceUsd("negroni", 12, 20),
  },
  {
    id: "giger_code",
    name: "Giger Code",
    menuSection: "avec_alcool" as const,
    priceUsd: stablePriceUsd("giger_code", 12, 20),
  },
  {
    id: "gourde",
    name: "Gourde",
    menuSection: "accessoires" as const,
    priceUsd: stablePriceUsd("gourde", 10, 18),
  },
  {
    id: "t_shirt",
    name: "T-shirt",
    menuSection: "accessoires" as const,
    priceUsd: stablePriceUsd("t_shirt", 15, 25),
  },
] as const;

export type CarrefourProductId = (typeof CARREFOUR_PRODUCTS)[number]["id"];

export function getCarrefourProduct(id: string) {
  return CARREFOUR_PRODUCTS.find((p) => p.id === id) ?? null;
}

export function getCarrefourProductsBySection(section: MarketMenuSection) {
  return CARREFOUR_PRODUCTS.filter((p) => p.menuSection === section);
}
