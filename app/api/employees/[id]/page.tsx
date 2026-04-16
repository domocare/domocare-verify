import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EmployeeDetailPage({ params }: Props) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      authorization: true,
      qrToken: true,
    },
  });

  if (!employee) {
    return (
      <BackofficeShell
        title="Collaborateur introuvable"
        subtitle="La fiche demandée n'existe pas."
      >
        <div className="bg-white rounded-2xl shadow p-6">
          <Link href="/employees" className="underline">
            ← Retour à la liste
          </Link>
        </div>
      </BackofficeShell>
    );
  }

  const qrUrl = employee.qrToken?.token
    ? `https://verify.groupe-lantana.fr/verify?token=${employee.qrToken.token}`
    : null;

  const qrImage = qrUrl ? await QRCode.toDataURL(qrUrl) : null;

  const status = employee.authorization?.status || "inconnu";

  const badgeClass =
    status === "active"
      ? "bg-green-100 text-green-700"
      : status === "expired"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <BackofficeShell
      title={`${employee.firstName} ${employee.lastName}`}
      subtitle="Fiche collaborateur"
      actions={
        <Link
          href="/employees"
          className="rounded-xl border px-4 py-2 bg-white"
        >
          ← Retour à la liste
        </Link>
      }
    >
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
<Link href={`/employees/${emp.id}`} className="text-2xl font-semibold hover:underline">
  {emp.firstName} {emp.lastName}
</Link>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
              {status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-slate-500">Fonction</div>
              <div className="font-medium mt-1">{employee.jobTitle || "-"}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-slate-500">Agence</div>
              <div className="font-medium mt-1">{employee.agency || "-"}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-slate-500">Société</div>
              <div className="font-medium mt-1">{employee.company || "-"}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-slate-500">Téléphone agence</div>
              <div className="font-medium mt-1">{employee.phoneAgency || "-"}</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-slate-500">Validité</div>
              <div className="font-medium mt-1">
                {employee.authorization?.validUntil
                  ? new Date(employee.authorization.validUntil).toLocaleDateString("fr-FR")
                  : "-"}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-slate-500">Token</div>
              <div className="font-medium mt-1 break-all">
                {employee.qrToken?.token || "-"}
              </div>
            </div>
          </div>

          {employee.qrToken?.token && (
            <div className="pt-2">
              <a
                href={`/verify?token=${employee.qrToken.token}`}
                className="underline text-sm"
              >
                Tester la vérification
              </a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border">
          <h3 className="text-lg font-semibold mb-4">QR code</h3>

          {qrImage ? (
            <div className="space-y-4">
              <img
                src={qrImage}
                alt="QR code"
                className="w-56 h-56 rounded-xl border bg-white p-3 mx-auto"
              />
              <p className="text-xs text-slate-500 break-all text-center">
                {qrUrl}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Aucun QR code disponible.</p>
          )}
        </div>
      </div>
    </BackofficeShell>
  );
}