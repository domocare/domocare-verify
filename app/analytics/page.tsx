import { connection } from "next/server";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import { prisma } from "@/lib/prisma";

type EmployeeForAnalytics = {
  company: string | null;
  agency: string | null;
  isActive: boolean;
  authorization: {
    status: string | null;
  } | null;
};

type GroupStats = {
  name: string;
  total: number;
  active: number;
  expired: number;
  suspended: number;
  agencies: Map<string, GroupStats>;
};

function emptyStats(name: string): GroupStats {
  return {
    name,
    total: 0,
    active: 0,
    expired: 0,
    suspended: 0,
    agencies: new Map(),
  };
}

function addEmployee(stats: GroupStats, employee: EmployeeForAnalytics) {
  const status = employee.authorization?.status;

  stats.total += 1;

  if (status === "active" && employee.isActive) {
    stats.active += 1;
  } else if (status === "expired") {
    stats.expired += 1;
  } else if (status === "revoked" || status === "suspended" || !employee.isActive) {
    stats.suspended += 1;
  }
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

async function getAnalyticsData() {
  const employees = await prisma.employee.findMany({
    select: {
      company: true,
      agency: true,
      isActive: true,
      authorization: {
        select: {
          status: true,
        },
      },
    },
    orderBy: [{ company: "asc" }, { agency: "asc" }],
  });

  const companies = new Map<string, GroupStats>();
  const agencies = new Map<string, GroupStats>();
  const total = emptyStats("Total");

  employees.forEach((employee) => {
    const companyName = employee.company || "Société non renseignée";
    const agencyName = employee.agency || "Agence non renseignée";

    const company = companies.get(companyName) || emptyStats(companyName);
    const agency = agencies.get(agencyName) || emptyStats(agencyName);
    const companyAgency = company.agencies.get(agencyName) || emptyStats(agencyName);

    addEmployee(total, employee);
    addEmployee(company, employee);
    addEmployee(agency, employee);
    addEmployee(companyAgency, employee);

    companies.set(companyName, company);
    agencies.set(agencyName, agency);
    company.agencies.set(agencyName, companyAgency);
  });

  return {
    total,
    companies: Array.from(companies.values()).sort((a, b) => b.total - a.total),
    agencies: Array.from(agencies.values()).sort((a, b) => b.total - a.total),
  };
}

export default async function AnalyticsPage() {
  await connection();

  let data: Awaited<ReturnType<typeof getAnalyticsData>> | null = null;

  try {
    data = await getAnalyticsData();
  } catch (error) {
    console.error("Analytics database error", error);
  }

  return (
    <BackofficeShell
      title="Pilotage effectifs"
      subtitle="Vue dynamique du nombre de collaborateurs par société et par agence."
    >
      {data ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Collaborateurs" value={data.total.total} tone="slate" />
            <MetricCard label="Actifs" value={data.total.active} tone="emerald" />
            <MetricCard label="Expires" value={data.total.expired} tone="amber" />
            <MetricCard label="Suspendus" value={data.total.suspended} tone="red" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-xl font-semibold">Collaborateurs par société</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Répartition globale avec détail des agences rattachées.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {data.companies.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">Aucun collaborateur en base.</p>
                ) : (
                  data.companies.map((company) => (
                    <CompanyRow key={company.name} company={company} total={data.total.total} />
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-xl font-semibold">Classement agences</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Nombre total de collaborateurs par agence.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {data.agencies.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">Aucune agence rattachée.</p>
                ) : (
                  data.agencies.map((agency) => (
                    <SimpleGroupRow key={agency.name} group={agency} total={data.total.total} />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <DatabaseErrorPanel title="Pilotage indisponible" />
      )}
    </BackofficeShell>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "emerald" | "amber" | "red";
}) {
  const toneClass = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-4xl font-bold text-slate-950">{value}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
          dynamique
        </span>
      </div>
    </div>
  );
}

function CompanyRow({ company, total }: { company: GroupStats; total: number }) {
  const agencyRows = Array.from(company.agencies.values()).sort((a, b) => b.total - a.total);

  return (
    <div className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{company.name}</h3>
          <p className="text-sm text-slate-500">
            {company.total} collaborateur(s), {agencyRows.length} agence(s)
          </p>
        </div>
        <StatusPills group={company} />
      </div>

      <ProgressBar value={percentage(company.total, total)} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {agencyRows.map((agency) => (
          <SimpleGroupRow key={agency.name} group={agency} total={company.total} compact />
        ))}
      </div>
    </div>
  );
}

function SimpleGroupRow({
  group,
  total,
  compact = false,
}: {
  group: GroupStats;
  total: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "rounded-lg bg-slate-50 p-4" : "p-5"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{group.name}</p>
          <p className="mt-1 text-sm text-slate-500">{group.total} collaborateur(s)</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {percentage(group.total, total)}%
        </span>
      </div>
      <ProgressBar value={percentage(group.total, total)} />
      <StatusPills group={group} compact />
    </div>
  );
}

function StatusPills({ group, compact = false }: { group: GroupStats; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-3" : ""}`}>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        {group.active} actif(s)
      </span>
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        {group.expired} expire(s)
      </span>
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        {group.suspended} suspendu(s)
      </span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-emerald-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
