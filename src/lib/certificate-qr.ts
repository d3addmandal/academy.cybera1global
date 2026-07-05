import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { put, del } from "@vercel/blob";

export interface StoredQr {
  url: string;
  /** Raw base64 PNG payload (no "data:image/png;base64," prefix) — same bytes as `url`, for templates that inline the QR via a data URI. */
  base64: string;
}

/**
 * Generates a QR PNG for a certificate's verification URL and stores it via
 * the same Vercel Blob (prod) / public/uploads (local dev) dual-path pattern
 * already used by src/app/api/admin/[company]/upload/route.ts.
 */
export async function generateAndStoreQr(company: string, certificateId: string, verificationUrl: string): Promise<StoredQr> {
  const buffer = await QRCode.toBuffer(verificationUrl, { type: "png", width: 480, margin: 1 });
  const base64 = buffer.toString("base64");
  const filename = `qr-${certificateId}-${Date.now()}.png`;

  if (process.env.VERCEL === "1") {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set — cannot store QR code.");
    const blobPath = `uploads/${company}/certificates/qr/${filename}`;
    const blob = await put(blobPath, new Blob([new Uint8Array(buffer)], { type: "image/png" }), { access: "public", token });
    return { url: blob.url, base64 };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", company, "certificates", "qr");
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return { url: `/uploads/${company}/certificates/qr/${filename}`, base64 };
}

/** Best-effort delete of a previously stored QR image (Vercel Blob only — local dev files are left, same as the upload route's behavior). */
export async function deleteStoredQr(qrCodePath: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !qrCodePath.includes(".public.blob.vercel-storage.com/")) return;
  try {
    await del(qrCodePath, { token });
  } catch (err) {
    console.warn("[certificate-qr] failed to delete old QR:", err);
  }
}
