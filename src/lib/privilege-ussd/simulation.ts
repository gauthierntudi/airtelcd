export type PrivilegeUssdScreenId = "root" | "forfaits" | "stub";

export type UssdMenuOption = {
  key: string;
  label: string;
};

export type UssdScreenView = {
  title: string;
  lines: string[];
  options: UssdMenuOption[];
  showInput: boolean;
};

export type PrivilegeSimulationState = {
  screen: PrivilegeUssdScreenId;
  stubLabel: string | null;
  /** Écran cible du « 0. Retour » depuis un stub */
  returnScreen: PrivilegeUssdScreenId;
};

export const PRIVILEGE_USSD_ROOT_OPTIONS: UssdMenuOption[] = [
  { key: "1", label: "Forfaits" },
  { key: "2", label: "Vodalar" },
  { key: "3", label: "Convertir un Forfait" },
  { key: "4", label: "Partager Forfait" },
  { key: "5", label: "Juste Pour Toi" },
  { key: "6", label: "Transfert&Recharge" },
  { key: "7", label: "Mpesa" },
  { key: "8", label: "Balance" },
  { key: "9", label: "Services" },
  { key: "10", label: "Mon Compte" },
];

export const PRIVILEGE_FORFAITS_OPTIONS: UssdMenuOption[] = [
  { key: "1", label: "Forfaits Privilege (30j)" },
  { key: "2", label: "Appels" },
  { key: "3", label: "Internet" },
  { key: "4", label: "SMS" },
  { key: "5", label: "Roaming" },
  { key: "6", label: "International (Mikili)" },
];

export const INITIAL_PRIVILEGE_SIM_STATE: PrivilegeSimulationState = {
  screen: "root",
  stubLabel: null,
  returnScreen: "root",
};

export function getPrivilegeUssdScreenView(
  state: PrivilegeSimulationState,
): UssdScreenView {
  if (state.screen === "root") {
    return {
      title: "PRIVILEGE",
      lines: [],
      options: PRIVILEGE_USSD_ROOT_OPTIONS,
      showInput: true,
    };
  }

  if (state.screen === "forfaits") {
    return {
      title: "Forfaits",
      lines: [],
      options: [
        ...PRIVILEGE_FORFAITS_OPTIONS,
        { key: "0", label: "Retour" },
      ],
      showInput: true,
    };
  }

  return {
    title: "PRIVILEGE",
    lines: [
      state.stubLabel ?? "Option",
      "",
      "Simulation — parcours interactif.",
      "Revenez au menu précédent.",
    ],
    options: [{ key: "0", label: "Retour" }],
    showInput: true,
  };
}

function toStub(
  state: PrivilegeSimulationState,
  label: string,
  returnScreen: PrivilegeUssdScreenId,
): PrivilegeSimulationState {
  return {
    screen: "stub",
    stubLabel: label,
    returnScreen,
  };
}

export function applyPrivilegeUssdChoice(
  state: PrivilegeSimulationState,
  choice: string,
): { state: PrivilegeSimulationState; accepted: boolean } {
  const key = choice.trim();

  if (state.screen === "root") {
    const option = PRIVILEGE_USSD_ROOT_OPTIONS.find((o) => o.key === key);
    if (!option) return { state, accepted: false };
    if (key === "1") {
      return {
        state: { ...state, screen: "forfaits", stubLabel: null },
        accepted: true,
      };
    }
    return {
      state: toStub(state, option.label, "root"),
      accepted: true,
    };
  }

  if (state.screen === "forfaits") {
    if (key === "0") {
      return {
        state: { ...state, screen: "root", stubLabel: null, returnScreen: "root" },
        accepted: true,
      };
    }
    const option = PRIVILEGE_FORFAITS_OPTIONS.find((o) => o.key === key);
    if (!option) return { state, accepted: false };
    return {
      state: toStub(state, option.label, "forfaits"),
      accepted: true,
    };
  }

  if (key === "0") {
    return {
      state: {
        screen: state.returnScreen,
        stubLabel: null,
        returnScreen: state.returnScreen === "forfaits" ? "root" : "root",
      },
      accepted: true,
    };
  }

  return { state, accepted: false };
}
