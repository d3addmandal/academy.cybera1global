import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { generateAndStoreQr, deleteStoredQr } from "@/lib/certificate-qr";
import type { CertificateAuditLogEntry } from "@/types/cms";

type Params = { params: Promise<{ company: string }> };
const MAX_BULK = 150;

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json().catch(() => ({}));

  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((v: unknown) => typeof v === "string") : [];
  if (ids.length === 0) return NextResponse.json({ success: false, error: "No certificate ids provided." }, { status: 400 });
  if (ids.length > MAX_BULK) {
    return NextResponse.json({ success: false, error: `Too many certificates selected. Max ${MAX_BULK} at a time.` }, { status: 400 });
  }

  const auditEntries: Omit<CertificateAuditLogEntry, "id" | "createdAt">[] = [];
  let regenerated = 0;

  for (const id of ids) {
    const existing = certificatesDb.getById(company, id);
    if (!existing) continue;
    const verificationUrl = existing.verificationUrl || `${req.nextUrl.origin}/certificate/${existing.certificateNumber}`;
    const qr = await generateAndStoreQr(company, existing.id, verificationUrl);
    await deleteStoredQr(existing.qrCodePath);
    certificatesDb.update(company, id, { qrCodePath: qr.url, qrCodeBase64: qr.base64, verificationUrl });
    auditEntries.push({
      companySlug: company,
      certificateId: id,
      certificateNumber: existing.certificateNumber,
      action: "qr_regenerated",
      actorUserId: auth.userId,
      actorEmail: auth.email,
      detail: "bulk regenerate",
    });
    regenerated++;
  }

  if (auditEntries.length > 0) certificateAuditLogDb.append(company, auditEntries);

  return NextResponse.json({ success: true, message: `Regenerated QR codes for ${regenerated} certificate(s).` });
}
