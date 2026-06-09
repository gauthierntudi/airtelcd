/** Avatars communauté — `public/img/persons/` */
export const ORBITAL_PERSON_AVATARS = [
  "/img/persons/person01.png",
  "/img/persons/person02.png",
  "/img/persons/person03.png",
  "/img/persons/person04.png",
  "/img/persons/person05.png",
  "/img/persons/person06.png",
  "/img/persons/person07.png",
  "/img/persons/person08.png",
  "/img/persons/person09.png",
  "/img/persons/person010.png",
] as const;

export type OrbitalBubble = {
  id: string;
  label: string;
  color: string;
  /** Position en % du conteneur orbital */
  x: number;
  y: number;
  size?: "sm" | "md" | "lg";
};

export type OrbitalHomeTheme = {
  id: "privilege" | "mpesa";
  pageTitle: string;
  badge: string;
  headline: string;
  subline: string;
  background: string;
  ringColor: string;
  centerImage: string;
  centerImageAlt: string;
  innerAvatarIndices: number[];
  outerAvatarIndices: number[];
  bubbles: OrbitalBubble[];
  otherHomeHref: string;
  otherHomeLabel: string;
};

export const PRIVILEGE_ORBITAL_HOME: OrbitalHomeTheme = {
  id: "privilege",
  pageTitle: "Vodacom Privilège",
  badge: "Vodacom Privilège Golf 2026",
  headline: "Le privilège se vit aussi sur le green",
  subline: "Kinshasa Open de Golf",
  background:
    "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
  ringColor: "rgba(255,255,255,0.22)",
  centerImage: "/img/kekekeke.jpg",
  centerImageAlt: "Vodacom Privilège",
  innerAvatarIndices: [0, 2, 4, 6],
  outerAvatarIndices: [1, 3, 5, 7, 8, 9],
  bubbles: [
    {
      id: "vip",
      label: "Invités VIP",
      color: "#e60000",
      x: 8,
      y: 14,
      size: "md",
    },
    {
      id: "golf",
      label: "Expérience golf",
      color: "#1a1a1a",
      x: 78,
      y: 10,
      size: "lg",
    },
    {
      id: "network",
      label: "Réseau business",
      color: "#7c3aed",
      x: 86,
      y: 46,
      size: "md",
    },
    {
      id: "bistro",
      label: "Green Bistro",
      color: "#15803d",
      x: 72,
      y: 80,
      size: "md",
    },
    {
      id: "members",
      label: "Membres privilège",
      color: "#ca8a04",
      x: 10,
      y: 76,
      size: "lg",
    },
  ],
  otherHomeHref: "/mpesa",
  otherHomeLabel: "M-Pesa",
};

export const MPESA_ORBITAL_HOME: OrbitalHomeTheme = {
  id: "mpesa",
  pageTitle: "M-Pesa",
  badge: "Carte Visa M-Pesa",
  headline: "Votre écosystème mobile money",
  subline: "Carte, bonus et marché en un parcours",
  background: "#414548",
  ringColor: "rgba(255,255,255,0.14)",
  centerImage: "/img/mpesa.jpg",
  centerImageAlt: "M-Pesa",
  innerAvatarIndices: [1, 3, 5, 8],
  outerAvatarIndices: [0, 2, 4, 6, 7, 9],
  bubbles: [
    {
      id: "visa",
      label: "Carte Visa M-Pesa",
      color: "#e60000",
      x: 6,
      y: 16,
      size: "lg",
    },
    {
      id: "bonus",
      label: "Bonus USD",
      color: "#16a34a",
      x: 80,
      y: 12,
      size: "md",
    },
    {
      id: "market",
      label: "Vodacom Market",
      color: "#f59e0b",
      x: 88,
      y: 48,
      size: "md",
    },
    {
      id: "secure",
      label: "Paiement sécurisé",
      color: "#1e3a8a",
      x: 70,
      y: 82,
      size: "sm",
    },
    {
      id: "ussd",
      label: "Parcours USSD",
      color: "#6b7280",
      x: 12,
      y: 78,
      size: "md",
    },
  ],
  otherHomeHref: "/",
  otherHomeLabel: "Vodacom Privilège",
};

/** Angles en degrés — sens horaire, 0° = droite */
export const ORBIT_INNER_ANGLES = [220, 315, 45, 135];
export const ORBIT_OUTER_ANGLES = [270, 330, 30, 90, 150, 210];
