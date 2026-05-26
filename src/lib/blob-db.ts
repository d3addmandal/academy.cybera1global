/**
 * Vercel Blob-backed persistence for CRM JSON data.
 *
 * On Vercel, /tmp/ is per-container and ephemeral. This module:
 *   - blobWrite()  — called after every db write to persist data to Blob CDN
 *   - blobHydrate() — called on cold containers to pull Blob data into /tmp/
 *                     so subsequent synchronous file reads work correctly.
 */
import { put, list } from "@vercel/blob";
import fs from "fs";
import path from "path";

const IS_VERCEL = process.env.VERCEL === "1";
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const TMP_DATA = "/tmp/data";

/** Persist a JSON file to Vercel Blob (fire-and-forget safe). */
export async function blobWrite(company: string, filename: string, data: unknown): Promise<void> {
  if (!IS_VERCEL || !TOKEN) return;
  try {
    await put(`crm-db/${company}/${filename}`, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      token: TOKEN,
    });
  } catch (err) {
    console.error("[blob-db] write failed:", filename, err);
  }
}

/**
 * Hydrate /tmp/data/ from Vercel Blob on cold-start containers.
 * Skips if theme.json is already present (container is warm).
 * Only runs when VERCEL=1 and BLOB_READ_WRITE_TOKEN is set.
 */
export async function blobHydrate(company: string): Promise<void> {
  if (!IS_VERCEL || !TOKEN) return;

  // Fast-path: if theme.json already in /tmp/, this container is warm — skip.
  const themeCheck = path.join(TMP_DATA, company, "theme.json");
  if (fs.existsSync(themeCheck)) return;

  try {
    const { blobs } = await list({
      prefix: `crm-db/${company}/`,
      token: TOKEN,
      limit: 100,
    });

    if (!blobs.length) return; // nothing saved yet — keep committed defaults

    const dir = path.join(TMP_DATA, company);
    fs.mkdirSync(dir, { recursive: true });

    await Promise.all(
      blobs.map(async (blob) => {
        const filename = blob.pathname.split("/").pop();
        if (!filename) return;
        const dest = path.join(dir, filename);
        if (fs.existsSync(dest)) return; // already present
        try {
          const res = await fetch(blob.url, { cache: "no-store" });
          if (!res.ok) return;
          fs.writeFileSync(dest, await res.text(), "utf-8");
        } catch { /* non-fatal */ }
      })
    );
  } catch (err) {
    console.error("[blob-db] hydrate failed:", err);
  }
}
