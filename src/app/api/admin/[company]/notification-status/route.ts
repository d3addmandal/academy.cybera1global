import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { whatsappProviderStatus } from "@/lib/whatsapp";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await params; // resolve params (company not needed — env vars are global)

  const { meta, callmebot } = whatsappProviderStatus();
  const active = meta ? "meta" : callmebot ? "callmebot" : null;

  return NextResponse.json({
    success: true,
    data: {
      active,          // "meta" | "callmebot" | null
      meta,            // true if Meta Cloud API is fully configured
      callmebot,       // true if CallMeBot is fully configured
      configured: meta || callmebot,
    },
  });
}
