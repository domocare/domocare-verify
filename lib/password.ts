import crypto from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) return false;

  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) return false;

  const candidate = crypto.scryptSync(password, salt, KEY_LENGTH);
  const original = Buffer.from(hash, "hex");

  if (candidate.length !== original.length) return false;

  return crypto.timingSafeEqual(candidate, original);
}
