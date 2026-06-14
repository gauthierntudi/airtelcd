"use client";

import { useEffect } from "react";

const SW_URL = "/animatic/sw.js";
const SW_SCOPE = "/animatic/";

export function AnimaticPwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register(SW_URL, { scope: SW_SCOPE })
      .catch(() => {
        /* PWA optionnelle — échec silencieux */
      });
  }, []);

  return null;
}
