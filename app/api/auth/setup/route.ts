import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalize(value).toLowerCase();
}

export async function POST(req: Request) {
  const existingUsers = await prisma.appUser.count({
    where: {
      passwordHash: {
        not: null,
      },
    },
  });

  if (existingUsers > 0) {
    return Response.json({ ok: false }, { status: 403 });
  }

  const body = await req.json();
  const email = normalizeEmail(body.email);
  const firstName = normalize(body.firstName);
  const lastName = normalize(body.lastName);
  const password = normalize(body.password);

  if (!email || !firstName || !lastName || password.length < 10) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const user = await prisma.appUser.upsert({
    where: { email },
    create: {
      email,
      firstName,
      lastName,
      role: "SUPER_ADMIN_GROUP",
      passwordHash: hashPassword(password),
      isActive: true,
    },
    update: {
      firstName,
      lastName,
      role: "SUPER_ADMIN_GROUP",
      passwordHash: hashPassword(password),
      isActive: true,
    },
  });

  const headersList = await headers();
  await prisma.loginLog.create({
    data: {
      userId: user.id,
      email,
      success: true,
      reason: "setup",
      ipAddress: headersList.get("x-forwarded-for"),
      userAgent: headersList.get("user-agent"),
    },
  });

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
