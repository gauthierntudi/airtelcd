import type { CarrefourProductId } from "@/lib/mpesa-visa/constants";

export type CarrefourProductUiMeta = {
  id: CarrefourProductId;
  image: string;
  tagline: string;
};

export const CARREFOUR_PRODUCT_UI: CarrefourProductUiMeta[] = [
  {
    id: "cocktail",
    image: "/img/products/cocktail.jpg",
    tagline: "Bar premium — événement Golf",
  },
  {
    id: "modem_5g",
    image: "/img/products/modem.jpg",
    tagline: "Connexion haut débit 5G",
  },
  {
    id: "samsung_phone",
    image: "/img/products/phone.png",
    tagline: "Smartphone Samsung — offre exclusive",
  },
];

export function getCarrefourProductUi(id: string) {
  return CARREFOUR_PRODUCT_UI.find((p) => p.id === id) ?? null;
}
