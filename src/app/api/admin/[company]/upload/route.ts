import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { put, del } from "@vercel/blob";
import { HAS_BLOB, BLOB_TOKEN } from "@/lib/env";

type Params = { params: Promise<{ company: string }> };

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp",
  "image/gif", "image/svg+xml",
  "image/x-icon", "image/vnd.microsoft.icon",
]);
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

function validateMagicBytes(buf: Buffer, mime: string): boolean {
  if (mime === "image/svg+xml") return true;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true; // JPEG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true; // PNG
  if (buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true; // WebP
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return true; // GIF
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return true; // ICO
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x02 && buf[3] === 0x00) return true; // CUR
  return false;
}

function containsMaliciousContent(buf: Buffer): boolean {
  const scan = buf.slice(0, 8192).toString("latin1").toLowerCase();
  const patterns = [
    "<?php", "<?=", "<script", "<%", "eval(",
    "base64_decode(", "exec(", "system(", "passthru(",
    "shell_exec(", "popen(", "__import__",
  ];
  return patterns.some((p) => scan.includes(p));
}

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { company } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "File too large. Maximum 15 MB." }, { status: 400 });
    }

    const declaredMime = file.type.toLowerCase();
    if (!ALLOWED_MIME.has(declaredMime)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Accepted: JPEG, PNG, WebP, GIF, SVG, ICO." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    if (!validateMagicBytes(bytes, declaredMime)) {
      return NextResponse.json(
        { success: false, error: "File rejected: magic bytes do not match declared type." },
        { status: 400 }
      );
    }

    if (declaredMime === "image/svg+xml") {
      const svgText = bytes.slice(0, 65536).toString("utf8").toLowerCase();
      const svgUnsafePatterns = [
        "<script", "javascript:", "vbscript:", "data:", "<use",
        "<foreignobject", "onload=", "onerror=", "onclick=", "onmouseover=",
        "onfocus=", "onblur=", "onmouseenter=", "onmouseleave=",
        "onkeydown=", "onkeyup=", "onkeypress=", "onanimation",
        "ontransition", "href=", "xlink:href=",
      ];
      if (svgUnsafePatterns.some((p) => svgText.includes(p))) {
        return NextResponse.json(
          { success: false, error: "File rejected: SVG contains unsafe content." },
          { status: 400 }
        );
      }
    }

    if (containsMaliciousContent(bytes)) {
      return NextResponse.json(
        { success: false, error: "File rejected: suspicious content detected." },
        { status: 400 }
      );
    }

    const ext = EXT_MAP[declaredMime] ?? "jpg";
    const uploadType = ((formData.get("type") as string) ?? "image")
      .replace(/[^a-z0-9-]/gi, "").toLowerCase();
    const folder = ((formData.get("folder") as string) ?? "")
      .replace(/[^a-z0-9\-_/]/gi, "").toLowerCase().slice(0, 64);
    const randomId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const prefix = folder ? "" : `${uploadType}-`;
    const filename = `${prefix}${Date.now()}-${randomId}.${ext}`;

    if (!HAS_BLOB) {
      console.error("[upload] BLOB_READ_WRITE_TOKEN is not set");
      return NextResponse.json(
        { success: false, error: "Storage not configured. Add BLOB_READ_WRITE_TOKEN (see .env.example / Vercel dashboard under Storage)." },
        { status: 500 }
      );
    }

    const blobPath = folder
      ? `uploads/${company}/${folder}/${filename}`
      : `uploads/${company}/${filename}`;

    const blob = await put(blobPath, new Blob([bytes], { type: declaredMime }), {
      access: "public",
      token: BLOB_TOKEN,
    });

    return NextResponse.json({ success: true, url: blob.url, filename });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[upload]", message);
    return NextResponse.json({ success: false, error: `Upload failed: ${message}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { company } = await params;

  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url : "";

    if (!url) {
      return NextResponse.json({ success: false, error: "url is required." }, { status: 400 });
    }

    // Only delete Vercel Blob CDN URLs belonging to this company's uploads
    if (!url.includes(".public.blob.vercel-storage.com/") || !url.includes(`/uploads/${company}/`)) {
      return NextResponse.json({ success: false, error: "Invalid or unauthorized blob URL." }, { status: 403 });
    }

    if (!HAS_BLOB) {
      return NextResponse.json({ success: true }); // storage not configured — nothing to delete
    }

    await del(url, { token: BLOB_TOKEN });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[upload delete]", message);
    return NextResponse.json({ success: false, error: `Delete failed: ${message}` }, { status: 500 });
  }
}
