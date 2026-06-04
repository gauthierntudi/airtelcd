"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  image: string;
  imageAlt: string;
  video?: string;
  isActive: boolean;
  priority?: boolean;
  welcomeObjectPosition?: boolean;
};

export function InvitationSlideBackground({
  image,
  imageAlt,
  video,
  isActive,
  priority,
  welcomeObjectPosition,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const mediaClass = welcomeObjectPosition
    ? "object-cover object-[center_28%]"
    : "object-cover object-center";

  useEffect(() => {
    if (!isActive) setVideoPlaying(false);
  }, [isActive]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video || !isActive) return;

    el.muted = true;
    el.defaultMuted = true;

    const onPlaying = () => setVideoPlaying(true);

    const play = () => {
      void el.play().catch(() => {});
    };

    el.addEventListener("playing", onPlaying);
    el.addEventListener("canplay", play);

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) play();

    return () => {
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("canplay", play);
      el.pause();
    };
  }, [isActive, video]);

  if (video) {
    if (!isActive) {
      return (
        <Image
          src={image}
          alt={imageAlt}
          fill
          unoptimized
          sizes="100vw"
          className={mediaClass}
        />
      );
    }

    return (
      <>
        <Image
          src={image}
          alt=""
          aria-hidden
          fill
          unoptimized
          sizes="100vw"
          className={`${mediaClass} transition-opacity duration-300 ${
            videoPlaying ? "opacity-0" : "opacity-100"
          }`}
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full ${mediaClass} transition-opacity duration-300 ${
            videoPlaying ? "opacity-100" : "opacity-0"
          }`}
          aria-label={imageAlt}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          disablePictureInPicture
          controls={false}
        >
          <source src={video} type="video/mp4" />
        </video>
      </>
    );
  }

  return (
    <Image
      src={image}
      alt={imageAlt}
      fill
      unoptimized
      priority={priority}
      sizes="100vw"
      className={mediaClass}
    />
  );
}
