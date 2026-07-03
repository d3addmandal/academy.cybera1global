import os from "os";
import path from "path";

/**
 * CRM data and uploads live exclusively in Vercel Blob — in every environment,
 * including local dev. This is the single gate everything else imports instead
 * of re-deriving VERCEL/token checks per-file.
 */
export const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
export const HAS_BLOB = !!BLOB_TOKEN;

// Cross-platform local cache dir (was hardcoded "/tmp/data" — Linux/Vercel-only,
// doesn't exist on Windows local dev).
export const TMP_DATA_DIR = path.join(os.tmpdir(), "a1-academy-crm-data");

if (!HAS_BLOB) {
  console.error(
    "[env] BLOB_READ_WRITE_TOKEN is not set. CRM data reads/writes and uploads " +
    "will not work. Add it to .env.local (see .env.example) or your deployment's " +
    "environment variables."
  );
}
