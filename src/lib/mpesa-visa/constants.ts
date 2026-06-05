/** Bonus crédité à la création de la carte Visa M-Pesa (USD) */
export const MPESA_VISA_WELCOME_BONUS_USD = 50;

export const CARREFOUR_MARKET_NAME = "Carrefour Market";

export const CARREFOUR_PRODUCTS = [
  {
    id: "cocktail",
    name: "Cocktail alcoolisé (verre)",
    priceUsd: 10,
  },
  {
    id: "modem_5g",
    name: "Modem Wifi 5G",
    priceUsd: 20,
  },
  {
    id: "samsung_phone",
    name: "Téléphone Samsung",
    priceUsd: 45,
  },
] as const;

export type CarrefourProductId = (typeof CARREFOUR_PRODUCTS)[number]["id"];

export function getCarrefourProduct(id: string) {
  return CARREFOUR_PRODUCTS.find((p) => p.id === id) ?? null;
}
