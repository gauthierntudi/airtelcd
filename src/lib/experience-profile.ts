export type ExperienceProfile = "TRAVELER" | "BUSINESS";

export const EXPERIENCE_PROFILES: ExperienceProfile[] = [
  "TRAVELER",
  "BUSINESS",
];

export const EXPERIENCE_PROFILE_COPY: Record<
  ExperienceProfile,
  {
    title: string;
    description: string;
    circleBg: string;
    orbitAngleDeg: number;
  }
> = {
  TRAVELER: {
    title: "Traveler",
    description: "Je voyage souvent.",
    circleBg: "#e60000",
    orbitAngleDeg: 180,
  },
  BUSINESS: {
    title: "Business",
    description: "Je travaille constamment connecté.",
    circleBg: "#474b4e",
    orbitAngleDeg: 0,
  },
};

/** Distance centre → profil, en % du champ orbital */
export const EXPERIENCE_PROFILE_ORBIT_RADIUS = 44;

const STORAGE_KEY = "golf2026-experience-profile";

export function saveExperienceProfile(profile: ExperienceProfile): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, profile);
  } catch {
    /* ignore */
  }
}

export function readExperienceProfile(): ExperienceProfile | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (value === "TRAVELER" || value === "BUSINESS") return value;
  } catch {
    /* ignore */
  }
  return null;
}
