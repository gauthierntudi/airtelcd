"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { TravelerFinishCircle } from "@/components/traveler/TravelerFinishCircle";
import {
  getFinishCircleBenefit,
  getTravelerFinishCircleDefs,
} from "@/lib/traveler-finish-circles";
import {
  clampCenterX,
  placeCircleOnStack,
  reconcileAllCircles,
  resolveDragY,
  shuffleArray,
  type PlacedFinishCircle,
} from "@/lib/traveler-finish-physics";
import { TRAVELER_FINISH_BG_IMAGE } from "@/lib/traveler-journey";

type Props = {
  onComplete: () => void;
};

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
};

const FALL_DURATION_MS = 860;
const CEILING_Y = 10;
const FALL_DELAY_MIN_MS = 40;
const FALL_DELAY_MAX_MS = 2600;

function randomFallDelay(): number {
  return (
    FALL_DELAY_MIN_MS +
    Math.floor(Math.random() * (FALL_DELAY_MAX_MS - FALL_DELAY_MIN_MS))
  );
}

export function TravelerJourneyFinishScreen({ onComplete }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const placedRef = useRef<PlacedFinishCircle[]>([]);
  const [circles, setCircles] = useState<PlacedFinishCircle[]>([]);
  const [introDone, setIntroDone] = useState(false);
  const [animateSettle, setAnimateSettle] = useState(false);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [fallingId, setFallingId] = useState<string | null>(null);
  const [settlingIds, setSettlingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [playSize, setPlaySize] = useState({ width: 0, height: 0, floorY: 0 });

  function applyReconcile(
    prev: PlacedFinishCircle[],
    pinnedIds: ReadonlySet<string> = new Set(),
  ) {
    const reconciled = reconcileAllCircles(
      prev,
      playSize.floorY,
      playSize.width,
      pinnedIds,
    );
    const movedIds = reconciled
      .filter((c) => {
        if (c.y < 0) return false;
        const before = prev.find((p) => p.id === c.id);
        if (!before) return false;
        return before.x !== c.x || before.y !== c.y;
      })
      .map((c) => c.id);

    if (movedIds.length > 0) {
      setSettlingIds(new Set(movedIds));
      window.setTimeout(() => setSettlingIds(new Set()), FALL_DURATION_MS);
    }

    placedRef.current = reconciled.filter((c) => c.y >= 0);
    return reconciled;
  }

  const measure = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    const footerHeight = footerRef.current?.getBoundingClientRect().height ?? 0;
    const floorY = rect.height - footerHeight;
    setPlaySize({ width: rect.width, height: rect.height, floorY });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);

    const shell = shellRef.current;
    const footer = footerRef.current;
    const observer =
      shell || footer
        ? new ResizeObserver(() => measure())
        : null;
    if (shell) observer?.observe(shell);
    if (footer) observer?.observe(footer);

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    if (playSize.width <= 0) return;

    const defs = getTravelerFinishCircleDefs();
    const dropOrder = shuffleArray(defs);
    const fallDelays = new Map(
      dropOrder.map((def) => [def.id, randomFallDelay()] as const),
    );

    placedRef.current = [];
    setIntroDone(false);
    setAnimateSettle(false);

    setCircles(
      dropOrder.map((def) => ({
        ...def,
        x: clampCenterX(
          playSize.width * (0.08 + Math.random() * 0.84),
          def.sizePx,
          playSize.width,
        ),
        y: -def.sizePx - 16 - Math.random() * 120,
        zIndex: 1,
      })),
    );

    let rafId = 0;
    const timers: number[] = [];

    rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateSettle(true));
    });

    dropOrder.forEach((def) => {
      const delay = fallDelays.get(def.id) ?? 0;
      const timer = window.setTimeout(() => {
        setCircles((prev) => {
          const current = prev.find((c) => c.id === def.id);
          if (!current) return prev;

          const landed = placeCircleOnStack(
            def,
            placedRef.current,
            playSize.floorY,
            playSize.width,
            current.x,
          );
          placedRef.current = [...placedRef.current, landed];

          const updated = prev.map((c) => (c.id === def.id ? landed : c));

          if (placedRef.current.length === defs.length) {
            window.setTimeout(() => setIntroDone(true), FALL_DURATION_MS + 80);
            return applyReconcile(updated);
          }

          return updated;
        });
      }, delay);
      timers.push(timer);
    });

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach((timer) => window.clearTimeout(timer));
      placedRef.current = [];
    };
  }, [playSize.width, playSize.floorY]);

  function handlePointerDown(
    e: React.PointerEvent<HTMLDivElement>,
    circle: PlacedFinishCircle,
  ) {
    if (!introDone || fallingId) return;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const rect = shellRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    setDragging({
      id: circle.id,
      offsetX: pointerX - circle.x,
      offsetY: pointerY - circle.y,
    });

    setCircles((prev) => applyReconcile(prev, new Set([circle.id])));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    setCircles((prev) => {
      const others = prev.filter((c) => c.id !== dragging.id);
      return prev.map((c) => {
        if (c.id !== dragging.id) return c;
        const x = clampCenterX(
          pointerX - dragging.offsetX,
          c.sizePx,
          playSize.width,
        );
        const rawY = pointerY - dragging.offsetY;
        const y = resolveDragY(
          x,
          c.sizePx,
          others,
          playSize.floorY,
          c.id,
          rawY,
          CEILING_Y,
        );
        return { ...c, x, y };
      });
    });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const id = dragging.id;
    setDragging(null);
    setFallingId(id);

    setCircles((prev) => applyReconcile(prev));

    window.setTimeout(() => setFallingId(null), FALL_DURATION_MS);
  }

  return (
    <div
      ref={shellRef}
      className="fixed inset-0 z-[68] overflow-hidden font-vodafone-lt text-white"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src={TRAVELER_FINISH_BG_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(0 0 0 / 0.97) 0%, rgb(0 0 0 / 0.9) 30%, rgb(0 0 0 / 0.78) 58%, rgb(0 0 0 / 0.55) 100%)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 z-10 touch-none overflow-hidden"
        onPointerMove={handlePointerMove}
      >
        {circles.map((circle, index) => {
          const benefit = getFinishCircleBenefit(circle.id);
          const isDragging = dragging?.id === circle.id;
          const isFalling = fallingId === circle.id;
          const isWaitingDrop = circle.y < 0;
          const atCeiling = isDragging && circle.y <= CEILING_Y + 1;
          const shouldSettle =
            animateSettle &&
            !isDragging &&
            !isWaitingDrop &&
            (isFalling || settlingIds.has(circle.id) || !dragging);

          return (
            <div
              key={circle.id}
              role="presentation"
              onPointerDown={(e) => handlePointerDown(e, circle)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute cursor-grab select-none active:cursor-grabbing ${
                shouldSettle ? "traveler-finish-circle-settle" : ""
              } ${isDragging ? "traveler-finish-circle-dragging" : ""} ${
                atCeiling ? "traveler-finish-circle-at-ceiling" : ""
              }`}
              style={{
                left: circle.x - circle.sizePx / 2,
                top: circle.y,
                width: circle.sizePx,
                height: circle.sizePx,
                zIndex: circle.zIndex,
              }}
            >
              <TravelerFinishCircle
                benefit={benefit}
                kind={circle.kind}
                index={index}
                sizePx={circle.sizePx}
                pauseFloat={isDragging || isFalling}
              />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none relative z-20 flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
          <VodacomLogo variant="white" height={34} />
          <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-white/60">
            Parcours terminé
          </p>
        </header>

        <section className="shrink-0 px-4 text-center sm:px-8">
          <h1 className="mx-auto max-w-[24rem] font-vodafone-exb text-[3.55rem] font-normal leading-[0.98] tracking-tight text-white sm:max-w-5xl sm:text-[5rem]">
            Le privilège se vit
            <br />
            aussi sur le green
          </h1>
          <p className="mt-3 font-vodafone-lt text-3xl text-white/80 sm:mt-4 sm:text-4xl">
            Une expérience exclusive
          </p>
        </section>

        <div className="min-h-0 flex-1" aria-hidden />

        <footer
          ref={footerRef}
          className="pointer-events-auto shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-8"
        >
          <button
            type="button"
            onClick={onComplete}
            disabled={!introDone}
            className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}
