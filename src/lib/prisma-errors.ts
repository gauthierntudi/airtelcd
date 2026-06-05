import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

function isPoolOrConnectionError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message.toLowerCase();
  return (
    msg.includes("connection pool") ||
    msg.includes("timed out fetching") ||
    msg.includes("can't reach database") ||
    msg.includes("p1001")
  );
}

/** Réponse API lisible quand Neon / Prisma ne peut pas se connecter. */
export function databaseErrorResponse(e: unknown): NextResponse | null {
  if (
    e instanceof Prisma.PrismaClientInitializationError ||
    e instanceof Prisma.PrismaClientKnownRequestError ||
    isPoolOrConnectionError(e)
  ) {
    console.error("[database]", e);
    return NextResponse.json(
      {
        error:
          "Base de données temporairement indisponible. Réessayez dans quelques secondes.",
      },
      { status: 503 },
    );
  }
  return null;
}
