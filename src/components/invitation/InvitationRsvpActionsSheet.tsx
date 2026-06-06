"use client";

import { CalendarPlus, Download, Navigation, X } from "lucide-react";
import { InvitationBottomSheet } from "@/components/invitation/InvitationBottomSheet";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  googleCalendarUrl: string;
  mapsUrl: string;
  onDownloadInvitation: () => void | Promise<void>;
  downloadingInvitation: boolean;
  onClose: () => void;
};

/** Bottom sheet — calendrier, itinéraire, téléchargement (.ics) */
export function InvitationRsvpActionsSheet({
  googleCalendarUrl,
  mapsUrl,
  onDownloadInvitation,
  downloadingInvitation,
  onClose,
}: Props) {
  const linkActions = [
    {
      icon: CalendarPlus,
      label: "Ajouter au calendrier",
      href: googleCalendarUrl,
      external: true,
    },
    {
      icon: Navigation,
      label: "Itinéraire",
      href: mapsUrl,
      external: true,
    },
  ] as const;

  return (
    <InvitationBottomSheet
      onClose={onClose}
      titleId="rsvp-actions-title"
      backdropLabel="Fermer le menu"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-0">
        <h2
          id="rsvp-actions-title"
          className="font-vodafone-exb text-xl leading-tight text-white"
        >
          Vous pouvez aussi :
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
        >
          <LucideIcon icon={X} size={20} />
        </button>
      </header>

      <ul className="flex flex-col gap-2 px-5 pb-4">
        {linkActions.map((action) => (
          <li key={action.label}>
            <a
              href={action.href}
              {...(action.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              onClick={onClose}
              className="flex h-14 items-center gap-3 rounded-2xl bg-white/[0.08] px-4 font-vodafone-rg-bd text-base text-white ring-1 ring-white/10 active:bg-white/15"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vodacom-red text-white">
                <LucideIcon icon={action.icon} size={20} />
              </span>
              {action.label}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={downloadingInvitation}
            onClick={() => {
              void Promise.resolve(onDownloadInvitation()).then(onClose);
            }}
            className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white/[0.08] px-4 font-vodafone-rg-bd text-base text-white ring-1 ring-white/10 active:bg-white/15 disabled:opacity-60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vodacom-red text-white">
              <LucideIcon icon={Download} size={20} />
            </span>
            {downloadingInvitation ? "Préparation…" : "Télécharger l'invitation"}
          </button>
        </li>
      </ul>

      <div className="shrink-0 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-white text-base font-bold text-vodacom-red active:scale-[0.98]"
        >
          Fermer
        </button>
      </div>
    </InvitationBottomSheet>
  );
}
