export const AIRTEL_SKIP_SPLASH_COOKIE = "airtel_skip_splash";

/** Pose un cookie court : l’invitation ne rejoue pas le splash après le login. */
export function markAirtelSplashSkip() {
  document.cookie = `${AIRTEL_SKIP_SPLASH_COOKIE}=1; Path=/; Max-Age=20; SameSite=Lax`;
}

export function clearAirtelSplashSkip() {
  document.cookie = `${AIRTEL_SKIP_SPLASH_COOKIE}=; Path=/; Max-Age=0`;
}
