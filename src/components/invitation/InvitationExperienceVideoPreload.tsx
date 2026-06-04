"use client";

import { INVITATION_EXPERIENCE_VIDEO_URL } from "@/lib/invitation-assets";

/** Précharge la vidéo Expérience pendant les slides 1–2 (évite l’écran noir au slide 3). */
export function InvitationExperienceVideoPreload({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <video
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none fixed h-0 w-0 opacity-0"
      src={INVITATION_EXPERIENCE_VIDEO_URL}
      preload="auto"
      muted
      playsInline
    />
  );
}
