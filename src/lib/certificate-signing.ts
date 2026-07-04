import crypto, { type KeyObject } from "crypto";

/**
 * Signs the certificate's canonical DATA (not the client-rendered PDF bytes —
 * those aren't byte-stable, and the verification page/signature-on-record is
 * the actual tamper-evidence mechanism, not the PDF file itself).
 *
 * Deliberately excludes `status` from the signed payload: signing only the
 * immutable issuance facts means a later revoke/suspend/expire doesn't
 * invalidate what "signed" means — the audit log covers status history.
 */

let _privateKey: KeyObject | null = null;
let _publicKey: KeyObject | null = null;
let _warnedMissingKeys = false;

// Env vars pasted via a dashboard textarea, a CLI, or copied out of a table/markdown
// cell can lose their real newlines in all sorts of partial ways — literal "\n" escape
// sequences, fully collapsed onto one line, or just the newline right after BEGIN/before
// END eaten while the body keeps its own. OpenSSL's PEM decoder has zero tolerance for any
// of these and fails with an opaque "DECODER routines::unsupported", so rather than special-
// casing each corruption shape, always locate the BEGIN/END markers and rebuild the PEM's
// line-wrapping from scratch — this is a no-op on an already-correct PEM and repairs every
// partial-newline-loss variant in one pass.
function normalizePem(pem: string): string {
  const cleaned = pem.trim().replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n").replace(/\\r/g, "");
  const match = cleaned.match(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/);
  if (!match) return cleaned;
  const [, label, rawBody] = match;
  const wrapped = rawBody.replace(/\s+/g, "").match(/.{1,64}/g)?.join("\n") ?? rawBody;
  return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----\n`;
}

function loadKeys(): { privateKey: KeyObject; publicKey: KeyObject } {
  if (_privateKey && _publicKey) return { privateKey: _privateKey, publicKey: _publicKey };

  const privatePem = process.env.CERT_SIGNING_PRIVATE_KEY;
  const publicPem = process.env.CERT_SIGNING_PUBLIC_KEY;

  if (privatePem && publicPem) {
    try {
      _privateKey = crypto.createPrivateKey(normalizePem(privatePem));
      _publicKey = crypto.createPublicKey(normalizePem(publicPem));
    } catch (err) {
      throw new Error(
        "[certificate-signing] Failed to parse CERT_SIGNING_PRIVATE_KEY/CERT_SIGNING_PUBLIC_KEY. " +
        "This usually means the PEM value lost its line breaks when it was pasted (e.g. copied out of a " +
        "table or a UI that collapsed newlines). Re-copy the key exactly as generated, including the " +
        "-----BEGIN/END----- lines on their own lines. Original error: " + (err instanceof Error ? err.message : String(err))
      );
    }
    return { privateKey: _privateKey, publicKey: _publicKey };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[certificate-signing] CERT_SIGNING_PRIVATE_KEY/CERT_SIGNING_PUBLIC_KEY are not set. " +
      "Generate a keypair (see .env.example) and add both to Vercel → Settings → Environment Variables."
    );
  }

  if (!_warnedMissingKeys) {
    console.warn(
      "[certificate-signing] No signing keys configured — using an ephemeral dev-only keypair. " +
      "Signatures generated this session will NOT verify after a restart. Never deploy without real keys."
    );
    _warnedMissingKeys = true;
  }
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  _privateKey = privateKey;
  _publicKey = publicKey;
  return { privateKey: _privateKey, publicKey: _publicKey };
}

export function buildCanonicalString(cert: {
  certificateNumber: string;
  studentName: string;
  courseName: string;
  issueDate: string;
}): string {
  return [cert.certificateNumber, cert.studentName, cert.courseName, cert.issueDate].join("|");
}

export function signCertificateData(data: string): string {
  const { privateKey } = loadKeys();
  return crypto.sign(null, Buffer.from(data, "utf8"), privateKey).toString("base64");
}

export function verifyCertificateSignature(data: string, signatureBase64: string): boolean {
  try {
    const { publicKey } = loadKeys();
    return crypto.verify(null, Buffer.from(data, "utf8"), publicKey, Buffer.from(signatureBase64, "base64"));
  } catch {
    return false;
  }
}
