import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-middleware";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
    "READ_ONLY",
  ]);
  if (authError) return authError;

  const agencies = await prisma.agency.findMany({
    orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
    include: {
      company: true,
    },
  });

  return Response.json({ agencies });
}

export async function POST(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
  ]);
  if (authError) return authError;

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const companyId = typeof body.companyId === "string" && body.companyId ? body.companyId : null;

  if (!name || !companyId) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    return Response.json({ ok: false, message: "Societe introuvable." }, { status: 404 });
  }

  const agency = await prisma.agency.upsert({
    where: { name },
    create: {
      name,
      companyId,
      siret: readText(body.siret),
      address: readText(body.address),
      phone: readText(body.phone),
      email: readText(body.email),
      director: readText(body.director),
    },
    update: {
      companyId,
      siret: readText(body.siret),
      address: readText(body.address),
      phone: readText(body.phone),
      email: readText(body.email),
      director: readText(body.director),
    },
  });

  return Response.json({ ok: true, agency });
}

export async function PATCH(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
  ]);
  if (authError) return authError;

  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const companyId = typeof body.companyId === "string" && body.companyId ? body.companyId : null;

  if (!id || !name || !companyId) {
    return Response.json({ ok: false, message: "Champs manquants." }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    return Response.json({ ok: false, message: "Societe introuvable." }, { status: 404 });
  }

  const existing = await prisma.agency.findUnique({ where: { id } });

  if (!existing) {
    return Response.json({ ok: false, message: "Agence introuvable." }, { status: 404 });
  }

  const duplicate = await prisma.agency.findUnique({ where: { name } });

  if (duplicate && duplicate.id !== id) {
    return Response.json({ ok: false, message: "Cette agence existe deja." }, { status: 409 });
  }

  const [agency] = await prisma.$transaction([
    prisma.agency.update({
      where: { id },
      data: {
        name,
        companyId,
        siret: readText(body.siret),
        address: readText(body.address),
        phone: readText(body.phone),
        email: readText(body.email),
        director: readText(body.director),
      },
    }),
    prisma.employee.updateMany({
      where: { agency: existing.name },
      data: { agency: name },
    }),
    prisma.appUser.updateMany({
      where: { agency: existing.name },
      data: { agency: name },
    }),
  ]);

  return Response.json({ ok: true, agency });
}

export async function DELETE(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
  ]);
  if (authError) return authError;

  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";

  if (!id) {
    return Response.json({ ok: false, message: "Identifiant manquant." }, { status: 400 });
  }

  const agency = await prisma.agency.findUnique({ where: { id } });

  if (!agency) {
    return Response.json({ ok: false, message: "Agence introuvable." }, { status: 404 });
  }

  const usageCount = await prisma.employee.count({
    where: { agency: agency.name },
  });

  if (usageCount > 0) {
    return Response.json(
      {
        ok: false,
        message: `Suppression impossible : ${usageCount} collaborateur(s) utilisent cette agence.`,
      },
      { status: 409 },
    );
  }

  await prisma.agency.delete({ where: { id } });

  return Response.json({ ok: true });
}
