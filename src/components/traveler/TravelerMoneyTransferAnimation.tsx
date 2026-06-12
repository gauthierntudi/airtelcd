"use client";

import {
  ArrowLeftRight,
  Banknote,
  Car,
  Check,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  senderLabel: string;
  receiverLabel: string;
  amount: string;
  onComplete?: () => void;
};

type TransferPhase = "preparing" | "sending" | "received" | "success";

const PHASE_TIMINGS = {
  preparing: 600,
  sending: 1800,
  received: 700,
  success: 900,
} as const;

const TOTAL_MS = Object.values(PHASE_TIMINGS).reduce((a, b) => a + b, 0);

export function TravelerMoneyTransferAnimation({
  senderLabel,
  receiverLabel,
  amount,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<TransferPhase>("preparing");

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase("sending"), PHASE_TIMINGS.preparing),
      window.setTimeout(
        () => setPhase("received"),
        PHASE_TIMINGS.preparing + PHASE_TIMINGS.sending,
      ),
      window.setTimeout(
        () => setPhase("success"),
        PHASE_TIMINGS.preparing +
          PHASE_TIMINGS.sending +
          PHASE_TIMINGS.received,
      ),
      window.setTimeout(() => onComplete?.(), TOTAL_MS),
    ];

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onComplete]);

  const progress =
    phase === "preparing"
      ? 12
      : phase === "sending"
        ? 58
        : phase === "received"
          ? 88
          : 100;

  return (
    <div className="w-full max-w-md sm:max-w-lg">
      <div className="traveler-transfer-card relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#0d9488]/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-[#e60000]/20 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <div className="flex items-center justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d9488]/25 ring-1 ring-[#0d9488]/40">
              <LucideIcon
                icon={ArrowLeftRight}
                size={16}
                className="text-[#5eead4]"
              />
            </span>
            <p className="font-vodafone-rg-bd text-xs uppercase tracking-[0.22em] text-white/80">
              Transfert P2P
            </p>
          </div>

          <TransferStatus phase={phase} amount={amount} />

          <div className="relative mt-7 px-1">
            <div className="flex items-start justify-between gap-2">
              <TransferUserCard
                label={senderLabel}
                subtitle="Émetteur"
                initials="A"
                accent="#e60000"
                state={
                  phase === "preparing"
                    ? "idle"
                    : phase === "sending"
                      ? "active"
                      : "done"
                }
                showDebit={phase === "sending" || phase === "received" || phase === "success"}
                amount={amount}
              />

              <TransferLane phase={phase} amount={amount} />

              <TransferUserCard
                label={receiverLabel}
                subtitle="Chauffeur Yango"
                initials="B"
                accent="#0d9488"
                icon={Car}
                state={
                  phase === "received" || phase === "success"
                    ? "success"
                    : phase === "sending"
                      ? "waiting"
                      : "idle"
                }
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="traveler-transfer-progress h-full rounded-full bg-gradient-to-r from-[#0d9488] via-[#2dd4bf] to-[#5eead4] transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <TransferSteps phase={phase} />
          </div>

          <div
            className={`mt-6 overflow-hidden transition-all duration-500 ${
              phase === "success"
                ? "max-h-24 translate-y-0 opacity-100"
                : "max-h-0 translate-y-2 opacity-0"
            }`}
          >
            <div className="traveler-transfer-success-banner flex items-center justify-center gap-2.5 rounded-2xl bg-[#0d9488]/20 px-4 py-3 ring-1 ring-[#0d9488]/35">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d9488] shadow-[0_0_20px_rgba(13,148,136,0.5)]">
                <LucideIcon icon={Check} size={18} className="text-white" />
              </span>
              <div className="text-left">
                <p className="font-vodafone-exb text-sm text-white">
                  Paiement confirmé
                </p>
                <p className="font-vodafone-lt text-xs text-white/75">
                  Course Yango réservée · {amount}
                </p>
              </div>
              <LucideIcon
                icon={Sparkles}
                size={18}
                className="ml-auto text-[#5eead4]/80"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransferStatus({
  phase,
  amount,
}: {
  phase: TransferPhase;
  amount: string;
}) {
  const copy: Record<TransferPhase, string> = {
    preparing: "Connexion sécurisée…",
    sending: `Envoi de ${amount} en cours`,
    received: "Réception par le chauffeur…",
    success: "Transfert réussi",
  };

  return (
    <div className="mt-5 text-center">
      <p
        className={`font-vodafone-exb text-3xl tracking-tight text-white sm:text-[2rem] ${
          phase === "sending" ? "traveler-transfer-amount-pulse" : ""
        }`}
      >
        {amount}
      </p>
      <p className="mt-1.5 font-vodafone-lt text-sm text-white/70 sm:text-base">
        {copy[phase]}
        {phase !== "success" ? (
          <span className="traveler-transfer-ellipsis" aria-hidden>
            …
          </span>
        ) : null}
      </p>
    </div>
  );
}

function TransferLane({ phase, amount }: { phase: TransferPhase; amount: string }) {
  const showCoin = phase === "sending" || phase === "received";

  return (
    <div className="relative mx-1 mt-8 flex min-w-[4.5rem] flex-1 flex-col items-center sm:min-w-[5.5rem]">
      <div className="relative h-1 w-full">
        <div className="absolute inset-0 rounded-full bg-white/10" />
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0d9488]/20 to-[#0d9488] transition-all duration-700 ease-out ${
            phase === "preparing" ? "w-0" : phase === "sending" ? "w-[45%]" : "w-full"
          }`}
        />
        <div
          className={`traveler-transfer-path-dash absolute inset-0 rounded-full ${
            phase === "sending" || phase === "received" ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
      </div>

      {showCoin ? (
        <span
          className={`traveler-transfer-coin absolute top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0d9488] px-2.5 py-1.5 font-vodafone-rg-bd text-xs text-white shadow-[0_8px_24px_rgba(13,148,136,0.45)] ring-2 ring-white/25 ${
            phase === "sending"
              ? "traveler-transfer-coin--fly"
              : "traveler-transfer-coin--landed"
          }`}
        >
          <LucideIcon icon={Banknote} size={14} />
          {amount}
          <span className="traveler-transfer-coin-trail" aria-hidden />
        </span>
      ) : null}

      {phase === "received" || phase === "success" ? (
        <span
          className="traveler-transfer-receive-ring pointer-events-none absolute top-1/2 right-0 h-8 w-8 -translate-y-1/2 rounded-full border-2 border-[#5eead4]/60"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function TransferUserCard({
  label,
  subtitle,
  initials,
  accent,
  state,
  icon: IconOverride,
  showDebit,
  amount,
}: {
  label: string;
  subtitle: string;
  initials: string;
  accent: string;
  state: "idle" | "active" | "waiting" | "done" | "success";
  icon?: typeof User;
  showDebit?: boolean;
  amount?: string;
}) {
  const Icon = IconOverride ?? User;
  const isSuccess = state === "success";
  const isActive = state === "active";

  return (
    <div className="flex w-[6.5rem] shrink-0 flex-col items-center gap-2 sm:w-[7rem]">
      <div className="relative">
        {(isActive || isSuccess) && (
          <span
            className={`pointer-events-none absolute inset-0 rounded-2xl ${
              isSuccess
                ? "traveler-transfer-avatar-glow--success"
                : "traveler-transfer-avatar-glow"
            }`}
            style={{ backgroundColor: `${accent}33` }}
            aria-hidden
          />
        )}
        <span
          className={`relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl ring-2 transition-all duration-500 sm:h-[4.5rem] sm:w-[4.5rem] ${
            isSuccess
              ? "bg-[#0d9488] ring-[#5eead4]/50"
              : isActive
                ? "bg-white/16 ring-white/45"
                : "bg-white/10 ring-white/20"
          } ${isActive ? "traveler-transfer-sender-pulse" : ""}`}
          style={
            !isSuccess && isActive
              ? { boxShadow: `0 0 0 0 ${accent}55` }
              : undefined
          }
        >
          {isSuccess ? (
            <LucideIcon icon={Check} size={30} className="text-white" />
          ) : (
            <>
              <LucideIcon
                icon={Icon}
                size={22}
                className="absolute text-white/25"
              />
              <span
                className="font-vodafone-exb text-lg text-white"
                aria-hidden
              >
                {initials}
              </span>
            </>
          )}
        </span>
      </div>

      <div className="text-center">
        <p className="font-vodafone-exb text-xs leading-tight text-white sm:text-sm">
          {label}
        </p>
        <p className="mt-0.5 font-vodafone-lt text-[10px] text-white/50">
          {subtitle}
        </p>
        {showDebit && amount ? (
          <p className="traveler-transfer-debit mt-1 font-vodafone-rg-bd text-[10px] text-[#fca5a5]">
            − {amount}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TransferSteps({ phase }: { phase: TransferPhase }) {
  const steps = [
    { id: "preparing", label: "Connexion" },
    { id: "sending", label: "Envoi" },
    { id: "success", label: "Confirmé" },
  ] as const;

  const activeIndex =
    phase === "preparing" ? 0 : phase === "sending" || phase === "received" ? 1 : 2;

  return (
    <ul className="mt-4 flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const current = index === activeIndex;

        return (
          <li key={step.id} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-400 ${
                done
                  ? "bg-[#0d9488] text-white"
                  : current
                    ? "bg-white text-vodacom-red ring-2 ring-white/30"
                    : "bg-white/10 text-white/40"
              }`}
            >
              {done ? <LucideIcon icon={Check} size={12} /> : index + 1}
            </span>
            <span
              className={`font-vodafone-lt text-[10px] uppercase tracking-wide ${
                current || done ? "text-white/75" : "text-white/35"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
