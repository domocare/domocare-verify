import { prisma } from "@/lib/prisma";

const ROLES = new Set([
  "SUPER_ADMIN_GROUP",
  "SECURITY_ADMIN",
  "AUDITOR",
  "AGENCY_ADMIN",
  "ADMIN_ASSISTANT",
  "HR_OPERATIONS",
  "OPERATIONAL_MANAGER",
  "READ_ONLY",
]);

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const users = await prisma.appUser.findMany({
    orderBy: [
      { isActive: "desc" },
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });

  return Response.json({ users });
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = normalizeEmail(body.email);
  const firstName = normalizeText(body.firstName);
  const lastName = normalizeText(body.lastName);
  const role = normalizeText(body.role);
  const company = normalizeText(body.company);
  const agency = normalizeText(body.agency);

  if (!email || !firstName || !lastName || !ROLES.has(role)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const user = await prisma.appUser.upsert({
    where: { email },
    create: {
      email,
      firstName,
      lastName,
      role,
      company: company || null,
      agency: agency || null,
      isActive: true,
    },
    update: {
      firstName,
      lastName,
      role,
      company: company || null,
      agency: agency || null,
      isActive: true,
    },
  });

  return Response.json({ ok: true, user });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const id = normalizeText(body.id);

  if (!id || typeof body.isActive !== "boolean") {
    return Response.json({ ok: false }, { status: 400 });
  }

  const user = await prisma.appUser.update({
    where: { id },
    data: {
      isActive: body.isActive,
    },
  });

  return Response.json({ ok: true, user });
}
