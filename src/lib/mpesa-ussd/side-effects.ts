import type { CarrefourProductId } from "@/lib/mpesa-visa/constants";
import type { UssdScreenId, VisaSimulationState } from "@/lib/mpesa-ussd/visa-simulation";

export type UssdPersistAction =
  | { type: "create_card" }
  | { type: "delete_card" }
  | { type: "block_card" }
  | { type: "unblock_card" }
  | {
      type: "purchase";
      productId: CarrefourProductId;
      payment?: {
        pan: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
      };
    };

export function getUssdPersistAction(
  prev: VisaSimulationState,
  next: VisaSimulationState,
): UssdPersistAction | null {
  if (
    prev.screen === "visa_create_confirm" &&
    next.screen === "visa_create_success"
  ) {
    return { type: "create_card" };
  }
  if (
    prev.screen === "visa_delete_confirm" &&
    next.screen === "visa_delete_done"
  ) {
    return { type: "delete_card" };
  }
  if (prev.screen === "visa_block_confirm" && next.screen === "visa_block_done") {
    return { type: "block_card" };
  }
  if (next.screen === "visa_unblock_done") {
    return { type: "unblock_card" };
  }
  if (next.screen === "carrefour_success" && next.carrefourProductId) {
    return {
      type: "purchase",
      productId: next.carrefourProductId as CarrefourProductId,
    };
  }
  return null;
}

export function screenAfterPersistFailure(
  screen: UssdScreenId,
): UssdScreenId {
  if (screen === "visa_create_success") return "visa_create_confirm";
  if (screen === "carrefour_success") return "carrefour_confirm";
  if (screen === "visa_delete_done") return "visa_my_card";
  if (screen === "visa_block_done" || screen === "visa_unblock_done") {
    return "visa_my_card";
  }
  return "root";
}
