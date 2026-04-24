import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-middleware";
import { sendCustomerPortalInviteEmail } from "@/lib/customer-portal-invite";

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

async function maybeSendPortalInvite({
  previousEmail,
  nextEmail,
  previousPortalEnabled,
  nextPortalEnabled,
  customerName,
}: {
  previousEmail?: string | null;
  nextEmail?: string | null;
  previousPortalEnabled?: boolean;
  nextPortalEnabled: boolean;
  customerName: string;
}) {
  if (!nextPortalEnabled || !nextEmail) return;

  const normalizedPreviousEmail = previousEmail?.trim().toLowerCase() || null;
  const normalizedNextEmail = nextEmail.trim().toLowerCase();
  const portalWasActivated = previousPortalEnabled !== true && nextPortalEnabled === true;
  const emailChanged = normalizedPreviousEmail !== normalizedNextEmail;

  if (!portalWasActivated && !emailChanged) return;

  await sendCustomerPortalInviteEmail({
    customerName,
    email: normalizedNextEmail,
  });
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
      portalUsers: {
        orderBy: [{ isOwner: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          isOwner: true,
          isActive: true,
        },
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
      portalCanManageUsers: body.portalCanManageUsers !== false,
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
      portalCanManageUsers: body.portalCanManageUsers !== false,
    },
  });

  await maybeSendPortalInvite({
    nextEmail: customer.email,
    nextPortalEnabled: customer.clientPortalEnabled,
    customerName: customer.name,
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

  const previousCustomer = await prisma.customer.findUnique({
    where: { id },
    select: {
      email: true,
      clientPortalEnabled: true,
    },
  });

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
      portalCanManageUsers: body.portalCanManageUsers !== false,
    },
  });

  await maybeSendPortalInvite({
    previousEmail: previousCustomer?.email,
    nextEmail: customer.email,
    previousPortalEnabled: previousCustomer?.clientPortalEnabled,
    nextPortalEnabled: customer.clientPortalEnabled,
    customerName: customer.name,
  });

  return Response.json({ ok: true, customer });
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
      customerId: id,
    },
  });

  if (linkedEmployees > 0) {
    return Response.json(
      {
        ok: false,
        message:
          "Ce client final est encore utilisé sur des collaborateurs. Modifiez les fiches avant suppression.",
      },
      { status: 409 },
    );
  }

  await prisma.customer.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}
