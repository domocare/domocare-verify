import { prisma } from "@/lib/prisma";
import { createEmployeeWorkbook, workbookToArrayBuffer } from "@/lib/employee-excel";

export const runtime = "nodejs";

export async function GET() {
  const employees = await prisma.employee.findMany({
    include: {
      authorization: true,
      qrToken: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const workbook = createEmployeeWorkbook(
    employees.map((employee) => ({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      company: employee.company,
      agency: employee.agency,
      phoneAgency: employee.phoneAgency,
      interventionType: employee.interventionType,
      vehiclePlate: employee.vehiclePlate,
      authorizedSite: employee.authorizedSite,
      status: employee.authorization?.status || "active",
      expiresAt: employee.qrToken?.expiresAt || employee.authorization?.validUntil || null,
      photoUrl: employee.photoUrl,
      token: employee.qrToken?.token,
    })),
  );

  const body = await workbookToArrayBuffer(workbook);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="export-collaborateurs-domocare.xlsx"',
    },
  });
}
