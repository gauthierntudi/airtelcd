"use client";

import { WelcomeHashtagLoaderCore } from "@/components/invitation/WelcomeHashtagLoaderCore";
import { DEFAULT_WELCOME_HASHTAG_LOADER_CONFIG } from "@/components/invitation/welcome-hashtag-loader-config";

type Props = {
  onDone: () => void;
};

export function WelcomeHashtagLoader({ onDone }: Props) {
  return (
    <WelcomeHashtagLoaderCore
      config={DEFAULT_WELCOME_HASHTAG_LOADER_CONFIG}
      onDone={onDone}
    />
  );
}
