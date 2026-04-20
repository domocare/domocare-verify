import { prisma } from "@/lib/prisma";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readLogo(value: unknown) {
  const logoUrl = readText(value);

  if (!logoUrl) return null;
  if (logoUrl.length > 2_100_000) return "__INVALID__";
  if (logoUrl.startsWith("data:image/") || logoUrl.startsWith("https://") || logoUrl.startsWith("http://")) {
    return logoUrl;
  }

  return "__INVALID__";
}

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
  const logoUrl = readLogo(body.logoUrl);

  if (!name || logoUrl === "__INVALID__") {
    return Response.json({ ok: false }, { status: 400 });
  }

  const company = await prisma.company.upsert({
    where: { name },
    create: {
      name,
      logoUrl,
      address: readText(body.address),
      phone: readText(body.phone),
      email: readText(body.email),
      director: readText(body.director),
    },
    update: {
      logoUrl,
      address: readText(body.address),
      phone: readText(body.phone),
      email: readText(body.email),
      director: readText(body.director),
    },
  });

  return Response.json({ ok: true, company });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const logoUrl = readLogo(body.logoUrl);

  if (!id || !name || logoUrl === "__INVALID__") {
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
      data: {
        name,
        logoUrl,
        address: readText(body.address),
        phone: readText(body.phone),
        email: readText(body.email),
        director: readText(body.director),
      },
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
