"use client";

import { WelcomeHashtagLoaderCore } from "@/components/invitation/WelcomeHashtagLoaderCore";
import { ANIMATIC_WELCOME_HASHTAG_LOADER_CONFIG } from "@/components/invitation/welcome-hashtag-loader-config";

/** Affichage public du welcome loader en boucle continue. */
export function WelcomeHashtagLoaderAnimatic() {
  return (
    <WelcomeHashtagLoaderCore
      config={ANIMATIC_WELCOME_HASHTAG_LOADER_CONFIG}
      className="absolute inset-0 z-0 h-full w-full"
    />
  );
}
