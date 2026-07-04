import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { generateAndStoreQr, deleteStoredQr } from "@/lib/certificate-qr";

type Params = { params: Promise<{ company: string; id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const existing = certificatesDb.getById(company, id);
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const verificationUrl = existing.verificationUrl || `${req.nextUrl.origin}/certificate/${existing.certificateNumber}`;
  const qrCodePath = await generateAndStoreQr(company, existing.id, verificationUrl);
  await deleteStoredQr(existing.qrCodePath);

  const updated = certificatesDb.update(company, id, { qrCodePath, verificationUrl });

  certificateAuditLogDb.append(company, [{
    companySlug: company,
    certificateId: id,
    certificateNumber: existing.certificateNumber,
    action: "qr_regenerated",
    actorUserId: auth.userId,
    actorEmail: auth.email,
  }]);

  return NextResponse.json({ success: true, data: updated, message: "QR code regenerated." });
}
