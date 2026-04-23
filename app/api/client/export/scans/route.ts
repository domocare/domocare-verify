import { getCustomerSessionFromRequest } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import {
  createCustomerScansWorkbook,
  customerWorkbookToArrayBuffer,
} from "@/lib/customer-portal-excel";

export const runtime = "nodejs";

function formatResult(result: string) {
  if (result === "valid" || result === "valid_code") return "Validé";
  if (result === "expired" || result === "suspended") return "À vérifier";
  return "Refusé";
}

function formatAccessStatus(value: string | null) {
  switch (value) {
    case "not_required":
      return "QR suffisant";
    case "approved":
      return "Code validé";
    case "approved_one_time":
      return "Code usage unique validé";
    case "refused":
      return "Code refusé";
    case "qr_not_authorized":
      return "QR non autorisé";
    case "no_customer":
      return "Aucun client final";
    case "no_token":
      return "QR absent";
    default:
      return value || "-";
  }
}

export async function GET(req: Request) {
  const customerSession = await getCustomerSessionFromRequest(req);
  if (!customerSession?.portalCanViewScans) {
    return Response.json({ ok: false }, { status: 403 });
  }

  const scans = await prisma.scanLog.findMany({
    where: { customerId: customerSession.id },
    orderBy: { createdAt: "desc" },
    select: {
      token: true,
      result: true,
      accessCodeStatus: true,
      customerName: true,
      customerSiteName: true,
      locationLabel: true,
      createdAt: true,
    },
  });

  const workbook = createCustomerScansWorkbook(
    scans.map((scan) => ({
      token: scan.token,
      resultat: formatResult(scan.result),
      validation: formatAccessStatus(scan.accessCodeStatus),
      client: scan.customerName || customerSession.name,
      site: scan.customerSiteName || "Tous les sites",
      localisation: scan.locationLabel || "-",
      dateHeure: new Date(scan.createdAt).toLocaleString("fr-FR"),
    })),
  );

  const body = await customerWorkbookToArrayBuffer(workbook);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="export-scans-client-final.xlsx"',
    },
  });
}
