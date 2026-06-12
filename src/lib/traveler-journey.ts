import type { LucideIcon } from "lucide-react";
import {
  CarTaxiFront,
  Hotel,
  PlaneLanding,
  RefreshCw,
  Ticket,
} from "lucide-react";

export type TravelerJourneyStepId =
  | "billet"
  | "hotel"
  | "taxi"
  | "aeroport"
  | "conversion";

export type TravelerJourneyStep = {
  id: TravelerJourneyStepId;
  index: number;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  activeBenefitIds: string[];
};

export const TRAVELER_JOURNEY_STEPS: TravelerJourneyStep[] = [
  {
    id: "billet",
    index: 1,
    label: "Billet",
    title: "Réservez votre billet",
    description:
      "Votre forfait Data est prêt pour préparer votre voyage au Kinshasa Open de Golf.",
    icon: Ticket,
    activeBenefitIds: ["data", "visa"],
  },
  {
    id: "hotel",
    index: 2,
    label: "Hôtel",
    title: "Choisissez votre hôtel",
    description:
      "Profitez de vos avantages Appels pour confirmer votre séjour.",
    icon: Hotel,
    activeBenefitIds: ["data", "appels"],
  },
  {
    id: "taxi",
    index: 3,
    label: "Taxi",
    title: "Réservez votre taxi",
    description: "Organisez vos déplacements avec le partenaire Yango.",
    icon: CarTaxiFront,
    activeBenefitIds: ["data"],
  },
  {
    id: "aeroport",
    index: 4,
    label: "Aéroport",
    title: "Accueil aéroport",
    description:
      "Préparez votre arrivée avec l'ensemble de vos avantages Privilège.",
    icon: PlaneLanding,
    activeBenefitIds: ["data"],
  },
  {
    id: "conversion",
    index: 5,
    label: "Conversion",
    title: "Conversion forfait",
    description:
      "Convertissez vos volumes Internet entre réseau local et roaming.",
    icon: RefreshCw,
    activeBenefitIds: ["data", "appels", "transfert", "visa"],
  },
];

export type TravelerConversionFlow = {
  id: string;
  label: string;
  from: string;
  to: string;
};

/** Schéma informatif — profil Traveler (étape Conversion) */
export const TRAVELER_CONVERSION_FLOWS: TravelerConversionFlow[] = [
  {
    id: "local-roaming",
    label: "Internet:Local vers Roaming",
    from: "Local",
    to: "Roaming",
  },
  {
    id: "roaming-local",
    label: "Internet:Roaming vers Local",
    from: "Roaming",
    to: "Local",
  },
];

export type TravelerBilletOption = {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  carrier: string;
  videoUrl: string;
};

export const TRAVELER_BILLET_OPTIONS: TravelerBilletOption[] = [
  {
    id: "kin-paris",
    from: "Kinshasa",
    to: "Paris",
    date: "12 juin 2026",
    time: "14:20",
    price: "385 $",
    carrier: "Air France",
    videoUrl:
      "https://mypullzond243.b-cdn.net/golf2026/videos/paris.mp4",
  },
  {
    id: "kin-los-angeles",
    from: "Kinshasa",
    to: "Los Angeles",
    date: "13 juin 2026",
    time: "09:15",
    price: "720 $",
    carrier: "Delta Air Lines",
    videoUrl:
      "https://mypullzond243.b-cdn.net/golf2026/videos/los-angeles.mp4",
  },
  {
    id: "kin-londres",
    from: "Kinshasa",
    to: "Londres",
    date: "12 juin 2026",
    time: "08:45",
    price: "450 $",
    carrier: "British Airways",
    videoUrl:
      "https://mypullzond243.b-cdn.net/golf2026/videos/londres.mp4",
  },
];

export function getTravelerBilletById(
  id: string | null,
): TravelerBilletOption | null {
  if (!id) return null;
  return TRAVELER_BILLET_OPTIONS.find((b) => b.id === id) ?? null;
}

export type TravelerHotelOption = {
  id: string;
  name: string;
  imageUrl: string;
  city: string;
  nights: number;
  pricePerNightUsd: number;
  rating: string;
};

export const TRAVELER_HOTEL_OPTIONS: TravelerHotelOption[] = [
  {
    id: "hotel-1",
    name: "Hôtel Plaza Athénée",
    imageUrl: "https://mypullzond243.b-cdn.net/golf2026/hotel1.jpg",
    city: "Paris",
    nights: 4,
    pricePerNightUsd: 220,
    rating: "5★",
  },
  {
    id: "hotel-2",
    name: "The Beverly Hills Hotel",
    imageUrl: "https://mypullzond243.b-cdn.net/golf2026/hotel2.jpg",
    city: "Los Angeles",
    nights: 5,
    pricePerNightUsd: 310,
    rating: "5★",
  },
  {
    id: "hotel-3",
    name: "The Savoy",
    imageUrl: "https://mypullzond243.b-cdn.net/golf2026/hotel3.jpg",
    city: "Londres",
    nights: 3,
    pricePerNightUsd: 195,
    rating: "5★",
  },
];

export function parseTravelerPriceUsd(price: string): number {
  const match = price.replace(/\s/g, "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function formatTravelerPriceUsd(amount: number): string {
  return `${amount} $`;
}

export function computeTravelerBookingTotalUsd(
  billet: TravelerBilletOption,
  hotel: TravelerHotelOption,
): number {
  return (
    parseTravelerPriceUsd(billet.price) +
    hotel.nights * hotel.pricePerNightUsd
  );
}

/** Visuel Yango — étape Taxi (phase initiale). */
export const TRAVELER_TAXI_YANGO_IMAGE = "/img/yango.png";

/** Fond écran fin de parcours Traveler (physique des cercles). */
export const TRAVELER_FINISH_BG_IMAGE = "/img/background01.jpg";

/** Visuels étape Aéroport */
export const TRAVELER_AIRPORT_BG_IMAGE =
  "https://mypullzond243.b-cdn.net/golf2026/aeroport.jpg";
export const TRAVELER_AIRPORT_PHONE_IMAGE =
  "https://mypullzond243.b-cdn.net/golf2026/man-looking-his-phone.png";

export const TRAVELER_AIRPORT_BODY_COPY =
  "Vous êtes sur le point de quitter le pays, vous pouvez rester connecté grâce à la convertibilité de vos forfaits privilège.";

export const TRAVELER_AIRPORT_HEADLINE =
  "Convertissez vos data locales en international.";

export function getTravelerHotelById(
  id: string | null,
): TravelerHotelOption | null {
  if (!id) return null;
  return TRAVELER_HOTEL_OPTIONS.find((h) => h.id === id) ?? null;
}

export function getTravelerJourneyStep(stepIndex: number): TravelerJourneyStep {
  return (
    TRAVELER_JOURNEY_STEPS.find((s) => s.index === stepIndex) ??
    TRAVELER_JOURNEY_STEPS[0]
  );
}
