import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { usersDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const user = usersDb.getById(auth.companySlug, auth.userId);
  if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: user.role, companySlug: user.companySlug },
  });
}
