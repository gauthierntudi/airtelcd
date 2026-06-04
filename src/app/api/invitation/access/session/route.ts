import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resolveInvitationSessionRedirect } from "@/lib/invitation-access/resolve-session";
import {
  INVITATION_SESSION_COOKIE,
} from "@/lib/invitation-access/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(INVITATION_SESSION_COOKIE)?.value;
  const result = await resolveInvitationSessionRedirect(session);

  if (!result) {
    return NextResponse.json({ error: "Session absente" }, { status: 401 });
  }

  return NextResponse.json(result);
}
