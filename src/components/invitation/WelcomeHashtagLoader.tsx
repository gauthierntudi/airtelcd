"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const LOADER_WORDS = [
  "Privilèges",
  "Flexibilité",
  "Convertibilité",
  "Partage",
  "Transacter sans cash",
  "Transformer son business",
] as const;

type Props = {
  onDone: () => void;
};

export function WelcomeHashtagLoader({ onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const text = textRef.current;
      if (!root || !text) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      gsap.set(root, { "--loader-angle": "180deg" });
      if (!prefersReducedMotion) {
        gsap.to(root, {
          "--loader-angle": "340deg",
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(root, {
            yPercent: -100,
            duration: 0.7,
            ease: "power3.inOut",
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
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden will-change-transform text-white"
      aria-live="polite"
      aria-busy="true"
      style={{
        backgroundColor: "#810100",
        backgroundImage:
          "linear-gradient(var(--loader-angle, 180deg), #810100 0%, #e60000 100%)",
      }}
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
