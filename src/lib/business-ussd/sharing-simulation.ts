export type BusinessSharingUssdScreenId = "menu" | "member";

export type UssdMenuOption = {
  key: string;
  label: string;
};

export type UssdScreenView = {
  title: string;
  lines: string[];
  options: UssdMenuOption[];
  inputMode: "keypad" | "none";
};

export type BusinessSharingUssdState = {
  screen: BusinessSharingUssdScreenId;
  memberNumber: string | null;
};

export const BUSINESS_SHARING_MENU_OPTIONS: UssdMenuOption[] = [
  { key: "1", label: "Supprimer un membre" },
  { key: "2", label: "Lister les membres" },
  { key: "3", label: "Supprimer le groupe" },
  { key: "4", label: "Cree groupe/Ajouter membre" },
];

export const INITIAL_BUSINESS_SHARING_USSD_STATE: BusinessSharingUssdState = {
  screen: "menu",
  memberNumber: null,
};

export type BusinessSharingUssdResult =
  | { type: "noop" }
  | { type: "complete"; memberNumber: string }
  | { type: "cancelled" };

const VALID_MEMBER_PREFIXES = ["081", "082", "083", "086"] as const;

export function isValidBusinessMemberNumber(input: string): boolean {
  const raw = input.trim();
  if (!/^0\d{9}$/.test(raw)) return false;
  const prefix = raw.slice(0, 3);
  return VALID_MEMBER_PREFIXES.includes(
    prefix as (typeof VALID_MEMBER_PREFIXES)[number],
  );
}

export function getBusinessSharingUssdScreenView(
  state: BusinessSharingUssdState,
): UssdScreenView {
  if (state.screen === "menu") {
    return {
      title: "Menu Interactif",
      lines: [],
      options: BUSINESS_SHARING_MENU_OPTIONS,
      inputMode: "keypad",
    };
  }

  return {
    title: "Menu Interactif",
    lines: ["Entrez le numero du membre (081, 082, 083, 086) :"],
    options: [],
    inputMode: "keypad",
  };
}

export function applyBusinessSharingUssdChoice(
  state: BusinessSharingUssdState,
  choice: string,
): {
  state: BusinessSharingUssdState;
  accepted: boolean;
  result: BusinessSharingUssdResult;
} {
  const key = choice.trim();
  const noop = { result: { type: "noop" } as const };

  if (state.screen === "menu") {
    if (key !== "4") return { state, accepted: false, ...noop };
    return {
      state: { ...state, screen: "member" },
      accepted: true,
      ...noop,
    };
  }

  if (!isValidBusinessMemberNumber(key)) {
    return { state, accepted: false, ...noop };
  }

  return {
    state: { ...state, memberNumber: key },
    accepted: true,
    result: { type: "complete", memberNumber: key },
  };
}
