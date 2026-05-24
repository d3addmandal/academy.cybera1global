import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getAuthFromRequest } from "@/lib/auth";
import { sessionsDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (auth) {
    // Invalidate session in DB so the sessionId can't be reused
    sessionsDb.invalidate(auth.companySlug, auth.userId);
  }
  const res = NextResponse.json({ success: true });
  const c = clearAuthCookie();
  res.cookies.set({ name: c.name, value: c.value, maxAge: c.maxAge, path: c.path, httpOnly: true, sameSite: "strict" });
  return res;
}
