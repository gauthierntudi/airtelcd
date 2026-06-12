"use client";

import { CornerDownLeft, Delete, Phone } from "lucide-react";
import { useEffect, useRef } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";

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
  onDial?: () => void;
  disabled?: boolean;
  error?: string | null;
  hint?: string;
};

export function PhoneDialPad({
  value,
  onChange,
  onDial,
  disabled = false,
  error,
  hint,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    function onKeyDown(e: KeyboardEvent) {
      if (disabled) return;
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        onChange(value + e.key);
        return;
      }
      if (e.key === "#" || e.key === "*") {
        e.preventDefault();
        onChange(value + e.key);
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        onChange(value.slice(0, -1));
        return;
      }
      if (e.key === "Enter" && onDial) {
        e.preventDefault();
        onDial();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, onChange, onDial, value]);

  function append(char: string) {
    if (disabled) return;
    onChange(value + char);
  }

  function backspace() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  return (
    <div
      ref={panelRef}
      className="rounded-2xl bg-[#474b4e] p-4 ring-1 ring-white/10 sm:p-5"
      role="group"
      aria-label="Clavier téléphone"
    >
      <div className="grid grid-cols-[minmax(0,8fr)_minmax(0,2fr)] gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
            Composer
          </p>
          <div
            className="mt-1.5 flex h-14 items-center justify-center rounded-xl border-2 border-[#2b292c] bg-[#2b292c] px-3 shadow-inner sm:h-[60px]"
            aria-live="polite"
          >
            <span className="truncate font-mono text-2xl font-bold tracking-wider text-white sm:text-3xl">
              {value || " "}
            </span>
          </div>
          {hint ? (
            <p className="mt-2 text-center font-vodafone-lt text-xs text-white/50">
              {hint}
            </p>
          ) : null}
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
            Effacer
          </p>
          <button
            type="button"
            disabled={disabled || !value}
            onClick={backspace}
            aria-label="Effacer"
            className="mt-1.5 flex h-14 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-[#2b292c] bg-white text-[#2b292c] transition active:scale-[0.98] disabled:opacity-35 sm:h-[60px]"
          >
            <LucideIcon icon={Delete} size={22} />
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-center text-xs text-[#ffb4b4]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        {DIAL_ROWS.flat().map((key) => (
          <DialKey
            key={key.digit}
            digit={key.digit}
            letters={key.letters}
            disabled={disabled}
            onPress={() => append(key.digit)}
          />
        ))}
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:gap-3">
        <DialKey digit="*" disabled={disabled} onPress={() => append("*")} />
        <DialKey digit="0" letters="+" disabled={disabled} onPress={() => append("0")} />
        <DialKey digit="#" disabled={disabled} onPress={() => append("#")} />
      </div>

      <button
        type="button"
        disabled={disabled || !onDial}
        onClick={onDial}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e60000] py-3.5 font-vodafone-exb text-base text-white shadow-[0_6px_20px_rgba(230,0,0,0.45)] transition active:scale-[0.98] disabled:opacity-45"
      >
        <LucideIcon icon={Phone} size={20} />
        Appeler
      </button>
    </div>
  );
}

function DialKey({
  digit,
  letters,
  disabled,
  onPress,
}: {
  digit: string;
  letters?: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      className="flex min-h-[52px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#2b292c] transition active:scale-[0.97] disabled:opacity-40 sm:min-h-[56px]"
    >
      <span className="font-mono text-2xl font-bold leading-none text-white">
        {digit}
      </span>
      {letters ? (
        <span className="mt-0.5 font-mono text-[8px] font-medium tracking-[0.2em] text-white/55">
          {letters}
        </span>
      ) : null}
    </button>
  );
}
