"use client";

import { X } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
};

export function AdminModal({ title, onClose, children, size = "md" }: Props) {
  const maxWidth =
    size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "admin-modal-title" : undefined}
      aria-label={title ? undefined : "Dialogue"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl`}
      >
        {title ? (
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 id="admin-modal-title" className="text-lg font-bold text-white">
              {title}
            </h3>
            <ModalCloseBtn onClose={onClose} />
          </div>
        ) : (
          <div className="mb-2 flex justify-end">
            <ModalCloseBtn onClose={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function ModalCloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
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
      <span className="text-sm font-medium text-white">{label}</span>
      {hint && <span className="ml-1 text-xs text-white/45">({hint})</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const modalInputClass =
  "w-full rounded-lg border border-white/15 bg-[#0c0c0c] px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/20";
