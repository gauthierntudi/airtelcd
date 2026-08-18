/** Chemins des assets dans `public/img/` */
export const BRAND = {
  logoWhite: "/img/airtel-logo-white.png",
  logoBlack: "/img/airtel-logo.png",
  logoLight: "/img/airtel-logo.png",
  logoColor: "/img/logo-color.svg",
  icon: "/img/icon-airtel.png",
  favicon: "/img/icon-airtel.png",
  themeColor: "#E60000",
} as const;

export type LogoVariant = "white" | "black" | "light" | "color";

export function logoSrc(variant: LogoVariant): string {
  const map: Record<LogoVariant, string> = {
    white: BRAND.logoWhite,
    black: BRAND.logoBlack,
    light: BRAND.logoLight,
    color: BRAND.logoColor,
  };
  return map[variant];
}
