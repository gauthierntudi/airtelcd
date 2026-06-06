import {
  getMessagingConfig,
  isTwilioVerifyConfigured,
} from "@/lib/messaging/config";
import twilio from "twilio";

/** Marqueur en base — le code est géré par Twilio Verify (pas de hash local). */
export const TWILIO_VERIFY_OTP_MARKER = "twilio-verify";

function verifyClient() {
  const { verify, verifyServiceSid } = getMessagingConfig().twilio;
  return {
    client: twilio(verify.accountSid!, verify.authToken!),
    serviceSid: verifyServiceSid!,
  };
}

function twilioErrorMessage(e: unknown): string {
  if (e && typeof e === "object") {
    const err = e as { message?: unknown; code?: number };
    if (err.code === 20404) {
      return (
        "Service Verify introuvable sur ce compte Twilio. Vérifiez TWILIO_VERIFY_SERVICE_SID " +
        "et TWILIO_VERIFY_ACCOUNT_SID / AUTH_TOKEN (même compte que la console Verify)."
      );
    }
    if (err.message) return String(err.message);
  }
  return "échec Twilio Verify";
}

/** Démarre une vérification SMS via Twilio Verify. */
export async function startTwilioVerifySms(toE164: string): Promise<void> {
  if (!isTwilioVerifyConfigured()) {
    throw new Error(
      "Twilio Verify indisponible : TWILIO_VERIFY_SERVICE_SID et identifiants Verify requis.",
    );
  }

  const { client, serviceSid } = verifyClient();

  try {
    await client.verify.v2.services(serviceSid).verifications.create({
      to: toE164,
      channel: "sms",
      locale: "fr",
    });
  } catch (e) {
    throw new Error(`Vérification SMS : ${twilioErrorMessage(e)}`);
  }
}

/** Valide le code saisi par l'invité (Twilio Verify). */
export async function checkTwilioVerifySms(
  toE164: string,
  code: string,
): Promise<boolean> {
  if (!isTwilioVerifyConfigured()) {
    throw new Error("Twilio Verify non configuré.");
  }

  const normalized = code.replace(/\D/g, "");
  if (normalized.length < 4) return false;

  const { client, serviceSid } = verifyClient();

  try {
    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: toE164,
        code: normalized,
      });
    return check.status === "approved";
  } catch (e) {
    const msg = twilioErrorMessage(e).toLowerCase();
    if (msg.includes("not found") || msg.includes("no pending")) {
      return false;
    }
    throw new Error(`Vérification du code : ${twilioErrorMessage(e)}`);
  }
}
