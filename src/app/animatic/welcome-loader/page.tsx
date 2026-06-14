import type { Metadata } from "next";
import { WelcomeHashtagLoaderAnimatic } from "@/components/invitation/WelcomeHashtagLoaderAnimatic";

export const metadata: Metadata = {
  title: "Vodacom Privilège — Animatic",
  description: "Animatic Vodacom Privilège Golf — affichage en boucle",
};

export default function WelcomeLoaderAnimaticPage() {
  return <WelcomeHashtagLoaderAnimatic />;
}
