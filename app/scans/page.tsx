import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import { BadgeCheck, Clock3, ShieldAlert } from "lucide-react";

async function getScans() {
  return prisma.scanLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function ScansPage() {
  await connection();

  let scans: Awaited<ReturnType<typeof getScans>> | null = null;

  try {
    scans = await getScans();
  } catch (error) {
    console.error("Scans database error", error);
  }

  return (
    <BackofficeShell
      title="Historique des scans"
      subtitle="Journal des vérifications effectuées"
    >
      {scans ? (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {scans.length === 0 ? (
            <p className="p-6 text-slate-500">Aucun scan enregistre</p>
          ) : (
            <div className="overflow-hidden">
              <div className="hidden grid-cols-[1.1fr_160px_180px_160px] gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                <span>Token</span>
                <span>Résultat</span>
                <span>Société</span>
                <span>Date</span>
              </div>
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="grid gap-3 border-b px-5 py-4 last:border-b-0 lg:grid-cols-[1.1fr_160px_180px_160px] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="break-all font-mono text-sm font-semibold text-slate-950">
                      {scan.token}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      IP {scan.ipAddress || "-"} - {scan.userAgent || "Terminal inconnu"}
                    </div>
                  </div>

                  <ScanBadge result={scan.result} />
                  <div className="text-sm font-medium text-slate-700">{scan.company || "-"}</div>
                  <div className="text-sm text-slate-500">
                    {new Date(scan.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <DatabaseErrorPanel title="Historique indisponible" />
      )}
    </BackofficeShell>
  );
}

function ScanBadge({ result }: { result: string }) {
  const Icon = result === "valid" ? BadgeCheck : result === "expired" ? Clock3 : ShieldAlert;
  const className =
    result === "valid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : result === "expired"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {result}
    </span>
  );
}
