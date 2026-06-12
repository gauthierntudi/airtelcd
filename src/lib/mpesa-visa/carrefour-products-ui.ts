import type { CarrefourProductId } from "@/lib/mpesa-visa/constants";

export const MARKET_COCKTAIL_IMAGE_SANS_ALCOOL =
  "/img/products/verre-sans-alcool.jpg";
export const MARKET_COCKTAIL_IMAGE_AVEC_ALCOOL =
  "/img/products/verre-avec-alcool.jpg";

export type CarrefourProductUiMeta = {
  id: CarrefourProductId;
  image: string;
  tagline: string;
  rating: number;
  reviewCount: number;
};

const COCKTAIL_SANS_ALCOOL_UI = {
  image: MARKET_COCKTAIL_IMAGE_SANS_ALCOOL,
  tagline: "Cocktail sans alcool — bar événement",
} as const;

const COCKTAIL_AVEC_ALCOOL_UI = {
  image: MARKET_COCKTAIL_IMAGE_AVEC_ALCOOL,
  tagline: "Cocktail avec alcool — bar événement",
} as const;

export const CARREFOUR_PRODUCT_UI: CarrefourProductUiMeta[] = [
  {
    id: "bora_bora",
    ...COCKTAIL_SANS_ALCOOL_UI,
    rating: 4.7,
    reviewCount: 84,
  },
  {
    id: "virginia_mojito",
    ...COCKTAIL_SANS_ALCOOL_UI,
    rating: 4.8,
    reviewCount: 112,
  },
  {
    id: "sunset",
    ...COCKTAIL_SANS_ALCOOL_UI,
    rating: 4.6,
    reviewCount: 67,
  },
  {
    id: "granite_pasteque",
    ...COCKTAIL_SANS_ALCOOL_UI,
    rating: 4.5,
    reviewCount: 53,
  },
  {
    id: "t_peach",
    ...COCKTAIL_AVEC_ALCOOL_UI,
    rating: 4.6,
    reviewCount: 91,
  },
  {
    id: "mojito",
    ...COCKTAIL_AVEC_ALCOOL_UI,
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: "jagerbomb",
    ...COCKTAIL_AVEC_ALCOOL_UI,
    rating: 4.4,
    reviewCount: 78,
  },
  {
    id: "sex_on_the_beach",
    ...COCKTAIL_AVEC_ALCOOL_UI,
    rating: 4.7,
    reviewCount: 124,
  },
  {
    id: "negroni",
    ...COCKTAIL_AVEC_ALCOOL_UI,
    rating: 4.9,
    reviewCount: 88,
  },
  {
    id: "giger_code",
    ...COCKTAIL_AVEC_ALCOOL_UI,
    rating: 4.5,
    reviewCount: 62,
  },
  {
    id: "gourde",
    image: "/img/products/gourde.jpg",
    tagline: "Gourde événement — Vodacom Privilège",
    rating: 4.6,
    reviewCount: 94,
  },
  {
    id: "t_shirt",
    image: "/img/products/t-short.jpg",
    tagline: "T-shirt officiel — édition Golf",
    rating: 4.7,
    reviewCount: 118,
  },
];

export function getCarrefourProductUi(id: string) {
  return CARREFOUR_PRODUCT_UI.find((p) => p.id === id) ?? null;
}
