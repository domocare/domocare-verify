import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-middleware";
import { sendCustomerPortalResetEmail } from "@/lib/customer-portal-invite";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
  const customerId = readText(body.customerId);

  if (!customerId) {
    return Response.json({ ok: false, message: "Client final introuvable." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      portalUsers: {
        where: { isActive: true },
        select: { email: true },
      },
    },
  });

  if (!customer || !customer.clientPortalEnabled) {
    return Response.json({ ok: false, message: "Le portail client final n'est pas activé." }, { status: 404 });
  }

  const recipients = Array.from(
    new Set(
      [customer.email, ...customer.portalUsers.map((user) => user.email)]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.trim().toLowerCase()),
    ),
  );

  if (recipients.length === 0) {
    return Response.json(
      { ok: false, message: "Aucun email de contact n'est disponible pour ce client final." },
      { status: 400 },
    );
  }

  const results = await Promise.all(
    recipients.map((email) =>
      sendCustomerPortalResetEmail({
        customerName: customer.name,
        email,
      }),
    ),
  );

  const delivered = results.filter((result) => result.ok).length;
  const skipped = results.every((result) => result.skipped);

  if (delivered === 0 && !skipped) {
    return Response.json(
      { ok: false, message: "Le mail de réinitialisation n'a pas pu être envoyé." },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    delivered,
    skipped,
    recipients,
  });
}
