"use client";

import { type RefObject, useEffect, useState } from "react";

/** Slide considéré visible quand ≥50 % dans le carousel horizontal (snap). */
export function useCarouselSlideInView(
  sectionRef: RefObject<HTMLElement | null>,
  rootRef: RefObject<HTMLElement | null>,
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const root = rootRef.current;
    if (!section || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { root, threshold: [0, 0.5, 0.75, 1] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef, rootRef]);

  return inView;
}
