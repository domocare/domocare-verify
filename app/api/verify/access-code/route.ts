import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readHeaderNumber(headersList: Headers, key: string) {
  const value = headersList.get(key);
  if (!value) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function readHeaderText(headersList: Headers, key: string) {
  const value = headersList.get(key);
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function buildLocationLabel(headersList: Headers) {
  const city = readHeaderText(headersList, "x-vercel-ip-city");
  const region = readHeaderText(headersList, "x-vercel-ip-country-region");
  const country = readHeaderText(headersList, "x-vercel-ip-country");

  return [city, region, country].filter(Boolean).join(", ") || null;
}

async function logScan({
  req,
  token,
  result,
  company,
  customerId,
  customerName,
  customerSiteId,
  customerSiteName,
  accessCodeStatus,
}: {
  req: Request;
  token: string;
  result: string;
  company?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerSiteId?: string | null;
  customerSiteName?: string | null;
  accessCodeStatus?: string | null;
}) {
  const headersList = req.headers;
  const latitude = readHeaderNumber(headersList, "x-vercel-ip-latitude");
  const longitude = readHeaderNumber(headersList, "x-vercel-ip-longitude");
  const locationLabel = buildLocationLabel(headersList);
  const hasLocation = Boolean(locationLabel) || (latitude !== null && longitude !== null);

  return prisma.scanLog.create({
    data: {
      token,
      result,
      company: company || null,
      customerId: customerId || null,
      customerName: customerName || null,
      customerSiteId: customerSiteId || null,
      customerSiteName: customerSiteName || null,
      accessCodeStatus: accessCodeStatus || null,
      latitude,
      longitude,
      locationLabel,
      locationSource: hasLocation ? "ip" : null,
      locationCapturedAt: hasLocation ? new Date() : null,
      ipAddress: headersList.get("x-forwarded-for"),
      userAgent: headersList.get("user-agent"),
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const token = normalize(body.token);
  const code = normalize(body.code);

  if (!token || !/^\d{6,8}$/.test(code)) {
    return Response.json({ ok: false, message: "Code invalide." }, { status: 400 });
  }

  const employee = await prisma.employee.findFirst({
    where: {
      qrToken: { token },
    },
    include: {
      qrToken: true,
      authorization: true,
      customer: true,
      customerSite: true,
    },
  });

  if (!employee || !employee.qrToken) {
    const scan = await logScan({ req, token, result: "invalid", accessCodeStatus: "no_token" });
    return Response.json({ ok: false, scanId: scan.id, message: "QR code non reconnu." }, { status: 404 });
  }

  const isExpiredByDate = !!employee.qrToken.expiresAt && new Date(employee.qrToken.expiresAt) < new Date();
  const isRevoked =
    employee.qrToken.isActive === false ||
    !!employee.qrToken.revokedAt ||
    employee.authorization?.status === "revoked" ||
    employee.authorization?.status === "suspended";
  const isExpired = isExpiredByDate || employee.authorization?.status === "expired";

  if (isRevoked || isExpired) {
    const scan = await logScan({
      req,
      token,
      result: isRevoked ? "suspended" : "expired",
      company: employee.company,
      customerId: employee.customerId,
      customerName: employee.customer?.name,
      customerSiteId: employee.customerSiteId,
      customerSiteName: employee.customerSite?.name,
      accessCodeStatus: "qr_not_authorized",
    });

    return Response.json({ ok: false, scanId: scan.id, message: "Habilitation non valide." }, { status: 403 });
  }

  if (!employee.customer?.accessCodeEnabled && !employee.customerSite?.codeRequired) {
    const scan = await logScan({
      req,
      token,
      result: "valid",
      company: employee.company,
      customerId: employee.customerId,
      customerName: employee.customer?.name,
      customerSiteId: employee.customerSiteId,
      customerSiteName: employee.customerSite?.name,
      accessCodeStatus: "not_required",
    });

    return Response.json({ ok: true, scanId: scan.id, message: "Accès validé." });
  }

  if (!employee.customerId) {
    const scan = await logScan({
      req,
      token,
      result: "invalid_code",
      company: employee.company,
      accessCodeStatus: "no_customer",
    });

    return Response.json({ ok: false, scanId: scan.id, message: "Aucun client autorisé sur cette fiche." }, { status: 403 });
  }

  const now = new Date();
  const codes = await prisma.customerAccessCode.findMany({
    where: {
      customerId: employee.customerId,
      isActive: true,
      usedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
  });

  const matchingCode = codes.find((accessCode) => {
    const matchesScope =
      !accessCode.siteId ||
      (employee.customerSiteId && accessCode.siteId === employee.customerSiteId);

    return matchesScope && verifyPassword(code, accessCode.codeHash);
  });

  if (!matchingCode) {
    const scan = await logScan({
      req,
      token,
      result: "invalid_code",
      company: employee.company,
      customerId: employee.customerId,
      customerName: employee.customer?.name,
      customerSiteId: employee.customerSiteId,
      customerSiteName: employee.customerSite?.name,
      accessCodeStatus: "refused",
    });

    return Response.json({ ok: false, scanId: scan.id, message: "Code refusé ou site non autorisé." }, { status: 403 });
  }

  if (matchingCode.isOneTime) {
    await prisma.customerAccessCode.update({
      where: { id: matchingCode.id },
      data: {
        usedAt: now,
        isActive: false,
      },
    });
  }

  const scan = await logScan({
    req,
    token,
    result: "valid_code",
    company: employee.company,
    customerId: employee.customerId,
    customerName: employee.customer?.name,
    customerSiteId: employee.customerSiteId,
    customerSiteName: employee.customerSite?.name,
    accessCodeStatus: matchingCode.isOneTime ? "approved_one_time" : "approved",
  });

  return Response.json({ ok: true, scanId: scan.id, message: "Accès validé par QR code et code client." });
}
