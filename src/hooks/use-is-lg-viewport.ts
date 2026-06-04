"use client";

import { useEffect, useState } from "react";

/** Tailwind `lg` — 1024px */
export const LG_MEDIA_QUERY = "(min-width: 1024px)";

/**
 * `null` before client mount (évite de monter les deux UIs en SSR/hydration).
 * Ensuite `true` = desktop, `false` = mobile.
 */
export function useIsLgViewport(): boolean | null {
  const [isLg, setIsLg] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(LG_MEDIA_QUERY);
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isLg;
}
