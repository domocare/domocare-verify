import QRCode from "qrcode";
import Link from "next/link";
import { connection } from "next/server";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import EmployeeCard from "@/components/employee-card";
import EmployeeExcelActions from "@/components/employee-excel-actions";
import { prisma } from "@/lib/prisma";
import { getAccessContext, getEmployeeScopeWhere } from "@/lib/access-control";
import { getVerifyUrl } from "@/lib/urls";

async function getEmployeesWithQr() {
  const access = await getAccessContext();
  if (!access) return [];

  const employees = await prisma.employee.findMany({
    where: getEmployeeScopeWhere(access),
    include: {
      authorization: true,
      qrToken: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Promise.all(
    employees.map(async (emp) => {
      const qrUrl = emp.qrToken?.token ? getVerifyUrl(emp.qrToken.token) : null;
      const qrImage = qrUrl ? await QRCode.toDataURL(qrUrl) : null;

      return {
        ...emp,
        qrImage,
      };
    })
  );
}

export default async function EmployeesPage() {
  await connection();

  let employeesWithQR: Awaited<ReturnType<typeof getEmployeesWithQr>> | null = null;

  try {
    employeesWithQR = await getEmployeesWithQr();
  } catch (error) {
    console.error("Employees database error", error);
  }

  return (
    <BackofficeShell
      title="Collaborateurs"
      subtitle="Liste des intervenants enregistres, avec statut, token et QR code."
      actions={
        <Link
          href="/employees/new"
          className="inline-block rounded-lg bg-black px-4 py-2 text-white"
        >
          + Ajouter un collaborateur
        </Link>
      }
    >
      {employeesWithQR ? (
        <div className="grid gap-5">
          <EmployeeExcelActions />

          <div className="grid gap-4">
            {employeesWithQR.map((emp) => (
              <EmployeeCard key={emp.id} employee={emp} />
            ))}
          </div>
        </div>
      ) : (
        <DatabaseErrorPanel title="Collaborateurs indisponibles" />
      )}
    </BackofficeShell>
  );
}
