import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersDb, sessionsDb, companyExists } from "@/lib/db";
import { signToken, setAuthCookie, adminDashboardUrl } from "@/lib/auth";
import { sanitizeEmail, sanitizeText } from "@/lib/sanitize";
import { checkRateLimit, recordFailedLogin, resetFailedLogin } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    // Rate limit: 10 requests per minute per IP
    const rateResult = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateResult.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = sanitizeEmail(body.email);
    const password = sanitizeText(body.password, 128);
    const companySlug = sanitizeText(body.companySlug, 64);

    if (!email || !password || !companySlug) {
      return NextResponse.json(
        { success: false, error: "Email, password and company are required." },
        { status: 400 }
      );
    }

    if (!companyExists(companySlug)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Account lockout: 5 failed attempts per 15 minutes per IP+email key
    const lockKey = `lockout:${ip}:${email}`;
    const lockResult = recordFailedLogin(lockKey, false);
    if (lockResult.locked) {
      return NextResponse.json(
        { success: false, error: "Account temporarily locked. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const user = usersDb.getByEmail(companySlug, email);
    if (!user || !user.isActive) {
      recordFailedLogin(lockKey, true);
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      recordFailedLogin(lockKey, true);
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    resetFailedLogin(lockKey);

    // Generate a new sessionId — REPLACES any existing session (no concurrent login)
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