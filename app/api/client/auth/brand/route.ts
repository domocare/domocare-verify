import { prisma } from "@/lib/prisma";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = normalizeEmail(body.email);

  if (!email) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const customer = await prisma.customer.findFirst({
    where: {
      email,
      clientPortalEnabled: true,
    },
    select: {
      name: true,
      email: true,
      logoUrl: true,
      brandColor: true,
    },
  });

  if (!customer) {
    return Response.json({ ok: false }, { status: 404 });
  }

  return Response.json({ ok: true, customer });
}
