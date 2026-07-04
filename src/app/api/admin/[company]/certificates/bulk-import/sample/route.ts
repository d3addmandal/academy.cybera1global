import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { isAdmin, forbidden } from "@/lib/permissions";
import * as XLSX from "xlsx";

type Params = { params: Promise<{ company: string }> };

const SAMPLE_ROW = {
  "Student Name": "Jordan Smith",
  "Course Name": "Certified Ethical Hacker",
  "Issue Date": "2026-01-15",
  "Student Date Of Birth": "2000-05-20",
  "Student Mobile": "+91 9876543210",
  "Student Email": "jordan.smith@example.com",
  "Course Start Date": "2026-01-01",
  "Course End Date": "2026-01-14",
};

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  await params;

  const ws = XLSX.utils.json_to_sheet([SAMPLE_ROW]);
  ws["!cols"] = Object.keys(SAMPLE_ROW).map((key) => ({ wch: Math.max(key.length, 20) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Certificates");
  const raw: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(new Uint8Array(raw), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="certificate-bulk-import-sample.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
