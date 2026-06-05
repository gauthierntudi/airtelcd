"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const LOADER_WORDS = [
  "#Privilèges",
  "#Flexibilité",
  "#Convertibilité",
  "#Partage",
] as const;

const LOADER_SCHEMES = [
  { bg: "#f70118", color: "#ffffff" },
  { bg: "#181818", color: "#ffffff" },
  { bg: "#ffffff", color: "#f70118" },
] as const;

type Scheme = (typeof LOADER_SCHEMES)[number];

function pickRandomScheme(): Scheme {
  return LOADER_SCHEMES[Math.floor(Math.random() * LOADER_SCHEMES.length)];
}

type Props = {
  onDone: () => void;
};

export function WelcomeHashtagLoader({ onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const schemeRef = useRef<Scheme | null>(null);
  if (!schemeRef.current) schemeRef.current = pickRandomScheme();
  const scheme = schemeRef.current;

  useGSAP(
    () => {
      const root = rootRef.current;
      const text = textRef.current;
      if (!root || !text) return;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(root, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.inOut",
            onComplete: onDone,
          });
        },
      });

      LOADER_WORDS.forEach((word) => {
        tl.add(() => {
          text.textContent = word;
        })
          .fromTo(
            text,
            { opacity: 0, y: 40, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.58,
              ease: "power3.out",
            },
          )
          .to(
            text,
            {
              opacity: 0,
              y: -36,
              scale: 0.94,
              duration: 0.44,
              ease: "power2.in",
            },
            "+=0.9",
          );
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
      style={{ backgroundColor: scheme.bg, color: scheme.color }}
    >
      <p
        ref={textRef}
        className="font-vodafone-exb px-6 text-center text-[1.65rem] font-normal leading-tight tracking-tight opacity-0 sm:text-[2.5rem]"
      >
        {LOADER_WORDS[0]}
      </p>
    </div>
  );
}
