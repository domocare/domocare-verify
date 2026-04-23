import { getCustomerSessionFromRequest } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import {
  createCustomerCodesWorkbook,
  customerWorkbookToArrayBuffer,
} from "@/lib/customer-portal-excel";

export const runtime = "nodejs";

function formatDate(value: Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
}

function formatState(code: { isActive: boolean; usedAt: Date | null }) {
  if (code.usedAt) return "Utilisé";
  return code.isActive ? "Actif" : "Inactif";
}

export async function GET(req: Request) {
  const customerSession = await getCustomerSessionFromRequest(req);
  if (!customerSession?.portalCanViewCodes) {
    return Response.json({ ok: false }, { status: 403 });
  }

  const accessCodes = await prisma.customerAccessCode.findMany({
    where: { customerId: customerSession.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      site: {
        select: { name: true },
      },
    },
  });

  const workbook = createCustomerCodesWorkbook(
    accessCodes.map((code) => ({
      libelle: code.label,
      site: code.site?.name || "Tous les sites",
      terminaison: `****${code.codeLast4 || "----"}`,
      portee: code.siteId ? "Site ciblé" : "Tous les sites",
      usage: code.isOneTime ? "Usage unique" : "Réutilisable",
      etat: formatState(code),
      expiration: formatDate(code.expiresAt),
      utiliseLe: formatDate(code.usedAt),
      creeLe: formatDate(code.createdAt),
    })),
  );

  const body = await customerWorkbookToArrayBuffer(workbook);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="export-codes-client-final.xlsx"',
    },
  });
}
