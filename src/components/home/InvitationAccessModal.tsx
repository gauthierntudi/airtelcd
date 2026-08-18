"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { InvitationAccessForm } from "@/components/home/InvitationAccessForm";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { InvitationAccessPostAuth } from "@/lib/invitation-access/types";
import { VODACOM_MARKET_NAME } from "@/lib/mpesa-visa/constants";

const POST_AUTH_COPY: Record<
  InvitationAccessPostAuth,
  { badge: string; title: string; submit: string; hint: string }
> = {
  invitation: {
    badge: "Invitation",
    title: "Accéder à votre invitation",
    submit: "Voir mon invitation",
    hint: "Saisissez le mobile ou l'e-mail enregistré pour votre invitation.",
  },
  market: {
    badge: VODACOM_MARKET_NAME,
    title: `Accéder au ${VODACOM_MARKET_NAME}`,
    submit: "Accéder au marché",
    hint: "Saisissez votre numéro mobile. Les visiteurs sans invitation peuvent accéder à l'expérience.",
  },
  mpesa: {
    badge: "Carte Visa M-Pesa",
    title: "Accéder à Carte Visa M-Pesa",
    submit: "Ouvrir l'expérience",
    hint: "Saisissez votre numéro mobile. Les visiteurs sans invitation peuvent accéder à l'expérience.",
  },
  privilege: {
    badge: "Airtel RSVP",
    title: "Commencez l'expérience",
    submit: "Continuer",
    hint: "Saisissez votre numéro mobile. Les visiteurs sans invitation peuvent accéder à l'expérience.",
  },
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Après identification : invitation → redirection ; market/mpesa → callback. */
  postAuth?: InvitationAccessPostAuth;
  onAuthenticated?: (intent: Exclude<InvitationAccessPostAuth, "invitation">) => void;
  /** Kiosque : ne pas rediriger vers l'invitation pendant Traveler / Business / M-Pesa. */
  blockInvitationRedirect?: boolean;
};

export function InvitationAccessModal({
  open,
  onClose,
  postAuth = "invitation",
  onAuthenticated,
  blockInvitationRedirect = false,
}: Props) {
  const copy = POST_AUTH_COPY[postAuth];
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]"
        aria-label="Fermer"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-labelledby="invitation-access-title"
        className="relative z-10 flex max-h-[min(92vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-vodacom-red">
              {copy.badge}
            </p>
            <h2
              id="invitation-access-title"
              className="font-vodafone-exb text-xl font-normal text-zinc-900"
            >
              {copy.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:bg-zinc-200"
            aria-label="Fermer"
          >
            <LucideIcon icon={X} size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <InvitationAccessForm
            key={postAuth}
            postAuth={postAuth}
            submitLabel={copy.submit}
            hint={copy.hint}
            onSuccess={onClose}
            onAuthenticated={onAuthenticated}
            blockInvitationRedirect={blockInvitationRedirect}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
