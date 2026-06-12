import {
  PRIVILEGE_FORFAIT_BENEFITS,
  PRIVILEGE_PURCHASED_FORFAIT_BENEFITS,
} from "@/lib/privilege-onboarding";
import type { FinishCircleDef } from "@/lib/traveler-finish-physics";

/** Tailles distinctes par avantage — petits, moyens et grands cercles mélangés */
const PURCHASED_SIZES: Record<string, number> = {
  data: 96,
  appels: 68,
  transfert: 80,
  visa: 72,
};

const PRIVILEGE_SIZES: Record<string, number> = {
  appels: 58,
  sms: 64,
  internet: 104,
  club: 70,
  "forfaits-plus": 92,
  roaming: 100,
  "appels-intl": 102,
  convertibilite: 98,
  flexibilite: 84,
};

export function getTravelerFinishCircleDefs(): FinishCircleDef[] {
  const purchased: FinishCircleDef[] = PRIVILEGE_PURCHASED_FORFAIT_BENEFITS.map(
    (b) => ({
      id: `purchased-${b.id}`,
      kind: "purchased" as const,
      sizePx: PURCHASED_SIZES[b.id] ?? 76,
    }),
  );

  const privilege: FinishCircleDef[] = PRIVILEGE_FORFAIT_BENEFITS.map((b) => ({
    id: `privilege-${b.id}`,
    kind: "privilege" as const,
    sizePx: PRIVILEGE_SIZES[b.id] ?? (b.ring === "inner" ? 68 : 74),
  }));

  return [...purchased, ...privilege];
}

export function getFinishCircleBenefit(id: string) {
  if (id.startsWith("purchased-")) {
    const key = id.replace("purchased-", "");
    return PRIVILEGE_PURCHASED_FORFAIT_BENEFITS.find((b) => b.id === key)!;
  }
  const key = id.replace("privilege-", "");
  return PRIVILEGE_FORFAIT_BENEFITS.find((b) => b.id === key)!;
}
