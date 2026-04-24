import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-middleware";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function ensureWriteAccess(req: Request) {
  return requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
  ]);
}

export async function POST(req: Request) {
  const authError = await ensureWriteAccess(req);
  if (authError) return authError;

  const body = await req.json();
  const customerId = readText(body.customerId);
  const name = readText(body.name);

  if (!customerId || !name) {
    return Response.json({ ok: false, message: "Client et site obligatoires." }, { status: 400 });
  }

  const site = await prisma.customerSite.upsert({
    where: {
      customerId_name: {
        customerId,
        name,
      },
    },
    create: {
      customerId,
      name,
      address: readText(body.address),
      postalCode: readText(body.postalCode),
      city: readText(body.city),
      codeRequired: body.codeRequired === true,
      isActive: body.isActive !== false,
    },
    update: {
      address: readText(body.address),
      postalCode: readText(body.postalCode),
      city: readText(body.city),
      codeRequired: body.codeRequired === true,
      isActive: body.isActive !== false,
    },
  });

  return Response.json({ ok: true, site });
}

export async function PATCH(req: Request) {
  const authError = await ensureWriteAccess(req);
  if (authError) return authError;

  const body = await req.json();
  const id = readText(body.id);
  const name = readText(body.name);

  if (!id || !name) {
    return Response.json({ ok: false, message: "Champs manquants." }, { status: 400 });
  }

  const site = await prisma.customerSite.update({
    where: { id },
    data: {
      name,
      address: readText(body.address),
      postalCode: readText(body.postalCode),
      city: readText(body.city),
      codeRequired: body.codeRequired === true,
      isActive: body.isActive !== false,
    },
  });

  return Response.json({ ok: true, site });
}

export async function DELETE(req: Request) {
  const authError = await ensureWriteAccess(req);
  if (authError) return authError;

  const body = await req.json();
  const id = readText(body.id);

  if (!id) {
    return Response.json({ ok: false, message: "Identifiant manquant." }, { status: 400 });
  }

  const linkedEmployees = await prisma.employee.count({
    where: {
      customerSiteId: id,
    },
  });

  if (linkedEmployees > 0) {
    return Response.json(
      {
        ok: false,
        message:
          "Ce site est encore utilisé sur des collaborateurs. Modifiez les fiches avant suppression.",
      },
      { status: 409 },
    );
  }

  await prisma.customerSite.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}
