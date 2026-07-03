// proxy.ts  (Next.js 16 — replaces middleware.ts, both cannot coexist)
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { sessionsDb } from "@/lib/db";
import { blobHydrate } from "@/lib/blob-db";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Scanner / bot blocking  (formerly middleware.ts)
// ─────────────────────────────────────────────────────────────────────────────

const SCANNER_UA: RegExp[] = [
  /netsparker/i,
  /acunetix/i,
  /appscan/i,
  /\bZAP\b/,
  /nikto/i,
  /sqlmap/i,
  /nuclei/i,
  /masscan/i,
  /openvas/i,
  /w3af/i,
  /arachni/i,
  /wapiti/i,
  /skipfish/i,
  /dirbuster/i,
  /gobuster/i,
  /ffuf/i,
  /wfuzz/i,
  /nessus/i,
  /hydra/i,
  /medusa/i,
  /python-requests\/[0-9]/i,
  /go-http-client/i,
  /curl\/[0-9]/i,
  /java\/[0-9]/i,
  /libwww-perl/i,
  /scrapy/i,
];

const PROBE_PATHS: RegExp[] = [
  /\/\.(env|git|svn|hg|bzr|DS_Store|htaccess|htpasswd|npmrc|dockerignore)/i,
  /\/(wp-admin|wp-login|wp-config|xmlrpc|phpmyadmin|adminer|phpinfo)/i,
  /\/(cgi-bin|server-status|server-info|admin\.php|setup\.php)/i,
  /\.(bak|backup|old|orig|swp|sql|dump|tar\.gz|zip|7z|rar)$/i,
  /\/(debug|console|trace|diagnostic)$/i,
  /\.(log|conf|config|cfg|ini|yaml|yml|toml|json\.bak)$/i,
  /\/actuator(\/|$)/,
  /\/(solr|jenkins|jira|confluence)\//i,
  /\.\.[\/\\]/,
  /%2e%2e[%2f%5c]/i,
  /\.\.(\/|%2f)/i,
];

const MALICIOUS_URL: RegExp[] = [
  /<script[\s>]/i,
  /javascript:/i,
  /vbscript:/i,
  /on(error|load|click|mouse\w+)\s*=/i,
  /\b(union\s+select|select\s+\*\s+from|drop\s+table|insert\s+into|delete\s+from)\b/i,
  /\$\{.*\}|\{\{.*\}\}|#\{.*\}/,
  /\$\{jndi:/i,
  /169\.254\.169\.254/,
  /fd00:|::1|0\.0\.0\.0/,
  /;(wget|curl|nc|bash|sh|python|perl|ruby)\s/i,
  /%00/,
];

function hasScannerHeaders(req: NextRequest): boolean {
  if (req.headers.get("x-scanner") || req.headers.get("x-scan-memo")) return true;
  if (req.headers.get("acunetix-header")) return true;
  return false;
}

const DENY = (status = 403) =>
  new NextResponse(null, { status, headers: { "Cache-Control": "no-store" } });

function runBotBlocking(req: NextRequest): NextResponse | null {
  const { pathname, search } = req.nextUrl;
  const ua = req.headers.get("user-agent") ?? "";
  const fullUrl = pathname + search;

  if (SCANNER_UA.some((p) => p.test(ua))) return DENY();
  if (hasScannerHeaders(req)) return DENY();
  if (PROBE_PATHS.some((p) => p.test(pathname))) return DENY();

  let decoded = fullUrl;
  try { decoded = decodeURIComponent(fullUrl); } catch { /* leave as-is */ }
  if (MALICIOUS_URL.some((p) => p.test(decoded))) return DENY();

  if (
    pathname.startsWith("/api/") &&
    !ua.trim() &&
    pathname !== "/api/contact/token"
  ) {
    return DENY();
  }

  if (/^\/\./.test(pathname)) return DENY();

  return null; // no block — continue
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Auth / session enforcement  (formerly proxy.ts)
// ─────────────────────────────────────────────────────────────────────────────

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-DO-NOT-USE-IN-PROD"
);
const COOKIE_NAME = "crm_admin_token";

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
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  res.headers.set("Content-Security-Policy", CSP);
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
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

function clearCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

function redirectToLogin(req: NextRequest, pathname: string): NextResponse {
  const parts = pathname.split("/");
  const company  = parts[2] ?? "cybera1";
  const adminSlug = parts[3] ?? `admin-edu-${company}`;
  const loginUrl = new URL(
    `/webapplication/${company}/${adminSlug}/login`,
    req.url
  );
  loginUrl.searchParams.set("from", pathname);
  return clearCookie(NextResponse.redirect(loginUrl));
}

function withAdminHeader(req: NextRequest): NextResponse {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-is-admin", "true");
  return NextResponse.next({ request: { headers: reqHeaders } });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Unified export  (Next.js calls `proxy` instead of `middleware`)
// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  // 1. Run scanner / bot blocking FIRST — cheapest, no async needed
  const blocked = runBotBlocking(req);
  if (blocked) return applySecurityHeaders(blocked);

  const { pathname } = req.nextUrl;
  const method = req.method;

  const isAdminPage = pathname.startsWith("/webapplication/");
  const isAdminApi  =
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/auth/") &&
    !pathname.startsWith("/api/admin/init");
  const isDashboard = pathname.includes("/dashboard");

  // 2. HTTP method restriction
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

  // 3. Tag admin-domain pages so root layout hides Header/Footer
  if (isAdminPage && !isDashboard && !isAdminApi) {
    return applySecurityHeaders(withAdminHeader(req));
  }

  // 4. Pass-through for non-admin, non-dashboard routes
  if (!isDashboard && !isAdminApi) {
    return applySecurityHeaders(NextResponse.next());
  }

  // 5. Auth enforcement for dashboard pages and API routes
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const auth  = token ? await verifyToken(token) : null;

  if (!auth) {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Unauthorised. Please sign in." },
          { status: 401 }
        )
      );
    }
    return applySecurityHeaders(redirectToLogin(req, pathname));
  }

  if (!auth.sessionId) {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Session expired. Please sign in again." },
          { status: 401 }
        )
      );
    }
    return applySecurityHeaders(redirectToLogin(req, pathname));
  }

  await blobHydrate(auth.companySlug);
  if (!sessionsDb.isValid(auth.companySlug, auth.userId, auth.sessionId)) {
    if (isAdminApi) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Session superseded. Sign in again." },
          { status: 401 }
        )
      );
    }
    return applySecurityHeaders(redirectToLogin(req, pathname));
  }

  // 6. Company isolation for API routes
  if (isAdminApi) {
    const apiCompany = pathname.split("/")[3];
    if (
      apiCompany &&
      apiCompany !== auth.companySlug &&
      auth.role !== "super_admin"
    ) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        )
      );
    }
  }

  return applySecurityHeaders(withAdminHeader(req));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images/|uploads/|fonts/).*)",
  ],
};