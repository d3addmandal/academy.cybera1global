import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText } from "@/lib/sanitize";
import type { CertificateStatus } from "@/types/cms";

type Params = { params: Promise<{ company: string; id: string }> };
const CERT_STATUSES: CertificateStatus[] = ["active", "revoked", "expired", "suspended"];

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const existing = certificatesDb.getById(company, id);
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (!CERT_STATUSES.includes(body.status)) {
    return NextResponse.json({ success: false, error: "Invalid status." }, { status: 400 });
  }
  const newStatus: CertificateStatus = body.status;
  const reason = body.reason ? sanitizeText(body.reason, 500) : undefined;

  const updated = certificatesDb.update(company, id, {
    status: newStatus,
    statusReason: reason,
    statusChangedAt: new Date().toISOString(),
  });
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  certificateAuditLogDb.append(company, [{
    companySlug: company,
    certificateId: id,
    certificateNumber: existing.certificateNumber,
    action: "status_changed",
    actorUserId: auth.userId,
    actorEmail: auth.email,
    detail: `status: ${existing.status} -> ${newStatus}${reason ? ` (${reason})` : ""}`,
  }]);

  return NextResponse.json({ success: true, data: updated, message: "Certificate status updated." });
}
