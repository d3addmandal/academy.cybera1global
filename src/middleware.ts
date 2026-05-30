import { NextRequest, NextResponse } from "next/server";

// ── Known scanner / automated-tool User-Agent signatures ─────────────────────
// These tools all send distinctive UA strings by default.
// Note: Burp Suite passes the browser UA — it cannot be blocked via UA alone.
const SCANNER_UA: RegExp[] = [
  /netsparker/i,
  /acunetix/i,
  /appscan/i,
  /\bZAP\b/,                  // OWASP ZAP default UA contains "ZAP"
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
  /hydra/i,
  /medusa/i,
  /python-requests\/[0-9]/i,  // bare requests lib — no legit visitor uses this
  /go-http-client/i,
  /curl\/[0-9]/i,             // bare curl (not browser)
  /java\/[0-9]/i,             // Java HTTP clients used by scanners
  /libwww-perl/i,
  /scrapy/i,
  /masscan/i,
];

// ── Sensitive file / path probes common in all scanners ──────────────────────
const PROBE_PATHS: RegExp[] = [
  // Dot-files and source control
  /\/\.(env|git|svn|hg|bzr|DS_Store|htaccess|htpasswd|npmrc|dockerignore)/i,
  // PHP / WordPress fingerprinting
  /\/(wp-admin|wp-login|wp-config|xmlrpc|phpmyadmin|adminer|phpinfo)/i,
  // Server internals
  /\/(cgi-bin|server-status|server-info|admin\.php|setup\.php)/i,
  // Backup / dump files
  /\.(bak|backup|old|orig|swp|sql|dump|tar\.gz|zip|7z|rar)$/i,
  // Log / config files
  /\/(debug|console|trace|diagnostic)$/i,
  /\.(log|conf|config|cfg|ini|yaml|yml|toml|json\.bak)$/i,
  // Spring Boot actuator / Java frameworks
  /\/actuator(\/|$)/,
  /\/(solr|jenkins|jira|confluence)\//i,
  // Path traversal sequences (encoded and raw)
  /\.\.[\/\\]/,
  /%2e%2e[%2f%5c]/i,
  /\.\.(\/|%2f)/i,
];

// ── Malicious payload signatures in the URL (path + query) ───────────────────
// Catches basic automated fuzzing even from tools that spoof their UA.
const MALICIOUS_URL: RegExp[] = [
  // XSS probes
  /<script[\s>]/i,
  /javascript:/i,
  /vbscript:/i,
  /on(error|load|click|mouse\w+)\s*=/i,
  // SQL injection probes
  /\b(union\s+select|select\s+\*\s+from|drop\s+table|insert\s+into|delete\s+from)\b/i,
  // Template/SSTI injection
  /\$\{.*\}|\{\{.*\}\}|#\{.*\}/,
  // Log4Shell
  /\$\{jndi:/i,
  // SSRF to cloud metadata / loopback
  /169\.254\.169\.254/,                           // AWS/GCP metadata endpoint
  /fd00:|::1|0\.0\.0\.0/,                         // IPv6 loopback / any
  // Common RCE probe strings
  /;(wget|curl|nc|bash|sh|python|perl|ruby)\s/i,
  // Null bytes
  /%00/,
];

// ── Suspicious header combinations that automated tools send ─────────────────
function hasScannnerHeaders(req: NextRequest): boolean {
  // Scanners often send both X-Scanner and arbitrary scan-id headers
  if (req.headers.get("x-scanner") || req.headers.get("x-scan-memo")) return true;
  // Acunetix always sends this custom header during crawl
  if (req.headers.get("acunetix-header")) return true;
  return false;
}

const DENY = (status = 403) =>
  new NextResponse(null, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const ua = req.headers.get("user-agent") ?? "";
  const fullUrl = pathname + search;

  // 1. Block scanner user agents
  if (SCANNER_UA.some((p) => p.test(ua))) return DENY();

  // 2. Block known scanner-injected headers
  if (hasScannnerHeaders(req)) return DENY();

  // 3. Block sensitive file/path probes
  if (PROBE_PATHS.some((p) => p.test(pathname))) return DENY();

  // 4. Block malicious payloads in the URL (path + query string)
  //    Decode first so %3Cscript%3E is caught alongside <script>
  let decoded = fullUrl;
  try { decoded = decodeURIComponent(fullUrl); } catch { /* leave as-is */ }
  if (MALICIOUS_URL.some((p) => p.test(decoded))) return DENY();

  // 5. API routes: require a non-empty User-Agent
  //    Legitimate browsers/mobile apps always send one; raw curl/scanner hits often don't.
  //    Exempt the token endpoint so server-side token pre-fetch can still work.
  if (
    pathname.startsWith("/api/") &&
    !ua.trim() &&
    pathname !== "/api/contact/token"
  ) {
    return DENY();
  }

  // 6. Hard-block any request to /.* (dot-files at root) not already caught
  if (/^\/\./.test(pathname)) return DENY();

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
