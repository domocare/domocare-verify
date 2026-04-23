import QRCode from "qrcode";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Prisma } from "@prisma/client";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import EmployeeCardExport from "@/components/employee-card-export";
import { prisma } from "@/lib/prisma";
import { getAccessContext, getEmployeeScopeWhere } from "@/lib/access-control";
import { getVerifyUrl } from "@/lib/urls";
import {
  reactivateEmployee,
  regenerateQrToken,
  suspendEmployee,
  updateEmployee,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    edit?: string;
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

function formatInputDate(date?: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function splitAgencyNames(value?: string | null) {
  return String(value || "")
    .split(",")
    .map((agency) => agency.trim())
    .filter(Boolean);
}

function formatScanLocation(scan: {
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  locationLabel?: string | null;
  locationSource?: string | null;
}) {
  if (scan.latitude === null || scan.latitude === undefined || scan.longitude === null || scan.longitude === undefined) {
    if (scan.locationLabel) {
      return {
        label: scan.locationLabel,
        accuracy: scan.locationSource === "gps" ? "GPS téléphone" : "Approximation réseau",
        url: null,
      };
    }

    return null;
  }

  return {
    label: `${scan.latitude.toFixed(5)}, ${scan.longitude.toFixed(5)}`,
    accuracy: scan.accuracy ? `± ${Math.round(scan.accuracy)} m` : null,
    url: `https://www.google.com/maps?q=${scan.latitude},${scan.longitude}`,
  };
}

function getStatusLabel(status?: string | null) {
  if (status === "active") return "Autorisé";
  if (status === "expired") return "Expire";
  if (status === "revoked" || status === "suspended") return "Suspendu";
  return "Inconnu";
}

function getBadgeClass(status?: string | null) {
  if (status === "active") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "expired") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export default async function EmployeeDetailPage({ params, searchParams }: Props) {
  await connection();

  const { id } = await params;
  const { edit } = await searchParams;
  const isEditing = edit === "1";

  let employee: EmployeeWithRelations | null = null;
  let companies: { id: string; name: string }[] = [];
  let agencies: { id: string; name: string; companyId: string | null }[] = [];

  try {
    const access = await getAccessContext();
    const scopedWhere = access ? getEmployeeScopeWhere(access) : { id: "__no_access__" };

    [employee, companies, agencies] = await Promise.all([
      prisma.employee.findFirst({
        where: { id, ...scopedWhere },
        include: {
          authorization: true,
          qrToken: true,
        },
      }),
      prisma.company.findMany({ orderBy: { name: "asc" } }),
      prisma.agency.findMany({
        orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
        include: { company: true },
      }),
    ]);
  } catch (error) {
    console.error("Employee detail database error", error);

    return (
      <BackofficeShell
        title="Fiche collaborateur"
        subtitle="Les informations ne peuvent pas être chargées pour le moment."
        actions={
          <Link href="/employees" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium">
            Retour à la liste
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

  const tokenScans = employee.qrToken?.token
    ? await prisma.scanLog.findMany({
        where: { token: employee.qrToken.token },
        orderBy: { createdAt: "desc" },
        take: 8,
      })
    : [];

  const status = employee.authorization?.status || "unknown";
  const verifyUrl = employee.qrToken?.token ? getVerifyUrl(employee.qrToken.token) : null;
  const qrImage = verifyUrl ? await QRCode.toDataURL(verifyUrl) : null;
  const suspendAction = suspendEmployee.bind(null, employee.id);
  const reactivateAction = reactivateEmployee.bind(null, employee.id);
  const regenerateAction = regenerateQrToken.bind(null, employee.id);
  const updateAction = updateEmployee.bind(null, employee.id);
  const selectedCompany = companies.find((company) => company.name === employee.company);
  const filteredAgencies = selectedCompany
    ? agencies.filter((agency) => agency.companyId === selectedCompany.id)
    : agencies;
  const selectedAgencyNames = splitAgencyNames(employee.agency);

  return (
    <BackofficeShell
      title={`${employee.firstName} ${employee.lastName}`}
      subtitle="Fiche collaborateur, statut d'autorisation et QR code de vérification."
      actions={
        <>
          <Link href="/employees" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium">
            Retour à la liste
          </Link>
          {isEditing ? (
            <Link href={`/employees/${employee.id}`} className="rounded-lg border bg-white px-4 py-2 text-sm font-medium">
              Annuler
            </Link>
          ) : (
            <Link
              href={`/employees/${employee.id}?edit=1`}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Modifier
            </Link>
          )}
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          {isEditing ? (
            <form action={updateAction} className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">Modification</p>
                  <h2 className="mt-1 text-2xl font-semibold">Informations collaborateur</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Modifiez les champs utiles puis enregistrez la fiche.
                  </p>
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Enregistrer
                </button>
              </div>

              <div className="grid gap-4 pt-5 md:grid-cols-2">
                <EditField label="Prénom" name="firstName" defaultValue={employee.firstName} required />
                <EditField label="Nom" name="lastName" defaultValue={employee.lastName} required />
                <EditField label="Fonction" name="jobTitle" defaultValue={employee.jobTitle} />
                <EditSelect
                  label="Société"
                  name="company"
                  defaultValue={employee.company}
                  items={companies}
                  emptyLabel="Choisir une société"
                />
                <EditMultiSelect
                  label="Agences"
                  name="agency"
                  defaultValues={selectedAgencyNames}
                  items={filteredAgencies}
                />
                <EditField label="Téléphone agence" name="phoneAgency" defaultValue={employee.phoneAgency} />
                <EditField label="Type intervention" name="interventionType" defaultValue={employee.interventionType} />
                <EditField label="Véhicule / plaque" name="vehiclePlate" defaultValue={employee.vehiclePlate} />
                <EditField label="Client ou site autorisé" name="authorizedSite" defaultValue={employee.authorizedSite} />
                <EditField label="Photo URL ou base64" name="photoUrl" defaultValue={employee.photoUrl} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600" htmlFor="status">
                    Statut habilitation
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={status}
                    className="w-full rounded-lg border bg-white px-4 py-3"
                  >
                    <option value="active">active</option>
                    <option value="expired">expired</option>
                    <option value="revoked">revoked</option>
                    <option value="suspended">suspended</option>
                  </select>
                </div>

                <EditField
                  label="Autorisation depuis"
                  name="validFrom"
                  type="date"
                  defaultValue={formatInputDate(employee.authorization?.validFrom)}
                />
                <EditField
                  label="Valide jusqu'au"
                  name="validUntil"
                  type="date"
                  defaultValue={formatInputDate(employee.authorization?.validUntil)}
                />
                <EditField
                  label="Expiration QR"
                  name="qrExpiresAt"
                  type="date"
                  defaultValue={formatInputDate(employee.qrToken?.expiresAt)}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Enregistrer
                </button>
                <Link
                  href={`/employees/${employee.id}`}
                  className="rounded-lg border bg-white px-5 py-3 text-sm font-semibold text-slate-800"
                >
                  Annuler
                </Link>
              </div>
            </form>
          ) : (
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
                <p className="mt-2 text-slate-600">{employee.jobTitle || "Fonction non renseignée"}</p>
              </div>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${getBadgeClass(status)}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>

          <div className="grid gap-4 pt-5 md:grid-cols-2">
            <InfoItem label="Société" value={employee.company} />
            <InfoItem label="Agence" value={employee.agency} />
            <InfoItem label="Téléphone agence" value={employee.phoneAgency} />
            <InfoItem label="Type intervention" value={employee.interventionType} />
            <InfoItem label="Véhicule / plaque" value={employee.vehiclePlate} />
            <InfoItem label="Client ou site autorisé" value={employee.authorizedSite} />
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
          )}

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
                  Régénérer QR
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
              <EmployeeCardExport
                employee={{
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  jobTitle: employee.jobTitle,
                  company: employee.company,
                  agency: employee.agency,
                  photoUrl: employee.photoUrl,
                  phoneAgency: employee.phoneAgency,
                  interventionType: employee.interventionType,
                  vehiclePlate: employee.vehiclePlate,
                  authorizedSite: employee.authorizedSite,
                }}
                statusLabel={getStatusLabel(status)}
                validUntil={formatDate(employee.authorization?.validUntil)}
                qrImage={qrImage}
                verifyUrl={verifyUrl}
              />
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Derniers scans du token</p>
                <div className="mt-3 space-y-3">
                  {tokenScans.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun scan enregistré.</p>
                  ) : (
                    tokenScans.map((scan) => {
                      const location = formatScanLocation(scan);

                      return (
                        <div key={scan.id} className="rounded-lg bg-white p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-900">{scan.result}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(scan.createdAt).toLocaleString("fr-FR")}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            {location?.url ? (
                              <a
                                href={location.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-emerald-700 underline"
                              >
                                {location.label}
                                {location.accuracy ? ` (${location.accuracy})` : ""}
                              </a>
                            ) : location ? (
                              <span className="font-semibold text-slate-700">
                                {location.label}
                                {location.accuracy ? ` (${location.accuracy})` : ""}
                              </span>
                            ) : (
                              "Géolocalisation non partagée"
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
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

function EditField({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        required={required}
        className="w-full rounded-lg border bg-white px-4 py-3"
      />
    </div>
  );
}

function EditSelect({
  label,
  name,
  defaultValue,
  items,
  emptyLabel,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  items: { id: string; name: string }[];
  emptyLabel: string;
}) {
  const hasCurrentValue =
    !!defaultValue && !items.some((item) => item.name === defaultValue);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue || ""}
        className="w-full rounded-lg border bg-white px-4 py-3"
      >
        <option value="">{emptyLabel}</option>
        {hasCurrentValue ? <option value={defaultValue || ""}>{defaultValue}</option> : null}
        {items.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function EditMultiSelect({
  label,
  name,
  defaultValues,
  items,
}: {
  label: string;
  name: string;
  defaultValues: string[];
  items: { id: string; name: string }[];
}) {
  const missingValues = defaultValues.filter(
    (value) => !items.some((item) => item.name === value),
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValues}
        multiple
        className="min-h-32 w-full rounded-lg border bg-white px-4 py-3"
      >
        {missingValues.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
        {items.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500">
        Maintenez Ctrl pour sélectionner plusieurs agences.
      </p>
    </div>
  );
}
