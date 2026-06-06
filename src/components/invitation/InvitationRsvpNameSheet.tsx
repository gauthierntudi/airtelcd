"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { InvitationBottomSheet } from "@/components/invitation/InvitationBottomSheet";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  firstName: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (lastName: string) => void;
};

/** Bottom sheet — nom requis avant confirmation RSVP si absent en base */
export function InvitationRsvpNameSheet({
  firstName,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [lastName, setLastName] = useState("");
  const trimmed = lastName.trim();
  const canSubmit = trimmed.length > 0 && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed);
  }

  return (
    <InvitationBottomSheet
      onClose={onClose}
      titleId="rsvp-name-title"
      backdropLabel="Fermer"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-0">
          <h2
            id="rsvp-name-title"
            className="font-vodafone-exb text-xl leading-tight text-white"
          >
            Votre nom
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

        <div className="px-5 pb-4">
          <p className="font-vodafone-lt text-sm leading-relaxed text-white/70">
            {firstName}, indiquez votre nom de famille pour confirmer votre
            présence.
          </p>
          <label htmlFor="rsvp-last-name" className="mt-4 block">
            <span className="font-vodafone-rg-bd text-sm text-white">Nom *</span>
            <input
              id="rsvp-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              placeholder="Dupont"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-vodafone-lt text-base text-white outline-none placeholder:text-white/35 focus:border-vodacom-red/60 focus:ring-2 focus:ring-vodacom-red/25"
            />
          </label>
        </div>

        <div className="shrink-0 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-vodacom-red text-base font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && (
              <LucideIcon icon={Loader2} size={20} className="animate-spin" />
            )}
            {loading ? "Confirmation…" : "Confirmer ma présence"}
          </button>
        </div>
      </form>
    </InvitationBottomSheet>
  );
}
