"use client";

import { X } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
};

export function AdminModal({
  title,
  onClose,
  children,
  size = "md",
}: Props) {
  const maxWidth =
    size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "admin-modal-title" : undefined}
      aria-label={title ? undefined : "Dialogue"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl`}
      >
        {title ? (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
            <h3 id="admin-modal-title" className="text-lg font-bold text-zinc-900">
              {title}
            </h3>
            <ModalCloseBtn onClose={onClose} />
          </div>
        ) : (
          <div className="flex shrink-0 justify-end px-6 pt-4">
            <ModalCloseBtn onClose={onClose} />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function ModalCloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
      aria-label="Fermer"
    >
      <LucideIcon icon={X} size={18} />
    </button>
  );
}

export function ModalField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      {hint && <span className="ml-1 text-xs text-zinc-500">({hint})</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const modalInputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/20";
