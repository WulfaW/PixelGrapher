import crypto from "crypto";

// Stateless login tokens: the user is sealed (AES-256-GCM) into the token itself, so a server
// restart does not log anyone out. shortcut: tokens can't be revoked server-side, they just
// expire (TTL); add a denylist if revocation is ever needed.
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const key = (): Buffer => {
  const secret = process.env.SESSION_SECRET || process.env.GITHUB_CLIENT_SECRET;
  if (!secret) throw new Error("SESSION_SECRET (or GITHUB_CLIENT_SECRET) must be set");
  return crypto.createHash("sha256").update(secret).digest();
};

export function sealUser(user: object, now = Date.now()): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify({ user, exp: now + TOKEN_TTL_MS })), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

/** Returns the user, or null for a forged, corrupted or expired token. */
export function unsealUser(token: string, now = Date.now()): any | null {
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const { user, exp } = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString());
    return exp > now ? user : null;
  } catch {
    return null;
  }
}
