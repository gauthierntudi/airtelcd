export type PrivilegeUssdScreenId =
  | "root"
  | "forfaits"
  | "forfaits_privilege_30j"
  | "confirm"
  | "stub";

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
  returnScreen: PrivilegeUssdScreenId;
  selectedPackageLabel: string | null;
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
];

export const PRIVILEGE_FORFAITS_PRIVILEGE_30J_OPTIONS: UssdMenuOption[] = [
  { key: "1", label: "Infos" },
  { key: "2", label: "10Gb+1.1h-10$" },
  { key: "3", label: "30Gb+2.2h+2P2P+Visa-25$" },
  { key: "4", label: "50Gb+2.5h+3P2P+Visa-35$" },
  { key: "5", label: "80Gb+4h+4P2P+Visa-50$" },
  { key: "6", label: "Suivant" },
];

export const PRIVILEGE_PURCHASED_PACKAGE_LABEL = "80Gb+4h+4P2P+Visa-50$";

export const INITIAL_PRIVILEGE_SIM_STATE: PrivilegeSimulationState = {
  screen: "root",
  stubLabel: null,
  returnScreen: "root",
  selectedPackageLabel: null,
};

export type PrivilegeUssdResult =
  | { type: "noop" }
  | { type: "complete" };

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
      options: [...PRIVILEGE_FORFAITS_OPTIONS, { key: "0", label: "Retour" }],
      showInput: true,
    };
  }

  if (state.screen === "forfaits_privilege_30j") {
    return {
      title: "Forfaits Privilege (30j)",
      lines: [],
      options: [
        ...PRIVILEGE_FORFAITS_PRIVILEGE_30J_OPTIONS,
        { key: "0", label: "Retour" },
      ],
      showInput: true,
    };
  }

  if (state.screen === "confirm") {
    return {
      title: "PRIVILEGE",
      lines: [
        `Confirmez | achat de ${state.selectedPackageLabel ?? PRIVILEGE_PURCHASED_PACKAGE_LABEL}?`,
      ],
      options: [
        { key: "1", label: "Confirmer" },
        { key: "2", label: "Annuler" },
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
    ...state,
    screen: "stub",
    stubLabel: label,
    returnScreen,
  };
}

export function applyPrivilegeUssdChoice(
  state: PrivilegeSimulationState,
  choice: string,
): {
  state: PrivilegeSimulationState;
  accepted: boolean;
  result: PrivilegeUssdResult;
} {
  const key = choice.trim();
  const noop = { result: { type: "noop" } as const };

  if (state.screen === "root") {
    const option = PRIVILEGE_USSD_ROOT_OPTIONS.find((o) => o.key === key);
    if (!option) return { state, accepted: false, ...noop };
    if (key === "1") {
      return {
        state: { ...state, screen: "forfaits", stubLabel: null },
        accepted: true,
        ...noop,
      };
    }
    return {
      state: toStub(state, option.label, "root"),
      accepted: true,
      ...noop,
    };
  }

  if (state.screen === "forfaits") {
    if (key === "0") {
      return {
        state: { ...state, screen: "root", stubLabel: null },
        accepted: true,
        ...noop,
      };
    }
    const option = PRIVILEGE_FORFAITS_OPTIONS.find((o) => o.key === key);
    if (!option) return { state, accepted: false, ...noop };
    if (key === "1") {
      return {
        state: { ...state, screen: "forfaits_privilege_30j", stubLabel: null },
        accepted: true,
        ...noop,
      };
    }
    return {
      state: toStub(state, option.label, "forfaits"),
      accepted: true,
      ...noop,
    };
  }

  if (state.screen === "forfaits_privilege_30j") {
    if (key === "0") {
      return {
        state: { ...state, screen: "forfaits", stubLabel: null },
        accepted: true,
        ...noop,
      };
    }
    const option = PRIVILEGE_FORFAITS_PRIVILEGE_30J_OPTIONS.find(
      (o) => o.key === key,
    );
    if (!option) return { state, accepted: false, ...noop };
    if (key === "5") {
      return {
        state: {
          ...state,
          screen: "confirm",
          selectedPackageLabel: option.label,
        },
        accepted: true,
        ...noop,
      };
    }
    if (key === "6") {
      return {
        state: toStub(state, option.label, "forfaits_privilege_30j"),
        accepted: true,
        ...noop,
      };
    }
    return {
      state: toStub(state, option.label, "forfaits_privilege_30j"),
      accepted: true,
      ...noop,
    };
  }

  if (state.screen === "confirm") {
    if (key === "1") {
      return {
        state,
        accepted: true,
        result: { type: "complete" },
      };
    }
    if (key === "2") {
      return {
        state: {
          ...state,
          screen: "forfaits_privilege_30j",
          selectedPackageLabel: null,
        },
        accepted: true,
        ...noop,
      };
    }
    return { state, accepted: false, ...noop };
  }

  if (key === "0") {
    return {
      state: {
        ...state,
        screen: state.returnScreen,
        stubLabel: null,
      },
      accepted: true,
      ...noop,
    };
  }

  return { state, accepted: false, ...noop };
}
