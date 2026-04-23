import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import DashboardOverview from "../dashboard-overview";
import { getAccessContext, getEmployeeScopeWhere, getScanScopeWhere } from "@/lib/access-control";

async function getDashboardData() {
  const access = await getAccessContext();
  if (!access) {
    return {
      stats: { employees: 0, active: 0, expired: 0, suspended: 0, scans: 0 },
      employees: [],
      scans: [],
    };
  }

  const employeeWhere = getEmployeeScopeWhere(access);
  const scanWhere = await getScanScopeWhere(access);

  const [employees, active, expired, suspended, scans, employeeRows, scanRows] =
    await Promise.all([
      prisma.employee.count({ where: employeeWhere }),
      prisma.authorization.count({ where: { status: "active", employee: employeeWhere } }),
      prisma.authorization.count({ where: { status: "expired", employee: employeeWhere } }),
      prisma.authorization.count({ where: { status: { in: ["revoked", "suspended"] }, employee: employeeWhere } }),
      prisma.scanLog.count({ where: scanWhere }),
      prisma.employee.findMany({
        where: employeeWhere,
        orderBy: { createdAt: "desc" },
        take: 80,
        include: {
          authorization: true,
          qrToken: true,
        },
      }),
      prisma.scanLog.findMany({
        where: scanWhere,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  return {
    stats: { employees, active, expired, suspended, scans },
    employees: employeeRows.map((employee) => ({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      agency: employee.agency,
      company: employee.company,
      photoUrl: employee.photoUrl,
      createdAt: employee.createdAt.toISOString(),
      status: employee.authorization?.status || null,
      token: employee.qrToken?.token || null,
    })),
    scans: scanRows.map((scan) => ({
      id: scan.id,
      token: scan.token,
      result: scan.result,
      company: scan.company,
      createdAt: scan.createdAt.toISOString(),
    })),
  };
}

export default async function DashboardPage() {
  await connection();

  let dashboardData: Awaited<ReturnType<typeof getDashboardData>> | null = null;

  try {
    dashboardData = await getDashboardData();
  } catch (error) {
    console.error("Dashboard database error", error);
  }

  return (
    <BackofficeShell
      title="Contrôle d'habilitation par QR code"
      subtitle="Back-office Domocare / Lantana pour vérifier, sécuriser et tracer les interventions terrain."
      actions={
        <>
          <Link href="/employees" className="rounded-lg border bg-black px-4 py-2 text-white">
            Rechercher
          </Link>
          <Link href="/employees/new" className="rounded-lg border bg-white px-4 py-2">
            Ajouter un collaborateur
          </Link>
        </>
      }
    >
      {dashboardData ? (
        <DashboardOverview
          stats={dashboardData.stats}
          employees={dashboardData.employees}
          scans={dashboardData.scans}
        />
      ) : (
        <DatabaseErrorPanel />
      )}
    </BackofficeShell>
  );
}
