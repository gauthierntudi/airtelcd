import type { NextConfig } from "next";

/** Origines LAN autorisées en `npm run dev` (téléphone, autre poste sur le Wi‑Fi). */
const allowedDevOrigins = [
  "192.168.*.*",
  "10.*.*.*",
];

if (process.env.ALLOWED_DEV_ORIGIN) {
  allowedDevOrigins.push(process.env.ALLOWED_DEV_ORIGIN);
}

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dfqlmkknv/image/upload/**",
      },
    ],
  },
  // Évite l’avertissement lockfile quand le repo n’est pas la racine du workspace
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
