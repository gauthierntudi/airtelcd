"use client";

import {
  ArrowLeft,
  ArrowRight,
  Globe,
  RefreshCw,
  Sparkles,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { TravelerConversionOrbitDecor } from "@/components/traveler/TravelerConversionOrbitDecor";
import { TRAVELER_CONVERSION_FLOWS } from "@/lib/traveler-journey";

export function TravelerConversionStep() {
  const [toRoaming, setToRoaming] = useState(true);
  const flow = toRoaming
    ? TRAVELER_CONVERSION_FLOWS[0]
    : TRAVELER_CONVERSION_FLOWS[1];

  return (
    <div className="relative w-full max-w-lg px-1 sm:max-w-xl sm:px-2">
      <TravelerConversionOrbitDecor />

      <div className="relative z-10">
      <header className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb]/20 ring-1 ring-[#2563eb]/35">
            <LucideIcon icon={RefreshCw} size={20} className="text-[#93c5fd]" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-vodafone-rg-bd text-[10px] uppercase tracking-wide text-white/75 ring-1 ring-white/15">
            <LucideIcon icon={Sparkles} size={12} />
            Profil Traveler
          </span>
        </div>
        <h3 className="font-vodafone-exb text-lg text-white sm:text-xl">
          Convertibilité Internet
        </h3>
        <p className="mt-2 font-vodafone-lt text-sm leading-relaxed text-white/75 sm:text-base">
          Basculez le sens pour visualiser la conversion de vos volumes Data
          entre réseau local et roaming.
        </p>
      </header>

      <ConversionSegmentedToggle toRoaming={toRoaming} onChange={setToRoaming} />

      <div key={flow.id} className="traveler-conversion-flow-enter mt-6 space-y-5">
        <div className="text-center">
          <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-[#5eead4]">
            Sens actif
          </p>
          <p className="mt-1.5 font-vodafone-exb text-base text-white sm:text-lg">
            {flow.label}
          </p>
        </div>

        <div className="flex items-center gap-2 px-1 sm:gap-4 sm:px-2">
          <ConversionNode
            label="Local"
            sublabel="Internet"
            icon={Wifi}
            accent="#2563eb"
            role={toRoaming ? "source" : "target"}
          />

          <ConversionLane toRoaming={toRoaming} />

          <ConversionNode
            label="Roaming"
            sublabel="Internet"
            icon={Globe}
            accent="#0d9488"
            role={toRoaming ? "target" : "source"}
          />
        </div>

        <p className="flex items-center justify-center gap-2 text-center font-vodafone-lt text-xs text-white/65 sm:text-sm">
          <LucideIcon icon={RefreshCw} size={14} className="shrink-0 text-[#5eead4]" />
          Conversion bidirectionnelle incluse dans votre forfait Privilège
        </p>
      </div>
      </div>
    </div>
  );
}

function ConversionSegmentedToggle({
  toRoaming,
  onChange,
}: {
  toRoaming: boolean;
  onChange: (toRoaming: boolean) => void;
}) {
  return (
    <div
      className="flex rounded-2xl bg-white/8 p-1 backdrop-blur-sm"
      role="tablist"
      aria-label="Sens de conversion"
    >
      <SegmentTab
        active={toRoaming}
        onClick={() => onChange(true)}
        label="Local → Roaming"
        shortLabel="L → R"
      />
      <SegmentTab
        active={!toRoaming}
        onClick={() => onChange(false)}
        label="Roaming → Local"
        shortLabel="R → L"
      />
    </div>
  );
}

function SegmentTab({
  active,
  onClick,
  label,
  shortLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  shortLabel: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex-1 rounded-xl px-2 py-3 text-center transition-all duration-300 sm:px-3 ${
        active
          ? "bg-vodacom-red text-white shadow-[0_8px_24px_rgba(230,0,0,0.35)]"
          : "text-white/55 hover:bg-white/5 hover:text-white/80"
      }`}
    >
      <span className="hidden font-vodafone-exb text-xs sm:block sm:text-sm">
        {label}
      </span>
      <span className="font-vodafone-exb text-xs sm:hidden">{shortLabel}</span>
    </button>
  );
}

function ConversionLane({ toRoaming }: { toRoaming: boolean }) {
  return (
    <div className="relative mx-0.5 flex min-w-[5rem] flex-1 flex-col items-center sm:min-w-[6.5rem]">
      <div className="relative h-2 w-full">
        <div className="absolute inset-0 rounded-full bg-white/10" />
        <div
          className={`absolute inset-y-0 w-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#0d9488] ${
            toRoaming ? "left-0" : "right-0"
          }`}
          style={{ opacity: 0.55 }}
        />
        <div
          className={`traveler-conversion-path-dash absolute inset-0 rounded-full ${
            toRoaming
              ? "traveler-conversion-path-dash--ltr"
              : "traveler-conversion-path-dash--rtl"
          }`}
          aria-hidden
        />
      </div>

      <div className="relative mt-3 flex h-11 w-full items-center justify-center sm:h-12">
        <span
          className={`traveler-conversion-flow-dot absolute h-2.5 w-2.5 rounded-full bg-[#5eead4] shadow-[0_0_12px_rgba(94,234,212,0.8)] ${
            toRoaming
              ? "traveler-conversion-flow-dot--ltr"
              : "traveler-conversion-flow-dot--rtl"
          }`}
          aria-hidden
        />
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/12 ring-2 ring-white/20 sm:h-10 sm:w-10 ${
            toRoaming
              ? "traveler-conversion-arrow"
              : "traveler-conversion-arrow-reverse"
          }`}
        >
          <LucideIcon
            icon={toRoaming ? ArrowRight : ArrowLeft}
            size={18}
            className="text-white"
          />
        </span>
      </div>

      <span className="mt-1 font-vodafone-lt text-[10px] uppercase tracking-[0.16em] text-white/45">
        Data
      </span>
    </div>
  );
}

function ConversionNode({
  label,
  sublabel,
  icon,
  accent,
  role,
}: {
  label: string;
  sublabel: string;
  icon: typeof Wifi;
  accent: string;
  role: "source" | "target";
}) {
  const isSource = role === "source";

  return (
    <div
      className={`flex w-[5.25rem] shrink-0 flex-col items-center gap-2 transition-all duration-300 sm:w-[5.75rem] ${
        isSource ? "scale-100" : "scale-[0.94] opacity-80"
      }`}
    >
      <div className="relative">
        {isSource ? (
          <span
            className="traveler-conversion-node-pulse pointer-events-none absolute -inset-1.5 rounded-[1.15rem]"
            style={{ backgroundColor: `${accent}28` }}
            aria-hidden
          />
        ) : null}
        <span
          className={`relative flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-2xl ring-2 sm:h-16 sm:w-16 ${
            isSource ? "ring-white/40" : "ring-white/20"
          }`}
          style={{
            backgroundColor: `${accent}${isSource ? "33" : "18"}`,
            boxShadow: isSource ? `0 10px 28px ${accent}44` : "none",
            borderColor: `${accent}77`,
          }}
        >
          <LucideIcon icon={icon} size={isSource ? 28 : 24} className="text-white" />
        </span>
        {isSource ? (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-vodacom-red px-2 py-0.5 font-vodafone-rg-bd text-[9px] uppercase tracking-wide text-white">
            Source
          </span>
        ) : (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-2 py-0.5 font-vodafone-rg-bd text-[9px] uppercase tracking-wide text-white/80">
            Cible
          </span>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="font-vodafone-exb text-xs text-white sm:text-sm">{label}</p>
        <p className="font-vodafone-lt text-[10px] text-white/50">{sublabel}</p>
      </div>
    </div>
  );
}
