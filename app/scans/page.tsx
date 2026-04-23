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

function formatLocation(scan: {
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
        accuracy: scan.locationSource === "ip" ? "Approximation réseau" : null,
        url: null,
        place: null,
      };
    }

    return null;
  }

  return {
    place: scan.locationLabel || null,
    label: `${scan.latitude.toFixed(5)}, ${scan.longitude.toFixed(5)}`,
    accuracy: scan.accuracy ? `± ${Math.round(scan.accuracy)} m` : "Approximation réseau",
    url: `https://www.google.com/maps?q=${scan.latitude},${scan.longitude}`,
  };
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
            <p className="p-6 text-slate-500">Aucun scan enregistré</p>
          ) : (
            <div className="overflow-hidden">
              <div className="hidden grid-cols-[1fr_140px_160px_210px_160px] gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                <span>Token</span>
                <span>Résultat</span>
                <span>Société</span>
                <span>Géolocalisation</span>
                <span>Date</span>
              </div>
              {scans.map((scan) => {
                const location = formatLocation(scan);

                return (
                  <div
                    key={scan.id}
                    className="grid gap-3 border-b px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_140px_160px_210px_160px] lg:items-center"
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
                    <div className="text-sm text-slate-600">
                      {location ? (
                        location.url ? (
                          <a
                            href={location.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-emerald-700 underline"
                          >
                            {location.place ? (
                              <span className="block text-slate-700">{location.place}</span>
                            ) : null}
                            {location.label}
                            {location.accuracy ? (
                              <span className="block text-xs font-medium text-slate-500">
                                {location.accuracy}
                              </span>
                            ) : null}
                          </a>
                        ) : (
                          <span>
                            <span className="font-semibold text-slate-700">{location.label}</span>
                            {location.accuracy ? (
                              <span className="block text-xs text-slate-500">{location.accuracy}</span>
                            ) : null}
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">Non disponible</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(scan.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                );
              })}
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
