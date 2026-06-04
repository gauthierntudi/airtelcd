"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";
const OTP_LENGTH = 6;

export type OtpSixDigitInputHandle = {
  focus: () => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  autoFocus?: boolean;
};

function digitsFromValue(value: string): string[] {
  const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
  return Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? "");
}

function joinDigits(cells: string[]): string {
  return cells.join("").replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export const OtpSixDigitInput = forwardRef<OtpSixDigitInputHandle, Props>(
  function OtpSixDigitInput(
    { value, onChange, disabled = false, id, autoFocus = false },
    ref,
  ) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const cells = digitsFromValue(value);

    const focusIndex = useCallback((index: number) => {
      const i = Math.max(0, Math.min(index, OTP_LENGTH - 1));
      inputRefs.current[i]?.focus();
      inputRefs.current[i]?.select();
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => focusIndex(0),
    }));

    useEffect(() => {
      if (autoFocus && !disabled) {
        focusIndex(0);
      }
    }, [autoFocus, disabled, focusIndex]);

    const applyDigits = useCallback(
      (next: string) => {
        onChange(joinDigits(digitsFromValue(next)));
      },
      [onChange],
    );

    const applyCells = useCallback(
      (nextCells: string[]) => {
        onChange(joinDigits(nextCells));
      },
      [onChange],
    );

    function handlePaste(pasted: string, startIndex = 0) {
      const digits = pasted.replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (!digits) return;

      const next = [...cells];
      let writeAt = startIndex;
      for (const d of digits) {
        if (writeAt >= OTP_LENGTH) break;
        next[writeAt] = d;
        writeAt += 1;
      }
      applyCells(next);
      const focusAt = Math.min(writeAt, OTP_LENGTH - 1);
      requestAnimationFrame(() => focusIndex(focusAt));
    }

    function handleChangeAt(index: number, raw: string) {
      const digits = raw.replace(/\D/g, "");
      if (!digits) {
        const next = [...cells];
        next[index] = "";
        applyCells(next);
        return;
      }

      if (digits.length > 1) {
        handlePaste(digits, index);
        return;
      }

      const next = [...cells];
      next[index] = digits;
      applyCells(next);
      if (index < OTP_LENGTH - 1) {
        requestAnimationFrame(() => focusIndex(index + 1));
      }
    }

    function handleKeyDown(
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) {
      if (e.key === "Backspace") {
        e.preventDefault();
        const next = [...cells];
        if (cells[index]) {
          next[index] = "";
          applyCells(next);
          return;
        }
        if (index > 0) {
          next[index - 1] = "";
          applyCells(next);
          focusIndex(index - 1);
        }
        return;
      }

      if (e.key === "Delete") {
        e.preventDefault();
        const next = [...cells];
        next[index] = "";
        applyCells(next);
        return;
      }

      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focusIndex(index - 1);
        return;
      }

      if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        e.preventDefault();
        focusIndex(index + 1);
      }
    }

    return (
      <div id={id} className="relative mt-1.5">
        <div
          className="flex justify-center gap-2 sm:gap-2.5"
          onPaste={(e) => {
            e.preventDefault();
            handlePaste(e.clipboardData.getData("text"), 0);
          }}
        >
          {cells.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={index === 0 ? OTP_LENGTH : 1}
              disabled={disabled}
              value={digit}
              aria-label={`Chiffre ${index + 1} sur ${OTP_LENGTH}`}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              className="h-12 w-10 rounded-xl border border-vodacom-silver/40 bg-white text-center font-vodafone-exb text-2xl text-vodacom-black outline-none transition focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15 disabled:opacity-60 sm:h-14 sm:w-12"
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleChangeAt(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => {
                e.preventDefault();
                handlePaste(e.clipboardData.getData("text"), index);
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);
