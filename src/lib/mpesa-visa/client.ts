import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import type { UssdPersistAction } from "@/lib/mpesa-ussd/side-effects";
import { publicPath } from "@/lib/branding";

let mpesaVisaCache: MpesaVisaExperienceState | null = null;

export function peekMpesaVisaCache(): MpesaVisaExperienceState | null {
  return mpesaVisaCache;
}

export function invalidateMpesaVisaCache() {
  mpesaVisaCache = null;
}

export function isMpesaAuthError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("otp") || m.includes("connectez-vous") || m.includes("session");
}

export async function fetchMpesaVisaState(options?: {
  force?: boolean;
}): Promise<MpesaVisaExperienceState> {
  if (mpesaVisaCache && !options?.force) {
    return mpesaVisaCache;
  }

  const res = await fetch(publicPath("/api/mpesa/visa"), { credentials: "include" });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error ?? "Session requise") as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  mpesaVisaCache = data as MpesaVisaExperienceState;
  return mpesaVisaCache;
}

export async function runMpesaVisaAction(
  action: UssdPersistAction,
): Promise<MpesaVisaExperienceState> {
  const res = await fetch(publicPath("/api/mpesa/visa"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Erreur");
  }
  mpesaVisaCache = data as MpesaVisaExperienceState;
  return mpesaVisaCache;
}
