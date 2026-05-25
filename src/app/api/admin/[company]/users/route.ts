import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthFromRequest } from "@/lib/auth";
import { usersDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeEmail, sanitizeText } from "@/lib/sanitize";
import type { UserRole } from "@/types/cms";

type Params = { params: Promise<{ company: string }> };

const ALLOWED_ROLES: UserRole[] = ["admin", "editor", "sales"];

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const users = usersDb.getAll(company).map(({ passwordHash: _, ...u }) => u);
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;

  const body = await req.json().catch(() => ({}));
  const name = sanitizeText(body.name, 64);
  const email = sanitizeEmail(body.email);
  const password = sanitizeText(body.password, 128);
  const role: UserRole = ALLOWED_ROLES.includes(body.role) ? body.role : "editor";

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, error: "Name, email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (usersDb.getByEmail(company, email)) {
    return NextResponse.json({ success: false, error: "A user with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { passwordHash: _, ...user } = usersDb.create(company, {
    companySlug: company,
    name,
    email,
    passwordHash,
    role,
    isActive: true,
  });

  return NextResponse.json({ success: true, data: user, message: "User created." }, { status: 201 });
}
