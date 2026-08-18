"use client";

import { useEffect, type ReactNode } from "react";
import { useBottomSheetDragClose } from "@/hooks/use-bottom-sheet-drag-close";

type Props = {
  onClose: () => void;
  /** id d’un titre pour aria-labelledby */
  titleId?: string;
  /** Label accessibilité du fond cliquable */
  backdropLabel: string;
  maxHeightClass?: string;
  tone?: "dark" | "light";
  children: ReactNode;
};

/** Coque bottom sheet — portal-ready, poignée draggable pour fermer */
export function InvitationBottomSheet({
  onClose,
  titleId,
  backdropLabel,
  maxHeightClass = "max-h-[min(92dvh,40rem)]",
  tone = "dark",
  children,
}: Props) {
  const { panelStyle, backdropStyle, handleProps } = useBottomSheetDragClose({
    onClose,
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end"
      role="presentation"
    >
      <button
        type="button"
        className={`invitation-bottom-sheet-backdrop absolute inset-0 backdrop-blur-sm ${
          tone === "light" ? "bg-zinc-900/40" : "bg-black/50"
        }`}
        style={backdropStyle}
        aria-label={backdropLabel}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        {...(titleId ? { "aria-labelledby": titleId } : {})}
        style={panelStyle}
        className={`invitation-bottom-sheet-panel relative flex w-full flex-col overflow-hidden rounded-t-[1.75rem] ${
          tone === "light"
            ? "bg-white shadow-[0_-12px_48px_rgba(24,24,27,0.18)]"
            : "bg-[#141414] shadow-[0_-12px_48px_rgba(0,0,0,0.55)]"
        } ${maxHeightClass}`}
      >
        <div {...handleProps}>
          <span
            className={`h-1 w-11 rounded-full ${
              tone === "light" ? "bg-zinc-300" : "bg-white/30"
            }`}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
