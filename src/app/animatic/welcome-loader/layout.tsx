import type { Metadata, Viewport } from "next";
import { AnimaticPwaRegister } from "@/components/invitation/AnimaticPwaRegister";

export const metadata: Metadata = {
  title: "Vodacom Privilège — Animatic",
  description: "Animatic Vodacom Privilège Golf — affichage en boucle",
  manifest: "/animatic/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vodacom Privilège",
  },
  applicationName: "Vodacom Privilège",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#810100",
};

export default function AnimaticWelcomeLoaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <AnimaticPwaRegister />
    </>
  );
}
