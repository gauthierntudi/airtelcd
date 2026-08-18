"use client";

import { Check, Loader2, X } from "lucide-react";
import { InvitationBottomSheet } from "@/components/invitation/InvitationBottomSheet";
import { LucideIcon } from "@/components/ui/lucide-icon";

export type RsvpConfirmIntent = "confirm" | "decline";

type Props = {
  intent: RsvpConfirmIntent;
  firstName?: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function InvitationRsvpConfirmSheet({
  intent,
  firstName,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const isConfirm = intent === "confirm";
  const titleId = "rsvp-confirm-title";

  return (
    <InvitationBottomSheet
      onClose={onClose}
      titleId={titleId}
      backdropLabel="Annuler"
      tone="light"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-0">
        <h2
          id={titleId}
          className="text-xl font-extrabold leading-tight text-zinc-900"
        >
          {isConfirm
            ? "Confirmer votre présence ?"
            : "Vous ne pourrez pas venir ?"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:bg-zinc-200"
        >
          <LucideIcon icon={X} size={20} />
        </button>
      </header>

      <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-500">
        {isConfirm
          ? "Votre pass d'accès sera activé. Présentez le QR à l'accueil le jour de l'événement."
          : "Votre invitation sera marquée comme déclinée. Vous pourrez confirmer plus tard si vos plans changent."}
      </p>

      <div className="flex shrink-0 flex-col gap-2.5 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
        <button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className={`flex h-14 w-full items-center justify-between rounded-2xl px-4 outline-none active:scale-[0.99] disabled:opacity-50 ${
            isConfirm
              ? "bg-vodacom-red text-white focus-visible:ring-2 focus-visible:ring-vodacom-red"
              : "bg-zinc-900 text-white focus-visible:ring-2 focus-visible:ring-zinc-900"
          }`}
        >
          <span className="min-w-0 text-left">
            <span className="block text-[17px] font-extrabold leading-tight">
              {loading
                ? "En cours…"
                : isConfirm
                  ? firstName
                    ? `Oui, je confirme, ${firstName}`
                    : "Oui, je confirme"
                  : "Oui, je ne pourrai pas venir"}
            </span>
            <span
              className={`block truncate text-[11px] font-medium ${
                isConfirm ? "text-white/70" : "text-white/55"
              }`}
            >
              {isConfirm ? "Activer le pass d'accès" : "Enregistrer la réponse"}
            </span>
          </span>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isConfirm ? "bg-white text-vodacom-red" : "bg-white/15 text-white"
            }`}
          >
            {loading ? (
              <LucideIcon icon={Loader2} size={18} className="animate-spin" />
            ) : (
              <LucideIcon icon={isConfirm ? Check : X} size={18} />
            )}
          </span>
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-zinc-100 text-sm font-semibold text-zinc-700 outline-none hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </InvitationBottomSheet>
  );
}
