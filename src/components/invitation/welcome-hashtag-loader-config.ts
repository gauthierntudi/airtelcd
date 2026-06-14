export const DEFAULT_LOADER_WORDS = [
  "Privilèges",
  "Flexibilité",
  "Convertibilité",
  "Partage",
  "Transacter sans cash",
  "Transformer son business",
] as const;

/** Textes de l'animatic public (/animatic/welcome-loader). */
export const ANIMATIC_LOADER_TEXTS = [
  "Rien ne se perd avec privilège.",
  "Convertissez votre volume\ninternet local en roaming\net vice-versa",
  "Devenez membre Privilège en\ncomposant *1111# option 4.",
  "Ensemble, tout devient possible",
] as const;

export type WelcomeHashtagLoaderConfig = {
  words: string[];
  gradientFrom: string;
  gradientTo: string;
  angleStart: number;
  angleEnd: number;
  angleDuration: number;
  wordInDuration: number;
  wordHoldDuration: number;
  wordOutDuration: number;
  fontSizeMobile: string;
  fontSizeDesktop: string;
  /** Valeur fluide du clamp (ex. 5vw). */
  fontSizeFluid?: string;
  loop: boolean;
  /** Variantes d'animation (animatic en boucle). */
  variedAnimations?: boolean;
  /** Intro logo avant le cycle de mots (animatic public). */
  introLogoSrc?: string;
};

export const ANIMATIC_WELCOME_HASHTAG_LOADER_CONFIG: WelcomeHashtagLoaderConfig = {
  words: [...ANIMATIC_LOADER_TEXTS],
  gradientFrom: "#810100",
  gradientTo: "#e60000",
  angleStart: 180,
  angleEnd: 340,
  angleDuration: 6.5,
  wordInDuration: 0.78,
  wordHoldDuration: 2.35,
  wordOutDuration: 0.52,
  fontSizeMobile: "2.5rem",
  fontSizeDesktop: "4rem",
  fontSizeFluid: "6.5vw",
  loop: true,
  variedAnimations: true,
  introLogoSrc: "/img/logo-animatic.png",
};

export const DEFAULT_WELCOME_HASHTAG_LOADER_CONFIG: WelcomeHashtagLoaderConfig = {
  words: [...DEFAULT_LOADER_WORDS],
  gradientFrom: "#810100",
  gradientTo: "#e60000",
  angleStart: 180,
  angleEnd: 340,
  angleDuration: 5,
  wordInDuration: 0.58,
  wordHoldDuration: 0.9,
  wordOutDuration: 0.44,
  fontSizeMobile: "1.65rem",
  fontSizeDesktop: "2.5rem",
  loop: false,
};
