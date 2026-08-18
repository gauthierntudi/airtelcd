/** Préfixe `NEXT_PUBLIC_BASE_PATH` pour les balises `<img>` brutes (pas `next/image`). */
export function publicPath(path: string): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
  const base =
    raw && raw !== "/" ? `/${raw.replace(/^\/+|\/+$/g, "")}` : "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Chemins des assets dans `public/img/` — sans basePath (`next/image` le préfixe). */
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
