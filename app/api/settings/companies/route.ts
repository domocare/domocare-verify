import { prisma } from "@/lib/prisma";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return Response.json({ companies });
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const company = await prisma.company.upsert({
    where: { name },
    create: { name },
    update: {},
  });

  return Response.json({ ok: true, company });
}
