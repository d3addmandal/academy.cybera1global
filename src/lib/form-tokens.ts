import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.FORM_TOKEN_SECRET ?? "dev-secret-change-in-prod";
const TTL_MS = 15 * 60_000; // 15 minutes

// In-memory set of consumed tokens. Cleared on cold starts — acceptable tradeoff
// for serverless; the HMAC signature prevents forged tokens regardless.
const usedTokens = new Set<string>();
setInterval(() => usedTokens.clear(), TTL_MS).unref?.();

export function generateFormToken(): string {
  const rand = randomBytes(16).toString("hex");
  const ts = Date.now().toString(36);
  const payload = `${ts}.${rand}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 24);
  return `${payload}.${sig}`;
}

export function consumeFormToken(token: string): { valid: boolean; reason?: string } {
  if (!token || typeof token !== "string") return { valid: false, reason: "missing" };

  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };

  const [ts, rand, sig] = parts;
  const payload = `${ts}.${rand}`;
  const expectedSig = createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 24);

  // Constant-time comparison to prevent timing attacks
  if (sig.length !== expectedSig.length || !timingSafeEqual(sig, expectedSig)) {
    return { valid: false, reason: "invalid" };
  }

  const tokenTime = parseInt(ts, 36);
  if (isNaN(tokenTime) || Date.now() - tokenTime > TTL_MS) {
    return { valid: false, reason: "expired" };
  }

  if (usedTokens.has(token)) return { valid: false, reason: "used" };
  usedTokens.add(token);

  return { valid: true };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
