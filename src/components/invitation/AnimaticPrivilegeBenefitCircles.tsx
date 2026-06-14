"use client";

import Image from "next/image";
import { forwardRef, type ReactNode } from "react";
import { OrbitBenefitCircle } from "@/components/branding/OrbitBenefitCircle";
import {
  ORBIT_INNER_ANGLES,
  ORBIT_OUTER_ANGLES,
  PRIVILEGE_ORBIT_INNER_CIRCLES,
  PRIVILEGE_ORBIT_OUTER_CIRCLES,
} from "@/lib/orbital-home";

const INNER_ORBIT_RADIUS = 30;
const OUTER_ORBIT_RADIUS = 48;

const ANIMATIC_CIRCLE_SIZE = {
  md: "h-[7rem] w-[7rem] p-2 text-[13px] leading-[1.05] sm:h-[8.25rem] sm:w-[8.25rem] sm:text-[15px]",
  lg: "h-[8.25rem] w-[8.25rem] p-2 text-[13px] leading-[1.05] sm:h-[9.5rem] sm:w-[9.5rem] sm:text-[15px]",
} as const;

type Props = {
  className?: string;
};

export const AnimaticPrivilegeBenefitCircles = forwardRef<HTMLDivElement, Props>(
  function AnimaticPrivilegeBenefitCircles({ className = "" }, ref) {
  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4 opacity-0 invisible ${className}`}
      aria-hidden
    >
      <div className="relative aspect-square w-full max-w-[min(96vw,48rem)]">
        <OrbitRing diameterPercent={OUTER_ORBIT_RADIUS * 2} />
        <OrbitRing diameterPercent={INNER_ORBIT_RADIUS * 2} />

        {PRIVILEGE_ORBIT_OUTER_CIRCLES.map((circle, index) => (
          <OrbitArm
            key={`outer-${circle.label}`}
            angleDeg={ORBIT_OUTER_ANGLES[index] ?? 0}
            radiusPercent={OUTER_ORBIT_RADIUS}
          >
            <OrbitBenefitCircle
              circle={circle}
              size="lg"
              className={ANIMATIC_CIRCLE_SIZE.lg}
            />
          </OrbitArm>
        ))}

        {PRIVILEGE_ORBIT_INNER_CIRCLES.map((circle, index) => (
          <OrbitArm
            key={`inner-${circle.label}`}
            angleDeg={ORBIT_INNER_ANGLES[index] ?? 0}
            radiusPercent={INNER_ORBIT_RADIUS}
          >
            <OrbitBenefitCircle
              circle={circle}
              size="md"
              className={ANIMATIC_CIRCLE_SIZE.md}
            />
          </OrbitArm>
        ))}

        <div className="absolute left-1/2 top-1/2 z-20 flex h-[6.5rem] w-[min(82vw,14rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-[7.5rem] sm:w-[16rem]">
          <Image
            src="/img/logo-animatic.png"
            alt="Vodacom Privilège"
            width={520}
            height={160}
            priority
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
  },
);

function OrbitRing({ diameterPercent }: { diameterPercent: number }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25"
      style={{
        width: `${diameterPercent}%`,
        height: `${diameterPercent}%`,
      }}
    />
  );
}

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
