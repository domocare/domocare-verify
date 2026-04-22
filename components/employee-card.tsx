import Link from "next/link";
import { BadgeCheck, Clock3, QrCode, ShieldAlert } from "lucide-react";

type EmployeeCardProps = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string | null;
    agency: string | null;
    company: string | null;
    photoUrl: string | null;
    qrToken?: { token: string } | null;
    authorization?: { status: string | null } | null;
    qrImage?: string | null;
  };
};

function badgeClass(status?: string | null) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "expired") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}

function statusLabel(status?: string | null) {
  if (status === "active") return "Autorisé";
  if (status === "expired") return "Expire";
  if (status === "revoked" || status === "suspended") return "Suspendu";
  return "Inconnu";
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const status = employee.authorization?.status;
  const StatusIcon = status === "active" ? BadgeCheck : status === "expired" ? Clock3 : ShieldAlert;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {employee.photoUrl ? (
            <img
              src={employee.photoUrl}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="h-16 w-16 rounded-lg border bg-slate-50 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-slate-50 text-sm font-semibold text-slate-400">
              {employee.firstName.slice(0, 1)}
              {employee.lastName.slice(0, 1)}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/employees/${employee.id}`}
                className="truncate text-lg font-semibold text-slate-950 hover:text-emerald-700"
              >
                {employee.firstName} {employee.lastName}
              </Link>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                  status,
                )}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusLabel(status)}
              </span>
            </div>

            <div className="mt-1 text-sm text-slate-600">{employee.jobTitle || "-"}</div>
            <div className="mt-1 text-sm text-slate-500">
              {employee.company || "-"} - {employee.agency || "-"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {employee.qrToken?.token ? (
            <a
              href={`/verify?token=${employee.qrToken.token}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <QrCode className="h-4 w-4" />
              Tester
            </a>
          ) : null}

          <Link
            href={`/employees/${employee.id}`}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Ouvrir
          </Link>

          {employee.qrImage ? (
            <img
              src={employee.qrImage}
              alt="QR code"
              className="h-20 w-20 rounded-lg border bg-white p-2"
            />
          ) : (
            <div className="text-sm text-slate-400">Pas de QR</div>
          )}
        </div>
      </div>
    </div>
  );
}
