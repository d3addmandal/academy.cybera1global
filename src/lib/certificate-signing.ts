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
// cell can lose their real newlines — either turned into literal "\n" escape
// sequences, or fully collapsed onto one line. Both fail OpenSSL's PEM decoder
// with an opaque "DECODER routines::unsupported", so repair both cases before
// handing the value off: unescape literal "\n" first, then if the result still
// has no line breaks (fully collapsed), reconstruct proper PEM line-wrapping
// from the BEGIN/END markers.
function normalizePem(pem: string): string {
  let value = pem.trim().replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n");
  if (!value.includes("\n")) {
    const match = value.match(/-----BEGIN ([A-Z ]+)-----\s*([A-Za-z0-9+/=\s]+?)\s*-----END \1-----/);
    if (match) {
      const [, label, body] = match;
      const wrapped = body.replace(/\s+/g, "").match(/.{1,64}/g)?.join("\n") ?? body;
      value = `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----\n`;
    }
  }
  return value;
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
