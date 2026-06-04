/** Chemins des assets dans `public/img/` */
export const BRAND = {
  logoWhite: "/img/logo-white.png",
  logoBlack: "/img/logo-black.png",
  logoLight: "/img/logo-light.png",
  icon: "/img/icon.png",
  favicon: "/img/favicon.png",
} as const;

export type LogoVariant = "white" | "black" | "light";

export function logoSrc(variant: LogoVariant): string {
  const map: Record<LogoVariant, string> = {
    white: BRAND.logoWhite,
    black: BRAND.logoBlack,
    light: BRAND.logoLight,
  };
  return map[variant];
}
