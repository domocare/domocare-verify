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

export async function PATCH(req: Request) {
  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!id || !name) {
    return Response.json({ ok: false, message: "Champs manquants." }, { status: 400 });
  }

  const existing = await prisma.company.findUnique({ where: { id } });

  if (!existing) {
    return Response.json({ ok: false, message: "Societe introuvable." }, { status: 404 });
  }

  const duplicate = await prisma.company.findUnique({ where: { name } });

  if (duplicate && duplicate.id !== id) {
    return Response.json({ ok: false, message: "Cette societe existe deja." }, { status: 409 });
  }

  const [company] = await prisma.$transaction([
    prisma.company.update({
      where: { id },
      data: { name },
    }),
    prisma.employee.updateMany({
      where: { company: existing.name },
      data: { company: name },
    }),
    prisma.appUser.updateMany({
      where: { company: existing.name },
      data: { company: name },
    }),
    prisma.scanLog.updateMany({
      where: { company: existing.name },
      data: { company: name },
    }),
  ]);

  return Response.json({ ok: true, company });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";

  if (!id) {
    return Response.json({ ok: false, message: "Identifiant manquant." }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id } });

  if (!company) {
    return Response.json({ ok: false, message: "Societe introuvable." }, { status: 404 });
  }

  const usageCount = await prisma.employee.count({
    where: { company: company.name },
  });

  if (usageCount > 0) {
    return Response.json(
      {
        ok: false,
        message: `Suppression impossible : ${usageCount} collaborateur(s) utilisent cette societe.`,
      },
      { status: 409 },
    );
  }

  await prisma.company.delete({ where: { id } });

  return Response.json({ ok: true });
}
