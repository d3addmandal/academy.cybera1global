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
  "certificates.json", "certificate-templates.json",
]);

const IS_VERCEL = process.env.VERCEL === "1";
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const TMP_DATA = "/tmp/data";

// Bounds how long a warm container can serve a stale local copy before
// re-checking Blob. Below this, blobHydrate() is a cheap in-memory check;
// past it, one caller pays a fresh list() round-trip and everyone else in
// the window reuses that result. Without this, a container that hydrated
// once at cold start would NEVER see a later edit made on a different
// container until it's recycled — this is what caused images/content to
// look stale until a hard refresh (or a lucky routing to a fresher container).
const HYDRATE_TTL_MS = 30_000;

// Tolerates minor clock skew between this container and Blob's uploadedAt
// timestamps when deciding whether a freshly-listed blob is newer than the
// local file already on disk.
const CLOCK_SKEW_TOLERANCE_MS = 2_000;

// Tracks in-flight/completed hydration per company, plus when it started.
// Storing the Promise itself means concurrent calls join the same work instead of
// fast-pathing with a "done" flag that's set before downloads actually finish.
// Once startedAt is older than HYDRATE_TTL_MS, the next call re-hydrates instead
// of reusing the (now potentially stale) resolved promise forever.
const hydrationState = new Map<string, { promise: Promise<void>; startedAt: number }>();

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
 * Hydrate /tmp/data/ from Vercel Blob — on cold-start containers, and again
 * every HYDRATE_TTL_MS afterward so edits made on other containers become
 * visible here within a bounded window instead of never.
 *
 * The Promise is stored in the Map BEFORE any async work starts so that
 * concurrent calls (e.g. layout + page rendering in the same request wave)
 * all await the same in-flight download — no caller ever reads /tmp/ before
 * the files are actually written.
 */
export function blobHydrate(company: string): Promise<void> {
  if (!IS_VERCEL || !TOKEN) return Promise.resolve();

  const existing = hydrationState.get(company);
  if (existing && Date.now() - existing.startedAt < HYDRATE_TTL_MS) {
    return existing.promise;
  }

  const startedAt = Date.now();
  const promise = _doHydrate(company).catch((err) => {
    console.error("[blob-db] hydrate failed:", err);
    hydrationState.delete(company); // allow retry on the next request
  });
  hydrationState.set(company, { promise, startedAt });
  return promise;
}

async function _doHydrate(company: string): Promise<void> {
  const { blobs } = await list({
    prefix: `crm-db/${company}/`,
    token: TOKEN!,
    limit: 100,
  });

  if (!blobs.length) return; // nothing saved yet — committed defaults will be used

  const dir = path.join(TMP_DATA, company);
  fs.mkdirSync(dir, { recursive: true });

  await Promise.all(
    blobs.map(async (blob) => {
      const filename = blob.pathname.split("/").pop();
      if (!filename) return;
      const dest = path.join(dir, filename);
      if (fs.existsSync(dest)) {
        // Only refetch if Blob actually has something newer than our local copy —
        // this is what lets edits from other containers propagate, while the
        // clock-skew tolerance keeps a container's own very-recent write (whose
        // blobWrite() may not have landed yet) from being clobbered by a stale read.
        const localMtimeMs = fs.statSync(dest).mtimeMs;
        const blobUploadedMs = new Date(blob.uploadedAt).getTime();
        if (blobUploadedMs <= localMtimeMs + CLOCK_SKEW_TOLERANCE_MS) return;
      }
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
}
