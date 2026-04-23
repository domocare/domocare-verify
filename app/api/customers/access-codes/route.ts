import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireRole } from "@/lib/auth-middleware";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readCode(value: unknown) {
  const code = readText(value);
  return code && /^\d{6,8}$/.test(code) ? code : null;
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
  const siteId = readText(body.siteId);
  const label = readText(body.label) || "Code d'accès";
  const code = readCode(body.code);
  const scope = siteId ? "site" : "customer";

  if (!customerId || !code) {
    return Response.json(
      { ok: false, message: "Client et code de 6 à 8 chiffres obligatoires." },
      { status: 400 },
    );
  }

  if (siteId) {
    const site = await prisma.customerSite.findFirst({
      where: {
        id: siteId,
        customerId,
      },
    });

    if (!site) {
      return Response.json({ ok: false, message: "Site introuvable." }, { status: 404 });
    }
  }

  const accessCode = await prisma.customerAccessCode.create({
    data: {
      customerId,
      siteId,
      label,
      codeHash: hashPassword(code),
      codeLast4: code.slice(-4),
      scope,
      isOneTime: body.isOneTime === true,
      isActive: body.isActive !== false,
      expiresAt: readText(body.expiresAt) ? new Date(`${readText(body.expiresAt)}T23:59:59.999Z`) : null,
    },
    select: {
      id: true,
      siteId: true,
      label: true,
      codeLast4: true,
      scope: true,
      isOneTime: true,
      isActive: true,
      expiresAt: true,
      usedAt: true,
      createdAt: true,
    },
  });

  return Response.json({ ok: true, accessCode });
}

export async function PATCH(req: Request) {
  const authError = await ensureWriteAccess(req);
  if (authError) return authError;

  const body = await req.json();
  const id = readText(body.id);

  if (!id) {
    return Response.json({ ok: false, message: "Identifiant manquant." }, { status: 400 });
  }

  const accessCode = await prisma.customerAccessCode.update({
    where: { id },
    data: {
      isActive: body.isActive === true,
    },
    select: {
      id: true,
      siteId: true,
      label: true,
      codeLast4: true,
      scope: true,
      isOneTime: true,
      isActive: true,
      expiresAt: true,
      usedAt: true,
      createdAt: true,
    },
  });

  return Response.json({ ok: true, accessCode });
}
