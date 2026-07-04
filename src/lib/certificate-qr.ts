import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { put, del } from "@vercel/blob";

/**
 * Generates a QR PNG for a certificate's verification URL and stores it via
 * the same Vercel Blob (prod) / public/uploads (local dev) dual-path pattern
 * already used by src/app/api/admin/[company]/upload/route.ts.
 */
export async function generateAndStoreQr(company: string, certificateId: string, verificationUrl: string): Promise<string> {
  const buffer = await QRCode.toBuffer(verificationUrl, { type: "png", width: 480, margin: 1 });
  const filename = `qr-${certificateId}-${Date.now()}.png`;

  if (process.env.VERCEL === "1") {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set — cannot store QR code.");
    const blobPath = `uploads/${company}/certificates/qr/${filename}`;
    const blob = await put(blobPath, new Blob([new Uint8Array(buffer)], { type: "image/png" }), { access: "public", token });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", company, "certificates", "qr");
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/uploads/${company}/certificates/qr/${filename}`;
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
