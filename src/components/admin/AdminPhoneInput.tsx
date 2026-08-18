"use client";

import { useState } from "react";
import { normalizePhone, PHONE_INPUT_HINT } from "@/lib/phone";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
};

export function AdminPhoneInput({ id, value, onChange, inputClass }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleBlur() {
    if (!value.trim()) {
      setPreview(null);
      setError(null);
      return;
    }
    const result = normalizePhone(value);
    if (result.ok && result.e164) {
      setPreview(result.e164);
      setError(null);
      return;
    }
    if (!result.ok) {
      setPreview(null);
      setError(result.error);
    }
  }

  return (
    <>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setPreview(null);
          setError(null);
        }}
        onBlur={handleBlur}
        className={inputClass}
        placeholder="0815191631"
        autoComplete="tel"
      />
      <p className="mt-1 text-xs text-zinc-500">{PHONE_INPUT_HINT}</p>
      {preview ? (
        <p className="mt-1 text-xs text-emerald-700">Enregistré : {preview}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-amber-700">{error}</p>
      ) : null}
    </>
  );
}
