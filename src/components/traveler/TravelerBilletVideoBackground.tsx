"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type TravelerBilletVideoBackgroundHandle = {
  prefetch: (url: string) => void;
};

type Props = {
  activeVideoUrl: string | null;
  /** Précharge toutes les vidéos dès l'étape Billet */
  preloadUrls?: string[];
};

const SLIDE_MS = 520;

function primeVideo(el: HTMLVideoElement) {
  el.muted = true;
  el.defaultMuted = true;
  el.preload = "auto";
  if (el.readyState < HTMLMediaElement.HAVE_METADATA) {
    el.load();
  }
}

function playVideo(el: HTMLVideoElement) {
  const start = () => {
    el.currentTime = 0;
    void el.play().catch(() => {});
  };

  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    start();
    return;
  }

  el.addEventListener("canplay", start, { once: true });
}

export const TravelerBilletVideoBackground = forwardRef<
  TravelerBilletVideoBackgroundHandle,
  Props
>(function TravelerBilletVideoBackground(
  { activeVideoUrl, preloadUrls = [] },
  ref,
) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const previousUrlRef = useRef<string | null>(null);
  const [exitingUrl, setExitingUrl] = useState<string | null>(null);
  const [enteringUrl, setEnteringUrl] = useState<string | null>(null);
  const hasSelection = Boolean(activeVideoUrl);

  const prefetch = useCallback((url: string) => {
    const el = videoRefs.current[url];
    if (!el) return;
    primeVideo(el);
    if (el.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      void el.play()
        .then(() => {
          el.pause();
        })
        .catch(() => {});
    }
  }, []);

  useImperativeHandle(ref, () => ({ prefetch }), [prefetch]);

  const setVideoRef = useCallback(
    (url: string) => (el: HTMLVideoElement | null) => {
      videoRefs.current[url] = el;
      if (el && preloadUrls.includes(url)) {
        primeVideo(el);
      }
    },
    [preloadUrls],
  );

  useEffect(() => {
    for (const url of preloadUrls) {
      prefetch(url);
    }
  }, [preloadUrls, prefetch]);

  useEffect(() => {
    const previous = previousUrlRef.current;

    if (activeVideoUrl === previous) return;

    if (activeVideoUrl && previous && previous !== activeVideoUrl) {
      setExitingUrl(previous);
      setEnteringUrl(activeVideoUrl);
      const timer = window.setTimeout(() => {
        setExitingUrl(null);
        setEnteringUrl(null);
      }, SLIDE_MS);
      previousUrlRef.current = activeVideoUrl;
      return () => window.clearTimeout(timer);
    }

    if (activeVideoUrl) {
      setEnteringUrl(activeVideoUrl);
      const timer = window.setTimeout(() => setEnteringUrl(null), SLIDE_MS);
      previousUrlRef.current = activeVideoUrl;
      return () => window.clearTimeout(timer);
    }

    setExitingUrl(null);
    setEnteringUrl(null);
    previousUrlRef.current = null;
  }, [activeVideoUrl]);

  useEffect(() => {
    if (!activeVideoUrl) return;
    const el = videoRefs.current[activeVideoUrl];
    if (el) playVideo(el);
  }, [activeVideoUrl, enteringUrl]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute inset-0 transition-opacity duration-150"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
          opacity: hasSelection ? 0 : 1,
        }}
        aria-hidden
      />

      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {preloadUrls.map((url) => {
          const isActive = activeVideoUrl === url;
          const isExiting = exitingUrl === url;
          const isEntering = enteringUrl === url;
          const isVisible = isActive || isExiting;

          let motionClass = "pointer-events-none absolute inset-0 translate-y-full opacity-0";
          if (isExiting) {
            motionClass =
              "pointer-events-none absolute inset-0 traveler-billet-video-exit";
          } else if (isEntering) {
            motionClass =
              "pointer-events-none absolute inset-0 traveler-billet-video-enter";
          } else if (isActive) {
            motionClass =
              "pointer-events-none absolute inset-0 traveler-billet-video-settled";
          }

          return (
            <video
              key={url}
              ref={setVideoRef(url)}
              src={url}
              className={`${motionClass} h-full w-full object-cover ${
                isVisible ? "opacity-100" : ""
              }`}
              muted
              playsInline
              loop
              preload="auto"
              disablePictureInPicture
              controls={false}
              aria-hidden={!isVisible}
            />
          );
        })}
      </div>

      {hasSelection ? (
        <div
          className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-black/55 via-black/40 to-black/65"
          aria-hidden
        />
      ) : null}
    </div>
  );
});
