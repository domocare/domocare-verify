"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAccessContext, getEmployeeScopeWhere } from "@/lib/access-control";

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function refreshEmployeePages(employeeId: string) {
  revalidatePath("/");
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readTextList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function readInterventionSelection(formData: FormData) {
  const interventionTypeIds = readTextList(formData, "interventionTypeIds");
  const selectedTypesRaw = interventionTypeIds.length
    ? await prisma.interventionType.findMany({
        where: { id: { in: interventionTypeIds } },
      })
    : [];
  const selectedTypes = interventionTypeIds
    .map((id) => selectedTypesRaw.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    interventionTypeId: selectedTypes[0]?.id || null,
    interventionType: selectedTypes.map((item) => item.name).join(", ") || null,
  };
}

function readStatus(formData: FormData) {
  const status = readText(formData, "status") || "active";

  if (["active", "expired", "revoked", "suspended"].includes(status)) {
    return status;
  }

  return "active";
}

function readDate(formData: FormData, key: string) {
  const value = readText(formData, key);
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function ensureSettings(company: string | null, agencies: string[]) {
  const companyRecord = company
    ? await prisma.company.upsert({
        where: { name: company },
        update: {},
        create: { name: company },
      })
    : null;

  for (const agency of agencies) {
    await prisma.agency.upsert({
      where: { name: agency },
      update: {
        companyId: companyRecord?.id,
      },
      create: {
        name: agency,
        companyId: companyRecord?.id,
      },
    });
  }
}

async function ensureEmployeeAccess(employeeId: string, requireManage = true) {
  const access = await getAccessContext();

  if (!access || (requireManage && !access.permission.canManageEmployees)) {
    throw new Error("Forbidden");
  }

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      ...getEmployeeScopeWhere(access),
    },
    select: { id: true },
  });

  if (!employee) {
    throw new Error("Forbidden");
  }
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  await ensureEmployeeAccess(employeeId);

  const firstName = readText(formData, "firstName");
  const lastName = readText(formData, "lastName");

  if (!firstName || !lastName) {
    throw new Error("Le prénom et le nom sont obligatoires.");
  }

  const company = readText(formData, "company");
  const agencyNames = readTextList(formData, "agency");
  const interventionSelection = await readInterventionSelection(formData);
  const agency = agencyNames.join(", ") || null;
  const status = readStatus(formData);
  const validFrom = readDate(formData, "validFrom");
  const validUntil = readDate(formData, "validUntil");
  const qrExpiresAt = readDate(formData, "qrExpiresAt") || validUntil;
  const isSuspended = status === "revoked" || status === "suspended";
  const now = new Date();

  await ensureSettings(company, agencyNames);

  if (company && agencyNames.length > 0) {
    const selectedAgencies = await prisma.agency.findMany({
      where: { name: { in: agencyNames } },
      include: { company: true },
    });

    const hasInvalidAgency =
      selectedAgencies.length !== agencyNames.length ||
      selectedAgencies.some((selectedAgency) => selectedAgency.company?.name !== company);

    if (hasInvalidAgency) {
      throw new Error("L'agence sélectionnée n'est pas rattachée à cette société.");
    }
  }

  await prisma.$transaction([
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName,
        lastName,
        jobTitle: readText(formData, "jobTitle"),
        company,
        agency,
        phoneAgency: readText(formData, "phoneAgency"),
        interventionTypeId: interventionSelection.interventionTypeId,
        interventionType: interventionSelection.interventionType,
        vehiclePlate: readText(formData, "vehiclePlate"),
        authorizedSite: readText(formData, "authorizedSite"),
        photoUrl: readText(formData, "photoUrl"),
        isActive: !isSuspended,
      },
    }),
    prisma.authorization.upsert({
      where: { employeeId },
      create: {
        employeeId,
        status,
        validFrom: validFrom || now,
        validUntil,
      },
      update: {
        status,
        validFrom,
        validUntil,
      },
    }),
    prisma.qrToken.upsert({
      where: { employeeId },
      create: {
        employeeId,
        token: generateToken(),
        isActive: !isSuspended,
        issuedAt: now,
        expiresAt: qrExpiresAt,
        revokedAt: isSuspended ? now : null,
      },
      update: {
        isActive: !isSuspended,
        expiresAt: qrExpiresAt,
        revokedAt: isSuspended ? now : null,
      },
    }),
  ]);

  refreshEmployeePages(employeeId);
  redirect(`/employees/${employeeId}`);
}

export async function suspendEmployee(employeeId: string) {
  await ensureEmployeeAccess(employeeId);

  const now = new Date();

  await prisma.$transaction([
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        isActive: false,
      },
    }),
    prisma.authorization.upsert({
      where: { employeeId },
      create: {
        employeeId,
        status: "revoked",
        validFrom: now,
      },
      update: {
        status: "revoked",
      },
    }),
    prisma.qrToken.updateMany({
      where: { employeeId },
      data: {
        isActive: false,
        revokedAt: now,
      },
    }),
  ]);

  refreshEmployeePages(employeeId);
}

export async function reactivateEmployee(employeeId: string) {
  await ensureEmployeeAccess(employeeId);

  const now = new Date();

  await prisma.$transaction([
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        isActive: true,
      },
    }),
    prisma.authorization.upsert({
      where: { employeeId },
      create: {
        employeeId,
        status: "active",
        validFrom: now,
      },
      update: {
        status: "active",
        validFrom: now,
      },
    }),
    prisma.qrToken.upsert({
      where: { employeeId },
      create: {
        employeeId,
        token: generateToken(),
        isActive: true,
        issuedAt: now,
      },
      update: {
        isActive: true,
        revokedAt: null,
      },
    }),
  ]);

  refreshEmployeePages(employeeId);
}

export async function regenerateQrToken(employeeId: string) {
  await ensureEmployeeAccess(employeeId);

  const now = new Date();
  const token = generateToken();

  await prisma.$transaction([
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        isActive: true,
      },
    }),
    prisma.qrToken.upsert({
      where: { employeeId },
      create: {
        employeeId,
        token,
        isActive: true,
        issuedAt: now,
      },
      update: {
        token,
        isActive: true,
        revokedAt: null,
        issuedAt: now,
      },
    }),
    prisma.authorization.upsert({
      where: { employeeId },
      create: {
        employeeId,
        status: "active",
        validFrom: now,
      },
      update: {
        status: "active",
      },
    }),
  ]);

  refreshEmployeePages(employeeId);
}
