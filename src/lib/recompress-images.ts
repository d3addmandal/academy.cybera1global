import sharp from "sharp";
import { put } from "@vercel/blob";
import { readCompanyFile, writeCompanyFile } from "@/lib/db";

/**
 * One-time/repeatable batch job: walks every JSON data file for a company,
 * finds image URLs uploaded before automatic compression existed (anything
 * still jpg/png/gif hosted on Vercel Blob), recompresses them the same way
 * the upload route does (WebP, 1920px cap, EXIF stripped), and rewrites the
 * data to point at the new compressed copies.
 *
 * Deliberately skips:
 *  - anything already .webp (already compressed, or nothing to gain)
 *  - QR codes (/qr/ path) — lossy re-encoding risks breaking scannability
 *  - favicon- and site-icon- prefixed filenames — tiny icons visibly distort
 *    under lossy compression (see upload route's ICON_UPLOAD_TYPES exemption)
 *  - non-Blob-hosted URLs (relative/local paths — nothing to fetch)
 *
 * Safe to re-run: a second pass finds nothing left to do once URLs have
 * already been swapped to their -recompressed.webp versions.
 */

const FILES_TO_SCAN = [
  "home.json", "programmes.json", "blog.json", "events.json",
  "testimonials.json", "trainers.json", "theme.json",
  "certificates.json", "certificate-templates.json",
];

const RECOMPRESSIBLE_URL_RE = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/.+\.(jpe?g|png|gif)$/i;
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 80;
// Safety cap per invocation so a very large data set can't run into a
// serverless execution-time limit — call again to continue where it left off.
const MAX_IMAGES_PER_RUN = 60;

function shouldSkip(url: string): boolean {
  if (!RECOMPRESSIBLE_URL_RE.test(url)) return true;
  if (/\/qr\//i.test(url)) return true;
  const filename = url.split("/").pop() ?? "";
  if (/^(favicon|site-icon)-/i.test(filename)) return true;
  return false;
}

function collectImageUrls(value: unknown, found: Set<string>): void {
  if (typeof value === "string") {
    if (!shouldSkip(value)) found.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectImageUrls(v, found));
  } else if (value !== null && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((v) => collectImageUrls(v, found));
  }
}

function replaceImageUrls(value: unknown, map: Map<string, string>): unknown {
  if (typeof value === "string") return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => replaceImageUrls(v, map));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, replaceImageUrls(v, map)])
    );
  }
  return value;
}

interface RecompressOneResult {
  newUrl: string;
  bytesBefore: number;
  bytesAfter: number;
}

async function recompressOne(url: string, token: string): Promise<RecompressOneResult | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const original = Buffer.from(await res.arrayBuffer());

  const compressed = await sharp(original, { animated: /\.gif$/i.test(url) })
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  if (compressed.length >= original.length) return null; // not worth it — keep original

  const urlObj = new URL(url);
  const parts = urlObj.pathname.split("/").filter(Boolean);
  const oldFilename = parts.pop()!;
  const newFilename = oldFilename.replace(/\.[a-z0-9]+$/i, "") + "-recompressed.webp";
  const newPath = [...parts, newFilename].join("/");

  const blob = await put(newPath, new Blob([new Uint8Array(compressed)], { type: "image/webp" }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });

  return { newUrl: blob.url, bytesBefore: original.length, bytesAfter: compressed.length };
}

export interface RecompressSummary {
  dryRun: boolean;
  scanned: number;      // distinct recompressible URLs found across all files
  processed: number;    // actually recompressed (dry run: same as would-process)
  skippedNoSavings: number;
  failed: number;
  bytesBefore: number;
  bytesAfter: number;
  remaining: number;    // left for a follow-up run because of MAX_IMAGES_PER_RUN
  details: { url: string; newUrl?: string; bytesBefore?: number; bytesAfter?: number; status: "recompressed" | "no-savings" | "failed" | "would-recompress" }[];
}

export async function recompressCompanyImages(company: string, dryRun: boolean): Promise<RecompressSummary> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set — cannot recompress images.");

  const summary: RecompressSummary = {
    dryRun, scanned: 0, processed: 0, skippedNoSavings: 0, failed: 0,
    bytesBefore: 0, bytesAfter: 0, remaining: 0, details: [],
  };

  const allUrls = new Set<string>();
  const fileData: Record<string, unknown> = {};
  for (const filename of FILES_TO_SCAN) {
    const data = readCompanyFile<unknown>(company, filename);
    if (data === null) continue;
    fileData[filename] = data;
    collectImageUrls(data, allUrls);
  }
  summary.scanned = allUrls.size;

  const urlList = Array.from(allUrls);
  const toProcess = urlList.slice(0, MAX_IMAGES_PER_RUN);
  summary.remaining = Math.max(0, urlList.length - toProcess.length);

  const replacements = new Map<string, string>();

  for (const url of toProcess) {
    if (dryRun) {
      summary.details.push({ url, status: "would-recompress" });
      summary.processed++;
      continue;
    }
    try {
      const result = await recompressOne(url, token);
      if (result) {
        replacements.set(url, result.newUrl);
        summary.bytesBefore += result.bytesBefore;
        summary.bytesAfter += result.bytesAfter;
        summary.processed++;
        summary.details.push({ url, newUrl: result.newUrl, bytesBefore: result.bytesBefore, bytesAfter: result.bytesAfter, status: "recompressed" });
      } else {
        summary.skippedNoSavings++;
        summary.details.push({ url, status: "no-savings" });
      }
    } catch (err) {
      summary.failed++;
      summary.details.push({ url, status: "failed" });
      console.error("[recompress-images] failed for", url, err);
    }
  }

  if (!dryRun && replacements.size > 0) {
    for (const filename of FILES_TO_SCAN) {
      if (!(filename in fileData)) continue;
      const updated = replaceImageUrls(fileData[filename], replacements);
      writeCompanyFile(company, filename, updated);
    }
  }

  return summary;
}
