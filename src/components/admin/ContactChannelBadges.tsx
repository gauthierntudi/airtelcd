import { Mail, MessageCircle } from "lucide-react";
import type { ContactChannel } from "@/lib/guest-contact";
import { LucideIcon } from "@/components/ui/lucide-icon";

const CONFIG: Record<
  ContactChannel,
  { label: string; className: string; icon: typeof Mail }
> = {
  email: {
    label: "Email",
    className: "bg-zinc-100 text-zinc-900 ring-zinc-200",
    icon: Mail,
  },
  whatsapp: {
    label: "WhatsApp",
    className: "bg-red-50 text-vodacom-red ring-vodacom-red/30",
    icon: MessageCircle,
  },
};

type Props = {
  channels: ContactChannel[];
  preferred?: ContactChannel | null;
  compact?: boolean;
};

export function ContactChannelBadges({
  channels,
  preferred,
  compact,
}: Props) {
  if (channels.length === 0) {
    return (
      <span className="text-xs text-zinc-400" title="Aucun canal de contact">
        Aucun envoi
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {channels.map((ch) => {
        const cfg = CONFIG[ch];
        const isPreferred = preferred === ch;
        return (
          <span
            key={ch}
            title={
              isPreferred
                ? `${cfg.label} — canal prioritaire pour l’envoi`
                : cfg.label
            }
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.className} ${
              isPreferred ? "ring-2 ring-vodacom-red" : ""
            }`}
          >
            <LucideIcon icon={cfg.icon} size={compact ? 11 : 12} />
            {!compact && cfg.label}
            {isPreferred && !compact && (
              <span className="opacity-70">· envoi</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
