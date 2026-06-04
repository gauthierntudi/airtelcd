import { redirect } from "next/navigation";
import { invitationPath } from "@/lib/invitation-url";

type Props = { params: Promise<{ token: string }> };

/** Ancienne URL /invite/[token] → /api/confirm/action=[token] */
export default async function LegacyInviteRedirect({ params }: Props) {
  const { token } = await params;
  redirect(invitationPath(token));
}
