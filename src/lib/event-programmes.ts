import type { EventDayId } from "@/lib/event-days";

export type EventDayProgramme = {
  title: string;
  subtitle: string;
  description: string;
  experiences: readonly string[];
};

export const EVENT_PROGRAMME_BY_DAY: Record<EventDayId, EventDayProgramme> = {
  "2026-06-12": {
    title: "CONNECTED HORIZONS",
    subtitle: "Explorer de nouvelles opportunités.",
    description:
      "Une journée dédiée à la découverte de solutions qui permettent aux professionnels, entrepreneurs et décideurs de gagner en flexibilité, en contrôle et en performance dans leur quotidien.",
    experiences: [
      "Pilot Pro",
      "M-Pesa Visa",
      "Offre 3-en-1 (Data, Call & SMS)",
      "Parcours personnalisé selon le profil utilisateur",
      "Networking au Green Bistro Club",
    ],
  },
  "2026-06-13": {
    title: "THE PRIVILEGE EDITION",
    subtitle: "Vivre l'expérience autrement.",
    description:
      "La journée signature de Vodacom, consacrée aux avantages exclusifs, à la flexibilité et à la reconnaissance des clients à forte valeur.",
    experiences: [
      "Pilot Pro",
      "M-Pesa Visa",
      "Offre 3-en-1 (Data, Call & SMS)",
      "Parcours personnalisé selon le profil utilisateur",
      "Expérience golf premium",
      "Networking & Sunset Session",
    ],
  },
  "2026-06-14": {
    title: "CONNECTED MOMENTS",
    subtitle: "Partager davantage. Profiter pleinement.",
    description:
      "Une journée orientée lifestyle, convivialité et moments de qualité autour des solutions qui simplifient le quotidien.",
    experiences: [
      "Pilot Pro",
      "M-Pesa Visa",
      "Offre 3-en-1 (Data, Call & SMS)",
      "Parcours personnalisé selon le profil utilisateur",
      "Moments de partage et de découverte",
      "Green Bistro Club Experience",
    ],
  },
};

export function getProgrammeForDay(dayId: EventDayId): EventDayProgramme {
  return EVENT_PROGRAMME_BY_DAY[dayId];
}
