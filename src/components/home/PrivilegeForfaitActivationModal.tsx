"use client";

import {
  ArrowLeftRight,
  Check,
  CreditCard,
  MessageSquare,
  Phone,
  Plane,
  Plus,
  RefreshCw,
  Sparkles,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  forfaitBenefitPosition,
  PRIVILEGE_FORFAIT_BENEFIT_DETAILS,
  PRIVILEGE_FORFAIT_BENEFITS,
  PRIVILEGE_FORFAIT_INNER_ORBIT_RADIUS,
  PRIVILEGE_FORFAIT_OUTER_ORBIT_RADIUS,
  PRIVILEGE_PURCHASED_FORFAIT_BENEFITS,
  type ForfaitBenefit,
} from "@/lib/privilege-onboarding";

export type PrivilegeForfaitModalMode = "activation" | "purchased";

type Props = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  mode?: PrivilegeForfaitModalMode;
};

const ACTIVATION_ICONS = {
  appels: Phone,
  sms: MessageSquare,
  internet: Wifi,
  "forfaits-plus": Plus,
  club: Sparkles,
  roaming: Plane,
  convertibilite: RefreshCw,
  flexibilite: Zap,
} as const;

const PURCHASED_ICONS = {
  data: Wifi,
  appels: Phone,
  transfert: ArrowLeftRight,
  visa: CreditCard,
} as const;

export function PrivilegeForfaitActivationModal({
  open,
  onClose,
  onContinue,
  mode = "activation",
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(
    null,
  );

  const isPurchased = mode === "purchased";
  const benefits = isPurchased
    ? PRIVILEGE_PURCHASED_FORFAIT_BENEFITS
    : PRIVILEGE_FORFAIT_BENEFITS;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setRevealedCount(0);
      setSelectedBenefitId(null);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setRevealedCount(0);
    const timers = benefits.map((_, index) =>
      window.setTimeout(() => {
        setRevealedCount((count) => Math.max(count, index + 1));
      }, 180 + index * 100),
    );

    return () => {
      document.body.style.overflow = prev;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [open, benefits]);

  if (!open || !mounted) return null;

  const allRevealed = revealedCount >= benefits.length;

  return createPortal(
    <div className="fixed inset-0 z-[66] flex flex-col overflow-visible font-vodafone-lt text-white">
      <div
        className="absolute inset-0"
        style={{
          background: isPurchased
            ? "radial-gradient(ellipse 110% 85% at 50% 15%, #5c6166 0%, #474b4e 42%, #35383b 100%)"
            : "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
        }}
      />
      {isPurchased ? (
        <>
          <div
            className="pointer-events-none absolute -left-10 top-24 h-48 w-48 rounded-full bg-[#2563eb]/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-8 top-1/3 h-44 w-44 rounded-full bg-[#e60000]/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-28 left-1/4 h-40 w-40 rounded-full bg-[#d97706]/15 blur-3xl"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-12 bottom-32 h-52 w-52 rounded-full bg-[#e60000]/25 blur-3xl"
            aria-hidden
          />
        </>
      )}

      <header className="relative z-30 flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
        <VodacomLogo variant="white" height={34} />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/15"
          aria-label="Fermer"
        >
          <LucideIcon icon={X} size={20} />
        </button>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-visible px-3 sm:px-6">
        <div className="experience-profile-enter relative aspect-square w-[min(92vw,78vmin)] max-w-2xl overflow-visible sm:w-[min(96vw,82vmin)]">
          <div className="absolute inset-[1%] overflow-visible">
            <OrbitRing
              diameterPercent={PRIVILEGE_FORFAIT_OUTER_ORBIT_RADIUS * 2}
              purchased={isPurchased}
            />
            <OrbitRing
              diameterPercent={PRIVILEGE_FORFAIT_INNER_ORBIT_RADIUS * 2}
              dashed
              purchased={isPurchased}
            />

            {benefits.map((benefit, index) => (
              <BenefitOrbitNode
                key={benefit.id}
                benefit={benefit}
                index={index}
                visible={index < revealedCount}
                mode={mode}
                selected={selectedBenefitId === benefit.id}
                onSelect={
                  isPurchased
                    ? undefined
                    : (id) =>
                        setSelectedBenefitId((current) =>
                          current === id ? null : id,
                        )
                }
              />
            ))}

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex max-w-[min(78%,15rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center px-2 text-center sm:max-w-[17rem]">
              {isPurchased ? (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 font-vodafone-rg-bd text-[10px] uppercase tracking-[0.14em] text-white ring-1 ring-white/25 sm:text-[11px]">
                  <LucideIcon icon={Check} size={13} />
                  Forfait activé
                </span>
              ) : null}
              <h1 className="font-vodafone-exb text-[clamp(2.125rem,8.5vw,3.5rem)] font-normal leading-[0.92] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
                {isPurchased ? "Votre forfait" : "Activer votre forfait"}
              </h1>
              {isPurchased ? (
                <p className="mt-3 rounded-full bg-white/10 px-3 py-1.5 font-vodafone-rg-bd text-[11px] leading-snug text-white/90 ring-1 ring-white/15 sm:text-xs">
                  Privilège 30j · 80Gb + 4h + 4P2P + Visa
                </p>
              ) : (
                <p className="mt-3 font-vodafone-lt text-sm leading-snug text-white/80 sm:mt-4 sm:text-base">
                  Vos avantages Privilège sont prêts à être activés.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer
        className={`relative z-30 shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 transition-all duration-500 sm:px-8 ${
          allRevealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-70"
        }`}
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!allRevealed}
          className={`mx-auto flex w-full max-w-md items-center justify-center rounded-2xl py-3.5 font-vodafone-rg-bd text-base shadow-lg transition active:scale-[0.98] disabled:opacity-50 ${
            isPurchased
              ? "bg-[#e60000] text-white shadow-[0_6px_20px_rgba(230,0,0,0.4)] active:bg-[#c40000]"
              : "bg-white text-vodacom-red"
          }`}
        >
          Continuer
        </button>
      </footer>
    </div>,
    document.body,
  );
}

function OrbitRing({
  diameterPercent,
  dashed = false,
  purchased = false,
}: {
  diameterPercent: number;
  dashed?: boolean;
  purchased?: boolean;
}) {
  const borderClass = purchased
    ? dashed
      ? "border-white/12"
      : "border-white/22"
    : dashed
      ? "border-white/15"
      : "border-white/25";

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${borderClass}`}
      style={{
        width: `${diameterPercent}%`,
        height: `${diameterPercent}%`,
        borderStyle: dashed ? "dashed" : "solid",
      }}
      aria-hidden
    />
  );
}

type BubbleSide = "left" | "right" | "top" | "bottom";

function getBenefitBubbleSide(benefit: ForfaitBenefit): BubbleSide {
  const rad = (benefit.orbitAngleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  if (sin < -0.55) return cos >= 0 ? "right" : "left";
  if (sin > 0.55) return cos >= 0 ? "right" : "left";
  if (Math.abs(cos) >= Math.abs(sin)) return cos >= 0 ? "right" : "left";
  return sin > 0 ? "bottom" : "top";
}

const BUBBLE_SIDE_LAYOUT: Record<
  BubbleSide,
  { panel: string; arrow: string }
> = {
  right: {
    panel: "left-[calc(100%+14px)] top-1/2 -translate-y-1/2",
    arrow:
      "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-b border-l border-white/20",
  },
  left: {
    panel: "right-[calc(100%+14px)] top-1/2 -translate-y-1/2",
    arrow:
      "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-t border-r border-white/20",
  },
  bottom: {
    panel: "left-1/2 top-[calc(100%+14px)] -translate-x-1/2",
    arrow:
      "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border-l border-t border-white/20",
  },
  top: {
    panel: "left-1/2 bottom-[calc(100%+14px)] -translate-x-1/2",
    arrow:
      "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 border-r border-b border-white/20",
  },
};

function ForfaitBenefitInfoBubble({
  title,
  bullets,
  side,
  onClose,
}: {
  title: string;
  bullets: string[];
  side: BubbleSide;
  onClose: () => void;
}) {
  const isIntroLine = (line: string) => line.endsWith(":");
  const layout = BUBBLE_SIDE_LAYOUT[side];

  return (
    <div
      className={`pointer-events-auto absolute z-50 w-[min(15.5rem,calc(100vw-2rem))] sm:w-[17rem] ${layout.panel}`}
      role="dialog"
      aria-labelledby="forfait-benefit-info-title"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={`absolute h-3 w-3 rotate-45 bg-[#1c1c1e] ${layout.arrow}`}
        aria-hidden
      />
      <div className="relative rounded-2xl border border-white/20 bg-[#1c1c1e]/98 p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h2
            id="forfait-benefit-info-title"
            className="font-vodafone-exb text-sm leading-tight text-white sm:text-base"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Fermer"
          >
            <LucideIcon icon={X} size={14} />
          </button>
        </div>
        <ul className="mt-2.5 space-y-1">
          {bullets.map((line) => (
            <li
              key={line}
              className={`font-vodafone-lt text-[13px] leading-snug sm:text-sm sm:leading-relaxed ${
                isIntroLine(line)
                  ? "font-vodafone-rg-bd text-white/90"
                  : "flex gap-1.5 text-white/75 before:shrink-0 before:content-['•']"
              }`}
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BenefitOrbitNode({
  benefit,
  index,
  visible,
  mode,
  selected = false,
  onSelect,
}: {
  benefit: ForfaitBenefit;
  index: number;
  visible: boolean;
  mode: PrivilegeForfaitModalMode;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  if (!visible) return null;

  const { left, top } = forfaitBenefitPosition(benefit);
  const isPurchased = mode === "purchased";
  const isOuter = !isPurchased && benefit.ring === "outer";
  const isInner = isPurchased || benefit.ring === "inner";
  const icons = isPurchased ? PURCHASED_ICONS : ACTIVATION_ICONS;
  const Icon = icons[benefit.id as keyof typeof icons];

  const size = isPurchased
    ? "h-[8.75rem] w-[8.75rem] sm:h-[9.75rem] sm:w-[9.75rem]"
    : isOuter
      ? "h-[9.5rem] w-[9.5rem] sm:h-[10.5rem] sm:w-[10.5rem]"
      : "h-[8.25rem] w-[8.25rem] sm:h-[9.25rem] sm:w-[9.25rem]";

  const innerFloatDelay = `${(index % 4) * 0.85}s`;
  const innerFloatDuration = `${3.8 + (index % 4) * 0.35}s`;
  const detail = PRIVILEGE_FORFAIT_BENEFIT_DETAILS[benefit.id];
  const hasDetail = Boolean(detail);
  const isInteractive = !isPurchased && hasDetail && onSelect;
  const bubbleSide = getBenefitBubbleSide(benefit);

  const circle = (
    <div
      className={`forfait-benefit-pop flex flex-col items-center justify-center rounded-full p-2.5 text-center ring-[3px] ${size} ${
        isPurchased
          ? "ring-white/70"
          : selected
            ? "shadow-[0_0_0_4px_rgba(255,255,255,0.35)] ring-2 ring-white"
            : "shadow-[0_8px_24px_rgba(0,0,0,0.28)] ring-2 ring-white/50"
      } ${isInteractive ? "cursor-pointer transition active:scale-95" : ""}`}
      style={{
        backgroundColor: benefit.color,
        animationDelay: `${index * 40}ms`,
        boxShadow: isPurchased
          ? `0 12px 36px ${benefit.color}66, 0 4px 14px rgba(0,0,0,0.32)`
          : undefined,
      }}
    >
      {Icon ? (
        <LucideIcon
          icon={Icon}
          size={isPurchased ? 28 : isOuter ? 30 : 26}
          className="shrink-0 drop-shadow-sm"
        />
      ) : null}
      <span
        className={`mt-1.5 max-w-[94%] font-vodafone-exb font-normal leading-tight text-white ${
          benefit.value
            ? "text-[10px] uppercase tracking-[0.12em] text-white/90 sm:text-[11px]"
            : isOuter
              ? "text-xs sm:text-sm"
              : "text-[11px] sm:text-xs"
        }`}
      >
        {benefit.label}
      </span>
      {benefit.value ? (
        <span className="mt-0.5 max-w-[94%] font-vodafone-exb text-[1.05rem] font-normal leading-none text-white sm:text-xl">
          {benefit.value}
        </span>
      ) : null}
    </div>
  );

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${selected ? "z-50" : "z-10"}`}
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <div
        className={`relative ${isInner ? "forfait-inner-orbit-float" : ""}`}
        style={
          isInner
            ? {
                animationDelay: innerFloatDelay,
                animationDuration: innerFloatDuration,
              }
            : undefined
        }
      >
        {isInteractive ? (
          <button
            type="button"
            onClick={() => onSelect(benefit.id)}
            className="relative rounded-full border-0 bg-transparent p-0"
            aria-label={`Détails : ${benefit.label}`}
            aria-pressed={selected}
            aria-expanded={selected}
          >
            {circle}
          </button>
        ) : (
          circle
        )}
        {selected && detail ? (
          <ForfaitBenefitInfoBubble
            title={detail.title}
            bullets={detail.bullets}
            side={bubbleSide}
            onClose={() => onSelect?.(benefit.id)}
          />
        ) : null}
      </div>
    </div>
  );
}
