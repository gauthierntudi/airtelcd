"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { InvitationBottomSheet } from "@/components/invitation/InvitationBottomSheet";
import { LucideIcon } from "@/components/ui/lucide-icon";

export type RsvpNamePayload = {
  firstName?: string;
  lastName?: string;
};

type Props = {
  needsFirstName: boolean;
  needsLastName: boolean;
  existingFirstName?: string | null;
  existingLastName?: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (names: RsvpNamePayload) => void;
};

function buildIntroMessage(
  needsFirstName: boolean,
  needsLastName: boolean,
): string {
  if (needsFirstName && needsLastName) {
    return "Indiquez votre prénom et nom pour confirmer votre présence.";
  }
  if (needsFirstName) {
    return "Votre nom est déjà enregistré. Complétez avec votre prénom pour confirmer.";
  }
  return "Votre prénom est déjà enregistré. Complétez avec votre nom pour confirmer.";
}

/** Bottom sheet — nom complet requis avant confirmation si absent en base */
export function InvitationRsvpNameSheet({
  needsFirstName,
  needsLastName,
  existingFirstName,
  existingLastName,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const firstOk = !needsFirstName || trimmedFirst.length > 0;
  const lastOk = !needsLastName || trimmedLast.length > 0;
  const canSubmit = firstOk && lastOk && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      ...(needsFirstName && { firstName: trimmedFirst }),
      ...(needsLastName && { lastName: trimmedLast }),
    });
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
            Votre identité
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
            {buildIntroMessage(needsFirstName, needsLastName)}
          </p>

          {!needsFirstName && existingFirstName?.trim() ? (
            <ProvidedNameField label="Prénom" value={existingFirstName.trim()} />
          ) : null}

          {!needsLastName && existingLastName?.trim() ? (
            <ProvidedNameField label="Nom" value={existingLastName.trim()} />
          ) : null}

          {needsFirstName ? (
            <label htmlFor="rsvp-first-name" className="mt-4 block">
              <span className="font-vodafone-rg-bd text-sm text-white">
                Prénom *
              </span>
              <input
                id="rsvp-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                placeholder="Jean"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-vodafone-lt text-base text-white outline-none placeholder:text-white/35 focus:border-vodacom-red/60 focus:ring-2 focus:ring-vodacom-red/25"
              />
            </label>
          ) : null}

          {needsLastName ? (
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
          ) : null}
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

function ProvidedNameField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-300"
          aria-hidden
        >
          <LucideIcon icon={Check} size={14} />
        </span>
        <div className="min-w-0">
          <p className="font-vodafone-rg-bd text-xs uppercase tracking-wide text-emerald-300/90">
            {label} déjà enregistré
          </p>
          <p className="mt-0.5 font-vodafone-rg-bd text-base text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
