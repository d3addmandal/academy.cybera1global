import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthFromRequest } from "@/lib/auth";
import { usersDb, sessionsDb } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";

type Params = { params: Promise<{ company: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { company } = await params;
  if (auth.companySlug !== company) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const currentPassword = sanitizeText(body.currentPassword, 128);
  const newPassword = sanitizeText(body.newPassword, 128);
  const confirmPassword = sanitizeText(body.confirmPassword, 128);

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ success: false, error: "New passwords do not match." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const user = usersDb.getById(company, auth.userId);
  if (!user) return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  usersDb.update(company, auth.userId, { passwordHash });
  // Invalidate all sessions — forces re-login on all devices
  sessionsDb.invalidate(company, auth.userId);

  return NextResponse.json({ success: true, message: "Password updated. Please log in again." });
}