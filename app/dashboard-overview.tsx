"use client";

import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  History,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

type DashboardStats = {
  employees: number;
  active: number;
  expired: number;
  suspended: number;
  scans: number;
};

type DashboardEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  agency: string | null;
  company: string | null;
  photoUrl: string | null;
  createdAt: string;
  status: string | null;
  token: string | null;
};

type DashboardScan = {
  id: string;
  token: string;
  result: string;
  company: string | null;
  createdAt: string;
};

type DashboardOverviewProps = {
  stats: DashboardStats;
  employees: DashboardEmployee[];
  scans: DashboardScan[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function statusMeta(status?: string | null) {
  if (status === "active") {
    return {
      label: "Autorisé",
      full: "Habilitation valide",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (status === "expired") {
    return {
      label: "Expire",
      full: "Habilitation expirée",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: CalendarClock,
    };
  }

  if (status === "revoked" || status === "suspended") {
    return {
      label: "Suspendu",
      full: "Habilitation suspendue",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: AlertTriangle,
    };
  }

  return {
    label: "À vérifier",
    full: "Statut à vérifier",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: AlertTriangle,
  };
}

function scanClass(result: string) {
  if (result === "valid") return "bg-emerald-100 text-emerald-700";
  if (result === "expired") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function DashboardOverview({
  stats,
  employees,
  scans,
}: DashboardOverviewProps) {
  const [query, setQuery] = useState("");

  const filteredEmployees = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return employees.slice(0, 5);

    return employees
      .filter((employee) =>
        [
          employee.firstName,
          employee.lastName,
          employee.jobTitle,
          employee.company,
          employee.agency,
          employee.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 5);
  }, [employees, query]);

  const recentEmployees = employees.slice(0, 5);
  const alertEmployees = employees
    .filter((employee) => employee.status !== "active")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric title="Collaborateurs" value={stats.employees} subtitle="Toutes entités" icon={Users} />
        <Metric title="Valides" value={stats.active} subtitle="Autorisations actives" icon={ShieldCheck} tone="emerald" />
        <Metric title="Expirés" value={stats.expired} subtitle="À renouveler" icon={CalendarClock} tone="amber" />
        <Metric title="Suspendus" value={stats.suspended} subtitle="Accès bloqués" icon={AlertTriangle} tone="red" />
        <Metric title="Scans" value={stats.scans} subtitle="Journal total" icon={History} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Recherche collaborateur</h2>
                <p className="mt-1 text-sm text-slate-500">Nom, société, agence ou statut.</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <Search className="h-5 w-5 text-slate-600" />
              </div>
            </div>

            <div className="relative mt-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900"
                placeholder="Rechercher un collaborateur"
              />
            </div>

            <div className="mt-4 space-y-3">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <EmployeeSearchRow key={employee.id} employee={employee} />
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">
                  Aucun collaborateur ne correspond à cette recherche.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Actions rapides</h2>
            <div className="mt-4 grid gap-3">
              <ActionLink href="/employees/new" icon={Plus} title="Créer un collaborateur" subtitle="Ajouter fiche, photo, agence et habilitation" />
              <ActionLink href="/employees" icon={QrCode} title="Contrôler les QR codes" subtitle="Ouvrir une fiche puis exporter la carte" />
              <ActionLink href="/settings" icon={Settings} title="Paramétrage" subtitle="Sociétés, agences et référentiels" />
              <ActionLink href="/users" icon={Users} title="Gestion des accès" subtitle="Rôles responsables et administrateurs" />
            </div>
          </section>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Panel title="Derniers collaborateurs créés" subtitle="Suivi immédiat des nouvelles fiches">
              <div className="space-y-3">
                {recentEmployees.map((employee) => (
                  <EmployeeWideRow key={employee.id} employee={employee} />
                ))}
              </div>
            </Panel>

            <Panel title="Points d'attention" subtitle="À traiter en priorité">
              <div className="space-y-3">
                {alertEmployees.length > 0 ? (
                  alertEmployees.map((employee) => (
                    <EmployeeAlertRow key={employee.id} employee={employee} />
                  ))
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    Aucun collaborateur expire ou suspendu dans les derniers dossiers.
                  </div>
                )}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Derniers scans" subtitle="Résultats publics remontés par QR code">
              <div className="space-y-3">
                {scans.length > 0 ? (
                  scans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm text-slate-900">{scan.token}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {scan.company || "Société inconnue"} - {formatDate(scan.createdAt)}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scanClass(scan.result)}`}>
                        {scan.result}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">
                    Aucun scan journalise pour le moment.
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Point sur les actions" subtitle="Priorites operationnelles de cette page">
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionStatus title="Retrouver vite une fiche" status="Disponible" tone="emerald" />
                <ActionStatus title="Créer un collaborateur" status="Disponible" tone="emerald" />
                <ActionStatus title="Suspendre / reactiver" status="Depuis la fiche" tone="emerald" />
                <ActionStatus title="Exporter carte PNG/PDF" status="Depuis la fiche" tone="emerald" />
                <ActionStatus title="Consulter les scans" status="Disponible" tone="emerald" />
                <ActionStatus title="Traiter les anomalies" status="À renforcer" tone="amber" />
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "slate",
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: ElementType;
  tone?: "slate" | "emerald" | "amber" | "red";
}) {
  const toneClass = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  }[tone];

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className={`rounded-lg p-3 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function EmployeeAvatar({ employee }: { employee: DashboardEmployee }) {
  if (employee.photoUrl) {
    return (
      <img
        src={employee.photoUrl}
        alt={`${employee.firstName} ${employee.lastName}`}
        className="h-12 w-12 rounded-lg border bg-slate-50 object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-slate-50 text-sm font-semibold text-slate-400">
      {employee.firstName.slice(0, 1)}
      {employee.lastName.slice(0, 1)}
    </div>
  );
}

function EmployeeSearchRow({ employee }: { employee: DashboardEmployee }) {
  const meta = statusMeta(employee.status);

  return (
    <Link href={`/employees/${employee.id}`} className="block rounded-lg border p-3 transition hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <EmployeeAvatar employee={employee} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="truncate text-sm text-slate-500">
            {employee.company || "-"} - {employee.agency || "-"}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
          {meta.label}
        </span>
      </div>
    </Link>
  );
}

function EmployeeWideRow({ employee }: { employee: DashboardEmployee }) {
  const meta = statusMeta(employee.status);
  const Icon = meta.icon;

  return (
    <Link href={`/employees/${employee.id}`} className="block rounded-lg border p-4 transition hover:bg-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <EmployeeAvatar employee={employee} />
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="truncate text-sm text-slate-500">{employee.jobTitle || "Fonction non renseignée"}</p>
            <p className="truncate text-xs text-slate-400">
              {employee.company || "-"} - {employee.agency || "-"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Cree le {formatDate(employee.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmployeeAlertRow({ employee }: { employee: DashboardEmployee }) {
  const meta = statusMeta(employee.status);

  return (
    <Link href={`/employees/${employee.id}`} className="block rounded-lg border p-3 transition hover:bg-slate-50">
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${meta.className}`}>
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="mt-1 text-sm text-slate-500">{meta.full}</p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {employee.company || "-"} - {employee.agency || "-"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ActionLink({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border p-4 transition hover:bg-slate-50">
      <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </Link>
  );
}

function ActionStatus({
  title,
  status,
  tone,
}: {
  title: string;
  status: string;
  tone: "emerald" | "amber";
}) {
  const className =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
          {status}
        </div>
      </div>
      <p className="mt-3 font-semibold text-slate-950">{title}</p>
    </div>
  );
}
