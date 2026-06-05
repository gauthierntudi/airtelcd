"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { GuestRow } from "@/lib/guest-types";
import type { MessagingStatus } from "@/lib/messaging/config";
import {
  canSendGuestWithOptions,
  getGuestSendBlockReason,
  type SendInvitationOptions,
} from "@/lib/messaging/send-options";

type Props = {
  guest: GuestRow;
  messagingStatus: MessagingStatus;
  sendOptions: SendInvitationOptions;
  copied: boolean;
  sending: boolean;
  busy: boolean;
  onSend: () => void;
  onCopy: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function GuestRowActions({
  guest,
  messagingStatus,
  sendOptions,
  copied,
  sending,
  busy,
  onSend,
  onCopy,
  onDetails,
  onEdit,
  onDelete,
}: Props) {
  const canSend = canSendGuestWithOptions(
    guest,
    sendOptions,
    messagingStatus,
  );
  const blockReason = getGuestSendBlockReason(
    guest,
    sendOptions,
    messagingStatus,
  );

  const sendTitle = !messagingStatus.canSendAny
    ? "APIs non configurées"
    : canSend
      ? "Envoyer l'invitation"
      : (blockReason ?? "Envoi impossible");

  return (
    <div className="flex flex-nowrap items-center justify-end gap-1">
      <IconBtn icon={Eye} title="Détails" disabled={busy} onClick={onDetails} />
      <IconBtn
        href={guest.invitationUrl}
        target="_blank"
        rel="noopener noreferrer"
        icon={ExternalLink}
        title="Prévisualiser l'invitation"
      />
      <IconBtn
        icon={sending ? Loader2 : Send}
        spin={sending}
        title={sendTitle}
        disabled={!canSend || busy}
        highlight
        onClick={onSend}
      />
      <IconBtn
        icon={copied ? Check : Copy}
        title={copied ? "Lien copié" : "Copier le lien"}
        disabled={busy}
        onClick={onCopy}
        success={copied}
      />
      <IconBtn icon={Pencil} title="Modifier" disabled={busy} onClick={onEdit} />
      <IconBtn
        icon={Trash2}
        title="Supprimer"
        disabled={busy}
        danger
        onClick={onDelete}
      />
    </div>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  href,
  target,
  rel,
  disabled,
  highlight,
  danger,
  success,
  spin,
}: {
  icon: LucideIconType;
  title: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  highlight?: boolean;
  danger?: boolean;
  success?: boolean;
  spin?: boolean;
}) {
  const base =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition disabled:pointer-events-none disabled:opacity-35";

  const className = danger
    ? `${base} border-white/10 bg-[#1f1f1f] text-white/55 hover:border-vodacom-red/35 hover:bg-vodacom-red/20 hover:text-vodacom-red`
    : highlight
      ? `${base} border-vodacom-red/30 bg-vodacom-red/15 text-vodacom-red hover:border-vodacom-red/50 hover:bg-vodacom-red/25`
      : success
        ? `${base} border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:border-emerald-500/45 hover:bg-emerald-500/25`
        : `${base} border-white/10 bg-[#1f1f1f] text-white/60 hover:border-white/20 hover:bg-[#2a2a2a] hover:text-white`;

  const content = (
    <LucideIcon icon={icon} size={15} className={spin ? "animate-spin" : ""} />
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={className} title={title}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={className}>
      {content}
    </button>
  );
}
