/** Préfixe `NEXT_PUBLIC_BASE_PATH` pour les URLs servies au navigateur. */
export function publicPath(path: string): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
  const base =
    raw && raw !== "/" ? `/${raw.replace(/^\/+|\/+$/g, "")}` : "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Chemins dans `public/img/` — sans préfixe. Passer par `publicPath` / `logoSrc`. */
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
  return publicPath(map[variant]);
}

export function brandIconSrc(): string {
  return publicPath(BRAND.icon);
}
