import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import EmployeeCard from "@/components/employee-card";
import Link from "next/link";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: {
      authorization: true,
      qrToken: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const employeesWithQR = await Promise.all(
    employees.map(async (emp) => {
      const qrUrl = emp.qrToken?.token
        ? `https://verify.groupe-lantana.fr/verify?token=${emp.qrToken.token}`
        : null;

      const qrImage = qrUrl ? await QRCode.toDataURL(qrUrl) : null;

      return {
        ...emp,
        qrImage,
      };
    })
  );

  return (
    <BackofficeShell
      title="Collaborateurs"
      subtitle="Liste des intervenants enregistrés, avec statut, token et QR code."
      actions={
        <Link
          href="/employees/new"
          className="inline-block rounded-xl bg-black text-white px-4 py-2"
        >
          + Ajouter un collaborateur
        </Link>
      }
    >
  <div className="space-y-2">
  <label className="text-sm font-medium">Date d’expiration du QR code</label>
  <input
    type="date"
    name="expiresAt"
    className="w-full rounded-xl border px-4 py-3"
  />
</div>      
      <div className="grid gap-4">
        {employeesWithQR.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} />
        ))}
      </div>
    </BackofficeShell>
  );
}