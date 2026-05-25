import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import fs from "fs";
import path from "path";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-DO-NOT-USE-IN-PROD"
);
const COOKIE_NAME = "crm_admin_token";

// Allowed HTTP methods
const PUBLIC_ALLOWED = new Set(["GET", "POST", "HEAD"]);
const ADMIN_ALLOWED  = new Set(["GET", "POST", "PUT", "DELETE", "HEAD"]);

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
  res.headers.set("Content-Security-Policy", CSP);
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return res;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  companySlug: string;
  sessionId?: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

const PROXY_DATA_DIR = path.join(process.cwd(), "data");
const PROXY_READ_DIRS = process.env.VERCEL === "1"
  ? ["/tmp/data", PROXY_DATA_DIR]
  : [PROXY_DATA_DIR];
const SESSION_INACTIVITY_MS = 30 * 60 * 1000; // must match db.ts

function isSessionActive(companySlug: string, userId: string, sessionId: string): boolean {
  try {
    for (const base of PROXY_READ_DIRS) {
      const filePath = path.join(base, companySlug, "sessions.json");
      if (!fs.existsSync(filePath)) continue;
      const sessions = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<{
        userId: string;
        sessionId: string;
        lastActivityAt?: string;
        createdAt: string;
      }>;
      const s = sessions.find((r) => r.userId === userId && r.sessionId === sessionId);
      if (!s) return false;
      const lastActivity = new Date(s.lastActivityAt ?? s.createdAt).getTime();
      return Date.now() - lastActivity <= SESSION_INACTIVITY_MS;
    }
    // No sessions file found in any directory.
    // On Vercel, /tmp/ is per-container so the file may not exist yet on this
    // instance — fall back to trusting the JWT signature + expiry alone.
    return process.env.VERCEL === "1";
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

function withAdminHeader(req: NextRequest): NextResponse {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-is-admin", "true");
  return NextResponse.next({ request: { headers: reqHeaders } });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const isAdminPage = pathname.startsWith("/webapplication/");
  const isAdminApi  =
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/auth/") &&
    !pathname.startsWith("/api/admin/init");
  const isDashboard = pathname.includes("/dashboard");

  // ── HTTP Method restriction ──────────────────────────────────────────────────
  const isAdminRoute = isAdminPage || isAdminApi;
  const allowed = isAdminRoute ? ADMIN_ALLOWED : PUBLIC_ALLOWED;
  if (!allowed.has(method)) {
    const allowHeader = isAdminRoute
      ? "GET, POST, PUT, DELETE, HEAD"
      : "GET, POST, HEAD";
    return applySecurityHeaders(
      new NextResponse(null, { status: 405, headers: { Allow: allowHeader } })
    );
  }

  // ── Tag admin-domain pages so root layout hides Header/Footer ────────────────
  if (isAdminPage && !isDashboard && !isAdminApi) {
    return applySecurityHeaders(withAdminHeader(req));
  }

  // Pass-through for non-admin routes (security headers only)
  if (!isDashboard && !isAdminApi) {
    return applySecurityHeaders(NextResponse.next());
  }

  // ── Auth enforcement for dashboard pages and API routes ──────────────────────
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const auth  = token ? await verifyToken(token) : null;

  if (!auth) {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Unauthorised. Please sign in." }, { status: 401 })
      );
    }
    return applySecurityHeaders(redirectToLogin(req, pathname));
  }

  // Old tokens (pre-session-tracking) have no sessionId — force re-login
  if (!auth.sessionId) {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Session expired. Please sign in again." }, { status: 401 })
      );
    }
    return applySecurityHeaders(redirectToLogin(req, pathname));
  }

  // Session check — enforces no-concurrent-login
  if (!isSessionActive(auth.companySlug, auth.userId, auth.sessionId)) {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Session superseded. Sign in again." }, { status: 401 })
      );
    }
    return applySecurityHeaders(redirectToLogin(req, pathname));
  }

  // Company isolation for API routes
  if (isAdminApi) {
    const apiCompany = pathname.split("/")[3];
    if (apiCompany && apiCompany !== auth.companySlug && auth.role !== "super_admin") {
      return applySecurityHeaders(
        NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      );
    }
  }

  // Inject x-is-admin header so root layout hides Header/Footer
  return applySecurityHeaders(withAdminHeader(req));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images/|uploads/|fonts/).*)",
  ],
};
