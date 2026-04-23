import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyCaptchaToken } from "@/lib/captcha";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalize(value).toLowerCase();
}

async function logAttempt({
  userId,
  email,
  success,
  reason,
}: {
  userId?: string;
  email: string;
  success: boolean;
  reason?: string;
}) {
  const headersList = await headers();

  await prisma.loginLog.create({
    data: {
      userId,
      email,
      success,
      reason,
      ipAddress: headersList.get("x-forwarded-for"),
      userAgent: headersList.get("user-agent"),
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = normalizeEmail(body.email);
  const password = normalize(body.password);
  const captchaAnswer = normalize(body.captchaAnswer);
  const captchaToken = normalize(body.captchaToken);

  if (!verifyCaptchaToken(captchaToken, captchaAnswer)) {
    await logAttempt({ email, success: false, reason: "invalid_captcha" });
    return Response.json({ ok: false, reason: "invalid_captcha" }, { status: 401 });
  }

  const user = await prisma.appUser.findUnique({
    where: { email },
  });

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    await logAttempt({ userId: user?.id, email, success: false, reason: "invalid_credentials" });
    return Response.json({ ok: false, reason: "invalid_credentials" }, { status: 401 });
  }

  await logAttempt({ userId: user.id, email, success: true });

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: `${user.firstName} ${user.lastName}`,
    company: user.company,
    agency: user.agency,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return Response.json({ ok: true });
}
