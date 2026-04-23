import { prisma } from "@/lib/prisma";

export function normalizePortalEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function findCustomerPortalIdentityByEmail(email: string) {
  const normalizedEmail = normalizePortalEmail(email);
  if (!normalizedEmail) return null;

  const portalUser = await prisma.customerPortalUser.findUnique({
    where: { email: normalizedEmail },
    include: {
      customer: true,
    },
  });

  if (portalUser?.customer.clientPortalEnabled) {
    return {
      customer: portalUser.customer,
      portalUser,
      matchedOn: "portal_user" as const,
    };
  }

  const customer = await prisma.customer.findFirst({
    where: {
      email: normalizedEmail,
      clientPortalEnabled: true,
    },
  });

  if (!customer) return null;

  return {
    customer,
    portalUser: null,
    matchedOn: "customer" as const,
  };
}
