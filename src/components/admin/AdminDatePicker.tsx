"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  required?: boolean;
  placeholder?: string;
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"] as const;

function parseIso(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIso(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function formatDisplay(iso: string): string {
  const d = parseIso(iso);
  if (!d) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AdminDatePicker({
  id,
  value,
  onChange,
  min,
  required,
  placeholder = "Choisir une date",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const selected = parseIso(value);

  const initialCursor = selected ?? new Date();
  const [cursor, setCursor] = useState({
    year: initialCursor.getFullYear(),
    month: initialCursor.getMonth(),
  });

  useEffect(() => {
    if (!open) return;
    const d = parseIso(value) ?? new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function place() {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      const popH = 300;
      const popW = 280;
      const top =
        window.innerHeight - r.bottom < popH + 12
          ? Math.max(8, r.top - popH - 8)
          : r.bottom + 8;
      const left = Math.min(
        Math.max(8, r.left),
        window.innerWidth - popW - 8,
      );
      setPos({ top, left });
    }
    place();
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const items: { iso: string; day: number; disabled: boolean }[] = [];
    for (let i = 0; i < mondayOffset; i++) {
      items.push({ iso: `pad-${i}`, day: 0, disabled: true });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toIso(cursor.year, cursor.month, day);
      items.push({
        iso,
        day,
        disabled: Boolean(min && iso < min),
      });
    }
    return items;
  }, [cursor.month, cursor.year, min]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    "fr-FR",
    { month: "long", year: "numeric" },
  );

  function selectDay(iso: string) {
    onChange(iso);
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const todayIso = toIso(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  return (
    <div ref={rootRef} className="relative mt-1.5">
      <input
        id={id}
        required={required}
        value={value}
        onChange={() => undefined}
        tabIndex={-1}
        className="sr-only"
        aria-hidden
      />
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={value ? formatDisplay(value) : placeholder}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-[42px] w-full min-w-[220px] items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-900 outline-none hover:border-zinc-300 focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/20"
      >
        <span className={value ? "capitalize" : "text-zinc-400"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <LucideIcon icon={Calendar} size={16} className="text-zinc-400" />
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label="Choisir une date"
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[80] w-[280px] rounded-xl border border-zinc-200 bg-white p-3 shadow-2xl"
          >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Mois précédent"
            >
              <LucideIcon icon={ChevronLeft} size={16} />
            </button>
            <p className="text-sm font-semibold capitalize text-zinc-900">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Mois suivant"
            >
              <LucideIcon icon={ChevronRight} size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((d, i) => (
              <span
                key={`${d}-${i}`}
                className="py-1 text-[10px] font-semibold uppercase text-zinc-400"
              >
                {d}
              </span>
            ))}
            {cells.map((cell) =>
              cell.day === 0 ? (
                <span key={cell.iso} />
              ) : (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => selectDay(cell.iso)}
                  className={`h-8 rounded-lg text-sm tabular-nums transition ${
                    cell.iso === value
                      ? "bg-vodacom-red font-semibold text-white"
                      : cell.disabled
                        ? "cursor-not-allowed text-zinc-300"
                        : cell.iso === todayIso
                          ? "ring-1 ring-vodacom-red/50 text-zinc-900 hover:bg-zinc-100"
                          : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {cell.day}
                </button>
              ),
            )}
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
