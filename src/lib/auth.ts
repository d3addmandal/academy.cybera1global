import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { AuthPayload } from "@/types/cms";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "crm-secret-key-change-in-production-32chars"
);
const COOKIE_NAME = "crm_admin_token";
const TOKEN_EXPIRY = "8h";

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromCookies(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthFromRequest(req: NextRequest): Promise<AuthPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(token: string): {
  name: string; value: string; httpOnly: boolean; secure: boolean;
  sameSite: "strict"; maxAge: number; path: string;
} {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
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
