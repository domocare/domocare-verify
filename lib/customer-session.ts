import crypto from "crypto";

export const CUSTOMER_SESSION_COOKIE = "domocare_customer_session";

export type CustomerSessionPayload = {
  customerId: string;
  userId?: string;
  email: string;
  name: string;
  userName?: string;
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || "development-only-domocare-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createCustomerSessionToken(payload: Omit<CustomerSessionPayload, "exp">) {
  const session: CustomerSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  };

  const encoded = base64UrlEncode(JSON.stringify(session));
  return `${encoded}.${sign(encoded)}`;
}

export function verifyCustomerSessionToken(token?: string | null) {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as CustomerSessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
