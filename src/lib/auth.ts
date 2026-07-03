import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { AuthPayload } from "@/types/cms";
import { sessionsDb } from "@/lib/db";
import { blobHydrate } from "@/lib/blob-db";

let _secret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (_secret) return _secret;
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[auth] JWT_SECRET env var is not set. Add it in Vercel → Settings → Environment Variables.");
    }
    console.warn("[auth] JWT_SECRET not set — using insecure dev fallback. Never deploy without it.");
  }
  _secret = new TextEncoder().encode(raw ?? "dev-only-DO-NOT-USE-IN-PROD");
  return _secret;
}
const COOKIE_NAME = "crm_admin_token";
const TOKEN_EXPIRY = "2h";

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromCookies(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  // Refresh the local cache first so the session check below reads current data.
  await blobHydrate(payload.companySlug);
  if (!sessionsDb.isValid(payload.companySlug, payload.userId, payload.sessionId)) return null;
  try { sessionsDb.touch(payload.companySlug, payload.userId); } catch { /* non-fatal */ }
  return payload;
}

export async function getAuthFromRequest(req: NextRequest): Promise<AuthPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  // Refresh the local cache first so the session check below reads current data.
  await blobHydrate(payload.companySlug);
  if (!sessionsDb.isValid(payload.companySlug, payload.userId, payload.sessionId)) return null;
  try { sessionsDb.touch(payload.companySlug, payload.userId); } catch { /* non-fatal */ }
  return payload;
}

// Session-only cookie — no maxAge so it expires when the browser closes
export function setAuthCookie(token: string): {
  name: string; value: string; httpOnly: boolean; secure: boolean;
  sameSite: "strict"; path: string;
} {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };
}

export function clearAuthCookie(): {
  name: string; value: string; maxAge: number; path: string;
} {
  return { name: COOKIE_NAME, value: "", maxAge: 0, path: "/" };
}

export function adminLoginUrl(company: string): string {
  return `/webapplication/${company}/admin-edu-${company}/login`;
}

export function adminDashboardUrl(company: string): string {
  return `/webapplication/${company}/admin-edu-${company}/dashboard`;
}