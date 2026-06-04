"use client";

import { CornerDownLeft, Delete } from "lucide-react";
import { useEffect, useRef } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { MPESA_USSD_COLORS as C } from "@/lib/mpesa-ussd/theme";

const DIAL_ROWS: { digit: string; letters?: string }[][] = [
  [
    { digit: "1" },
    { digit: "2", letters: "ABC" },
    { digit: "3", letters: "DEF" },
  ],
  [
    { digit: "4", letters: "GHI" },
    { digit: "5", letters: "JKL" },
    { digit: "6", letters: "MNO" },
  ],
  [
    { digit: "7", letters: "PQRS" },
    { digit: "8", letters: "TUV" },
    { digit: "9", letters: "WXYZ" },
  ],
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  error?: string | null;
};

export function UssdKeypad({
  value,
  onChange,
  onSubmit,
  disabled = false,
  error,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    function onKeyDown(e: KeyboardEvent) {
      if (disabled) return;
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        onChange(e.key);
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        onChange("");
        return;
      }
      if (e.key === "Enter" && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, onChange, onSubmit]);

  function pressDigit(digit: string) {
    if (disabled) return;
    onChange(digit);
  }

  return (
    <div
      ref={panelRef}
      className="shrink-0 rounded-2xl p-4 ring-1 ring-white/10 sm:p-5"
      style={{ backgroundColor: C.mid }}
      role="group"
      aria-label="Clavier de réponse USSD"
    >
      <div className="grid grid-cols-[minmax(0,8fr)_minmax(0,2fr)] gap-3">
        <div className="flex min-w-0 flex-col">
          <p
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: C.textMuted }}
          >
            Votre choix
          </p>
          <div
            className="mt-1.5 flex h-14 items-center justify-center rounded-xl border-2 px-4 shadow-inner sm:h-[60px]"
            style={{
              borderColor: C.dark,
              backgroundColor: C.dark,
            }}
            aria-live="polite"
          >
            {value ? (
              <span
                className="font-mono text-4xl font-bold tabular-nums"
                style={{ color: C.text }}
              >
                {value}
              </span>
            ) : (
              <span
                className="animate-pulse font-mono text-3xl font-light"
                style={{ color: C.textDim }}
              >
                _
              </span>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <p
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: C.textMuted }}
          >
            Effacer
          </p>
          <button
            type="button"
            disabled={disabled || !value}
            onClick={() => onChange("")}
            aria-label="Effacer la saisie"
            className="mt-1.5 flex h-14 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 transition active:scale-[0.98] disabled:opacity-35 sm:h-[60px]"
            style={{
              borderColor: C.dark,
              backgroundColor: C.cancelBg,
              color: C.dark,
            }}
          >
            <LucideIcon icon={Delete} size={24} />
            <span className="font-vodafone-rg-bd text-[10px] uppercase tracking-wide">
              Effacer
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-center text-xs text-[#ffb4b4]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        {DIAL_ROWS.flat().map((key) => (
          <DialKey
            key={key.digit}
            digit={key.digit}
            letters={key.letters}
            active={value === key.digit}
            disabled={disabled}
            onPress={() => pressDigit(key.digit)}
          />
        ))}
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          disabled
          aria-hidden
          className="flex min-h-[52px] flex-col items-center justify-center rounded-xl font-mono text-lg opacity-40 sm:min-h-[56px]"
          style={{ backgroundColor: C.dark, color: C.textDim }}
        >
          *
        </button>
        <DialKey
          digit="0"
          letters="+"
          active={value === "0"}
          disabled={disabled}
          onPress={() => pressDigit("0")}
        />
        <button
          type="button"
          disabled={disabled || !onSubmit}
          onClick={onSubmit}
          aria-label="Valider avec Entrée"
          className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-white transition active:scale-95 disabled:opacity-35 sm:min-h-[56px]"
          style={{ backgroundColor: C.accent }}
        >
          <LucideIcon icon={CornerDownLeft} size={20} />
          <span className="text-[9px] font-vodafone-rg-bd">Entrée</span>
        </button>
      </div>

      <p
        className="mt-3 text-center font-vodafone-lt text-[10px]"
        style={{ color: C.textDim }}
      >
        Touchez un chiffre ou utilisez le clavier de votre appareil
      </p>
    </div>
  );
}

function DialKey({
  digit,
  letters,
  active,
  disabled,
  onPress,
}: {
  digit: string;
  letters?: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      className="flex min-h-[52px] flex-col items-center justify-center rounded-xl border transition active:scale-[0.97] disabled:opacity-40 sm:min-h-[56px]"
      style={{
        borderColor: active ? C.accent : "rgba(255,255,255,0.12)",
        backgroundColor: C.dark,
        boxShadow: active ? `0 0 0 2px ${C.accent}55` : "0 2px 0 rgba(0,0,0,0.35)",
      }}
    >
      <span
        className="font-mono text-2xl font-bold leading-none"
        style={{ color: C.text }}
      >
        {digit}
      </span>
      {letters && (
        <span
          className="mt-0.5 font-mono text-[8px] font-medium tracking-[0.2em]"
          style={{ color: C.textMuted }}
        >
          {letters}
        </span>
      )}
    </button>
  );
}
