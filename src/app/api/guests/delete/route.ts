import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { guestIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const ids = body.guestIds?.filter(Boolean);
  if (!ids?.length) {
    return NextResponse.json(
      { error: "Liste guestIds requise" },
      { status: 400 },
    );
  }

  if (ids.length > 200) {
    return NextResponse.json(
      { error: "Maximum 200 suppressions par lot" },
      { status: 400 },
    );
  }

  const result = await prisma.guest.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({
    deleted: result.count,
    requested: ids.length,
  });
}
