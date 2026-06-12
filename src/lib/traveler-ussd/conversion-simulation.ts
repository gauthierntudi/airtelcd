export type TravelerConversionUssdScreenId = "menu" | "volume" | "confirm";

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

export type TravelerConversionUssdState = {
  screen: TravelerConversionUssdScreenId;
  conversionLabel: string | null;
  volume: string | null;
};

export const TRAVELER_CONVERSION_MENU_OPTIONS: UssdMenuOption[] = [
  { key: "1", label: "Voix vers Internet" },
  { key: "2", label: "Internet vers Voix" },
  { key: "3", label: "Internet:Local vers Roaming" },
  { key: "4", label: "Internet:Roaming vers Local" },
];

export const INITIAL_TRAVELER_CONVERSION_USSD_STATE: TravelerConversionUssdState =
  {
    screen: "menu",
    conversionLabel: null,
    volume: null,
  };

export type TravelerConversionUssdResult =
  | { type: "noop" }
  | { type: "complete" }
  | { type: "cancelled" };

export function getTravelerConversionUssdScreenView(
  state: TravelerConversionUssdState,
): UssdScreenView {
  if (state.screen === "menu") {
    return {
      title: "Convertir Forfait",
      lines: [],
      options: TRAVELER_CONVERSION_MENU_OPTIONS,
      inputMode: "keypad",
    };
  }

  if (state.screen === "volume") {
    return {
      title: "Convertir Forfait",
      lines: [
        state.conversionLabel ?? "",
        "",
        "Insérer le volume à convertir (0.5G ou 3G)",
      ],
      options: [],
      inputMode: "keypad",
    };
  }

  return {
    title: "Convertir Forfait",
    lines: [
      state.conversionLabel ?? "",
      `Volume : ${state.volume ?? "—"}`,
      "",
      "Confirmer la conversion ?",
    ],
    options: [
      { key: "1", label: "Confirmer" },
      { key: "2", label: "Annuler" },
    ],
    inputMode: "keypad",
  };
}

/** Affichage clavier : 0 puis N → 0.N (ex. 05 → 0.5, 02 → 0.2) */
export function formatVolumeKeypadDisplay(input: string): string {
  if (!input) return "";
  if (input.startsWith("0") && input.length > 1) {
    return `0.${input.slice(1)}`;
  }
  return input;
}

/**
 * Quantité libre saisie au clavier (chiffres).
 * Ex. 3 → 3G, 05 → 0.5G, 10 → 10G
 */
export function normalizeVolumeFromKeypad(input: string): string | null {
  const raw = input.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;

  if (raw.startsWith("0") && raw.length > 1) {
    return `${raw[0]}.${raw.slice(1)}G`;
  }

  if (raw === "0") return null;

  return `${raw}G`;
}

export function applyTravelerConversionUssdChoice(
  state: TravelerConversionUssdState,
  choice: string,
): {
  state: TravelerConversionUssdState;
  accepted: boolean;
  result: TravelerConversionUssdResult;
} {
  const key = choice.trim();
  const noop = { result: { type: "noop" } as const };

  if (state.screen === "menu") {
    const option = TRAVELER_CONVERSION_MENU_OPTIONS.find((o) => o.key === key);
    if (!option) return { state, accepted: false, ...noop };
    return {
      state: {
        ...state,
        screen: "volume",
        conversionLabel: option.label,
      },
      accepted: true,
      ...noop,
    };
  }

  if (state.screen === "volume") {
    const volume = normalizeVolumeFromKeypad(key);
    if (!volume) return { state, accepted: false, ...noop };
    return {
      state: {
        ...state,
        screen: "confirm",
        volume,
      },
      accepted: true,
      ...noop,
    };
  }

  if (key === "1") {
    return {
      state,
      accepted: true,
      result: { type: "complete" },
    };
  }

  if (key === "2") {
    return {
      state,
      accepted: true,
      result: { type: "cancelled" },
    };
  }

  return { state, accepted: false, ...noop };
}
