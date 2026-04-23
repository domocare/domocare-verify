import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
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

  const identity = await findCustomerPortalIdentityByEmail(email);
  if (!identity) {
    return Response.json({ ok: false, reason: "invalid_credentials" }, { status: 401 });
  }

  let sessionUser:
    | {
        id: string;
        email: string;
        name: string;
        isActive: boolean;
        passwordHash: string | null;
      }
    | null = identity.portalUser
    ? {
        id: identity.portalUser.id,
        email: identity.portalUser.email,
        name: identity.portalUser.name,
        isActive: identity.portalUser.isActive,
        passwordHash: identity.portalUser.passwordHash,
      }
    : null;

  if (sessionUser) {
    if (!sessionUser.isActive || !verifyPassword(password, sessionUser.passwordHash)) {
      return Response.json({ ok: false, reason: "invalid_credentials" }, { status: 401 });
    }
  } else if (verifyPassword(password, identity.customer.portalPasswordHash)) {
    sessionUser = await prisma.customerPortalUser.create({
      data: {
        customerId: identity.customer.id,
        email,
        name: identity.customer.name,
        passwordHash: identity.customer.portalPasswordHash,
        isOwner: true,
      },
    });
  } else {
    return Response.json({ ok: false, reason: "invalid_credentials" }, { status: 401 });
  }

  const token = createCustomerSessionToken({
    customerId: identity.customer.id,
    userId: sessionUser.id,
    email: sessionUser.email,
    name: identity.customer.name,
    userName: sessionUser.name,
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
