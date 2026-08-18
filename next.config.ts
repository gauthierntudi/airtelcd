import type { NextConfig } from "next";

/** Origines LAN autorisées en `npm run dev` (téléphone, autre poste sur le Wi‑Fi). */
const allowedDevOrigins = [
  "192.168.*.*",
  "10.*.*.*",
];

if (process.env.ALLOWED_DEV_ORIGIN) {
  allowedDevOrigins.push(process.env.ALLOWED_DEV_ORIGIN);
}

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";
const withBasePath = (path: string) => (basePath ? `${basePath}${path}` : path);

const nextConfig: NextConfig = {
  output: "standalone",
  basePath,
  allowedDevOrigins,
  outputFileTracingIncludes: {
    "*": ["./node_modules/.prisma/client/**/*"],
  },
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
  async headers() {
    return [
      {
        source: withBasePath("/animatic/sw.js"),
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        source: withBasePath("/animatic/manifest.webmanifest"),
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
};

export default nextConfig;
