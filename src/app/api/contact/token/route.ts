import { NextResponse } from "next/server";
import { generateFormToken } from "@/lib/form-tokens";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const rl = checkRateLimit(`token:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  return NextResponse.json({ token: generateFormToken() });
}
