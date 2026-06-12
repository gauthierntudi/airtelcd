"use client";

import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  QrCode,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  CHECKIN_CANCEL_DELAY_MS,
  CHECKIN_SUCCESS_COUNTDOWN_SEC,
} from "@/lib/checkin/constants";
import type { CheckinKioskView } from "@/lib/checkin/kiosk-service";
import { BRAND } from "@/lib/branding";
import { EVENT } from "@/lib/event";

const POLL_MS = 1500;

/** Rayon orbital (% du demi-conteneur) — aligné sur le cercle à 94 % */
const ORBIT_RADIUS = 47;

/** Avatars disposés sur l’orbite — étape « Vérifiez » */
const VERIFY_ORBIT_AVATARS = [
  { src: "/img/persons/person01.png", angle: -82, radius: ORBIT_RADIUS, size: 68 },
  { src: "/img/persons/person02.png", angle: -28, radius: ORBIT_RADIUS + 1, size: 58 },
  { src: "/img/persons/person03.png", angle: 18, radius: ORBIT_RADIUS - 1, size: 72 },
  { src: "/img/persons/person04.png", angle: 62, radius: ORBIT_RADIUS, size: 62 },
  { src: "/img/persons/person05.png", angle: 108, radius: ORBIT_RADIUS + 1, size: 66 },
  { src: "/img/persons/person06.png", angle: 152, radius: ORBIT_RADIUS, size: 60 },
  { src: "/img/persons/person07.png", angle: 198, radius: ORBIT_RADIUS - 1, size: 70 },
  { src: "/img/persons/person08.png", angle: 238, radius: ORBIT_RADIUS, size: 64 },
  { src: "/img/persons/person09.png", angle: -142, radius: ORBIT_RADIUS + 1, size: 56 },
] as const;

const STEPS = [
  { id: "scan", label: "Scannez" },
  { id: "verify", label: "Vérifiez" },
  { id: "confirm", label: "Confirmez" },
  { id: "welcome", label: "Bienvenue" },
] as const;

function stepIndex(status: CheckinKioskView["status"] | undefined): number {
  switch (status) {
    case "SHOW_QR":
      return 0;
    case "WAITING_GUEST":
      return 1;
    case "WAITING_CONFIRM":
      return 2;
    case "SUCCESS":
      return 3;
    default:
      return 0;
  }
}

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CheckinDisplayScreen() {
  const [state, setState] = useState<CheckinKioskView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const hasLoadedRef = useRef(false);
  const waitingConfirmSinceRef = useRef<number | null>(null);
  const clock = useLiveClock();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin/kiosk", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setState(data as CheckinKioskView);
      setError(null);
      setConnected(true);
      hasLoadedRef.current = true;
    } catch (e) {
      setConnected(false);
      if (!hasLoadedRef.current) {
        setError(e instanceof Error ? e.message : "Erreur de connexion");
      }
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (state?.status === "WAITING_CONFIRM") {
      if (waitingConfirmSinceRef.current == null) {
        waitingConfirmSinceRef.current = Date.now();
      }
    } else {
      waitingConfirmSinceRef.current = null;
      setShowCancel(false);
    }
  }, [state?.status]);

  useEffect(() => {
    if (state?.status !== "WAITING_CONFIRM") return;

    const since = waitingConfirmSinceRef.current;
    if (since == null) return;

    const elapsed = Date.now() - since;
    if (elapsed >= CHECKIN_CANCEL_DELAY_MS) {
      setShowCancel(true);
      return;
    }

    const id = window.setTimeout(
      () => setShowCancel(true),
      CHECKIN_CANCEL_DELAY_MS - elapsed,
    );
    return () => window.clearTimeout(id);
  }, [state?.status]);

  const handleCancelCheckin = useCallback(async () => {
    if (!state?.token || cancelling) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/checkin/kiosk/${state.token}/reset`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setState(data as CheckinKioskView);
      waitingConfirmSinceRef.current = null;
      setShowCancel(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'annuler");
    } finally {
      setCancelling(false);
    }
  }, [cancelling, state?.token]);

  const activeStep = stepIndex(state?.status);
  const showQr = state?.status === "SHOW_QR";
  const isSuccess = state?.status === "SUCCESS";
  const isWaiting =
    state?.status === "WAITING_GUEST" || state?.status === "WAITING_CONFIRM";

  const countdownProgress = useMemo(() => {
    if (state?.countdownSeconds == null || state.countdownSeconds <= 0) {
      return 0;
    }
    return state.countdownSeconds / CHECKIN_SUCCESS_COUNTDOWN_SEC;
  }, [state?.countdownSeconds]);

  return (
    <div
      className="checkin-kiosk relative flex min-h-[100dvh] flex-col overflow-hidden text-white"
      style={{
        background: "linear-gradient(165deg, #840000 0%, #e40000 100%)",
      }}
    >
      <KioskBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Image
            src={BRAND.logoWhite}
            alt="Vodacom Privilège"
            width={200}
            height={52}
            className="h-9 w-auto object-contain sm:h-11"
            priority
          />
          <div className="hidden border-l border-white/15 pl-4 sm:block">
            <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.22em] text-white/85">
              Check-in
            </p>
            <p className="font-vodafone-lt text-sm text-white/70">{EVENT.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className="hidden font-vodafone-lt text-sm tabular-nums text-white/50 sm:inline"
            aria-hidden
          >
            {clock}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-vodafone-rg-bd uppercase tracking-wider ${
              connected
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-amber-500/15 text-amber-400"
            }`}
            title={connected ? "Connecté" : "Reconnexion…"}
          >
            <LucideIcon icon={connected ? Wifi : WifiOff} size={12} />
            <span className="hidden sm:inline">
              {connected ? "En ligne" : "Hors ligne"}
            </span>
          </span>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-6 sm:px-10">
        {error && !state ? (
          <div className="checkin-kiosk-fade-in text-center">
            <p className="font-vodafone-lt text-lg text-white/70">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-6 rounded-2xl bg-vodacom-red px-8 py-3 font-vodafone-rg-bd text-sm transition hover:bg-vodacom-red-dark"
            >
              Réessayer
            </button>
          </div>
        ) : !state ? (
          <LucideIcon
            icon={Loader2}
            size={48}
            className="animate-spin text-white/40"
          />
        ) : (
          <div className="checkin-kiosk-fade-in flex w-full max-w-3xl flex-col items-center">
            <StepProgress activeStep={activeStep} />

            <div className="mt-8 flex w-full flex-col items-center lg:mt-10">
              {showQr ? (
                <QrPanel qrUrl={state.qrUrl} />
              ) : isSuccess ? (
                <SuccessPanel
                  displayName={state.displayName}
                  countdownSeconds={state.countdownSeconds}
                  progress={countdownProgress}
                />
              ) : state.status === "WAITING_GUEST" ? (
                <VerifyOrbitalPanel />
              ) : (
                <WaitingPanel
                  status={state.status}
                  displayName={state.displayName}
                />
              )}

              <div className="mt-8 text-center sm:mt-10">
                <h1
                  className={`font-vodafone-exb leading-tight ${
                    isSuccess
                      ? "text-3xl sm:text-4xl lg:text-5xl"
                      : "text-2xl sm:text-3xl lg:text-4xl"
                  }`}
                >
                  {state.headline}
                </h1>
                {state.subline ? (
                  <p className="mx-auto mt-3 max-w-lg font-vodafone-lt text-base text-white/65 sm:text-lg">
                    {state.subline}
                  </p>
                ) : null}
              </div>

              {showQr ? (
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vodacom-red/20 text-vodacom-red">
                    <LucideIcon icon={Smartphone} size={20} />
                  </span>
                  <p className="text-left font-vodafone-lt text-sm text-white/75 sm:text-base">
                    Ouvrez l&apos;appareil photo de votre téléphone et pointez vers le
                    code
                  </p>
                </div>
              ) : null}

              {isWaiting ? (
                <p className="mt-6 font-vodafone-lt text-sm text-white/40">
                  Ne quittez pas cet écran
                </p>
              ) : null}

              {state.status === "WAITING_CONFIRM" && showCancel ? (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => void handleCancelCheckin()}
                  className="mt-5 rounded-2xl border border-white/25 bg-white/10 px-8 py-3 font-vodafone-rg-bd text-sm text-white backdrop-blur-sm transition hover:bg-white/15 disabled:opacity-60"
                >
                  {cancelling ? "Réinitialisation…" : "Annuler"}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/8 px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-2 font-vodafone-lt text-xs text-white/45 sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <LucideIcon icon={CalendarDays} size={14} className="text-vodacom-red/80" />
            {EVENT.dateLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <LucideIcon icon={MapPin} size={14} className="text-vodacom-red/80" />
            {EVENT.venue}
          </span>
        </div>
      </footer>
    </div>
  );
}

function KioskBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(rgb(255 255 255 / 0.6) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.6) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
      aria-hidden
    />
  );
}

function StepProgress({ activeStep }: { activeStep: number }) {
  return (
    <ol className="flex w-full max-w-xl items-center justify-between gap-1 sm:gap-2">
      {STEPS.map((step, index) => {
        const done = index < activeStep;
        const active = index === activeStep;

        return (
          <li key={step.id} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              {index > 0 ? (
                <div
                  className={`h-0.5 flex-1 transition-colors duration-500 ${
                    done || active ? "bg-vodacom-red" : "bg-white/15"
                  }`}
                />
              ) : null}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-vodafone-rg-bd transition-all duration-500 sm:h-9 sm:w-9 ${
                  done || active
                    ? "bg-[#ff0000] text-white"
                    : "bg-[#f2f0f0] text-[#840000]/45"
                } ${active ? "ring-4 ring-white/40" : ""}`}
              >
                {done ? (
                  <LucideIcon icon={CheckCircle2} size={16} />
                ) : (
                  index + 1
                )}
              </span>
              {index < STEPS.length - 1 ? (
                <div
                  className={`h-0.5 flex-1 transition-colors duration-500 ${
                    done ? "bg-vodacom-red" : "bg-white/15"
                  }`}
                />
              ) : null}
            </div>
            <span
              className={`font-vodafone-lt text-[10px] uppercase tracking-wider sm:text-[11px] ${
                active ? "text-white" : done ? "text-white/55" : "text-white/30"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function QrPanel({ qrUrl }: { qrUrl: string }) {
  return (
    <div className="checkin-qr-frame relative">
      <div className="checkin-qr-corner checkin-qr-corner--tl" aria-hidden />
      <div className="checkin-qr-corner checkin-qr-corner--tr" aria-hidden />
      <div className="checkin-qr-corner checkin-qr-corner--bl" aria-hidden />
      <div className="checkin-qr-corner checkin-qr-corner--br" aria-hidden />

      <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-[0_24px_80px_rgb(0_0_0/0.45)] sm:p-7">
        <div className="checkin-qr-scan-line" aria-hidden />
        <QRCode
          value={qrUrl}
          size={300}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
          className="relative z-[1] h-auto w-full max-w-[min(72vw,18.75rem)] sm:max-w-[300px]"
        />
      </div>

      <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-vodacom-red px-4 py-1.5 font-vodafone-rg-bd text-[11px] uppercase tracking-wider text-white shadow-lg">
        <LucideIcon icon={QrCode} size={14} />
        QR Check-in
      </span>
    </div>
  );
}

function orbitPosition(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${50 + radius * Math.cos(rad)}%`,
    top: `${50 + radius * Math.sin(rad)}%`,
  };
}

function VerifyOrbitalPanel() {
  return (
    <div className="mx-auto w-[min(94vw,32rem)] sm:w-[30rem] lg:w-[36rem]">
      <div className="relative aspect-square w-full">
        <div
          className="checkin-orbit-ring pointer-events-none absolute inset-[3%] rounded-full border-2 border-white/45"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[14%] rounded-full border border-white/20"
          aria-hidden
        />

        {VERIFY_ORBIT_AVATARS.map((avatar, index) => {
          const pos = orbitPosition(avatar.angle, avatar.radius);

          return (
            <div
              key={avatar.src}
              className="checkin-orbit-avatar absolute"
              style={{
                ...pos,
                width: avatar.size,
                height: avatar.size,
                animationDelay: `${index * 0.07}s`,
              }}
            >
              <div
                className="checkin-orbit-avatar-inner relative h-full w-full overflow-hidden rounded-full bg-white shadow-lg shadow-black/25 ring-[3px] ring-white"
                style={{ animationDelay: `${index * 0.4}s` }}
              >
                <Image
                  src={avatar.src}
                  alt=""
                  fill
                  sizes={`${avatar.size}px`}
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="checkin-waiting-pulse flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-black/15 sm:h-24 sm:w-24">
            <LucideIcon
              icon={Smartphone}
              size={42}
              className="text-vodacom-red checkin-phone-bob"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="flex items-center gap-2 rounded-full bg-white/12 px-5 py-2.5 backdrop-blur-sm">
          <LucideIcon icon={Loader2} size={18} className="animate-spin text-white/80" />
          <span className="font-vodafone-lt text-sm text-white/80 sm:text-base">
            Vérification en cours…
          </span>
        </div>
      </div>
    </div>
  );
}

function WaitingPanel({
  status,
  displayName,
}: {
  status: CheckinKioskView["status"];
  displayName: string | null;
}) {
  return (
    <div className="checkin-waiting-pulse flex h-[min(68vw,17rem)] w-[min(68vw,17rem)] flex-col items-center justify-center rounded-3xl border border-white/12 bg-white/[0.06] backdrop-blur-sm sm:h-72 sm:w-72">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-vodacom-red shadow-lg shadow-black/10">
        <LucideIcon icon={Smartphone} size={48} className="checkin-phone-bob" />
      </span>
      {displayName && status === "WAITING_CONFIRM" ? (
        <p className="mt-5 font-vodafone-rg-bd text-sm text-white/80">{displayName}</p>
      ) : null}
      <LucideIcon
        icon={Loader2}
        size={28}
        className="mt-4 animate-spin text-white/35"
      />
    </div>
  );
}

function SuccessPanel({
  displayName,
  countdownSeconds,
  progress,
}: {
  displayName: string | null;
  countdownSeconds: number | null;
  progress: number;
}) {
  const showCountdown = countdownSeconds != null && countdownSeconds > 0;
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference * (1 - progress);

  return (
    <div className="relative flex flex-col items-center">
      <div className="checkin-success-glow relative flex h-[min(68vw,17rem)] w-[min(68vw,17rem)] items-center justify-center sm:h-72 sm:w-72">
        {showCountdown ? (
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgb(255 255 255 / 0.08)"
              strokeWidth="4"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e60000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
        ) : null}

        <div className="checkin-success-pop relative z-[1] flex flex-col items-center rounded-full bg-white p-8 shadow-lg shadow-black/10 ring-1 ring-white/80">
          <LucideIcon icon={CheckCircle2} size={72} className="text-emerald-500" />
        </div>
      </div>

      {showCountdown ? (
        <p className="mt-5 font-vodafone-lt text-sm text-white/50">
          Nouveau QR dans{" "}
          <span className="font-vodafone-exb tabular-nums text-vodacom-red">
            {countdownSeconds}
          </span>{" "}
          s
        </p>
      ) : null}

      {displayName ? (
        <p className="mt-2 font-vodafone-rg-bd text-lg text-white/70 sm:text-xl">
          {displayName}
        </p>
      ) : null}
    </div>
  );
}
