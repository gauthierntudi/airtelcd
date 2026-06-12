"use client";

import { CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { InvitationBottomSheet } from "@/components/invitation/InvitationBottomSheet";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { CheckinGuestView } from "@/lib/checkin/kiosk-service";
import { BRAND } from "@/lib/branding";
import type { InvitationAccessChannel } from "@/lib/invitation-access/types";
import { notify } from "@/lib/toast";

type Props = {
  token: string;
};

const POLL_MS = 1500;

export function CheckinGuestFlow({ token }: Props) {
  const [state, setState] = useState<CheckinGuestView | null>(null);
  const [booting, setBooting] = useState(true);
  const [channel, setChannel] = useState<InvitationAccessChannel>("email");
  const [emailContact, setEmailContact] = useState("");
  const [smsContact, setSmsContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const scannedRef = useRef(false);

  const contactValue = channel === "email" ? emailContact : smsContact;
  const setContactValue =
    channel === "email" ? setEmailContact : setSmsContact;

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/checkin/kiosk/${token}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erreur");
    return data as CheckinGuestView;
  }, [token]);

  const applyState = useCallback((next: CheckinGuestView) => {
    setState(next);
    if (next.status === "WAITING_CONFIRM") {
      setConfirmOpen(true);
    }
    if (next.status === "SUCCESS") {
      setConfirmOpen(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!scannedRef.current) {
          scannedRef.current = true;
          const scanRes = await fetch(`/api/checkin/kiosk/${token}/scan`, {
            method: "POST",
          });
          const scanData = await scanRes.json();
          if (!scanRes.ok) throw new Error(scanData.error ?? "Erreur");
          if (!cancelled) applyState(scanData as CheckinGuestView);
        } else {
          const data = await refresh();
          if (!cancelled) applyState(data);
        }
      } catch (e) {
        if (!cancelled) {
          notify.error(e instanceof Error ? e.message : "Erreur");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refresh, applyState]);

  useEffect(() => {
    if (!state || booting) return;
    if (
      state.status !== "WAITING_CONFIRM" &&
      state.status !== "SUCCESS"
    ) {
      return;
    }
    const id = window.setInterval(() => {
      void refresh()
        .then(applyState)
        .catch(() => {});
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [state?.status, booting, refresh, applyState, state]);

  async function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    const value = contactValue.trim();
    if (!value) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/checkin/kiosk/${token}/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, contact: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      applyState(data as CheckinGuestView);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmRsvp() {
    setLoading(true);
    try {
      const res = await fetch(`/api/checkin/kiosk/${token}/confirm`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      applyState(data as CheckinGuestView);
      setConfirmOpen(false);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-vodacom-cream">
        <LucideIcon icon={Loader2} size={36} className="animate-spin text-vodacom-red" />
      </div>
    );
  }

  if (state?.status === "SUCCESS") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-vodacom-cream px-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <LucideIcon icon={CheckCircle2} size={44} />
        </span>
        <h1 className="mt-6 font-vodafone-exb text-2xl text-vodacom-black">
          {state.headline}
        </h1>
        {state.subline ? (
          <p className="mt-3 font-vodafone-lt text-base text-vodacom-black/65">
            {state.subline}
          </p>
        ) : null}
        {state.countdownSeconds != null && state.countdownSeconds > 0 ? (
          <p className="mt-8 font-vodafone-lt text-sm text-vodacom-black/45">
            Vous pouvez fermer cette page
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] bg-vodacom-cream px-5 py-8">
        <Image
          src={BRAND.logoBlack}
          alt="Vodacom Privilège"
          width={140}
          height={40}
          className="mb-8 h-9 w-auto object-contain"
        />

        <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-vodacom-red">
          Check-in
        </p>
        <h1 className="mt-1 font-vodafone-exb text-2xl text-vodacom-black">
          {state?.headline ?? "Vérification invitation"}
        </h1>
        {state?.subline ? (
          <p className="mt-2 font-vodafone-lt text-sm text-vodacom-black/60">
            {state.subline}
          </p>
        ) : null}

        <form onSubmit={handleAuthenticate} className="mt-8 space-y-4">
          <div className="flex gap-2 rounded-xl bg-white p-1 ring-1 ring-vodacom-silver/30">
            <ChannelTab
              active={channel === "email"}
              icon={Mail}
              label="E-mail"
              onClick={() => setChannel("email")}
            />
            <ChannelTab
              active={channel === "sms"}
              icon={Phone}
              label="SMS"
              onClick={() => setChannel("sms")}
            />
          </div>

          <label className="block">
            <span className="font-vodafone-rg-bd text-sm text-vodacom-black">
              {channel === "email" ? "Adresse e-mail" : "Numéro mobile"}
            </span>
            <input
              type={channel === "email" ? "email" : "tel"}
              autoComplete={channel === "email" ? "email" : "tel"}
              inputMode={channel === "email" ? "email" : "tel"}
              required
              disabled={loading}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={
                channel === "email" ? "vous@exemple.com" : "082 426 9291"
              }
              className="mt-1.5 w-full rounded-xl border border-vodacom-silver/40 bg-white px-4 py-3 font-vodafone-lt text-base outline-none focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15"
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
            {loading ? "Vérification…" : "Continuer"}
          </button>
        </form>
      </div>

      {confirmOpen && state?.needsRsvpConfirm ? (
        <InvitationBottomSheet
          onClose={() => setConfirmOpen(false)}
          titleId="checkin-confirm-title"
          backdropLabel="Fermer"
        >
          <div className="px-5 pb-8 pt-2">
            <h2
              id="checkin-confirm-title"
              className="font-vodafone-exb text-xl text-white"
            >
              Confirmer ma présence
            </h2>
            <p className="mt-2 font-vodafone-lt text-sm text-white/70">
              Validez votre participation au Vodacom Privilège Golf 2026 pour
              finaliser le check-in.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleConfirmRsvp()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-3.5 font-vodafone-rg-bd text-base text-white disabled:opacity-60"
            >
              {loading && (
                <LucideIcon icon={Loader2} size={20} className="animate-spin" />
              )}
              Je confirme ma présence
            </button>
          </div>
        </InvitationBottomSheet>
      ) : null}
    </>
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
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 font-vodafone-rg-bd text-sm transition ${
        active
          ? "bg-vodacom-red text-white shadow-sm"
          : "text-vodacom-black/55"
      }`}
    >
      <LucideIcon icon={icon} size={16} />
      {label}
    </button>
  );
}
