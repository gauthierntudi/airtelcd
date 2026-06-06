/** Bonus crédité à la création de la carte Visa M-Pesa (USD) */
export const MPESA_VISA_WELCOME_BONUS_USD = 50;

export const VODACOM_MARKET_NAME = "Vodacom Market";

/** @deprecated Alias interne — préférer VODACOM_MARKET_NAME */
export const CARREFOUR_MARKET_NAME = VODACOM_MARKET_NAME;

export const CARREFOUR_PRODUCTS = [
  {
    id: "cocktail",
    name: "Cocktail alcoolisé (verre)",
    priceUsd: 10,
  },
  {
    id: "bottega_grappa",
    name: "Bottega Grappa",
    priceUsd: 12,
  },
  {
    id: "santorsola_ice_vin",
    name: "Sant'orsola Ice Vin",
    priceUsd: 10,
  },
  {
    id: "masi_moxxe",
    name: "Masi Moxxé",
    priceUsd: 12,
  },
  {
    id: "martini_bellini",
    name: "Martini Bellini",
    priceUsd: 10,
  },
  {
    id: "usb_stick",
    name: "USB-Stick",
    priceUsd: 8,
  },
  {
    id: "modem_wifi_usb_4g",
    name: "Modem WiFi USB 4G",
    priceUsd: 20,
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
