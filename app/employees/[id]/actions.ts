"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

async function ensureSettings(company: string | null, agency: string | null) {
  await Promise.all([
    company
      ? prisma.company.upsert({
          where: { name: company },
          update: {},
          create: { name: company },
        })
      : Promise.resolve(),
    agency
      ? prisma.agency.upsert({
          where: { name: agency },
          update: {},
          create: { name: agency },
        })
      : Promise.resolve(),
  ]);
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const firstName = readText(formData, "firstName");
  const lastName = readText(formData, "lastName");

  if (!firstName || !lastName) {
    throw new Error("Le prenom et le nom sont obligatoires.");
  }

  const company = readText(formData, "company");
  const agency = readText(formData, "agency");
  const status = readStatus(formData);
  const validFrom = readDate(formData, "validFrom");
  const validUntil = readDate(formData, "validUntil");
  const qrExpiresAt = readDate(formData, "qrExpiresAt") || validUntil;
  const isSuspended = status === "revoked" || status === "suspended";
  const now = new Date();

  await ensureSettings(company, agency);

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
        interventionType: readText(formData, "interventionType"),
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
