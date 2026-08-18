import type { Metadata } from "next";
import { InvitationLoginPage } from "@/components/home/InvitationLoginPage";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: `Accéder à votre invitation — ${EVENT.title}`,
};

export default function HomePage() {
  return <InvitationLoginPage />;
}
