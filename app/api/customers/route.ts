import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-middleware";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function ensureReadAccess(req: Request) {
  return requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
    "HR_OPERATIONS",
    "READ_ONLY",
  ]);
}

async function ensureWriteAccess(req: Request) {
  return requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
  ]);
}

export async function GET(req: Request) {
  const authError = await ensureReadAccess(req);
  if (authError) return authError;

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      sites: {
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
      },
    },
  });

  return Response.json({ customers });
}

export async function POST(req: Request) {
  const authError = await ensureWriteAccess(req);
  if (authError) return authError;

  const body = await req.json();
  const name = readText(body.name);

  if (!name) {
    return Response.json({ ok: false, message: "Nom client obligatoire." }, { status: 400 });
  }

  const customer = await prisma.customer.upsert({
    where: { name },
    create: {
      name,
      email: readText(body.email),
      logoUrl: readText(body.logoUrl),
      brandColor: readText(body.brandColor),
      siret: readText(body.siret),
      address: readText(body.address),
      postalCode: readText(body.postalCode),
      city: readText(body.city),
      activity: readText(body.activity),
      accessCodeEnabled: body.accessCodeEnabled === true,
      clientPortalEnabled: body.clientPortalEnabled === true,
      portalCanViewCodes: body.portalCanViewCodes !== false,
      portalCanViewSites: body.portalCanViewSites !== false,
      portalCanViewScans: body.portalCanViewScans !== false,
    },
    update: {
      siret: readText(body.siret),
      email: readText(body.email),
      logoUrl: readText(body.logoUrl),
      brandColor: readText(body.brandColor),
      address: readText(body.address),
      postalCode: readText(body.postalCode),
      city: readText(body.city),
      activity: readText(body.activity),
      accessCodeEnabled: body.accessCodeEnabled === true,
      clientPortalEnabled: body.clientPortalEnabled === true,
      portalCanViewCodes: body.portalCanViewCodes !== false,
      portalCanViewSites: body.portalCanViewSites !== false,
      portalCanViewScans: body.portalCanViewScans !== false,
    },
  });

  return Response.json({ ok: true, customer });
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

  const duplicate = await prisma.customer.findUnique({ where: { name } });

  if (duplicate && duplicate.id !== id) {
    return Response.json({ ok: false, message: "Ce client existe déjà." }, { status: 409 });
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name,
      email: readText(body.email),
      logoUrl: readText(body.logoUrl),
      brandColor: readText(body.brandColor),
      siret: readText(body.siret),
      address: readText(body.address),
      postalCode: readText(body.postalCode),
      city: readText(body.city),
      activity: readText(body.activity),
      accessCodeEnabled: body.accessCodeEnabled === true,
      clientPortalEnabled: body.clientPortalEnabled === true,
      portalCanViewCodes: body.portalCanViewCodes !== false,
      portalCanViewSites: body.portalCanViewSites !== false,
      portalCanViewScans: body.portalCanViewScans !== false,
    },
  });

  return Response.json({ ok: true, customer });
}
