export type PrivilegeOptInScreenId = "main" | "confirm";

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

export type PrivilegeOptInState = {
  screen: PrivilegeOptInScreenId;
};

export const INITIAL_PRIVILEGE_OPT_IN_STATE: PrivilegeOptInState = {
  screen: "main",
};

export function getPrivilegeOptInScreenView(
  state: PrivilegeOptInState,
): UssdScreenView {
  if (state.screen === "main") {
    return {
      title: "Vodacom Privilège",
      lines: [],
      options: [
        { key: "1", label: "Opt-In" },
        { key: "2", label: "Annuler" },
      ],
      showInput: true,
    };
  }

  return {
    title: "Vodacom Privilège",
    lines: ["Opt-In"],
    options: [{ key: "1", label: "Confirmer" }],
    showInput: true,
  };
}

export type PrivilegeOptInResult =
  | { type: "noop" }
  | { type: "cancel" }
  | { type: "confirm" };

export function applyPrivilegeOptInChoice(
  state: PrivilegeOptInState,
  choice: string,
): { state: PrivilegeOptInState; accepted: boolean; result: PrivilegeOptInResult } {
  const key = choice.trim();

  if (state.screen === "main") {
    if (key === "1") {
      return {
        state: { screen: "confirm" },
        accepted: true,
        result: { type: "noop" },
      };
    }
    if (key === "2") {
      return {
        state,
        accepted: true,
        result: { type: "cancel" },
      };
    }
    return { state, accepted: false, result: { type: "noop" } };
  }

  if (key === "1") {
    return {
      state,
      accepted: true,
      result: { type: "confirm" },
    };
  }

  return { state, accepted: false, result: { type: "noop" } };
}
