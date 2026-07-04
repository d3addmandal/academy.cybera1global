import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { isAdmin, forbidden } from "@/lib/permissions";
import { programmesDb, certificateTemplatesDb, certificateAuditLogDb } from "@/lib/db";
import { createCertificateFull } from "@/lib/certificate-create";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import * as XLSX from "xlsx";

type Params = { params: Promise<{ company: string }> };

interface RawRow {
  "Student Name"?: unknown;
  "Course Name"?: unknown;
  "Issue Date"?: unknown;
  "Student Date Of Birth"?: unknown;
  "Student Mobile"?: unknown;
  "Student Email"?: unknown;
  "Course Start Date"?: unknown;
  "Course End Date"?: unknown;
}

interface RowResult {
  row: number;
  studentName: string;
  courseName: string;
  ok: boolean;
  error?: string;
}

// Excel serial dates and Date objects (both of which xlsx can hand back for date-formatted cells)
// need to become plain YYYY-MM-DD strings — the rest of the certificate pipeline treats issue/start/end/dob as strings.
function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const epoch = XLSX.SSF.parse_date_code(value);
    if (epoch) {
      const mm = String(epoch.m).padStart(2, "0");
      const dd = String(epoch.d).padStart(2, "0");
      return `${epoch.y}-${mm}-${dd}`;
    }
  }
  return sanitizeText(String(value ?? ""), 30);
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const dryRun = form?.get("dryRun") !== "false";

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let rows: RawRow[];
  try {
    const wb = XLSX.read(bytes, { type: "array", cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  } catch {
    return NextResponse.json({ success: false, error: "Could not parse the uploaded file. Use the sample .xlsx/.csv format." }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ success: false, error: "The file has no data rows." }, { status: 400 });
  }

  const programmes = programmesDb.getAll(company);
  const templates = certificateTemplatesDb.getAll(company);
  const results: RowResult[] = [];
  const created: { id: string; certificateNumber: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNum = i + 2; // header is row 1
    const studentName = sanitizeText(String(raw["Student Name"] ?? ""), 150);
    const courseNameInput = sanitizeText(String(raw["Course Name"] ?? ""), 200);
    const issueDate = toDateString(raw["Issue Date"]);

    if (!studentName || !courseNameInput || !issueDate) {
      results.push({ row: rowNum, studentName, courseName: courseNameInput, ok: false, error: "Student Name, Course Name, and Issue Date are required." });
      continue;
    }

    const programme = programmes.find((p) => p.title.trim().toLowerCase() === courseNameInput.trim().toLowerCase());
    if (!programme) {
      results.push({ row: rowNum, studentName, courseName: courseNameInput, ok: false, error: `Course "${courseNameInput}" was not found.` });
      continue;
    }

    const template = templates.find((t) => t.programmeId === programme.id);
    if (!template) {
      results.push({ row: rowNum, studentName, courseName: courseNameInput, ok: false, error: `No certificate template configured for "${programme.title}".` });
      continue;
    }

    if (dryRun) {
      results.push({ row: rowNum, studentName, courseName: programme.title, ok: true });
      continue;
    }

    const studentEmailRaw = String(raw["Student Email"] ?? "");
    const studentPhoneRaw = String(raw["Student Mobile"] ?? "");
    const result = await createCertificateFull(company, req.nextUrl.origin, {
      programmeId: programme.id,
      studentName,
      studentEmail: studentEmailRaw ? sanitizeEmail(studentEmailRaw) : undefined,
      studentPhone: studentPhoneRaw ? sanitizePhone(studentPhoneRaw) : undefined,
      studentDob: raw["Student Date Of Birth"] ? toDateString(raw["Student Date Of Birth"]) : undefined,
      issueDate,
      startDate: raw["Course Start Date"] ? toDateString(raw["Course Start Date"]) : undefined,
      endDate: raw["Course End Date"] ? toDateString(raw["Course End Date"]) : undefined,
    });

    if (result.error || !result.certificate) {
      results.push({ row: rowNum, studentName, courseName: programme.title, ok: false, error: result.error ?? "Failed to create certificate." });
      continue;
    }

    created.push({ id: result.certificate.id, certificateNumber: result.certificate.certificateNumber });
    results.push({ row: rowNum, studentName, courseName: programme.title, ok: true });
  }

  if (!dryRun && created.length > 0) {
    certificateAuditLogDb.append(
      company,
      created.map(({ id, certificateNumber }) => ({
        companySlug: company,
        certificateId: id,
        certificateNumber,
        action: "created" as const,
        actorUserId: auth.userId,
        actorEmail: auth.email,
        detail: "Created via bulk import",
      }))
    );
  }

  const successCount = results.filter((r) => r.ok).length;
  const failureCount = results.length - successCount;

  return NextResponse.json({
    success: true,
    dryRun,
    total: results.length,
    successCount,
    failureCount,
    createdCount: created.length,
    results,
  });
}
