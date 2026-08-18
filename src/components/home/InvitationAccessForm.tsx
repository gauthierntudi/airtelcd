"use client";

import { Loader2, Mail, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type {
  InvitationAccessChannel,
  InvitationAccessPostAuth,
} from "@/lib/invitation-access/types";
import { notify } from "@/lib/toast";
import { markAirtelSplashSkip } from "@/lib/airtel-splash";

const EXPERIENCE_INTENTS = new Set<InvitationAccessPostAuth>([
  "privilege",
  "mpesa",
  "market",
]);

function isExperienceIntent(
  intent: InvitationAccessPostAuth,
): intent is Exclude<InvitationAccessPostAuth, "invitation"> {
  return EXPERIENCE_INTENTS.has(intent);
}

function detectAccessChannel(contact: string): InvitationAccessChannel {
  return contact.includes("@") ? "email" : "sms";
}

type Props = {
  postAuth?: InvitationAccessPostAuth;
  submitLabel: string;
  hint?: string;
  onSuccess?: () => void;
  onAuthenticated?: (
    intent: Exclude<InvitationAccessPostAuth, "invitation">,
  ) => void;
  blockInvitationRedirect?: boolean;
  /** Champs plus grands, sans autofocus clavier (écran login mobile). */
  size?: "default" | "lg";
  autoFocus?: boolean;
  /** Formulaire sur fond rouge Airtel. */
  tone?: "default" | "onRed";
  onBusyChange?: (busy: boolean) => void;
};

export function InvitationAccessForm({
  postAuth = "invitation",
  submitLabel,
  hint,
  onSuccess,
  onAuthenticated,
  blockInvitationRedirect = false,
  size = "default",
  autoFocus = true,
  tone = "default",
  onBusyChange,
}: Props) {
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const contactRef = useRef<HTMLInputElement>(null);
  const channel = detectAccessChannel(contact);
  const large = size === "lg";
  const onRed = tone === "onRed";

  useEffect(() => {
    if (!autoFocus) return;
    contactRef.current?.focus();
  }, [autoFocus]);

  async function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    const value = contact.trim();
    if (!value) return;

    setLoading(true);
    onBusyChange?.(true);
    try {
      const authenticateUrl = isExperienceIntent(postAuth)
        ? "/api/experience/access/authenticate"
        : "/api/invitation/access/authenticate";

      const res = await fetch(authenticateUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, contact: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      onSuccess?.();
      if (postAuth === "invitation") {
        if (!blockInvitationRedirect) {
          markAirtelSplashSkip();
          window.location.href = data.redirectPath as string;
        }
        return;
      }
      onAuthenticated?.(postAuth);
    } catch (err) {
      onBusyChange?.(false);
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAuthenticate} className={large ? "space-y-5" : "space-y-4"}>
      {hint && (
        <p
          className={
            onRed
              ? "text-[15px] leading-relaxed text-white/80"
              : large
                ? "text-[15px] leading-relaxed text-zinc-500"
                : "text-sm leading-relaxed text-zinc-500"
          }
        >
          {hint}
        </p>
      )}

      <label className="block">
        <span
          className={
            onRed
              ? "text-[13px] font-semibold text-white"
              : large
                ? "text-[13px] font-semibold text-zinc-800"
                : "text-sm font-semibold text-zinc-800"
          }
        >
          Mobile ou e-mail
        </span>
        <span className="relative mt-2 block">
          <span
            className={`pointer-events-none absolute inset-y-0 left-4 flex items-center ${
              onRed ? "text-zinc-400" : "text-zinc-400"
            }`}
          >
            <LucideIcon icon={channel === "email" ? Mail : Phone} size={18} />
          </span>
          <input
            ref={contactRef}
            type="text"
            autoComplete="username"
            inputMode="text"
            required
            disabled={loading}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="082 426 9291 ou vous@exemple.com"
            className={
              onRed
                ? "h-14 w-full rounded-2xl border-0 bg-white py-0 pl-12 pr-4 text-[17px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-white/70 disabled:opacity-60"
                : large
                  ? "h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-0 pl-12 pr-4 text-[17px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-vodacom-red/50 focus:bg-white focus:ring-2 focus:ring-vodacom-red/15 disabled:opacity-60"
                  : "w-full rounded-xl border border-zinc-200 bg-white py-3 pl-12 pr-4 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15 disabled:opacity-60"
            }
          />
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || !contact.trim()}
        className={
          onRed
            ? "flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[17px] font-semibold text-vodacom-red active:scale-[0.99] disabled:opacity-60"
            : large
              ? "flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-vodacom-red text-[17px] font-semibold text-white active:scale-[0.99] disabled:opacity-60"
              : "flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-3.5 font-semibold text-white disabled:opacity-60"
        }
      >
        {loading && (
          <LucideIcon icon={Loader2} size={20} className="animate-spin" />
        )}
        {loading ? "Vérification…" : submitLabel}
      </button>
    </form>
  );
}
