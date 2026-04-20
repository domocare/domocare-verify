import { prisma } from "@/lib/prisma";

export async function GET() {
  const agencies = await prisma.agency.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return Response.json({ agencies });
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const agency = await prisma.agency.upsert({
    where: { name },
    create: { name },
    update: {},
  });

  return Response.json({ ok: true, agency });
}
