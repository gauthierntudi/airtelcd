import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth-admin";
import { listAdminMpesaOverview } from "@/lib/mpesa-visa/service";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!isAdminAuthorized(secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const rows = await listAdminMpesaOverview();
  return NextResponse.json(rows);
}
