/**
 * Vercel Blob-backed persistence for CRM JSON data.
 *
 * On Vercel, /tmp/ is per-container and ephemeral. This module:
 *   - blobWrite()   — called (via after()) after every db write to persist to Blob CDN
 *   - blobHydrate() — called on cold containers to pull Blob data into /tmp/
 *                     so subsequent synchronous file reads work correctly.
 */
import { put, list } from "@vercel/blob";
import fs from "fs";
import path from "path";

// Only sanitize strings that look like image file paths (not hrefs, labels, etc.)
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif|svg|ico)$/i;

function isPublicFileAccessible(relativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", relativePath));
  } catch {
    return false;
  }
}

// Strip broken image paths:
//   - /images/subdir/... paths (those subdirectories don't exist in public/)
//   - relative /uploads/... paths where the file was deleted from the git repo
function fixBrokenImagePaths(value: unknown): unknown {
  if (typeof value === "string") {
    if (!IMAGE_EXT_RE.test(value)) return value; // not an image path — skip
    if (/^\/images\/.+\/.+/.test(value)) return ""; // /images/subdir/ paths don't exist
    if (value.startsWith("/") && !isPublicFileAccessible(value)) return ""; // deleted local file
    return value;
  }
  if (Array.isArray(value)) return value.map(fixBrokenImagePaths);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, fixBrokenImagePaths(v)])
    );
  }
  return value;
}

// Apply to all files that may contain image references
const FILES_NEEDING_IMAGE_SANITIZE = new Set([
  "programmes.json", "blog.json", "events.json",
  "home.json", "testimonials.json", "trainers.json", "theme.json",
]);

const IS_VERCEL = process.env.VERCEL === "1";
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const TMP_DATA = "/tmp/data";

// In-memory flag — avoids redundant Blob list calls within the same container lifetime.
const hydratedCompanies = new Set<string>();

if (IS_VERCEL && !TOKEN) {
  console.error(
    "[blob-db] BLOB_READ_WRITE_TOKEN is not set. " +
    "All CRM data writes will NOT persist across container restarts. " +
    "Add this variable in Vercel → Project → Settings → Environment Variables."
  );
}

/** Persist a JSON file to Vercel Blob (called via after() for guaranteed completion). */
export async function blobWrite(company: string, filename: string, data: unknown): Promise<void> {
  if (!IS_VERCEL || !TOKEN) return;
  await put(`crm-db/${company}/${filename}`, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: TOKEN,
  });
}

/**
 * Hydrate /tmp/data/ from Vercel Blob on cold-start containers.
 * Uses a module-level in-memory flag to skip on warm containers.
 * Only runs when VERCEL=1 and BLOB_READ_WRITE_TOKEN is set.
 */
export async function blobHydrate(company: string): Promise<void> {
  if (!IS_VERCEL || !TOKEN) return;

  // Fast-path: already hydrated this container instance
  if (hydratedCompanies.has(company)) return;

  try {
    const { blobs } = await list({
      prefix: `crm-db/${company}/`,
      token: TOKEN,
      limit: 100,
    });

    // Mark hydrated regardless — prevents repeated list calls even when Blob is empty
    hydratedCompanies.add(company);

    if (!blobs.length) return; // nothing saved yet — committed defaults will be used

    const dir = path.join(TMP_DATA, company);
    fs.mkdirSync(dir, { recursive: true });

    await Promise.all(
      blobs.map(async (blob) => {
        const filename = blob.pathname.split("/").pop();
        if (!filename) return;
        const dest = path.join(dir, filename);
        if (fs.existsSync(dest)) return; // already present from a previous write this container
        try {
          const res = await fetch(blob.url, { cache: "no-store" });
          if (!res.ok) return;
          const original = await res.text();

          // Fix broken /images/subdir/ paths that were seeded from committed defaults
          if (FILES_NEEDING_IMAGE_SANITIZE.has(filename)) {
            try {
              const parsed = JSON.parse(original);
              const fixed = fixBrokenImagePaths(parsed);
              const fixedText = JSON.stringify(fixed, null, 2);
              fs.writeFileSync(dest, fixedText, "utf-8");
              // Write clean version back to Blob so future cold starts skip the sanitizer work
              if (fixedText !== original) {
                put(`crm-db/${company}/${filename}`, fixedText, {
                  access: "public", contentType: "application/json",
                  addRandomSuffix: false, allowOverwrite: true, token: TOKEN!,
                }).catch(err => console.warn("[blob-db] sanitize write-back failed:", filename, err));
              }
              return;
            } catch {
              // JSON parse failed — fall through to write original
            }
          }

          fs.writeFileSync(dest, original, "utf-8");
        } catch (err) {
          console.error("[blob-db] failed to fetch blob:", filename, err);
        }
      })
    );
  } catch (err) {
    console.error("[blob-db] hydrate failed:", err);
  }
}
