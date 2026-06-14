import gsap from "gsap";

export type LineMotionVariant = {
  inFrom: gsap.TweenVars;
  inTo: gsap.TweenVars;
  outTo: gsap.TweenVars;
  inEase: string;
  outEase: string;
  inStagger?: number | gsap.StaggerVars;
  outStagger?: number | gsap.StaggerVars;
  hold?: (
    lines: HTMLElement[],
    holdDuration: number,
  ) => gsap.core.Timeline;
};

export type LogoMotionVariant = {
  initial: gsap.TweenVars;
  inFrom: gsap.TweenVars;
  inTo: gsap.TweenVars;
  inEase: string;
  hold?: (logo: HTMLElement, holdDuration: number) => gsap.core.Timeline;
  outTo: gsap.TweenVars;
  outEase: string;
};

/** Une variante distincte par texte de l'animatic. */
export const TEXT_MOTION_VARIANTS: LineMotionVariant[] = [
  {
    inFrom: { opacity: 0, y: 44, filter: "blur(12px)" },
    inTo: { opacity: 1, y: 0, filter: "blur(0px)" },
    outTo: { opacity: 0, y: -34, filter: "blur(8px)" },
    inEase: "power4.out",
    outEase: "power3.in",
    hold: (lines, holdDuration) => {
      const tl = gsap.timeline();
      tl.to(lines, {
        y: -6,
        duration: holdDuration * 0.42,
        ease: "sine.inOut",
        stagger: 0.06,
      }).to(lines, {
        y: 0,
        duration: holdDuration * 0.58,
        ease: "sine.inOut",
        stagger: 0.06,
      });
      return tl;
    },
  },
  {
    inFrom: { opacity: 0, x: -76, filter: "blur(8px)" },
    inTo: { opacity: 1, x: 0, filter: "blur(0px)" },
    outTo: { opacity: 0, x: 64, filter: "blur(6px)" },
    inEase: "power3.out",
    outEase: "power2.in",
    inStagger: { each: 0.13, from: "start" },
    outStagger: { each: 0.09, from: "end" },
    hold: (lines, holdDuration) =>
      gsap.timeline().to(lines, {
        x: 8,
        duration: holdDuration,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
        stagger: 0.05,
      }),
  },
  {
    inFrom: { opacity: 0, x: 76, scale: 0.94, filter: "blur(8px)" },
    inTo: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
    outTo: { opacity: 0, x: -58, scale: 1.04, filter: "blur(6px)" },
    inEase: "expo.out",
    outEase: "power3.in",
    inStagger: { each: 0.1, from: "center" },
    outStagger: { each: 0.08, from: "center" },
    hold: (lines, holdDuration) =>
      gsap.timeline().to(lines, {
        scale: 1.04,
        duration: holdDuration * 0.5,
        ease: "sine.inOut",
        transformOrigin: "50% 50%",
        stagger: 0.07,
      }).to(lines, {
        scale: 1,
        duration: holdDuration * 0.5,
        ease: "sine.inOut",
        stagger: 0.07,
      }),
  },
  {
    inFrom: { opacity: 0, y: -38, scale: 0.82, filter: "blur(14px)" },
    inTo: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    outTo: { opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" },
    inEase: "back.out(1.4)",
    outEase: "power4.in",
    inStagger: { each: 0.14, from: "random" },
    outStagger: { each: 0.1, from: "random" },
    hold: (lines, holdDuration) =>
      gsap.timeline().fromTo(
        lines,
        { rotationX: 0 },
        {
          rotationX: 6,
          duration: holdDuration * 0.45,
          ease: "sine.inOut",
          transformPerspective: 700,
          stagger: 0.06,
        },
      ).to(lines, {
        rotationX: 0,
        duration: holdDuration * 0.55,
        ease: "sine.inOut",
        stagger: 0.06,
      }),
  },
];

/** Variantes du logo qui alternent à chaque boucle. */
export const LOGO_MOTION_VARIANTS: LogoMotionVariant[] = [
  {
    initial: { opacity: 0, scale: 0.88, y: 28, filter: "blur(12px)" },
    inFrom: { opacity: 0, scale: 0.88, y: 28, filter: "blur(12px)" },
    inTo: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    inEase: "power4.out",
    hold: (logo, holdDuration) =>
      gsap.timeline().to(logo, {
        scale: 1.05,
        duration: holdDuration,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
      }),
    outTo: { opacity: 0, scale: 1.08, y: -22, filter: "blur(10px)" },
    outEase: "power3.inOut",
  },
  {
    initial: { opacity: 0, scale: 0.72, filter: "blur(16px)" },
    inFrom: { opacity: 0, scale: 0.72, filter: "blur(16px)" },
    inTo: { opacity: 1, scale: 1, filter: "blur(0px)" },
    inEase: "expo.out",
    hold: (logo, holdDuration) =>
      gsap.timeline().to(logo, {
        rotation: 1.5,
        duration: holdDuration * 0.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
      }),
    outTo: { opacity: 0, scale: 1.14, filter: "blur(12px)" },
    outEase: "power2.in",
  },
  {
    initial: { opacity: 0, x: -48, scale: 0.94, filter: "blur(10px)" },
    inFrom: { opacity: 0, x: -48, scale: 0.94, filter: "blur(10px)" },
    inTo: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
    inEase: "power3.out",
    hold: (logo, holdDuration) =>
      gsap.timeline().to(logo, {
        x: 10,
        duration: holdDuration,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
      }),
    outTo: { opacity: 0, x: 42, scale: 1.06, filter: "blur(8px)" },
    outEase: "power3.in",
  },
  {
    initial: { opacity: 0, y: -36, scale: 1.08, filter: "blur(10px)" },
    inFrom: { opacity: 0, y: -36, scale: 1.08, filter: "blur(10px)" },
    inTo: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    inEase: "back.out(1.6)",
    hold: (logo, holdDuration) =>
      gsap.timeline().to(logo, {
        y: -8,
        duration: holdDuration * 0.55,
        ease: "sine.inOut",
      }).to(logo, {
        y: 0,
        duration: holdDuration * 0.45,
        ease: "sine.inOut",
      }),
    outTo: { opacity: 0, y: 30, scale: 0.92, filter: "blur(10px)" },
    outEase: "power4.in",
  },
];

export const DEFAULT_TEXT_MOTION: LineMotionVariant = {
  inFrom: { opacity: 0, y: 36, filter: "blur(10px)" },
  inTo: { opacity: 1, y: 0, filter: "blur(0px)" },
  outTo: { opacity: 0, y: -28, filter: "blur(8px)" },
  inEase: "power4.out",
  outEase: "power3.in",
};
