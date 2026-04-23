import { prisma } from "@/lib/prisma";
import { normalizePortalEmail } from "@/lib/customer-portal";

export async function POST(req: Request) {
  const body = await req.json();
  const email = normalizePortalEmail(body.email);

  if (!email) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const portalUser = await prisma.customerPortalUser.findUnique({
    where: { email },
    select: {
      customer: {
        select: {
          name: true,
          email: true,
          logoUrl: true,
          brandColor: true,
          city: true,
          activity: true,
          clientPortalEnabled: true,
        },
      },
    },
  });

  const customer = portalUser?.customer?.clientPortalEnabled
    ? portalUser.customer
    : await prisma.customer.findFirst({
        where: {
          email,
          clientPortalEnabled: true,
        },
        select: {
          name: true,
          email: true,
          logoUrl: true,
          brandColor: true,
          city: true,
          activity: true,
        },
      });

  if (!customer) {
    return Response.json({ ok: false }, { status: 404 });
  }

  return Response.json({ ok: true, customer });
}
