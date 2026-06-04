"use client";

import { Loader2 } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import { LucideIcon } from "@/components/ui/lucide-icon";

type Props = {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "primary",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const confirmClass =
    variant === "danger"
      ? "bg-vodacom-red text-white hover:bg-vodacom-red-dark"
      : "bg-vodacom-red text-white hover:bg-vodacom-red-dark";

  return (
    <AdminModal title={title} onClose={loading ? () => {} : onClose}>
      <div className="text-sm text-white/75">{message}</div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${confirmClass}`}
        >
          {loading && <LucideIcon icon={Loader2} size={16} className="animate-spin" />}
          {loading ? "En cours…" : confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}
