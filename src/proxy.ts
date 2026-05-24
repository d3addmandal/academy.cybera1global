import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import fs from "fs";
import path from "path";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "crm-secret-key-change-in-production-32chars"
);
const COOKIE_NAME = "crm_admin_token";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  companySlug: string;
  sessionId?: string; // optional for backwards-compat — absent = force re-login
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

function isSessionActive(companySlug: string, userId: string, sessionId: string): boolean {
  try {
    const filePath = path.join(process.cwd(), "data", companySlug, "sessions.json");
    if (!fs.existsSync(filePath)) return false;
    const sessions = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<{
      userId: string;
      sessionId: string;
    }>;
    return sessions.some((s) => s.userId === userId && s.sessionId === sessionId);
  } catch {
    return false;
  }
}

function clearCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME, value: "", maxAge: 0, path: "/",
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production",
  });
  return res;
}

function redirectToLogin(req: NextRequest, pathname: string): NextResponse {
  const parts = pathname.split("/");
  const company = parts[2] ?? "cybera1";
  const adminSlug = parts[3] ?? `admin-edu-${company}`;
  const loginUrl = new URL(`/webapplication/${company}/${adminSlug}/login`, req.url);
  loginUrl.searchParams.set("from", pathname);
  return clearCookie(NextResponse.redirect(loginUrl));
}

// ─── Inject x-is-admin header so the root layout can hide Header/Footer ─────
function withAdminHeader(req: NextRequest): NextResponse {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-is-admin", "true");
  return NextResponse.next({ request: { headers: reqHeaders } });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/webapplication/");
  const isAdminApi =
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/auth/") &&
    !pathname.startsWith("/api/admin/init");
  const isDashboard = pathname.includes("/dashboard");

  // ── Tag ALL admin-domain requests so the root layout can hide Header/Footer ──
  if (isAdminPage && !isDashboard && !isAdminApi) {
    // Login page and root redirect: just tag, no auth required
    return withAdminHeader(req);
  }

  if (!isDashboard && !isAdminApi) return NextResponse.next();

  // ── Auth enforcement for dashboard and API routes ─────────────────────────
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const auth = token ? await verifyToken(token) : null;

  if (!auth) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: "Unauthorised. Please sign in." },
        { status: 401 }
      );
    }
    return redirectToLogin(req, pathname);
  }

  // Old tokens (pre-session-tracking) have no sessionId — force re-login
  if (!auth.sessionId) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: "Session expired. Please sign in again." },
        { status: 401 }
      );
    }
    return redirectToLogin(req, pathname);
  }

  // Session check — enforces no-concurrent-login
  if (!isSessionActive(auth.companySlug, auth.userId, auth.sessionId)) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: "Session superseded. Sign in again." },
        { status: 401 }
      );
    }
    return redirectToLogin(req, pathname);
  }

  // Company isolation for API routes.
  // URL shape: /api/admin/[company]/[endpoint]
  //  split: ["", "api", "admin", "cybera1", "endpoint"]
  //  index:   0    1      2         3           4
  if (isAdminApi) {
    const apiCompany = pathname.split("/")[3]; // index 3 = company slug
    if (apiCompany && apiCompany !== auth.companySlug && auth.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  }

  // Inject x-is-admin header so root layout hides Header/Footer
  return withAdminHeader(req);
}

export const config = {
  // Match ALL webapplication routes (login + dashboard) AND admin APIs
  matcher: [
    "/webapplication/:path*",
    "/api/admin/:company/:path*",
  ],
};
