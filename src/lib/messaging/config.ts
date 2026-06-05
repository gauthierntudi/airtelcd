import type { ContactChannel } from "@/lib/guest-contact";
import type { GuestContactFields } from "@/lib/guest-contact";

export type TwilioCredentials = {
  accountSid: string | undefined;
  authToken: string | undefined;
  from: string | undefined;
};

export type TwilioWhatsappCredentials = TwilioCredentials & {
  contentInviteSid: string | undefined;
};

function twilioWhatsappCredentials(): TwilioWhatsappCredentials {
  return {
    accountSid:
      process.env.TWILIO_WHATSAPP_ACCOUNT_SID?.trim() ||
      process.env.TWILIO_ACCOUNT_SID?.trim(),
    authToken:
      process.env.TWILIO_WHATSAPP_AUTH_TOKEN?.trim() ||
      process.env.TWILIO_AUTH_TOKEN?.trim(),
    from: process.env.TWILIO_WHATSAPP_FROM?.trim(),
    contentInviteSid: process.env.TWILIO_WHATSAPP_CONTENT_INVITE_SID?.trim(),
  };
}

function twilioSmsCredentials(): TwilioCredentials {
  return {
    accountSid: process.env.TWILIO_SMS_ACCOUNT_SID?.trim(),
    authToken: process.env.TWILIO_SMS_AUTH_TOKEN?.trim(),
    from: process.env.TWILIO_SMS_FROM?.trim(),
  };
}

export function getMessagingConfig() {
  return {
    brevo: {
      apiKey: process.env.BREVO_API_KEY?.trim(),
      senderEmail: process.env.BREVO_SENDER_EMAIL?.trim(),
      senderName:
        process.env.BREVO_SENDER_NAME?.trim() ?? "Vodacom Privilege Golf",
    },
    twilio: {
      whatsapp: twilioWhatsappCredentials(),
      sms: twilioSmsCredentials(),
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim(),
  };
}

export function isBrevoConfigured(): boolean {
  const { brevo } = getMessagingConfig();
  return Boolean(brevo.apiKey && brevo.senderEmail);
}

export function isTwilioWhatsappConfigured(): boolean {
  const { whatsapp } = getMessagingConfig().twilio;
  return Boolean(
    whatsapp.accountSid &&
      whatsapp.authToken &&
      whatsapp.from &&
      whatsapp.contentInviteSid,
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

export function isChannelConfigured(channel: ContactChannel): boolean {
  if (channel === "email") return isBrevoConfigured();
  if (channel === "whatsapp") return isTwilioWhatsappConfigured();
  return false;
}

export type MessagingStatus = {
  brevo: boolean;
  twilioWhatsapp: boolean;
  twilioSms: boolean;
  /** Au moins un fournisseur prêt à envoyer des invitations */
  canSendAny: boolean;
};

export function getMessagingStatus(): MessagingStatus {
  const brevo = isBrevoConfigured();
  const twilioWhatsapp = isTwilioWhatsappConfigured();
  const twilioSms = isTwilioSmsConfigured();
  return {
    brevo,
    twilioWhatsapp,
    twilioSms,
    canSendAny: brevo || twilioWhatsapp,
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
      name: "TWILIO_WHATSAPP_CONTENT_INVITE_SID",
      label: "Template invitation (Content SID)",
      configured: Boolean(cfg.twilio.whatsapp.contentInviteSid),
    },
  ];

  const twilioSmsChecks: EnvVarCheck[] = [
    {
      name: "TWILIO_SMS_ACCOUNT_SID",
      label: "Account SID (SMS)",
      configured: Boolean(cfg.twilio.sms.accountSid),
    },
    {
      name: "TWILIO_SMS_AUTH_TOKEN",
      label: "Auth token (SMS)",
      configured: Boolean(cfg.twilio.sms.authToken),
    },
    {
      name: "TWILIO_SMS_FROM",
      label: "Expéditeur SMS (E.164 ou Sender ID)",
      configured: isValidTwilioSmsFrom(cfg.twilio.sms.from),
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
    appUrl: cfg.appUrl ?? null,
    sendPriority:
      "Email et WhatsApp envoyés si l'invité a les deux contacts et que Brevo + Twilio sont configurés. Les codes OTP utilisent Brevo + un compte Twilio SMS séparé.",
  };
}

/** Canaux utilisables : contact présent ET API configurée pour ce canal. */
export function getSendableMessageChannels(
  guest: GuestContactFields,
): ContactChannel[] {
  const channels: ContactChannel[] = [];
  if (guest.email?.trim() && isBrevoConfigured()) channels.push("email");
  if (guest.phone?.trim() && isTwilioWhatsappConfigured()) {
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
  if (channel === "whatsapp" && !isTwilioWhatsappConfigured()) {
    throw new Error(
      "Envoi WhatsApp impossible : TWILIO_WHATSAPP_ACCOUNT_SID, TWILIO_WHATSAPP_AUTH_TOKEN, TWILIO_WHATSAPP_FROM et TWILIO_WHATSAPP_CONTENT_INVITE_SID requis.",
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
