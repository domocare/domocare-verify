import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
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

  if (!email || password.length < 10) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const customer = await prisma.customer.findFirst({
    where: {
      email,
      clientPortalEnabled: true,
    },
  });

  if (!customer) {
    return Response.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      portalPasswordHash: hashPassword(password),
    },
  });

  const token = createCustomerSessionToken({
    customerId: updatedCustomer.id,
    email: updatedCustomer.email || email,
    name: updatedCustomer.name,
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
