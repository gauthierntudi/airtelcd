/** Bannière hero — emails invitation (simple + nominatif) */
export const INVITATION_HERO_IMAGE_URL =
  "https://mypullzond243.b-cdn.net/golf2026/flyer-gen.jpg";

/** Home — fond bandeau « Vodacom Golf 2026 » (Cloudinary) */
export const PLATFORM_ORGANIZER_BG_URL =
  "https://res.cloudinary.com/dfqlmkknv/image/upload/v1780598340/18639_eekx1z.jpg";

/** Home — expériences & parcours (`public/img/icons/`) */
export const PLATFORM_MODULE_ICONS = {
  invitation: "/img/icons/invitation.svg",
  mpesa: "/img/icons/mpesa.svg",
  market: "/img/icons/market.svg",
  forfait: "/img/icons/forfait.svg",
  games: "/img/icons/games.svg",
} as const;

/** Slide mobile Expérience — fond vidéo (Cloudinary) */
export const INVITATION_EXPERIENCE_VIDEO_URL =
  "https://res.cloudinary.com/dfqlmkknv/video/upload/v1780556077/open_zfan2e.mp4";

/** Poster slide Expérience (avant lecture vidéo + slide hors vue) */
export const INVITATION_EXPERIENCE_POSTER = "/img/poster3.jpg";

const IMG = (n: number) =>
  n === 1 ? "/img/background01.jpg" : `/img/img0${n}.jpg`;

/** Visuels desktop — `public/img/` */
export const INVITATION_CLIENT_IMAGES = {
  hero: { src: IMG(1), alt: "Vodacom Privilège Golf 2026" },
  experience: { src: IMG(2), alt: "Expérience golf premium" },
  programme: { src: IMG(3), alt: "Programme et networking" },
} as const;

/** Slides onboarding mobile (1 image par écran) */
export type InvitationSlideId =
  | "welcome"
  | "invite"
  | "experience"
  | "datetime"
  | "programme"
  | "rsvp";

export type InvitationSlideConfig = {
  id: InvitationSlideId;
  image: string;
  imageAlt: string;
  /** Fond vidéo (mp4) — poster = `image` */
  video?: string;
  /** Libellé court dans la barre d’étape (style app) */
  stepLabel: string;
};

export const INVITATION_MOBILE_SLIDES: InvitationSlideConfig[] = [
  {
    id: "welcome",
    image: IMG(1),
    imageAlt: "Bienvenue au Vodacom Privilège Golf",
    stepLabel: "Bienvenue",
  },
  {
    id: "invite",
    image: IMG(2),
    imageAlt: "Invitation personnalisée",
    stepLabel: "Vous",
  },
  {
    id: "experience",
    image: INVITATION_EXPERIENCE_POSTER,
    video: INVITATION_EXPERIENCE_VIDEO_URL,
    imageAlt: "Expérience exclusive",
    stepLabel: "Expérience",
  },
  {
    id: "datetime",
    image: IMG(4),
    imageAlt: "Date et horaires",
    stepLabel: "Date",
  },
  {
    id: "programme",
    image: IMG(5),
    imageAlt: "Programme de la journée",
    stepLabel: "Programme",
  },
  {
    id: "rsvp",
    image: IMG(8),
    imageAlt: "Confirmer votre présence",
    stepLabel: "RSVP",
  },
];

/** Fond de la carte PNG « Télécharger l'invitation » (slide RSVP). */
export const INVITATION_RSVP_PASS_IMAGE =
  INVITATION_MOBILE_SLIDES.find((s) => s.id === "rsvp")!.image;
