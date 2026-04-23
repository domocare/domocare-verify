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
    "HR_OPERATIONS",
    "READ_ONLY",
  ]);
  if (authError) return authError;

  const interventionTypes = await prisma.interventionType.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return Response.json({ interventionTypes });
}

export async function POST(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
  ]);
  if (authError) return authError;

  const body = await req.json();
  const name = readText(body.name);

  if (!name) {
    return Response.json({ ok: false, message: "Nom obligatoire." }, { status: 400 });
  }

  const interventionType = await prisma.interventionType.upsert({
    where: { name },
    create: {
      name,
      description: readText(body.description),
      isActive: body.isActive !== false,
    },
    update: {
      description: readText(body.description),
      isActive: body.isActive !== false,
    },
  });

  return Response.json({ ok: true, interventionType });
}

export async function PATCH(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
  ]);
  if (authError) return authError;

  const body = await req.json();
  const id = readText(body.id);
  const name = readText(body.name);

  if (!id || !name) {
    return Response.json({ ok: false, message: "Champs manquants." }, { status: 400 });
  }

  const duplicate = await prisma.interventionType.findUnique({ where: { name } });

  if (duplicate && duplicate.id !== id) {
    return Response.json({ ok: false, message: "Ce type existe déjà." }, { status: 409 });
  }

  const interventionType = await prisma.interventionType.update({
    where: { id },
    data: {
      name,
      description: readText(body.description),
      isActive: body.isActive !== false,
    },
  });

  return Response.json({ ok: true, interventionType });
}

export async function DELETE(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
  ]);
  if (authError) return authError;

  const body = await req.json();
  const id = readText(body.id);

  if (!id) {
    return Response.json({ ok: false, message: "Identifiant manquant." }, { status: 400 });
  }

  const linkedEmployees = await prisma.employee.count({
    where: {
      interventionTypeId: id,
    },
  });

  if (linkedEmployees > 0) {
    return Response.json(
      {
        ok: false,
        message: "Ce type d'intervention est utilisé sur des collaborateurs. Désactivez-le ou modifiez les fiches avant suppression.",
      },
      { status: 409 },
    );
  }

  await prisma.interventionType.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}
