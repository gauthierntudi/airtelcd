"use client";

import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from "react";

const DISMISS_THRESHOLD_PX = 96;
const MAX_DRAG_PX = 520;

type Options = {
  onClose: () => void;
};

/** Glisser la poignée vers le bas pour fermer le bottom sheet */
export function useBottomSheetDragClose({ onClose }: Options) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragYRef = useRef(0);
  const draggingRef = useRef(false);
  const startClientY = useRef(0);
  const startDragY = useRef(0);

  const endDrag = useCallback(
    (offset: number) => {
      draggingRef.current = false;
      setDragging(false);
      if (offset >= DISMISS_THRESHOLD_PX) {
        onClose();
        return;
      }
      dragYRef.current = 0;
      setDragY(0);
    },
    [onClose],
  );

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startClientY.current = e.clientY;
    startDragY.current = dragYRef.current;
    draggingRef.current = true;
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = e.clientY - startClientY.current;
    const next = Math.min(MAX_DRAG_PX, Math.max(0, startDragY.current + delta));
    dragYRef.current = next;
    setDragY(next);
  }, []);

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    endDrag(dragYRef.current);
  }, [endDrag]);

  const onPointerCancel = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      endDrag(dragYRef.current);
    },
    [endDrag],
  );

  const panelStyle: CSSProperties = {
    transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
    transition: dragging
      ? "none"
      : "transform 0.34s cubic-bezier(0.32, 0.72, 0, 1)",
  };

  const backdropStyle: CSSProperties = {
    opacity: 0.5 * (1 - Math.min(dragY / 280, 0.9)),
    transition: dragging ? "none" : "opacity 0.28s ease-out",
  };

  const handleProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    "aria-hidden": true as const,
    className:
      "invitation-bottom-sheet-handle flex shrink-0 touch-none cursor-grab select-none justify-center py-3 active:cursor-grabbing",
  };

  return { panelStyle, backdropStyle, handleProps };
}
