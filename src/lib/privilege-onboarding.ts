/** Code USSD saisi au clavier pour ouvrir l'opt-in Privilège */
export const PRIVILEGE_DIAL_CODE = "*1157*3#";

/** En-tête des menus USSD interactifs Privilège */
export const PRIVILEGE_USSD_MENU_CODE = "*1111#";

export function normalizeDialInput(value: string): string {
  return value.replace(/\s/g, "");
}

export function isPrivilegeDialCodeComplete(value: string): boolean {
  return normalizeDialInput(value) === PRIVILEGE_DIAL_CODE;
}

export type ForfaitBenefitRing = "inner" | "outer";

export type ForfaitBenefit = {
  id: string;
  label: string;
  /** Valeur affichée sous le libellé (ex. forfait acheté) */
  value?: string;
  color: string;
  ring: ForfaitBenefitRing;
  /** Angle en degrés (0° = droite, 90° = bas) */
  orbitAngleDeg: number;
};

/** Guides orbitaux — cercles parfaits */
export const PRIVILEGE_FORFAIT_INNER_ORBIT_RADIUS = 38;
export const PRIVILEGE_FORFAIT_OUTER_ORBIT_RADIUS = 54;

/** Positions des avantages sur chaque orbite */
export const PRIVILEGE_FORFAIT_INNER_CIRCLE_RADIUS = 36;
export const PRIVILEGE_FORFAIT_OUTER_CIRCLE_RADIUS = 52;

const INNER_ANGLES = [-90, 0, 90, 180] as const;
const OUTER_ANGLES = [-54, 36, 126, 216] as const;

export type ForfaitBenefitDetail = {
  title: string;
  bullets: string[];
};

export const PRIVILEGE_FORFAIT_BENEFIT_DETAILS: Record<
  string,
  ForfaitBenefitDetail
> = {
  convertibilite: {
    title: "Convertibilité",
    bullets: [
      "Possibilité de convertir :",
      "Les minutes en Internet",
      "Un volume Internet en minutes d'appels",
      "Un Internet local en roaming et vice versa",
    ],
  },
  appels: {
    title: "Appels",
    bullets: [
      "Des minutes d'appels capables d'appeler tous les réseaux",
      "Appels internationaux vers la Zone A",
    ],
  },
  sms: {
    title: "SMS",
    bullets: ["Des SMS utilisables vers tous les réseaux"],
  },
  roaming: {
    title: "Roaming",
    bullets: [
      "Des forfaits avec un volume Internet capable d'être converti en roaming",
    ],
  },
  internet: {
    title: "Partage",
    bullets: [
      "Forfait avec un volume voix et Internet partageable",
      "Possibilité d'attribuer un quota d'utilisation à chaque membre du groupe de partage",
    ],
  },
  flexibilite: {
    title: "Flexibilité",
    bullets: [
      "Des forfaits pouvant être convertis selon les besoins",
      "Possibilité de le partager avec les proches (Famille)",
      "Possibilité de l'utiliser même en roaming grâce à la conversion",
    ],
  },
  "forfaits-plus": {
    title: "Bénéfices M-Pesa",
    bullets: [
      "Des transferts M-Pesa gratuits",
      "Une carte virtuelle Visa",
    ],
  },
};

export const PRIVILEGE_FORFAIT_BENEFITS: ForfaitBenefit[] = [
  { id: "appels", label: "Appels", color: "#e60000", ring: "inner", orbitAngleDeg: INNER_ANGLES[0] },
  { id: "sms", label: "SMS", color: "#ff6b35", ring: "inner", orbitAngleDeg: INNER_ANGLES[1] },
  {
    id: "internet",
    label: "Partage",
    color: "#1d4ed8",
    ring: "inner",
    orbitAngleDeg: INNER_ANGLES[2],
  },
  { id: "club", label: "Club Privilège", color: "#b30000", ring: "inner", orbitAngleDeg: INNER_ANGLES[3] },
  {
    id: "forfaits-plus",
    label: "Bénéfices M-Pesa",
    color: "#7c3aed",
    ring: "outer",
    orbitAngleDeg: OUTER_ANGLES[0],
  },
  { id: "roaming", label: "Roaming", color: "#0d9488", ring: "outer", orbitAngleDeg: OUTER_ANGLES[1] },
  {
    id: "convertibilite",
    label: "Convertibilité",
    color: "#ca8a04",
    ring: "outer",
    orbitAngleDeg: OUTER_ANGLES[2],
  },
  {
    id: "flexibilite",
    label: "Flexibilité",
    color: "#db2777",
    ring: "outer",
    orbitAngleDeg: OUTER_ANGLES[3],
  },
];

/** Forfait confirmé après achat USSD — 4 petits cercles intérieurs */
export const PRIVILEGE_PURCHASED_FORFAIT_BENEFITS: ForfaitBenefit[] = [
  {
    id: "data",
    label: "Data",
    value: "80Gb",
    color: "#2563eb",
    ring: "inner",
    orbitAngleDeg: -90,
  },
  {
    id: "appels",
    label: "Appels",
    value: "4 Heures",
    color: "#e60000",
    ring: "inner",
    orbitAngleDeg: 0,
  },
  {
    id: "transfert",
    label: "Transfert",
    value: "4P2P",
    color: "#0d9488",
    ring: "inner",
    orbitAngleDeg: 90,
  },
  {
    id: "visa",
    label: "Carte Visa",
    value: "50$",
    color: "#d97706",
    ring: "inner",
    orbitAngleDeg: 180,
  },
];

export function forfaitBenefitRadiusPercent(benefit: ForfaitBenefit): number {
  return benefit.ring === "inner"
    ? PRIVILEGE_FORFAIT_INNER_CIRCLE_RADIUS
    : PRIVILEGE_FORFAIT_OUTER_CIRCLE_RADIUS;
}

export function forfaitBenefitAngleDeg(benefit: ForfaitBenefit): number {
  return benefit.orbitAngleDeg;
}

/** 0° = droite, 90° = bas */
export function forfaitBenefitPosition(
  benefit: ForfaitBenefit,
): { left: number; top: number } {
  const radius = forfaitBenefitRadiusPercent(benefit);
  const rad = (benefit.orbitAngleDeg * Math.PI) / 180;
  return {
    left: 50 + Math.cos(rad) * radius,
    top: 50 + Math.sin(rad) * radius,
  };
}
