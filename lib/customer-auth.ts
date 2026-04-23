import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerSessionToken,
} from "@/lib/customer-session";

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CUSTOMER_SESSION_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.slice(CUSTOMER_SESSION_COOKIE.length + 1)) : null;
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const session = verifyCustomerSessionToken(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!session) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      sites: {
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
      },
    },
  });

  if (!customer || !customer.clientPortalEnabled) return null;
  return customer;
}

export async function getCustomerSessionFromRequest(request: Request) {
  const session = verifyCustomerSessionToken(parseCookieHeader(request.headers.get("cookie")));
  if (!session) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
  });

  if (!customer || !customer.clientPortalEnabled) return null;
  return customer;
}
