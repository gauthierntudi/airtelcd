import type { CarrefourProductId } from "@/lib/mpesa-visa/constants";

export type CarrefourProductUiMeta = {
  id: CarrefourProductId;
  image: string;
  tagline: string;
  rating: number;
  reviewCount: number;
};

export const CARREFOUR_PRODUCT_UI: CarrefourProductUiMeta[] = [
  {
    id: "cocktail",
    image: "/img/products/cocktail.jpg",
    tagline: "Bar premium — événement Golf",
    rating: 4.6,
    reviewCount: 128,
  },
  {
    id: "bottega_grappa",
    image: "/img/products/bottega-grappa.jpg",
    tagline: "Grappa italienne premium Bottega",
    rating: 4.7,
    reviewCount: 96,
  },
  {
    id: "santorsola_ice_vin",
    image: "/img/products/santorsola-ice-vin.jpg",
    tagline: "Vin blanc glacé Sant'Orsola",
    rating: 4.5,
    reviewCount: 74,
  },
  {
    id: "masi_moxxe",
    image: "/img/products/masi-moxxe.jpg",
    tagline: "Prosecco rosé Masi Moxxé",
    rating: 4.6,
    reviewCount: 112,
  },
  {
    id: "martini_bellini",
    image: "/img/products/martini-bellini.jpg",
    tagline: "Cocktail prêt à servir Martini Bellini",
    rating: 4.4,
    reviewCount: 58,
  },
  {
    id: "usb_stick",
    image: "/img/products/usb-stick.jpg",
    tagline: "Clé USB — stockage portable",
    rating: 4.3,
    reviewCount: 203,
  },
  {
    id: "modem_wifi_usb_4g",
    image: "/img/products/modem-wifi-usb-4g.jpg",
    tagline: "Modem WiFi USB 4G — connexion mobile",
    rating: 4.5,
    reviewCount: 67,
  },
  {
    id: "modem_5g",
    image: "/img/products/modem.jpg",
    tagline: "Connexion haut débit 5G",
    rating: 4.4,
    reviewCount: 89,
  },
  {
    id: "samsung_phone",
    image: "/img/products/phone.png",
    tagline: "Smartphone Samsung — offre exclusive",
    rating: 4.8,
    reviewCount: 214,
  },
];

export function getCarrefourProductUi(id: string) {
  return CARREFOUR_PRODUCT_UI.find((p) => p.id === id) ?? null;
}
