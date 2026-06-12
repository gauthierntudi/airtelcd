import type { EventDayId } from "@/lib/event-days";

export type AdminWhatsAppDayId = 1 | 2 | 3;

export type AdminWhatsAppTemplate = {
  id: string;
  label: string;
  contentSid: string;
};

export type AdminWhatsAppDay = {
  id: AdminWhatsAppDayId;
  eventDayId: EventDayId;
  label: string;
};

export const ADMIN_WHATSAPP_DAYS: AdminWhatsAppDay[] = [
  { id: 1, eventDayId: "2026-06-12", label: "Jour 1 — 12 juin" },
  { id: 2, eventDayId: "2026-06-13", label: "Jour 2 — 13 juin" },
  { id: 3, eventDayId: "2026-06-14", label: "Jour 3 — 14 juin" },
];

export const ADMIN_WHATSAPP_TEMPLATES: Record<
  AdminWhatsAppDayId,
  AdminWhatsAppTemplate[]
> = {
  1: [
    {
      id: "1",
      label: "Template 1",
      contentSid: "HX82f38d7bbcbdd92f8a81397e147e0be8",
    },
    {
      id: "2",
      label: "Template 2",
      contentSid: "HX93ea9802848d5f674b9d2b3835d058e6",
    },
    {
      id: "3",
      label: "Template 3",
      contentSid: "HX8b014f59592823b77bd086f36964588f",
    },
    {
      id: "4",
      label: "Template 4",
      contentSid: "HX49425a25cebfe2dce8d79c269d67d943",
    },
  ],
  2: [
    {
      id: "1",
      label: "Template 1",
      contentSid: "HXaad52c34a35e957cd849dac5e4dfc97d",
    },
    {
      id: "2",
      label: "Template 2",
      contentSid: "HX52991cffe25b50907f77808bc4d9939c",
    },
    {
      id: "3",
      label: "Template 3",
      contentSid: "HX0572bceed5d60e45cb048d23bccd38f5",
    },
    {
      id: "4",
      label: "Template 4",
      contentSid: "HX5ff440c813d1f91b31eb4bdf842a6e32",
    },
  ],
  3: [
    {
      id: "1",
      label: "Template 1",
      contentSid: "HX53e37962bdc34a9860b0a230e3c2607d",
    },
    {
      id: "2",
      label: "Template 2",
      contentSid: "HXce62e9cfafbbda2b5bd8e3f2c80aaf9d",
    },
    {
      id: "3",
      label: "Template 3",
      contentSid: "HX3dfba3ff86e592123da1240c88ff74c9",
    },
    {
      id: "4",
      label: "Template 4",
      contentSid: "HX79f99f6a9db295e53f6c89720c4a5311",
    },
    {
      id: "5",
      label: "Template 5",
      contentSid: "HXd9020e379f57ee10c7c7a8a39e3625ed",
    },
  ],
};

export function parseAdminWhatsAppDayId(
  value: unknown,
): AdminWhatsAppDayId | null {
  const n = Number(value);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

export function getAdminWhatsAppDay(dayId: AdminWhatsAppDayId): AdminWhatsAppDay {
  return ADMIN_WHATSAPP_DAYS.find((d) => d.id === dayId)!;
}

export function resolveAdminWhatsAppTemplate(
  dayId: AdminWhatsAppDayId,
  templateId: string,
): AdminWhatsAppTemplate {
  const template = ADMIN_WHATSAPP_TEMPLATES[dayId].find((t) => t.id === templateId);
  if (!template) {
    throw new Error("Template WhatsApp introuvable pour ce jour.");
  }
  return template;
}
