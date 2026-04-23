import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer-session";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalize(value).toLowerCase();
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = normalizeEmail(body.email);
  const password = normalize(body.password);

  const customer = await prisma.customer.findFirst({
    where: {
      email,
      clientPortalEnabled: true,
    },
  });

  if (!customer || !verifyPassword(password, customer.portalPasswordHash)) {
    return Response.json({ ok: false, reason: "invalid_credentials" }, { status: 401 });
  }

  const token = createCustomerSessionToken({
    customerId: customer.id,
    email: customer.email || email,
    name: customer.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return Response.json({ ok: true });
}
