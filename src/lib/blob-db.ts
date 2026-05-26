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
          fs.writeFileSync(dest, await res.text(), "utf-8");
        } catch (err) {
          console.error("[blob-db] failed to fetch blob:", filename, err);
        }
      })
    );
  } catch (err) {
    console.error("[blob-db] hydrate failed:", err);
  }
}
