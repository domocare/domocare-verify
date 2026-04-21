import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import DashboardOverview from "../dashboard-overview";

async function getDashboardData() {
  const [employees, active, expired, suspended, scans, employeeRows, scanRows] =
    await Promise.all([
      prisma.employee.count(),
      prisma.authorization.count({ where: { status: "active" } }),
      prisma.authorization.count({ where: { status: "expired" } }),
      prisma.authorization.count({ where: { status: { in: ["revoked", "suspended"] } } }),
      prisma.scanLog.count(),
      prisma.employee.findMany({
        orderBy: { createdAt: "desc" },
        take: 80,
        include: {
          authorization: true,
          qrToken: true,
        },
      }),
      prisma.scanLog.findMany({
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
      title="Controle d'habilitation par QR code"
      subtitle="Back-office Domocare / Lantana pour verifier, securiser et tracer les interventions terrain."
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
