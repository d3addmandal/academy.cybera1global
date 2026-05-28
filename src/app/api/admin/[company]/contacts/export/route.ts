import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { contactsDb } from "@/lib/db";
import * as XLSX from "xlsx";

type Params = { params: Promise<{ company: string }> };

const INQUIRY_LABELS: Record<string, string> = {
  counseling:    "Free Counseling",
  corporate:     "Corporate Training",
  institutional: "Institutional Partnership",
  course:        "Course Enquiry",
  general:       "General Enquiry",
};

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { company } = await params;
  const contacts = contactsDb.getAll(company);

  const rows = contacts.map((c) => ({
    "Name":             c.name,
    "Phone":            c.phone,
    "Email":            c.email    || "",
    "City":             c.city     || "",
    "Program / Course": c.program  || "",
    "Organisation":     c.company  || "",
    "Enquiry Type":     INQUIRY_LABELS[c.inquiryType] ?? c.inquiryType ?? "General Enquiry",
    "Message":          c.message  || "",
    "Submitted At":     new Date(c.submittedAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-size columns to fit content
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Enquiries");

  const raw: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const body = new Uint8Array(raw);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `enquiries-${company}-${date}.xlsx`;

  return new NextResponse(body, {
    headers: {
      "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "no-store",
    },
  });
}
