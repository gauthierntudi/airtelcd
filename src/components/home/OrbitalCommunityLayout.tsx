"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { VodacomLogo } from "@/components/branding/VodacomLogo";
import { OrbitBenefitCircle } from "@/components/branding/OrbitBenefitCircle";
import {
  ORBIT_INNER_ANGLES,
  ORBIT_OUTER_ANGLES,
  ORBITAL_PERSON_AVATARS,
  type OrbitalBenefitCircle,
  type OrbitalHomeTheme,
} from "@/lib/orbital-home";

type Props = {
  theme: OrbitalHomeTheme;
  children?: ReactNode;
};

const BUBBLE_SIZE = {
  sm: "h-[4.25rem] w-[4.25rem] text-[8px] leading-tight",
  md: "h-[5.25rem] w-[5.25rem] text-[9px] leading-tight",
  lg: "h-[6.25rem] w-[6.25rem] text-[10px] leading-tight",
} as const;

/** Distance centre → avatar, en % de la largeur du champ orbital */
const INNER_ORBIT_RADIUS = 26;
const OUTER_ORBIT_RADIUS = 42;

export function OrbitalCommunityLayout({ theme, children }: Props) {
  const isMpesa = theme.id === "mpesa";

  return (
    <div
      className="relative min-h-screen overflow-hidden font-vodafone-lt text-white"
      style={{ background: theme.background }}
    >
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
        {isMpesa ? (
          <Link href="/" className="inline-flex shrink-0 items-center gap-2">
            <VodacomLogo variant="white" height={32} />
          </Link>
        ) : (
          <VodacomLogo variant="white" href="/" height={36} />
        )}
        <Link
          href={theme.otherHomeHref}
          className="rounded-full bg-white/10 px-3.5 py-2 font-vodafone-rg-bd text-xs text-white ring-1 ring-white/15 transition hover:bg-white/15 sm:text-sm"
        >
          {isMpesa ? `← ${theme.otherHomeLabel}` : `${theme.otherHomeLabel} →`}
        </Link>
      </header>

      <section className="relative z-10 px-4 pb-6 pt-2 text-center sm:px-8">
        <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.22em] text-white/70 sm:text-xs">
          {theme.badge}
        </p>
        <h1 className="mt-2 font-vodafone-exb text-[1.65rem] font-normal leading-tight tracking-tight sm:text-3xl">
          {theme.headline}
        </h1>
        <p className="mt-1.5 font-vodafone-lt text-sm text-white/75 sm:text-base">
          {theme.subline}
        </p>
      </section>

      <div className="relative mx-auto aspect-square w-full max-w-[min(94vw,30rem)] sm:max-w-2xl">
        {theme.bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full p-2 text-center font-vodafone-rg-bd font-normal uppercase tracking-wide text-white shadow-lg ${BUBBLE_SIZE[bubble.size ?? "md"]}`}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              backgroundColor: bubble.color,
            }}
          >
            <span className="max-w-[92%]">{bubble.label}</span>
          </div>
        ))}

        {/* Champ orbital — anneaux + avatars (positions en % du conteneur) */}
        <div className="absolute inset-[2%]">
          <OrbitRing
            diameterPercent={OUTER_ORBIT_RADIUS * 2}
            borderColor={theme.ringColor}
          />
          <OrbitRing
            diameterPercent={INNER_ORBIT_RADIUS * 2}
            borderColor={theme.ringColor}
          />

          <OrbitLayer
            radiusPercent={OUTER_ORBIT_RADIUS}
            durationSec={110}
            clockwise
            items={
              theme.outerBenefitCircles
                ? theme.outerBenefitCircles.map((circle, i) => ({
                    key: `outer-benefit-${i}`,
                    ...circle,
                    angleDeg: ORBIT_OUTER_ANGLES[i] ?? 0,
                    size: "lg" as const,
                  }))
                : theme.outerAvatarIndices.map((index, i) => ({
                    key: `outer-${index}`,
                    src: ORBITAL_PERSON_AVATARS[index],
                    angleDeg: ORBIT_OUTER_ANGLES[i] ?? 0,
                    size: "lg" as const,
                  }))
            }
          />
          <OrbitLayer
            radiusPercent={INNER_ORBIT_RADIUS}
            durationSec={85}
            clockwise={false}
            items={
              theme.innerBenefitCircles
                ? theme.innerBenefitCircles.map((circle, i) => ({
                    key: `inner-benefit-${i}`,
                    ...circle,
                    angleDeg: ORBIT_INNER_ANGLES[i] ?? 0,
                    size: "md" as const,
                  }))
                : theme.innerAvatarIndices.map((index, i) => ({
                    key: `inner-${index}`,
                    src: ORBITAL_PERSON_AVATARS[index],
                    angleDeg: ORBIT_INNER_ANGLES[i] ?? 0,
                    size: "md" as const,
                  }))
            }
          />

          <div className="absolute left-1/2 top-1/2 z-20 flex h-[4.75rem] w-[4.75rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-4 ring-[#e60000] sm:h-[5.75rem] sm:w-[5.75rem]">
            <Image
              src={theme.centerImage}
              alt={theme.centerImageAlt}
              width={isMpesa ? 56 : 88}
              height={isMpesa ? 56 : 88}
              unoptimized
              className={`h-full w-full ${isMpesa ? "object-cover" : "object-contain p-1.5"}`}
            />
          </div>
        </div>
      </div>

      {children ? (
        <div className="relative z-20 mx-auto max-w-lg px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-xl sm:px-8">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function OrbitRing({
  diameterPercent,
  borderColor,
}: {
  diameterPercent: number;
  borderColor: string;
}) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
      style={{
        width: `${diameterPercent}%`,
        height: `${diameterPercent}%`,
        borderColor,
      }}
    />
  );
}

type OrbitItem =
  | {
      key: string;
      src: string;
      angleDeg: number;
      size: "md" | "lg";
    }
  | (OrbitalBenefitCircle & {
      key: string;
      angleDeg: number;
      size: "md" | "lg";
    });

function isBenefitOrbitItem(
  item: OrbitItem,
): item is Extract<OrbitItem, { label: string }> {
  return "label" in item;
}

function OrbitLayer({
  radiusPercent,
  durationSec,
  clockwise,
  items,
}: {
  radiusPercent: number;
  durationSec: number;
  clockwise: boolean;
  items: OrbitItem[];
}) {
  const trackClass = clockwise
    ? "home-orbit-track--cw"
    : "home-orbit-track--ccw";
  const uprightClass = clockwise
    ? "home-orbit-upright--ccw"
    : "home-orbit-upright--cw";

  return (
    <div
      className={`home-orbit-track pointer-events-none absolute inset-0 z-10 ${trackClass}`}
      style={{ animationDuration: `${durationSec}s` }}
    >
      {items.map((item) => (
        <OrbitArm
          key={item.key}
          angleDeg={item.angleDeg}
          radiusPercent={radiusPercent}
        >
          <div
            className={uprightClass}
            style={{ animationDuration: `${durationSec}s` }}
          >
            {isBenefitOrbitItem(item) ? (
              <OrbitBenefitCircle circle={item} size={item.size} />
            ) : (
              <OrbitAvatarImage src={item.src} size={item.size} />
            )}
          </div>
        </OrbitArm>
      ))}
    </div>
  );
}

/** Bras radial : pivot au centre, avatar à l'extrémité */
function OrbitArm({
  angleDeg,
  radiusPercent,
  children,
}: {
  angleDeg: number;
  radiusPercent: number;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute left-1/2 w-0"
      style={{
        bottom: "50%",
        height: `${radiusPercent}%`,
        transformOrigin: "bottom center",
        transform: `translateX(-50%) rotate(${angleDeg}deg)`,
      }}
    >
      <div
        className="absolute left-1/2 top-0"
        style={{
          transform: `translate(-50%, -50%) rotate(${-angleDeg}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function OrbitAvatarImage({
  src,
  size,
}: {
  src: string;
  size: "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "h-[3.25rem] w-[3.25rem] sm:h-16 sm:w-16"
      : "h-11 w-11 sm:h-14 sm:w-14";

  return (
    <div className={dim}>
      <Image
        src={src}
        alt=""
        width={64}
        height={64}
        unoptimized
        className="h-full w-full rounded-full object-cover ring-2 ring-white shadow-md"
      />
    </div>
  );
}
