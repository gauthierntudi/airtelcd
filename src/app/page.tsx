import type { Metadata } from "next";
import { PrivilegeHome } from "@/components/home/PrivilegeHome";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: `${EVENT.organizer} — ${EVENT.title}`,
};

export default function HomePage() {
  return <PrivilegeHome />;
}
