import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getCustomerSessionFromRequest } from "@/lib/customer-auth";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readEmail(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

async function requireManager(req: Request) {
  const customerSession = await getCustomerSessionFromRequest(req);
  if (!customerSession?.portalCanManageUsers || !customerSession.portalUser.isOwner) {
    return { customerSession: null, response: Response.json({ ok: false }, { status: 403 }) };
  }

  return { customerSession, response: null };
}

export async function GET(req: Request) {
  const { customerSession, response } = await requireManager(req);
  if (!customerSession) return response;

  const users = await prisma.customerPortalUser.findMany({
    where: { customerId: customerSession.id },
    orderBy: [{ isOwner: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      isOwner: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ ok: true, users });
}

export async function POST(req: Request) {
  const { customerSession, response } = await requireManager(req);
  if (!customerSession) return response;

  const body = await req.json();
  const name = readText(body.name);
  const email = readEmail(body.email);
  const password = readText(body.password);

  if (!name || !email || !password || password.length < 10) {
    return Response.json({ ok: false, message: "Nom, email et mot de passe de 10 caractères minimum requis." }, { status: 400 });
  }

  const existing = await prisma.customerPortalUser.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ ok: false, message: "Cet email existe déjà." }, { status: 409 });
  }

  const user = await prisma.customerPortalUser.create({
    data: {
      customerId: customerSession.id,
      name,
      email,
      passwordHash: hashPassword(password),
      isOwner: body.isOwner === true,
      isActive: body.isActive !== false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isOwner: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ ok: true, user });
}

export async function PATCH(req: Request) {
  const { customerSession, response } = await requireManager(req);
  if (!customerSession) return response;

  const body = await req.json();
  const id = readText(body.id);
  const name = readText(body.name);
  const password = readText(body.password);

  if (!id) {
    return Response.json({ ok: false, message: "Identifiant manquant." }, { status: 400 });
  }

  const existing = await prisma.customerPortalUser.findFirst({
    where: {
      id,
      customerId: customerSession.id,
    },
  });

  if (!existing) {
    return Response.json({ ok: false }, { status: 404 });
  }

  if (existing.id === customerSession.portalUser.id && body.isActive === false) {
    return Response.json({ ok: false, message: "Vous ne pouvez pas désactiver votre propre compte." }, { status: 400 });
  }

  const user = await prisma.customerPortalUser.update({
    where: { id },
    data: {
      name: name || existing.name,
      isOwner: body.isOwner === true,
      isActive: body.isActive !== false,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      isOwner: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ ok: true, user });
}
