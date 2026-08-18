import type { ContactChannel } from "@/lib/guest-contact";
import type { GuestContactFields } from "@/lib/guest-contact";

export type TwilioCredentials = {
  accountSid: string | undefined;
  authToken: string | undefined;
  from: string | undefined;
};

export type TwilioWhatsappCredentials = TwilioCredentials & {
  /** @deprecated Préférer contentInviteThreeDaysSid */
  contentInviteSid: string | undefined;
  /** Template 3 jours — {{1}} token */
  contentInviteThreeDaysSid: string | undefined;
  /** Template 1 jour — {{1}} date, {{2}} horaire, {{3}} token */
  contentInviteOneDaySid: string | undefined;
  /** @deprecated Alias contentInviteThreeDaysSid */
  contentInviteNominativeSid: string | undefined;
  /** @deprecated Alias contentInviteOneDaySid */
  contentInviteSimpleSid: string | undefined;
};

function twilioWhatsappCredentials(): TwilioWhatsappCredentials {
  const legacyInviteSid = process.env.TWILIO_WHATSAPP_CONTENT_INVITE_SID?.trim();
  const threeDaysSid =
    process.env.TWILIO_WHATSAPP_CONTENT_INVITE_THREE_DAYS_SID?.trim() ||
    process.env.TWILIO_WHATSAPP_CONTENT_INVITE_NOMINATIVE_SID?.trim() ||
    legacyInviteSid;
  const oneDaySid =
    process.env.TWILIO_WHATSAPP_CONTENT_INVITE_ONE_DAY_SID?.trim() ||
    process.env.TWILIO_WHATSAPP_CONTENT_INVITE_SIMPLE_SID?.trim();
  return {
    accountSid:
      process.env.TWILIO_WHATSAPP_ACCOUNT_SID?.trim() ||
      process.env.TWILIO_ACCOUNT_SID?.trim(),
    authToken:
      process.env.TWILIO_WHATSAPP_AUTH_TOKEN?.trim() ||
      process.env.TWILIO_AUTH_TOKEN?.trim(),
    from: process.env.TWILIO_WHATSAPP_FROM?.trim(),
    contentInviteSid: legacyInviteSid,
    contentInviteThreeDaysSid: threeDaysSid,
    contentInviteOneDaySid: oneDaySid,
    contentInviteNominativeSid: threeDaysSid,
    contentInviteSimpleSid: oneDaySid,
  };
}

function twilioSmsCredentials(): TwilioCredentials {
  return {
    accountSid: process.env.TWILIO_SMS_ACCOUNT_SID?.trim(),
    authToken: process.env.TWILIO_SMS_AUTH_TOKEN?.trim(),
    from: process.env.TWILIO_SMS_FROM?.trim(),
  };
}

function twilioVerifyServiceSid(): string | undefined {
  return process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
}

/** Compte Twilio hébergeant le Verify Service (souvent ≠ compte SMS). */
function twilioVerifyCredentials(): TwilioCredentials {
  return {
    accountSid:
      process.env.TWILIO_VERIFY_ACCOUNT_SID?.trim() ||
      process.env.TWILIO_WHATSAPP_ACCOUNT_SID?.trim() ||
      process.env.TWILIO_SMS_ACCOUNT_SID?.trim(),
    authToken:
      process.env.TWILIO_VERIFY_AUTH_TOKEN?.trim() ||
      process.env.TWILIO_WHATSAPP_AUTH_TOKEN?.trim() ||
      process.env.TWILIO_SMS_AUTH_TOKEN?.trim(),
    from: undefined,
  };
}

export function getMessagingConfig() {
  return {
    brevo: {
      apiKey: process.env.BREVO_API_KEY?.trim(),
      senderEmail: process.env.BREVO_SENDER_EMAIL?.trim(),
      senderName:
        process.env.BREVO_SENDER_NAME?.trim() ?? "Airtel RSVP",
    },
    twilio: {
      whatsapp: twilioWhatsappCredentials(),
      sms: twilioSmsCredentials(),
      verify: twilioVerifyCredentials(),
      verifyServiceSid: twilioVerifyServiceSid(),
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim(),
  };
}

export function isBrevoConfigured(): boolean {
  const { brevo } = getMessagingConfig();
  return Boolean(brevo.apiKey && brevo.senderEmail);
}

export function isTwilioWhatsappCredentialsConfigured(): boolean {
  const { whatsapp } = getMessagingConfig().twilio;
  return Boolean(whatsapp.accountSid && whatsapp.authToken && whatsapp.from);
}

export function isTwilioWhatsappConfigured(): boolean {
  const { whatsapp } = getMessagingConfig().twilio;
  return (
    isTwilioWhatsappCredentialsConfigured() &&
    Boolean(whatsapp.contentInviteThreeDaysSid && whatsapp.contentInviteOneDaySid)
  );
}

/** @deprecated Alias — WhatsApp invitations */
export function isTwilioConfigured(): boolean {
  return isTwilioWhatsappConfigured();
}

/** Expéditeur Twilio SMS : E.164 (+243…) ou Sender ID alphanumérique (ex. GOLF2026). */
export function isValidTwilioSmsFrom(from: string | undefined): boolean {
  const value = from?.trim();
  if (!value) return false;
  if (/^\+[1-9]\d{6,14}$/.test(value)) return true;
  return /^[A-Za-z][A-Za-z0-9]{0,10}$/.test(value);
}

export function isTwilioSmsConfigured(): boolean {
  const { sms } = getMessagingConfig().twilio;
  return Boolean(
    sms.accountSid && sms.authToken && isValidTwilioSmsFrom(sms.from),
  );
}

/** Twilio Verify — OTP SMS (recommandé, remplace l'envoi SMS manuel). */
export function isTwilioVerifyConfigured(): boolean {
  const { verify, verifyServiceSid } = getMessagingConfig().twilio;
  return Boolean(
    verify.accountSid && verify.authToken && verifyServiceSid,
  );
}

/** OTP SMS disponible : Verify (prioritaire) ou SMS classique. */
export function isOtpSmsChannelConfigured(): boolean {
  return isTwilioVerifyConfigured() || isTwilioSmsConfigured();
}

export function isChannelConfigured(channel: ContactChannel): boolean {
  if (channel === "email") return isBrevoConfigured();
  if (channel === "whatsapp") return isTwilioWhatsappConfigured();
  return false;
}

export type MessagingStatus = {
  brevo: boolean;
  twilioWhatsapp: boolean;
  twilioSms: boolean;
  twilioVerify: boolean;
  /** Au moins un fournisseur prêt à envoyer des invitations */
  canSendAny: boolean;
};

export function getMessagingStatus(): MessagingStatus {
  const brevo = isBrevoConfigured();
  const twilioWhatsapp = isTwilioWhatsappConfigured();
  const twilioSms = isTwilioSmsConfigured();
  const twilioVerify = isTwilioVerifyConfigured();
  return {
    brevo,
    twilioWhatsapp,
    twilioSms,
    twilioVerify,
    canSendAny: brevo || twilioWhatsapp || isTwilioWhatsappCredentialsConfigured(),
  };
}

export type EnvVarCheck = {
  name: string;
  label: string;
  configured: boolean;
};

export type SystemMessagingReport = {
  status: MessagingStatus;
  overall: "ok" | "partial" | "offline";
  brevo: {
    configured: boolean;
    checks: EnvVarCheck[];
    senderEmail: string | null;
    senderName: string;
  };
  twilioWhatsapp: {
    configured: boolean;
    checks: EnvVarCheck[];
    from: string | null;
  };
  twilioSms: {
    configured: boolean;
    checks: EnvVarCheck[];
    from: string | null;
  };
  twilioVerify: {
    configured: boolean;
    checks: EnvVarCheck[];
    serviceSid: string | null;
  };
  appUrl: string | null;
  sendPriority: string;
};

export function getSystemMessagingReport(): SystemMessagingReport {
  const cfg = getMessagingConfig();
  const status = getMessagingStatus();

  const brevoChecks: EnvVarCheck[] = [
    {
      name: "BREVO_API_KEY",
      label: "Clé API Brevo",
      configured: Boolean(cfg.brevo.apiKey),
    },
    {
      name: "BREVO_SENDER_EMAIL",
      label: "Email expéditeur (vérifié dans Brevo)",
      configured: Boolean(cfg.brevo.senderEmail),
    },
  ];

  const twilioWhatsappChecks: EnvVarCheck[] = [
    {
      name: "TWILIO_WHATSAPP_ACCOUNT_SID",
      label: "Account SID (WhatsApp)",
      configured: Boolean(cfg.twilio.whatsapp.accountSid),
    },
    {
      name: "TWILIO_WHATSAPP_AUTH_TOKEN",
      label: "Auth token (WhatsApp)",
      configured: Boolean(cfg.twilio.whatsapp.authToken),
    },
    {
      name: "TWILIO_WHATSAPP_FROM",
      label: "Numéro WhatsApp (from)",
      configured: Boolean(cfg.twilio.whatsapp.from),
    },
    {
      name: "TWILIO_WHATSAPP_CONTENT_INVITE_THREE_DAYS_SID",
      label: "Template WhatsApp 3 jours (Content SID)",
      configured: Boolean(cfg.twilio.whatsapp.contentInviteThreeDaysSid),
    },
    {
      name: "TWILIO_WHATSAPP_CONTENT_INVITE_ONE_DAY_SID",
      label: "Template WhatsApp 1 jour (Content SID)",
      configured: Boolean(cfg.twilio.whatsapp.contentInviteOneDaySid),
    },
  ];

  const twilioSmsChecks: EnvVarCheck[] = [
    {
      name: "TWILIO_SMS_ACCOUNT_SID",
      label: "Account SID (SMS / Verify)",
      configured: Boolean(cfg.twilio.sms.accountSid),
    },
    {
      name: "TWILIO_SMS_AUTH_TOKEN",
      label: "Auth token (SMS / Verify)",
      configured: Boolean(cfg.twilio.sms.authToken),
    },
    {
      name: "TWILIO_SMS_FROM",
      label: "Expéditeur SMS legacy (si Verify absent)",
      configured: isValidTwilioSmsFrom(cfg.twilio.sms.from),
    },
  ];

  const twilioVerifyChecks: EnvVarCheck[] = [
    {
      name: "TWILIO_VERIFY_SERVICE_SID",
      label: "Verify Service SID (VA…)",
      configured: Boolean(cfg.twilio.verifyServiceSid),
    },
    {
      name: "TWILIO_VERIFY_ACCOUNT_SID",
      label: "Account SID Verify (ou WhatsApp en repli)",
      configured: Boolean(cfg.twilio.verify.accountSid),
    },
    {
      name: "TWILIO_VERIFY_AUTH_TOKEN",
      label: "Auth token Verify (ou WhatsApp en repli)",
      configured: Boolean(cfg.twilio.verify.authToken),
    },
  ];

  let overall: SystemMessagingReport["overall"] = "offline";
  if (status.brevo && status.twilioWhatsapp) overall = "ok";
  else if (status.canSendAny) overall = "partial";

  return {
    status,
    overall,
    brevo: {
      configured: status.brevo,
      checks: brevoChecks,
      senderEmail: cfg.brevo.senderEmail ?? null,
      senderName: cfg.brevo.senderName,
    },
    twilioWhatsapp: {
      configured: status.twilioWhatsapp,
      checks: twilioWhatsappChecks,
      from: cfg.twilio.whatsapp.from ?? null,
    },
    twilioSms: {
      configured: status.twilioSms,
      checks: twilioSmsChecks,
      from: cfg.twilio.sms.from ?? null,
    },
    twilioVerify: {
      configured: status.twilioVerify,
      checks: twilioVerifyChecks,
      serviceSid: cfg.twilio.verifyServiceSid ?? null,
    },
    appUrl: cfg.appUrl ?? null,
    sendPriority:
      "Invitations : Brevo + Twilio WhatsApp. OTP : email via Brevo ; SMS via Twilio Verify (recommandé) ou SMS classique si TWILIO_VERIFY_SERVICE_SID absent.",
  };
}

/** Canaux utilisables : contact présent ET API configurée pour ce canal. */
export function getSendableMessageChannels(
  guest: GuestContactFields,
): ContactChannel[] {
  const channels: ContactChannel[] = [];
  if (guest.email?.trim() && isBrevoConfigured()) channels.push("email");
  if (guest.phone?.trim() && isTwilioWhatsappCredentialsConfigured()) {
    channels.push("whatsapp");
  }
  return channels;
}

/** @deprecated Utiliser getSendableMessageChannels — premier canal ou null */
export function getSendableMessageChannel(
  guest: GuestContactFields,
): ContactChannel | null {
  return getSendableMessageChannels(guest)[0] ?? null;
}

export function canSendInvitationToGuest(guest: GuestContactFields): boolean {
  return getSendableMessageChannels(guest).length > 0;
}

export function assertChannelConfigured(channel: ContactChannel): void {
  if (channel === "email" && !isBrevoConfigured()) {
    throw new Error(
      "Envoi email impossible : BREVO_API_KEY et BREVO_SENDER_EMAIL non configurés dans .env",
    );
  }
  if (channel === "whatsapp" && !isTwilioWhatsappCredentialsConfigured()) {
    throw new Error(
      "Envoi WhatsApp impossible : TWILIO_WHATSAPP_ACCOUNT_SID, TWILIO_WHATSAPP_AUTH_TOKEN et TWILIO_WHATSAPP_FROM requis.",
    );
  }
}

export function assertCanSendInvitation(guest: GuestContactFields): ContactChannel[] {
  const channels = getSendableMessageChannels(guest);
  if (channels.length > 0) return channels;

  const hasEmail = Boolean(guest.email?.trim());
  const hasPhone = Boolean(guest.phone?.trim());

  if (!hasEmail && !hasPhone) {
    throw new Error(
      "Aucun canal de contact : renseignez un email ou un numéro valide.",
    );
  }
  if (hasEmail && !isBrevoConfigured()) {
    throw new Error(
      "Brevo non configuré : l'envoi par email est désactivé tant que BREVO_API_KEY et BREVO_SENDER_EMAIL ne sont pas définis.",
    );
  }
  throw new Error(
    "Twilio WhatsApp non configuré : variables TWILIO_WHATSAPP_* requises.",
  );
}
