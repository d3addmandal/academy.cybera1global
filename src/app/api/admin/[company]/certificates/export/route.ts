import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import * as XLSX from "xlsx";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();

  const { company } = await params;
  const format = req.nextUrl.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const certificates = certificatesDb.getAll(company);

  const rows = certificates.map((c) => ({
    "Student Name":       c.studentName,
    "Student Email":      c.studentEmail || "",
    "Course Name":        c.courseName,
    "Certificate Number": c.certificateNumber,
    "Issue Date":         c.issueDate,
    "Start Date":         c.startDate || "",
    "End Date":           c.endDate || "",
    "Instructor":         c.instructorName || "",
    "Organization":       c.organizationName,
    "Status":             c.status,
    "Verification URL":   c.verificationUrl,
    "Created At":         c.createdAt,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `certificates-${company}-${date}.${format}`;

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Certificates");
  const raw: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(new Uint8Array(raw), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
