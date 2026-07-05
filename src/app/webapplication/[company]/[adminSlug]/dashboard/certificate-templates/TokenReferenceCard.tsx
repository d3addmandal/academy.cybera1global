"use client";
import { Card } from "@/components/admin/FormField";
import { CERTIFICATE_TOKENS } from "@/lib/certificate-template";

// The 9 tokens also drive the Visual Builder's drag-and-drop palette (single source of
// truth in certificate-template.ts); qr_code_base64 is raw-mode-only (a data-URI building
// block, not something that makes sense as a positionable canvas field), so it's appended
// here rather than added to the shared list.
const TOKENS: { token: string; description: string }[] = [
  ...CERTIFICATE_TOKENS.map((t) => ({
    token: `{{${t.token}}}`,
    description: t.token === "qr_code"
      ? "Verification QR code — renders as an <image> tag (works in both HTML and SVG templates)"
      : t.description,
  })),
  { token: "{{qr_code_base64}}", description: "Raw base64 QR PNG — use inside your own href=\"data:image/png;base64,...\"" },
];

export function TokenReferenceCard() {
  return (
    <Card title="Available Tokens" subtitle="Click to copy">
      <ul className="space-y-2">
        {TOKENS.map((t) => (
          <li key={t.token}>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(t.token)}
              className="w-full text-left group"
              title="Copy to clipboard"
            >
              <code className="text-xs font-mono text-red-600 group-hover:text-red-700">{t.token}</code>
              <p className="text-[11px] text-slate-400">{t.description}</p>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export const DEFAULT_TEMPLATE_HTML = `<div style="position:relative;width:1123px;height:794px;background:#ffffff;border:12px solid #8b0000;box-sizing:border-box;font-family:Georgia,serif;text-align:center;padding:60px;">
  <p style="letter-spacing:4px;color:#8b0000;font-size:14px;text-transform:uppercase;">Certificate of Completion</p>
  <p style="margin-top:40px;font-size:16px;color:#555;">This is to certify that</p>
  <h2 style="font-size:36px;margin:10px 0;color:#8b0000;">{{student_name}}</h2>
  <p style="font-size:16px;color:#555;">has successfully completed the course</p>
  <h3 style="font-size:26px;margin:10px 0;">{{course_name}}</h3>
  <p style="font-size:14px;color:#777;margin-top:20px;">Issued on {{issue_date}} &middot; Certificate No. {{certificate_number}}</p>
  <div style="position:absolute;bottom:40px;right:60px;">{{qr_code}}</div>
</div>`;
