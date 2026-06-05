"use client";

import { Mail, MessageCircle } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { InvitationEmailVariant } from "@/lib/messaging/invitation-email-vars";
import type { MessagingStatus } from "@/lib/messaging/config";
import type { SendInvitationOptions } from "@/lib/messaging/send-options";

type Props = {
  value: SendInvitationOptions;
  onChange: (next: SendInvitationOptions) => void;
  messagingStatus: MessagingStatus;
  compact?: boolean;
};

const EMAIL_TEMPLATES: {
  id: InvitationEmailVariant;
  label: string;
  hint: string;
}[] = [
  { id: "nominative", label: "Nominatif", hint: "Cher/Chère + nom" },
  { id: "simple", label: "Simple", hint: "Sans nom" },
];

export function InvitationSendOptions({
  value,
  onChange,
  messagingStatus,
  compact,
}: Props) {
  const emailDisabled = !messagingStatus.brevo;
  const whatsappDisabled = !messagingStatus.twilioWhatsapp;
  const noChannel = !value.channels.email && !value.channels.whatsapp;

  function setChannel(key: "email" | "whatsapp", checked: boolean) {
    onChange({
      ...value,
      channels: { ...value.channels, [key]: checked },
    });
  }

  function setEmailTemplate(template: InvitationEmailVariant) {
    onChange({ ...value, emailTemplate: template });
  }

  return (
    <div
      className={
        compact
          ? "w-full space-y-3"
          : "w-fit max-w-full rounded-2xl border border-white/[0.08] bg-[#121212] p-4 sm:p-5"
      }
    >
      {!compact ? (
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-vodacom-red/90">
            Options d&apos;envoi
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
        <section className="shrink-0 space-y-2">
          <p className="text-xs font-semibold text-white/60">Canaux</p>
          <div className="flex flex-wrap gap-2">
            <ChannelSwitchRow
              icon={Mail}
              label="Email"
              checked={value.channels.email}
              disabled={emailDisabled}
              onCheckedChange={(c) => setChannel("email", c)}
            />
            <ChannelSwitchRow
              icon={MessageCircle}
              label="WhatsApp"
              checked={value.channels.whatsapp}
              disabled={whatsappDisabled}
              onCheckedChange={(c) => setChannel("whatsapp", c)}
            />
          </div>
        </section>

        {value.channels.email ? (
          <section
            className="shrink-0 space-y-2"
            role="radiogroup"
            aria-label="Template email"
          >
            <p className="text-xs font-semibold text-white/60">Template email</p>
            <div className="flex flex-wrap gap-2">
              {EMAIL_TEMPLATES.map((tpl) => (
                <TemplateSwitchRow
                  key={tpl.id}
                  label={tpl.label}
                  hint={tpl.hint}
                  selected={value.emailTemplate === tpl.id}
                  onSelect={() => setEmailTemplate(tpl.id)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {noChannel ? (
        <p className="mt-3 text-xs text-amber-400/90">Activez au moins un canal.</p>
      ) : null}
    </div>
  );
}

function ChannelSwitchRow({
  icon,
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  icon: typeof Mail;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label} — ${checked ? "activé" : "désactivé"}`}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`inline-flex items-center gap-2.5 rounded-xl border py-2 pl-2.5 pr-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vodacom-red/50 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked && !disabled
          ? "border-vodacom-red/35 bg-vodacom-red/[0.08]"
          : "border-white/10 bg-[#1a1a1a] hover:border-white/18"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          checked && !disabled
            ? "bg-vodacom-red/20 text-vodacom-red"
            : "bg-white/5 text-white/45"
        }`}
      >
        <LucideIcon icon={icon} size={16} />
      </span>
      <span className="text-sm font-medium text-white">{label}</span>
      <ToggleSwitchVisual checked={checked && !disabled} />
    </button>
  );
}

function TemplateSwitchRow({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      title={hint}
      onClick={onSelect}
      className={`inline-flex items-center gap-2.5 rounded-xl border py-2 pl-3 pr-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vodacom-red/50 ${
        selected
          ? "border-vodacom-red/35 bg-vodacom-red/[0.08]"
          : "border-white/10 bg-[#1a1a1a] hover:border-white/18"
      }`}
    >
      <span className="text-left">
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="block text-[10px] text-white/40">{hint}</span>
      </span>
      <ToggleSwitchVisual checked={selected} />
    </button>
  );
}

function ToggleSwitchVisual({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`invite-toggle relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-vodacom-red" : "bg-white/15"
      }`}
    >
      <span
        className={`invite-toggle-thumb pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-[1.15rem]" : "translate-x-1"
        }`}
      />
    </span>
  );
}

export type { InvitationEmailVariant };
