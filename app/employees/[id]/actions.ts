"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function refreshEmployeePages(employeeId: string) {
  revalidatePath("/");
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
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
