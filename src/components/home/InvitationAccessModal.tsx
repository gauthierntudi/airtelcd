"use client";

import { Loader2, Mail, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  OtpSixDigitInput,
  type OtpSixDigitInputHandle,
} from "@/components/ui/OtpSixDigitInput";
import type {
  InvitationAccessChannel,
  InvitationAccessPostAuth,
} from "@/lib/invitation-access/types";
import { VODACOM_MARKET_NAME } from "@/lib/mpesa-visa/constants";
import { formatPhoneDisplay } from "@/lib/phone";
import { notify } from "@/lib/toast";

type Step = "contact" | "otp";

const POST_AUTH_COPY: Record<
  InvitationAccessPostAuth,
  { badge: string; title: string; submit: string }
> = {
  invitation: {
    badge: "Invitation",
    title: "Commencez l'expérience",
    submit: "Voir mon invitation",
  },
  market: {
    badge: VODACOM_MARKET_NAME,
    title: `Accéder au ${VODACOM_MARKET_NAME}`,
    submit: "Accéder au marché",
  },
  mpesa: {
    badge: "Carte Visa M-Pesa",
    title: "Accéder à Carte Visa M-Pesa",
    submit: "Ouvrir l'expérience",
  },
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Après OTP : invitation → redirection ; market/mpesa → callback. */
  postAuth?: InvitationAccessPostAuth;
  onAuthenticated?: (intent: Exclude<InvitationAccessPostAuth, "invitation">) => void;
};

export function InvitationAccessModal({
  open,
  onClose,
  postAuth = "invitation",
  onAuthenticated,
}: Props) {
  const copy = POST_AUTH_COPY[postAuth];
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("contact");
  const [channel, setChannel] = useState<InvitationAccessChannel>("sms");
  const [emailContact, setEmailContact] = useState("");
  const [smsContact, setSmsContact] = useState("");
  /** Coordonnées utilisées pour la vérification OTP (figées après envoi du code). */
  const [lockedContact, setLockedContact] = useState("");
  const [lockedChannel, setLockedChannel] =
    useState<InvitationAccessChannel>("sms");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<OtpSixDigitInputHandle>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setStep("contact");
      setEmailContact("");
      setSmsContact("");
      setLockedContact("");
      setCode("");
      setChannel("sms");
      setLockedChannel("sms");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (step === "otp") codeRef.current?.focus();
    if (step === "contact") contactRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const contactValue = channel === "email" ? emailContact : smsContact;
  const setContactValue =
    channel === "email" ? setEmailContact : setSmsContact;

  function goToContactStep() {
    setLoading(false);
    setStep("contact");
  }

  function handleChannelChange(next: InvitationAccessChannel) {
    if (next === channel) return;
    setChannel(next);
  }

  function contactLabel(): string {
    if (lockedChannel === "email") return lockedContact;
    return formatPhoneDisplay(lockedContact);
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    const value = contactValue.trim();
    if (!value) return;

    setLoading(true);
    try {
      const res = await fetch("/api/invitation/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, contact: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      setLockedContact(value);
      setLockedChannel(channel);

      if (data.devCode) {
        notify.info(`Code dev : ${data.devCode}`);
      } else {
        notify.success("Code envoyé si votre invitation existe.");
      }
      setStep("otp");
      setCode("");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const otp = code.replace(/\D/g, "");
    if (otp.length < 6) return;

    setLoading(true);
    try {
      const res = await fetch("/api/invitation/access/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: lockedChannel,
          contact: lockedContact.trim(),
          code: otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      onClose();
      if (postAuth === "invitation") {
        window.location.href = data.redirectPath as string;
        return;
      }
      onAuthenticated?.(postAuth);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!lockedContact.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invitation/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: lockedChannel,
          contact: lockedContact.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      if (data.devCode) {
        notify.info(`Code dev : ${data.devCode}`);
      } else {
        notify.success("Nouveau code envoyé si votre invitation existe.");
      }
      setCode("");
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-vodacom-black/70 backdrop-blur-[2px]"
        aria-label="Fermer"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-labelledby="invitation-access-title"
        className="relative z-10 flex max-h-[min(92vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-vodacom-silver/25 px-5 py-4">
          <div>
            <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-vodacom-red">
              {copy.badge}
            </p>
            <h2
              id="invitation-access-title"
              className="font-vodafone-exb text-xl font-normal text-vodacom-black"
            >
              {copy.title}
            </h2>
            <p className="mt-1 font-vodafone-lt text-sm text-vodacom-black/60">
              {step === "contact"
                ? "Saisissez le mobile ou l’e-mail enregistré pour votre invitation."
                : "Entrez le code reçu par SMS ou e-mail."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vodacom-cream text-vodacom-black active:bg-vodacom-silver/30"
            aria-label="Fermer"
          >
            <LucideIcon icon={X} size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {step === "contact" ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="flex gap-2 rounded-xl bg-vodacom-cream/80 p-1 ring-1 ring-vodacom-silver/25">
                <ChannelTab
                  active={channel === "sms"}
                  icon={Phone}
                  label="Mobile"
                  onClick={() => handleChannelChange("sms")}
                />
                <ChannelTab
                  active={channel === "email"}
                  icon={Mail}
                  label="E-mail"
                  onClick={() => handleChannelChange("email")}
                />
              </div>

              <label className="block">
                <span className="font-vodafone-rg-bd text-sm text-vodacom-black">
                  {channel === "email" ? "Adresse e-mail" : "Numéro mobile"}
                </span>
                <input
                  ref={contactRef}
                  type={channel === "email" ? "email" : "tel"}
                  autoComplete={channel === "email" ? "email" : "tel"}
                  inputMode={channel === "email" ? "email" : "tel"}
                  required
                  disabled={loading}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={
                    channel === "email"
                      ? "vous@exemple.com"
                      : "082 426 9291"
                  }
                  className="mt-1.5 w-full rounded-xl border border-vodacom-silver/40 bg-white px-4 py-3 font-vodafone-lt text-base text-vodacom-black outline-none focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15 disabled:opacity-60"
                />
              </label>

              <button
                type="submit"
                disabled={loading || !contactValue.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-3.5 font-vodafone-rg-bd text-base text-white disabled:opacity-60"
              >
                {loading && (
                  <LucideIcon icon={Loader2} size={20} className="animate-spin" />
                )}
                {loading ? "Envoi…" : "Recevoir le code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="rounded-xl bg-vodacom-cream/60 px-4 py-3 ring-1 ring-vodacom-silver/25">
                <p className="font-vodafone-lt text-xs text-vodacom-black/50">
                  Code envoyé à
                </p>
                <p className="mt-0.5 font-vodafone-rg-bd text-sm text-vodacom-black">
                  {contactLabel()}
                </p>
                <button
                  type="button"
                  onClick={goToContactStep}
                  className="mt-2 font-vodafone-lt text-sm text-vodacom-red underline-offset-2 hover:underline"
                >
                  {lockedChannel === "email"
                    ? "Changer d’e-mail"
                    : "Changer de numéro"}
                </button>
              </div>

              <div className="block">
                <span className="font-vodafone-rg-bd text-sm text-vodacom-black">
                  Code à 6 chiffres
                </span>
                <OtpSixDigitInput
                  ref={codeRef}
                  value={code}
                  onChange={setCode}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-3.5 font-vodafone-rg-bd text-base text-white disabled:opacity-60"
              >
                {loading && (
                  <LucideIcon icon={Loader2} size={20} className="animate-spin" />
                )}
                {loading ? "Vérification…" : copy.submit}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleResendCode}
                className="w-full py-2 text-center font-vodafone-lt text-sm text-vodacom-black/55 hover:text-vodacom-black/80 disabled:opacity-50"
              >
                Renvoyer le code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ChannelTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Mail;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-vodafone-rg-bd transition ${
        active
          ? "bg-vodacom-red text-white shadow-sm"
          : "text-vodacom-black/55 hover:text-vodacom-black"
      }`}
    >
      <LucideIcon icon={icon} size={16} />
      {label}
    </button>
  );
}
