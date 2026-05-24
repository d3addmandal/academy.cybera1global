import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersDb, sessionsDb, companyExists } from "@/lib/db";
import { signToken, setAuthCookie, adminDashboardUrl } from "@/lib/auth";
import { seedCompany } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    const { email, password, companySlug } = await req.json();

    if (!email || !password || !companySlug) {
      return NextResponse.json(
        { success: false, error: "Email, password and company are required." },
        { status: 400 }
      );
    }

    // Auto-seed on first visit
    if (!companyExists(companySlug)) {
      await seedCompany(companySlug);
    }

    const user = usersDb.getByEmail(companySlug, email);
    if (!user || !user.isActive) {
      // Same error for both "not found" and "inactive" — no enumeration
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate a new sessionId — this REPLACES any existing session (no concurrent login)
    const sessionId = crypto.randomUUID();
    sessionsDb.create(companySlug, user.id, sessionId, {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined,
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companySlug,
      sessionId,
    });

    usersDb.updateLastLogin(companySlug, user.id);

    const cookieOpts = setAuthCookie(token);
    const res = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        redirectTo: adminDashboardUrl(companySlug),
      },
    });
    res.cookies.set(cookieOpts);
    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}
