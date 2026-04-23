import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  findCustomerPortalIdentityByEmail,
  normalizePortalEmail,
} from "@/lib/customer-portal";
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer-session";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = normalizePortalEmail(body.email);
  const password = normalize(body.password);

  if (!email || password.length < 10) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const identity = await findCustomerPortalIdentityByEmail(email);
  if (!identity) {
    return Response.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  const nextPasswordHash = hashPassword(password);
  const updatedCustomer = await prisma.customer.update({
    where: { id: identity.customer.id },
    data: {
      portalPasswordHash: nextPasswordHash,
    },
  });

  const portalUser = identity.portalUser
    ? await prisma.customerPortalUser.update({
        where: { id: identity.portalUser.id },
        data: {
          passwordHash: nextPasswordHash,
          isActive: true,
        },
      })
    : await prisma.customerPortalUser.create({
        data: {
          customerId: identity.customer.id,
          email,
          name: identity.customer.name,
          passwordHash: nextPasswordHash,
          isOwner: true,
          isActive: true,
        },
      });

  const token = createCustomerSessionToken({
    customerId: updatedCustomer.id,
    userId: portalUser.id,
    email: portalUser.email,
    name: updatedCustomer.name,
    userName: portalUser.name,
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
