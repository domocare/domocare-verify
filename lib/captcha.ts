import crypto from "crypto";

type CaptchaPayload = {
  answerHash: string;
  exp: number;
  nonce: string;
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
  return crypto.createHmac("sha256", getSecret()).update(`captcha:${value}`).digest("base64url");
}

function hashAnswer(answer: string, nonce: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${answer.trim()}:${nonce}`)
    .digest("base64url");
}

function timingSafeEqualText(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createCaptchaChallenge() {
  const left = crypto.randomInt(2, 10);
  const right = crypto.randomInt(2, 10);
  const answer = String(left + right);
  const nonce = crypto.randomBytes(16).toString("base64url");
  const payload: CaptchaPayload = {
    answerHash: hashAnswer(answer, nonce),
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
    nonce,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));

  return {
    question: `${left} + ${right}`,
    token: `${encoded}.${sign(encoded)}`,
  };
}

export function verifyCaptchaToken(token?: string | null, answer?: string | null) {
  if (!token || !answer) return false;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expectedSignature = sign(encoded);
  if (!timingSafeEqualText(expectedSignature, signature)) return false;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as CaptchaPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;

    const expectedAnswer = hashAnswer(answer, payload.nonce);
    return timingSafeEqualText(expectedAnswer, payload.answerHash);
  } catch {
    return false;
  }
}
