import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-middleware";
import { getAccessContextFromRequest } from "@/lib/access-control";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function splitAgencyNames(value: unknown) {
  return typeof value === "string"
    ? value
        .split(",")
        .map((agency) => agency.trim())
        .filter(Boolean)
    : [];
}

export async function POST(req: Request) {
  const authError = await requireRole(req, [
    "SUPER_ADMIN_GROUP",
    "SECURITY_ADMIN",
    "AGENCY_ADMIN",
    "ADMIN_ASSISTANT",
    "HR_OPERATIONS",
  ]);
  if (authError) return authError;

  try {
    const access = await getAccessContextFromRequest(req);
    if (!access?.permission.canManageEmployees) {
      return Response.json({ ok: false }, { status: 403 });
    }

    const body = await req.json();
    const photoUrl = typeof body.photoUrl === "string" ? body.photoUrl : "";
    const interventionTypeId = typeof body.interventionTypeId === "string" && body.interventionTypeId ? body.interventionTypeId : null;
    const customerId = typeof body.customerId === "string" && body.customerId ? body.customerId : null;
    const customerSiteId = typeof body.customerSiteId === "string" && body.customerSiteId ? body.customerSiteId : null;

    if (photoUrl && !photoUrl.startsWith("data:image/")) {
      return Response.json({ ok: false }, { status: 400 });
    }

    if (photoUrl.length > 2_100_000) {
      return Response.json({ ok: false }, { status: 413 });
    }

    const agencyNames = splitAgencyNames(body.agency);

    if (access.permission.dataScope === "company" && body.company !== access.user.company) {
      return Response.json({ ok: false, message: "Société hors périmètre." }, { status: 403 });
    }

    if (access.permission.dataScope === "agency") {
      const agencyAllowed = Boolean(access.user.agency) && agencyNames.includes(access.user.agency || "");

      if (body.company !== access.user.company || !agencyAllowed) {
        return Response.json({ ok: false, message: "Agence hors périmètre." }, { status: 403 });
      }
    }

    if (body.company && agencyNames.length > 0) {
      const selectedAgencies = await prisma.agency.findMany({
        where: { name: { in: agencyNames } },
        include: { company: true },
      });

      const hasInvalidAgency =
        selectedAgencies.length !== agencyNames.length ||
        selectedAgencies.some((agency) => agency.company && agency.company.name !== body.company);

      if (hasInvalidAgency) {
        return Response.json(
          { ok: false, message: "Agence non rattachée à la société sélectionnée." },
          { status: 400 },
        );
      }
    }

    const employee = await prisma.employee.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        jobTitle: body.jobTitle || null,
        agency: body.agency || null,
        company: body.company || null,
        interventionTypeId,
        customerId,
        customerSiteId,
        photoUrl: photoUrl || null,
        phoneAgency: body.phoneAgency || null,
        interventionType: body.interventionType || null,
        vehiclePlate: body.vehiclePlate || null,
        authorizedSite: body.authorizedSite || null,
        isActive: true,
      },
    });

    await prisma.authorization.create({
      data: {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        status: body.status || "active",
        validFrom: new Date(),
      },
    });

    await prisma.qrToken.create({
      data: {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        token: generateToken(),
        isActive: true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
