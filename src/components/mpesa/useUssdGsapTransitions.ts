"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP);

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Entrée du contenu menu USSD à chaque changement d'écran */
export function useUssdScreenEnterAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  screenId: string,
) {
  useGSAP(
    () => {
      const root = scopeRef.current;
      if (!root || prefersReducedMotion()) return;

      const title = root.querySelector("[data-ussd-title]");
      const lines = root.querySelectorAll("[data-ussd-line]");
      const options = root.querySelectorAll("[data-ussd-option]");

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        root,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.3 },
        0,
      );

      if (title) {
        tl.fromTo(
          title,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.28 },
          0.05,
        );
      }

      if (lines.length > 0) {
        tl.fromTo(
          lines,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.035 },
          0.08,
        );
      }

      if (options.length > 0) {
        tl.fromTo(
          options,
          { autoAlpha: 0, x: -12 },
          { autoAlpha: 1, x: 0, duration: 0.2, stagger: 0.045 },
          0.12,
        );
      }
    },
    { scope: scopeRef, dependencies: [screenId], revertOnUpdate: true },
  );
}

/** Ouverture du clavier de réponse */
export function useUssdKeypadEnterAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  open: boolean,
) {
  useGSAP(
    () => {
      const el = scopeRef.current;
      if (!el || !open || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 22, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.34,
          ease: "power3.out",
        },
      );
    },
    { scope: scopeRef, dependencies: [open], revertOnUpdate: true },
  );
}

/** Message d'erreur / statut sous le menu */
export function useUssdStatusEnterAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  message: string | null,
) {
  useGSAP(
    () => {
      const el = scopeRef.current;
      if (!el || !message || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
      );
    },
    { scope: scopeRef, dependencies: [message], revertOnUpdate: true },
  );
}
