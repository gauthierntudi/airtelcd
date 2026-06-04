"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UssdKeypad } from "@/components/mpesa/UssdKeypad";
import {
  useUssdKeypadEnterAnimation,
  useUssdScreenEnterAnimation,
  useUssdStatusEnterAnimation,
} from "@/components/mpesa/useUssdGsapTransitions";
import {
  applyUssdChoice,
  getUssdScreenView,
  INITIAL_VISA_SIM_STATE,
  type VisaSimulationState,
} from "@/lib/mpesa-ussd/visa-simulation";
import { MPESA_USSD_COLORS as C } from "@/lib/mpesa-ussd/theme";

type Props = {
  onClose?: () => void;
};

export function UssdPhoneSimulator({ onClose }: Props) {
  const [sim, setSim] = useState<VisaSimulationState>(INITIAL_VISA_SIM_STATE);
  const [input, setInput] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const keypadRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const view = getUssdScreenView(sim);

  useUssdScreenEnterAnimation(screenRef, sim.screen);
  useUssdKeypadEnterAnimation(keypadRef, replyOpen && view.showInput);
  useUssdStatusEnterAnimation(
    statusRef,
    statusMsg && !replyOpen ? statusMsg : null,
  );

  useEffect(() => {
    screenRef.current?.scrollTo({ top: 0 });
  }, [sim.screen]);

  useEffect(() => {
    setReplyOpen(false);
    setInput("");
    setStatusMsg(null);
  }, [sim.screen]);

  const submitChoice = useCallback(
    (choice: string) => {
      const { state: next, accepted } = applyUssdChoice(sim, choice);
      if (!accepted) {
        setStatusMsg("Choix invalide");
        window.setTimeout(() => setStatusMsg(null), 1200);
        return;
      }
      setSim(next);
      setInput("");
      setReplyOpen(false);
      setStatusMsg(null);
    },
    [sim],
  );

  const trySubmit = useCallback(() => {
    if (!input.trim()) {
      setStatusMsg("Saisissez un chiffre");
      window.setTimeout(() => setStatusMsg(null), 1200);
      return;
    }
    submitChoice(input.trim());
  }, [input, submitChoice]);

  function handleRepondre() {
    if (!view.showInput) return;
    if (!replyOpen) {
      setReplyOpen(true);
      setStatusMsg(null);
      return;
    }
    trySubmit();
  }

  function handleAnnuler() {
    if (replyOpen) {
      setReplyOpen(false);
      setInput("");
      setStatusMsg(null);
      return;
    }
    onClose?.();
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-1 flex-col sm:max-w-xl">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
      <section
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ backgroundColor: C.dark }}
        aria-label="Menu USSD"
      >
        <div
          className="shrink-0 border-b border-white/10 px-4 py-2.5"
          style={{ backgroundColor: C.mid }}
        >
          <p
            className="text-center font-mono text-xs sm:text-sm"
            style={{ color: C.textMuted }}
          >
            *111# — Session USSD · Vodacom M-Pesa
          </p>
        </div>

        <div
          ref={screenRef}
          key={sim.screen}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 font-mono text-sm leading-relaxed will-change-transform sm:px-6 sm:py-5 sm:text-[15px]"
          style={{ color: C.text }}
        >
          <p
            data-ussd-title
            className="mb-3 text-base font-bold sm:text-lg"
            style={{ color: C.text }}
          >
            {view.title}
          </p>
          {view.lines.map((line, i) => (
            <p
              key={i}
              data-ussd-line
              className="whitespace-pre-wrap"
              style={{ color: C.textMuted }}
            >
              {line || "\u00A0"}
            </p>
          ))}
          {view.options.length > 0 && (
            <ul className="mt-4 space-y-1">
              {view.options.map((opt) => (
                <li
                  key={opt.key}
                  data-ussd-option
                  className="rounded-lg px-2 py-1.5 sm:py-2"
                  style={{ color: C.text }}
                >
                  <span className="font-bold" style={{ color: C.accent }}>
                    {opt.key}.
                  </span>{" "}
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {statusMsg && !replyOpen && (
          <p
            ref={statusRef}
            key={statusMsg}
            className="shrink-0 border-t border-white/10 px-4 py-2 text-center text-xs text-[#ffb4b4]"
          >
            {statusMsg}
          </p>
        )}
      </section>

      {replyOpen && view.showInput && (
        <div ref={keypadRef} className="mt-3 will-change-transform">
          <UssdKeypad
            value={input}
            onChange={(v) => {
              setInput(v.slice(-1));
              setStatusMsg(null);
            }}
            onSubmit={trySubmit}
            error={statusMsg}
          />
        </div>
      )}
      </div>

      <div
        className="relative z-20 shrink-0 border-t border-white/10 px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:sticky max-sm:bottom-0 sm:px-6"
        style={{ backgroundColor: C.dark }}
      >
        <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleAnnuler}
            className="flex min-h-[56px] w-full min-w-0 items-center justify-center rounded-2xl border-2 border-white/20 py-4 font-vodafone-exb text-base tracking-wide active:scale-[0.98] sm:min-h-[60px] sm:text-lg"
            style={{
              backgroundColor: C.cancelBg,
              color: C.dark,
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleRepondre}
            disabled={!view.showInput}
            className="flex min-h-[56px] w-full min-w-0 items-center justify-center rounded-2xl py-4 font-vodafone-exb text-base tracking-wide text-white shadow-[0_6px_20px_rgba(230,0,0,0.45)] active:scale-[0.98] active:bg-[#c40000] disabled:opacity-45 sm:min-h-[60px] sm:text-lg"
            style={{ backgroundColor: C.accent }}
          >
            Répondre
          </button>
        </div>
      </div>
    </div>
  );
}
