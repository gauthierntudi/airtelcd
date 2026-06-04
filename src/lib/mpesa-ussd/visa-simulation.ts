export type UssdScreenId =
  | "root"
  | "root_stub"
  | "visa_no_card"
  | "visa_main"
  | "visa_create_confirm"
  | "visa_create_success"
  | "visa_my_card"
  | "visa_card_number"
  | "visa_card_expiry"
  | "visa_card_cvv"
  | "visa_card_status"
  | "visa_block_confirm"
  | "visa_block_done"
  | "visa_unblock_done"
  | "visa_delete_confirm"
  | "visa_delete_done"
  | "visa_history"
  | "visa_history_list"
  | "visa_assistance"
  | "visa_assistance_info";

export type VisaSimulationState = {
  screen: UssdScreenId;
  hasCard: boolean;
  cardBlocked: boolean;
  historyCount: 5 | 10;
  assistanceTopic: string | null;
  stubLabel: string | null;
};

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

export const INITIAL_VISA_SIM_STATE: VisaSimulationState = {
  screen: "root",
  hasCard: false,
  cardBlocked: false,
  historyCount: 5,
  assistanceTopic: null,
  stubLabel: null,
};

const DEMO_CARD = {
  number: "4532 •••• •••• 8291",
  expiry: "08/26",
  cvv: "•••",
};

function statusLine(blocked: boolean): string {
  return blocked ? "Bloquée" : "Active";
}

export function getUssdScreenView(state: VisaSimulationState): UssdScreenView {
  const { screen, hasCard, cardBlocked, historyCount, assistanceTopic, stubLabel } =
    state;

  switch (screen) {
    case "root":
      return {
        title: "M-PESA",
        lines: ["Veuillez Sélectionner"],
        options: [
          { key: "1", label: "M-Pesa USD" },
          { key: "2", label: "M-Pesa FC" },
          { key: "3", label: "Inviter un proche" },
          { key: "4", label: "Balance Rallonge" },
          { key: "5", label: "Petit Commerce" },
          { key: "6", label: "Achat Produits" },
          { key: "7", label: "M-Pesa Carte Visa" },
          { key: "8", label: "Compte Bonus" },
        ],
        showInput: true,
      };

    case "root_stub":
      return {
        title: "M-PESA",
        lines: [
          stubLabel ?? "Option",
          "",
          "Simulation — parcours non disponible dans cette démo.",
          "Revenez au menu principal.",
        ],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_no_card":
      return {
        title: "M-PESA CARTE VISA",
        lines: [
          "Vous ne disposez pas encore",
          "d'une Carte Visa M-Pesa.",
        ],
        options: [
          { key: "1", label: "Créer une carte Visa" },
          { key: "0", label: "Retour" },
        ],
        showInput: true,
      };

    case "visa_main":
      return {
        title: "M-PESA CARTE VISA",
        lines: [],
        options: [
          { key: "1", label: "Créer une carte Visa" },
          { key: "2", label: "Ma carte Visa" },
          { key: "3", label: "Historique des transactions" },
          { key: "4", label: "Assistance" },
          { key: "0", label: "Retour" },
        ],
        showInput: true,
      };

    case "visa_create_confirm":
      return {
        title: "CRÉATION CARTE VISA",
        lines: [
          "Frais de création : 1 USD",
          "Validité : 6 mois",
        ],
        options: [
          { key: "1", label: "Confirmer" },
          { key: "2", label: "Annuler" },
        ],
        showInput: true,
      };

    case "visa_create_success":
      return {
        title: "M-PESA CARTE VISA",
        lines: [
          "Votre Carte Visa M-Pesa",
          "a été créée avec succès.",
        ],
        options: [
          { key: "1", label: "Voir les détails" },
          { key: "0", label: "Retour" },
        ],
        showInput: true,
      };

    case "visa_my_card":
      return {
        title: "MA CARTE VISA",
        lines: [`Statut : ${statusLine(cardBlocked)}`],
        options: [
          { key: "1", label: "Voir le numéro de carte" },
          { key: "2", label: "Voir la date d'expiration" },
          { key: "3", label: "Voir le CVV" },
          { key: "4", label: "Statut de la carte" },
          { key: "5", label: "Bloquer la carte" },
          { key: "6", label: "Débloquer la carte" },
          { key: "7", label: "Supprimer la carte" },
          { key: "0", label: "Retour" },
        ],
        showInput: true,
      };

    case "visa_card_number":
      return {
        title: "MA CARTE VISA",
        lines: ["Numéro de carte :", DEMO_CARD.number],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_card_expiry":
      return {
        title: "MA CARTE VISA",
        lines: ["Date d'expiration :", DEMO_CARD.expiry],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_card_cvv":
      return {
        title: "MA CARTE VISA",
        lines: ["CVV :", DEMO_CARD.cvv, "(Simulation — non réel)"],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_card_status":
      return {
        title: "MA CARTE VISA",
        lines: [
          `Statut : ${statusLine(cardBlocked)}`,
          "Validité : 6 mois",
          "Solde lié : M-Pesa FC",
        ],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_block_confirm":
      return {
        title: "MA CARTE VISA",
        lines: ["Bloquer votre carte Visa M-Pesa ?"],
        options: [
          { key: "1", label: "Confirmer" },
          { key: "2", label: "Annuler" },
        ],
        showInput: true,
      };

    case "visa_block_done":
      return {
        title: "MA CARTE VISA",
        lines: ["Votre carte a été bloquée."],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_unblock_done":
      return {
        title: "MA CARTE VISA",
        lines: ["Votre carte a été débloquée."],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_delete_confirm":
      return {
        title: "MA CARTE VISA",
        lines: ["Supprimer définitivement votre carte ?"],
        options: [
          { key: "1", label: "Confirmer" },
          { key: "2", label: "Annuler" },
        ],
        showInput: true,
      };

    case "visa_delete_done":
      return {
        title: "M-PESA CARTE VISA",
        lines: ["Votre carte a été supprimée."],
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    case "visa_history":
      return {
        title: "HISTORIQUE",
        lines: [],
        options: [
          { key: "1", label: "5 dernières transactions" },
          { key: "2", label: "10 dernières transactions" },
          { key: "0", label: "Retour" },
        ],
        showInput: true,
      };

    case "visa_history_list": {
      const txs = [
        "Achat POS — 12,50 USD",
        "Retrait ATM — 50,00 USD",
        "Paiement en ligne — 8,99 USD",
        "Recharge — 100,00 USD",
        "Frais mensuels — 1,00 USD",
        "Achat POS — 22,00 USD",
        "Paiement — 15,30 USD",
        "Retrait — 30,00 USD",
        "Achat — 5,50 USD",
        "Crédit — 200,00 USD",
      ].slice(0, historyCount);
      return {
        title: "HISTORIQUE",
        lines: txs.map((t, i) => `${i + 1}. ${t}`),
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };
    }

    case "visa_assistance":
      return {
        title: "ASSISTANCE",
        lines: [],
        options: [
          { key: "1", label: "Comment utiliser ma carte ?" },
          { key: "2", label: "Frais de la carte" },
          { key: "3", label: "Conditions d'utilisation" },
          { key: "4", label: "Contacter le service client" },
          { key: "0", label: "Retour" },
        ],
        showInput: true,
      };

    case "visa_assistance_info":
      return {
        title: "ASSISTANCE",
        lines: assistanceInfoLines(assistanceTopic),
        options: [{ key: "0", label: "Retour" }],
        showInput: true,
      };

    default:
      return getUssdScreenView({ ...state, screen: "root" });
  }
}

function assistanceInfoLines(topic: string | null): string[] {
  switch (topic) {
    case "1":
      return [
        "Utilisez votre carte Visa M-Pesa",
        "pour les paiements POS, en ligne",
        "et les retraits ATM partenaires.",
      ];
    case "2":
      return [
        "Création : 1 USD",
        "Validité : 6 mois",
        "Frais selon grille M-Pesa Visa.",
      ];
    case "3":
      return [
        "Carte liée à votre compte M-Pesa.",
        "Usage personnel. Conditions",
        "disponibles sur vodacom.cd",
      ];
    case "4":
      return [
        "Service client : 111",
        "WhatsApp Vodacom RDC",
        "vodacomprivilege.com",
      ];
    default:
      return ["Information non disponible."];
  }
}

export function applyUssdChoice(
  state: VisaSimulationState,
  choice: string,
): { state: VisaSimulationState; accepted: boolean } {
  const key = choice.trim();
  if (!key) return { state, accepted: false };

  const snapshot = JSON.stringify(state);
  const next = applyUssdChoiceInner(state, key);
  return { state: next, accepted: JSON.stringify(next) !== snapshot };
}

function applyUssdChoiceInner(
  state: VisaSimulationState,
  key: string,
): VisaSimulationState {
  const { screen } = state;

  if (screen === "root") {
    if (key === "7") {
      return {
        ...state,
        screen: state.hasCard ? "visa_main" : "visa_no_card",
      };
    }
    const labels: Record<string, string> = {
      "1": "M-Pesa USD",
      "2": "M-Pesa FC",
      "3": "Inviter un proche",
      "4": "Balance Rallonge",
      "5": "Petit Commerce",
      "6": "Achat Produits",
      "8": "Compte Bonus",
    };
    if (labels[key]) {
      return { ...state, screen: "root_stub", stubLabel: labels[key] };
    }
    return state;
  }

  if (screen === "root_stub" && key === "0") {
    return { ...state, screen: "root", stubLabel: null };
  }

  if (screen === "visa_no_card") {
    if (key === "1") return { ...state, screen: "visa_create_confirm" };
    if (key === "0") return { ...state, screen: "root" };
    return state;
  }

  if (screen === "visa_main") {
    if (key === "0") return { ...state, screen: "root" };
    if (key === "1") return { ...state, screen: "visa_create_confirm" };
    if (key === "2" && state.hasCard) return { ...state, screen: "visa_my_card" };
    if (key === "3" && state.hasCard) return { ...state, screen: "visa_history" };
    if (key === "4" && state.hasCard) return { ...state, screen: "visa_assistance" };
    return state;
  }

  if (screen === "visa_create_confirm") {
    if (key === "1") {
      return {
        ...state,
        hasCard: true,
        cardBlocked: false,
        screen: "visa_create_success",
      };
    }
    if (key === "2") {
      return {
        ...state,
        screen: state.hasCard ? "visa_main" : "visa_no_card",
      };
    }
    return state;
  }

  if (screen === "visa_create_success") {
    if (key === "1") return { ...state, screen: "visa_my_card" };
    if (key === "0") return { ...state, screen: "visa_main" };
    return state;
  }

  if (screen === "visa_my_card") {
    if (key === "0") return { ...state, screen: "visa_main" };
    if (key === "1") return { ...state, screen: "visa_card_number" };
    if (key === "2") return { ...state, screen: "visa_card_expiry" };
    if (key === "3") return { ...state, screen: "visa_card_cvv" };
    if (key === "4") return { ...state, screen: "visa_card_status" };
    if (key === "5" && !state.cardBlocked) {
      return { ...state, screen: "visa_block_confirm" };
    }
    if (key === "6" && state.cardBlocked) {
      return { ...state, screen: "visa_unblock_done", cardBlocked: false };
    }
    if (key === "7") return { ...state, screen: "visa_delete_confirm" };
    return state;
  }

  if (screen === "visa_block_confirm") {
    if (key === "1") {
      return { ...state, cardBlocked: true, screen: "visa_block_done" };
    }
    if (key === "2") return { ...state, screen: "visa_my_card" };
    return state;
  }

  if (screen === "visa_block_done" && key === "0") {
    return { ...state, screen: "visa_my_card" };
  }

  if (screen === "visa_unblock_done" && key === "0") {
    return { ...state, screen: "visa_my_card" };
  }

  if (screen === "visa_delete_confirm") {
    if (key === "1") {
      return {
        ...state,
        hasCard: false,
        cardBlocked: false,
        screen: "visa_delete_done",
      };
    }
    if (key === "2") return { ...state, screen: "visa_my_card" };
    return state;
  }

  if (screen === "visa_delete_done" && key === "0") {
    return { ...state, screen: "visa_no_card" };
  }

  if (
    screen === "visa_card_number" ||
    screen === "visa_card_expiry" ||
    screen === "visa_card_cvv" ||
    screen === "visa_card_status"
  ) {
    if (key === "0") return { ...state, screen: "visa_my_card" };
    return state;
  }

  if (screen === "visa_history") {
    if (key === "0") return { ...state, screen: "visa_main" };
    if (key === "1") {
      return { ...state, historyCount: 5, screen: "visa_history_list" };
    }
    if (key === "2") {
      return { ...state, historyCount: 10, screen: "visa_history_list" };
    }
    return state;
  }

  if (screen === "visa_history_list" && key === "0") {
    return { ...state, screen: "visa_history" };
  }

  if (screen === "visa_assistance") {
    if (key === "0") return { ...state, screen: "visa_main" };
    if (["1", "2", "3", "4"].includes(key)) {
      return {
        ...state,
        assistanceTopic: key,
        screen: "visa_assistance_info",
      };
    }
    return state;
  }

  if (screen === "visa_assistance_info" && key === "0") {
    return { ...state, screen: "visa_assistance", assistanceTopic: null };
  }

  return state;
}
