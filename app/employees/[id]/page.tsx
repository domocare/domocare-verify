import QRCode from "qrcode";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Prisma } from "@prisma/client";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import { prisma } from "@/lib/prisma";
import { getVerifyUrl } from "@/lib/urls";
import {
  reactivateEmployee,
  regenerateQrToken,
  suspendEmployee,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    authorization: true;
    qrToken: true;
  };
}>;

function formatDate(date?: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status?: string | null) {
  if (status === "active") return "Autorise";
  if (status === "expired") return "Expire";
  if (status === "revoked" || status === "suspended") return "Suspendu";
  return "Inconnu";
}

function getBadgeClass(status?: string | null) {
  if (status === "active") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "expired") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export default async function EmployeeDetailPage({ params }: Props) {
  await connection();

  const { id } = await params;

  let employee: EmployeeWithRelations | null = null;

  try {
    employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        authorization: true,
        qrToken: true,
      },
    });
  } catch (error) {
    console.error("Employee detail database error", error);

    return (
      <BackofficeShell
        title="Fiche collaborateur"
        subtitle="Les informations ne peuvent pas etre chargees pour le moment."
        actions={
          <Link href="/employees" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium">
            Retour a la liste
          </Link>
        }
      >
        <DatabaseErrorPanel title="Fiche indisponible" />
      </BackofficeShell>
    );
  }

  if (!employee) {
    notFound();
  }

  const status = employee.authorization?.status || "unknown";
  const verifyUrl = employee.qrToken?.token ? getVerifyUrl(employee.qrToken.token) : null;
  const qrImage = verifyUrl ? await QRCode.toDataURL(verifyUrl) : null;
  const suspendAction = suspendEmployee.bind(null, employee.id);
  const reactivateAction = reactivateEmployee.bind(null, employee.id);
  const regenerateAction = regenerateQrToken.bind(null, employee.id);

  return (
    <BackofficeShell
      title={`${employee.firstName} ${employee.lastName}`}
      subtitle="Fiche collaborateur, statut d'autorisation et QR code de verification."
      actions={
        <Link href="/employees" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium">
          Retour a la liste
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          <div className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
            <div className="flex flex-wrap items-center gap-4">
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="h-24 w-24 rounded-xl object-cover border bg-slate-50"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-slate-50 text-sm text-slate-400">
                  Photo
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-500">Collaborateur</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="mt-2 text-slate-600">{employee.jobTitle || "Fonction non renseignee"}</p>
              </div>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${getBadgeClass(status)}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>

          <div className="grid gap-4 pt-5 md:grid-cols-2">
            <InfoItem label="Societe" value={employee.company} />
            <InfoItem label="Agence" value={employee.agency} />
            <InfoItem label="Telephone agence" value={employee.phoneAgency} />
            <InfoItem label="Type intervention" value={employee.interventionType} />
            <InfoItem label="Vehicule / plaque" value={employee.vehiclePlate} />
            <InfoItem label="Client ou site autorise" value={employee.authorizedSite} />
            <InfoItem label="Etat collaborateur" value={employee.isActive ? "Actif" : "Inactif"} />
            <InfoItem label="Autorisation depuis" value={formatDate(employee.authorization?.validFrom)} />
            <InfoItem label="Valide jusqu'au" value={formatDate(employee.authorization?.validUntil)} />
            <InfoItem label="QR emis le" value={formatDate(employee.qrToken?.issuedAt)} />
            <InfoItem label="QR expire le" value={formatDate(employee.qrToken?.expiresAt)} />
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Token</p>
            <p className="mt-1 break-all font-mono text-sm text-slate-800">
              {employee.qrToken?.token || "-"}
            </p>
          </div>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-semibold">Actions</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={suspendAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Suspendre
                </button>
              </form>

              <form action={reactivateAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  Reactiver
                </button>
              </form>

              <form action={regenerateAction}>
                <button
                  type="submit"
                  className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
                >
                  Regenerer QR
                </button>
              </form>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-semibold">QR code</h3>

          {qrImage && verifyUrl ? (
            <div className="mt-5 space-y-4">
              <img
                src={qrImage}
                alt={`QR code de ${employee.firstName} ${employee.lastName}`}
                className="mx-auto h-56 w-56 rounded-lg border bg-white p-3"
              />
              <a
                href={verifyUrl}
                className="block break-all rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-700 underline"
              >
                {verifyUrl}
              </a>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Aucun QR code disponible.</p>
          )}
        </aside>
      </div>
    </BackofficeShell>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}
