import CustomerPortalShell from "@/components/customer-portal-shell";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

function StatCard({
  label,
  value,
  help,
}: {
  label: string;
  value: number;
  help: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{help}</p>
    </div>
  );
}

export default async function ClientDashboardPage() {
  const customer = await getCustomerSession();
  if (!customer) return null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [sites, activeCodes, totalScans, scansToday, validatedScans, refusedScans, oneTimeUsed, scanSites, recentScans] =
    await Promise.all([
      prisma.customerSite.count({ where: { customerId: customer.id, isActive: true } }),
      prisma.customerAccessCode.count({ where: { customerId: customer.id, isActive: true } }),
      prisma.scanLog.count({ where: { customerId: customer.id } }),
      prisma.scanLog.count({ where: { customerId: customer.id, createdAt: { gte: todayStart } } }),
      prisma.scanLog.count({
        where: {
          customerId: customer.id,
          result: { in: ["valid", "valid_code"] },
        },
      }),
      prisma.scanLog.count({
        where: {
          customerId: customer.id,
          result: { in: ["invalid", "invalid_code", "expired", "suspended"] },
        },
      }),
      prisma.scanLog.count({
        where: {
          customerId: customer.id,
          accessCodeStatus: "approved_one_time",
        },
      }),
      prisma.scanLog.findMany({
        where: { customerId: customer.id },
        select: { customerSiteName: true },
      }),
      prisma.scanLog.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          token: true,
          result: true,
          accessCodeStatus: true,
          customerSiteName: true,
          locationLabel: true,
          createdAt: true,
        },
      }),
    ]);

  const siteBreakdown = Object.entries(
    scanSites.reduce<Record<string, number>>((accumulator, scan) => {
      const key = scan.customerSiteName || "Tous les sites";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);

  return (
    <CustomerPortalShell
      title="Vue d'ensemble"
      subtitle="Suivi des accès, validations par code et activité récente de vos sites."
      customer={customer}
      active="dashboard"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sites actifs" value={sites} help="Sites d'intervention actuellement ouverts." />
        <StatCard label="Codes actifs" value={activeCodes} help="Codes permanents ou temporaires disponibles." />
        <StatCard label="Scans aujourd'hui" value={scansToday} help="Activité relevée depuis minuit." />
        <StatCard label="Scans totaux" value={totalScans} help="Historique enregistré sur votre portail." />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-950">KPI sécurité</h2>
              <p className="mt-1 text-sm text-slate-500">
                Double authentification QR code + code client final.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">Validations</p>
              <p className="mt-2 text-3xl font-black text-emerald-900">{validatedScans}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">Refus</p>
              <p className="mt-2 text-3xl font-black text-red-900">{refusedScans}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-700">Codes usage unique utilisés</p>
              <p className="mt-2 text-3xl font-black text-amber-900">{oneTimeUsed}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Sites les plus scannés</h2>
          <div className="mt-4 grid gap-3">
            {siteBreakdown.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun scan enregistré pour le moment.</p>
            ) : (
              siteBreakdown.map(([siteName, count]) => (
                <div key={siteName} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-950">{siteName}</p>
                    <p className="text-sm text-slate-500">Volume d&apos;activité observé</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-xl font-bold text-slate-950">Derniers scans</h2>
          <p className="mt-1 text-sm text-slate-500">
            Vue rapide pour votre accueil, votre sécurité ou votre exploitation.
          </p>
        </div>

        {recentScans.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Aucun scan enregistré.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentScans.map((scan) => {
              const isSuccess = scan.result === "valid" || scan.result === "valid_code";

              return (
                <div key={scan.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_160px_150px_180px] md:items-center">
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-950">{scan.token}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {scan.customerSiteName || "Tous les sites"}
                      {scan.locationLabel ? ` - ${scan.locationLabel}` : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                      isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {isSuccess ? "Validé" : "Refusé"}
                  </span>
                  <p className="text-sm text-slate-600">{scan.accessCodeStatus || "-"}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(scan.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </CustomerPortalShell>
  );
}
