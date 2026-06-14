"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";
import type { WelcomeHashtagLoaderConfig } from "@/components/invitation/welcome-hashtag-loader-config";
import { AnimaticPrivilegeBenefitCircles } from "@/components/invitation/AnimaticPrivilegeBenefitCircles";
import {
  DEFAULT_TEXT_MOTION,
  LOGO_MOTION_VARIANTS,
  TEXT_MOTION_VARIANTS,
  type LineMotionVariant,
  type LogoMotionVariant,
} from "@/components/invitation/welcome-hashtag-loader-variants";

gsap.registerPlugin(useGSAP);

const INTRO_LOGO_IN = 0.95;
const INTRO_LOGO_HOLD = 1.5;
const INTRO_LOGO_OUT = 0.72;
const LINE_STAGGER_IN = 0.11;
const LINE_STAGGER_OUT = 0.07;
const LOOP_BREATHE = 0.45;
const CIRCLES_IN_DURATION = 0.62;
const CIRCLES_OUT_DURATION = 0.48;
const CIRCLES_IN_STAGGER = 0.09;
const CIRCLES_OUT_STAGGER = 0.06;

function mountWordLines(container: HTMLElement, word: string): HTMLElement[] {
  container.replaceChildren();
  return word.split("\n").map((line) => {
    const span = document.createElement("span");
    span.className = "block will-change-[transform,opacity,filter]";
    span.textContent = line;
    container.appendChild(span);
    return span;
  });
}

function lineAnimDuration(
  lineCount: number,
  baseDuration: number,
  stagger: number | gsap.StaggerVars | undefined,
): number {
  const staggerEach =
    typeof stagger === "number"
      ? stagger
      : typeof stagger === "object" && stagger && "each" in stagger
        ? Number(stagger.each)
        : 0;

  return baseDuration + Math.max(0, lineCount - 1) * staggerEach;
}

function resetLineStyles(lines: HTMLElement[]) {
  gsap.set(lines, { clearProps: "transform,filter,opacity,x,y,scale,rotation,rotationX" });
}

function resetLogoStyles(logo: HTMLElement) {
  gsap.set(logo, { clearProps: "transform,filter,x,y,scale,rotation,rotationX,opacity" });
}

function appendLogoSegment(
  tl: gsap.core.Timeline,
  logo: HTMLElement,
  textWrap: HTMLElement,
  circlesWrap: HTMLElement | null,
  variant: LogoMotionVariant,
  prefersReducedMotion: boolean,
) {
  tl.set(textWrap, { opacity: 0, visibility: "hidden" });
  if (circlesWrap) {
    tl.set(circlesWrap, { opacity: 0, visibility: "hidden" });
  }
  tl.set(logo, { visibility: "visible", opacity: 0, ...variant.initial });

  if (prefersReducedMotion) {
    tl.set(logo, { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", rotation: 0 })
      .to(logo, {}, `+=${INTRO_LOGO_HOLD}`)
      .set(logo, { opacity: 0, visibility: "hidden" });
    return;
  }

  tl.fromTo(logo, variant.inFrom, {
    ...variant.inTo,
    duration: INTRO_LOGO_IN,
    ease: variant.inEase,
  });

  if (variant.hold) {
    tl.add(variant.hold(logo, INTRO_LOGO_HOLD));
  } else {
    tl.to({}, { duration: INTRO_LOGO_HOLD });
  }

  tl.to(logo, {
    ...variant.outTo,
    duration: INTRO_LOGO_OUT,
    ease: variant.outEase,
  })
    .set(logo, { opacity: 0, visibility: "hidden" })
    .call(() => resetLogoStyles(logo));
}

function appendWordSegment(
  tl: gsap.core.Timeline,
  textWrap: HTMLElement,
  word: string,
  variant: LineMotionVariant,
  config: WelcomeHashtagLoaderConfig,
  prefersReducedMotion: boolean,
) {
  const lineCount = Math.max(1, word.split("\n").length);
  const inStagger = variant.inStagger ?? LINE_STAGGER_IN;
  const outStagger = variant.outStagger ?? LINE_STAGGER_OUT;
  const inDuration = lineAnimDuration(lineCount, config.wordInDuration, inStagger);
  const outDuration = lineAnimDuration(lineCount, config.wordOutDuration, outStagger);

  const wordTl = gsap.timeline();

  wordTl.call(() => {
    const lines = mountWordLines(textWrap, word);
    gsap.killTweensOf(lines);
    gsap.set(textWrap, { opacity: 1, visibility: "visible" });

    if (prefersReducedMotion) {
      gsap.set(lines, { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    gsap.fromTo(lines, variant.inFrom, {
      ...variant.inTo,
      duration: config.wordInDuration,
      ease: variant.inEase,
      stagger: inStagger,
    });
  });

  wordTl.to({}, { duration: inDuration });

  if (variant.hold && !prefersReducedMotion) {
    wordTl.call(() => {
      const lines = Array.from(textWrap.children) as HTMLElement[];
      gsap.killTweensOf(lines);
      variant.hold!(lines, config.wordHoldDuration);
    });
    wordTl.to({}, { duration: config.wordHoldDuration });
  } else {
    wordTl.to({}, { duration: config.wordHoldDuration });
  }

  wordTl.call(() => {
    const lines = Array.from(textWrap.children) as HTMLElement[];
    gsap.killTweensOf(lines);

    if (prefersReducedMotion) {
      gsap.set(lines, { opacity: 0 });
      return;
    }

    gsap.to(lines, {
      ...variant.outTo,
      duration: config.wordOutDuration,
      ease: variant.outEase,
      stagger: outStagger,
    });
  });

  wordTl
    .to({}, { duration: outDuration })
    .call(() => {
      const lines = Array.from(textWrap.children) as HTMLElement[];
      gsap.killTweensOf(lines);
      resetLineStyles(lines);
    })
    .set(textWrap, { opacity: 0, visibility: "hidden" });

  tl.add(wordTl);
}

function getBenefitCircleElements(circlesWrap: HTMLElement): HTMLElement[] {
  return Array.from(
    circlesWrap.querySelectorAll<HTMLElement>("[data-benefit-circle]"),
  );
}

function appendCirclesSegment(
  tl: gsap.core.Timeline,
  circlesWrap: HTMLElement,
  textWrap: HTMLElement,
  config: WelcomeHashtagLoaderConfig,
  prefersReducedMotion: boolean,
) {
  const holdDuration = config.circlesHoldDuration ?? 3.2;
  const circlesTl = gsap.timeline();

  circlesTl
    .set(textWrap, { opacity: 0, visibility: "hidden" })
    .set(circlesWrap, { opacity: 1, visibility: "visible" });

  if (prefersReducedMotion) {
    circlesTl
      .call(() => {
        gsap.set(getBenefitCircleElements(circlesWrap), { opacity: 1, scale: 1 });
      })
      .to({}, { duration: holdDuration })
      .set(circlesWrap, { opacity: 0, visibility: "hidden" });
    tl.add(circlesTl);
    return;
  }

  circlesTl.call(() => {
    const circles = getBenefitCircleElements(circlesWrap);
    gsap.killTweensOf(circles);
    gsap.fromTo(
      circles,
      { opacity: 0, scale: 0.45, filter: "blur(8px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: CIRCLES_IN_DURATION,
        ease: "back.out(1.6)",
        stagger: CIRCLES_IN_STAGGER,
      },
    );
  });

  const circleCount = getBenefitCircleElements(circlesWrap).length;
  const inTotal =
    CIRCLES_IN_DURATION + Math.max(0, circleCount - 1) * CIRCLES_IN_STAGGER;
  circlesTl.to({}, { duration: inTotal });

  circlesTl.call(() => {
    const circles = getBenefitCircleElements(circlesWrap);
    gsap.to(circles, {
      scale: 1.06,
      duration: holdDuration * 0.45,
      ease: "sine.inOut",
      stagger: 0.04,
      yoyo: true,
      repeat: 1,
    });
  });
  circlesTl.to({}, { duration: holdDuration });

  circlesTl.call(() => {
    const circles = getBenefitCircleElements(circlesWrap);
    gsap.killTweensOf(circles);
    gsap.to(circles, {
      opacity: 0,
      scale: 0.75,
      filter: "blur(6px)",
      duration: CIRCLES_OUT_DURATION,
      ease: "power3.in",
      stagger: CIRCLES_OUT_STAGGER,
    });
  });

  const outTotal =
    CIRCLES_OUT_DURATION + Math.max(0, circleCount - 1) * CIRCLES_OUT_STAGGER;
  circlesTl
    .to({}, { duration: outTotal })
    .call(() => {
      gsap.killTweensOf(getBenefitCircleElements(circlesWrap));
      gsap.set(getBenefitCircleElements(circlesWrap), {
        clearProps: "transform,filter,opacity,scale",
      });
    })
    .set(circlesWrap, { opacity: 0, visibility: "hidden" });

  tl.add(circlesTl);
}

function buildCycleTimeline(
  logo: HTMLElement | null,
  textWrap: HTMLElement,
  circlesWrap: HTMLElement | null,
  words: string[],
  config: WelcomeHashtagLoaderConfig,
  prefersReducedMotion: boolean,
  cycleIndex: number,
): gsap.core.Timeline {
  const cycleTl = gsap.timeline();
  const useVariedMotion = Boolean(config.variedAnimations);

  if (config.introLogoSrc && logo) {
    const logoVariant = useVariedMotion
      ? LOGO_MOTION_VARIANTS[cycleIndex % LOGO_MOTION_VARIANTS.length]
      : LOGO_MOTION_VARIANTS[0];
    appendLogoSegment(cycleTl, logo, textWrap, circlesWrap, logoVariant, prefersReducedMotion);
  }

  words.forEach((word, index) => {
    const variant = useVariedMotion
      ? TEXT_MOTION_VARIANTS[index % TEXT_MOTION_VARIANTS.length]
      : DEFAULT_TEXT_MOTION;
    appendWordSegment(cycleTl, textWrap, word, variant, config, prefersReducedMotion);
  });

  if (config.showBenefitCircles && circlesWrap) {
    appendCirclesSegment(cycleTl, circlesWrap, textWrap, config, prefersReducedMotion);
  }

  if (config.loop) {
    cycleTl.to({}, { duration: LOOP_BREATHE });
  }

  return cycleTl;
}

type Props = {
  config: WelcomeHashtagLoaderConfig;
  onDone?: () => void;
  className?: string;
};

export function WelcomeHashtagLoaderCore({
  config,
  onDone,
  className = "fixed inset-0 z-[60]",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const circlesWrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const logo = logoRef.current;
      const textWrap = textWrapRef.current;
      const circlesWrap = circlesWrapRef.current;
      if (!root || !textWrap) return;

      const words = config.words.filter((w) => w.trim());
      if (words.length === 0) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.killTweensOf(root);
      gsap.killTweensOf(textWrap);
      if (circlesWrap) gsap.killTweensOf(circlesWrap);
      if (logo) gsap.killTweensOf(logo);

      gsap.set(root, { "--loader-angle": `${config.angleStart}deg` });
      if (!prefersReducedMotion) {
        gsap.to(root, {
          "--loader-angle": `${config.angleEnd}deg`,
          duration: config.angleDuration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (config.loop) {
        let cycleIndex = 0;
        let cancelled = false;
        let activeCycle: gsap.core.Timeline | null = null;

        const playNextCycle = () => {
          if (cancelled) return;

          if (logo) gsap.killTweensOf(logo);
          gsap.killTweensOf(textWrap);
          if (circlesWrap) gsap.killTweensOf(circlesWrap);
          activeCycle?.kill();

          const cycle = buildCycleTimeline(
            logo,
            textWrap,
            circlesWrap,
            words,
            config,
            prefersReducedMotion,
            cycleIndex,
          );
          cycleIndex += 1;
          activeCycle = cycle;

          cycle.eventCallback("onComplete", () => {
            if (!cancelled) playNextCycle();
          });
          cycle.play(0);
        };

        playNextCycle();

        return () => {
          cancelled = true;
          activeCycle?.kill();
        };
      }

      const tl = gsap.timeline({
        onComplete: () => {
          if (!onDone) return;
          gsap.to(root, {
            yPercent: -100,
            duration: 0.85,
            ease: "power4.inOut",
            onComplete: onDone,
          });
        },
      });

      tl.add(
        buildCycleTimeline(
          logo,
          textWrap,
          circlesWrap,
          words,
          config,
          prefersReducedMotion,
          0,
        ),
      );
    },
    {
      scope: rootRef,
      dependencies: [
        config.words.join("|"),
        config.introLogoSrc,
        config.variedAnimations,
        config.showBenefitCircles,
        config.circlesHoldDuration,
        config.gradientFrom,
        config.gradientTo,
        config.angleStart,
        config.angleEnd,
        config.angleDuration,
        config.wordInDuration,
        config.wordHoldDuration,
        config.wordOutDuration,
        config.loop,
      ],
    },
  );

  const firstWordLines = (config.words[0] ?? "").split("\n");

  return (
    <div
      ref={rootRef}
      className={`${className} flex items-center justify-center overflow-hidden will-change-transform text-white`}
      aria-live="polite"
      aria-busy="true"
      style={{
        backgroundColor: config.gradientFrom,
        backgroundImage: `linear-gradient(var(--loader-angle, ${config.angleStart}deg), ${config.gradientFrom} 0%, ${config.gradientTo} 100%)`,
      }}
    >
      {config.introLogoSrc ? (
        <div
          ref={logoRef}
          className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-8 opacity-0 will-change-[transform,opacity,filter]"
          aria-hidden
        >
          <Image
            src={config.introLogoSrc}
            alt="Vodacom Privilège"
            width={520}
            height={160}
            priority
            className="h-auto w-full max-w-[min(88vw,32rem)] object-contain"
          />
        </div>
      ) : null}

      <div
        ref={textWrapRef}
        className="relative z-[1] font-vodafone-exb px-6 text-center font-normal leading-[1.15] tracking-tight opacity-0 [perspective:700px]"
        style={{
          fontSize: `clamp(${config.fontSizeMobile}, ${config.fontSizeFluid ?? "4vw"}, ${config.fontSizeDesktop})`,
        }}
      >
        {firstWordLines.map((line, index) => (
          <span key={`${line}-${index}`} className="block">
            {line}
          </span>
        ))}
      </div>

      {config.showBenefitCircles ? (
        <AnimaticPrivilegeBenefitCircles ref={circlesWrapRef} />
      ) : null}
    </div>
  );
}
