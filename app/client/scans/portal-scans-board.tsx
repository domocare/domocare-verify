"use client";

import { useMemo, useState } from "react";

type ScanItem = {
  id: string;
  token: string;
  result: string;
  accessCodeStatus: string | null;
  customerName: string | null;
  customerSiteName: string | null;
  locationLabel: string | null;
  createdAt: Date | string;
};

function getResultMeta(result: string) {
  if (result === "valid" || result === "valid_code") {
    return {
      label: "Validé",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (result === "expired" || result === "suspended") {
    return {
      label: "À vérifier",
      className: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Refusé",
    className: "bg-red-50 text-red-700",
  };
}

function formatAccessStatus(value: string | null) {
  switch (value) {
    case "not_required":
      return "QR suffisant";
    case "approved":
      return "Code validé";
    case "approved_one_time":
      return "Code usage unique validé";
    case "refused":
      return "Code refusé";
    case "qr_not_authorized":
      return "QR non autorisé";
    case "no_customer":
      return "Aucun client final";
    case "no_token":
      return "QR absent";
    default:
      return value || "-";
  }
}

export default function PortalScansBoard({ scans }: { scans: ScanItem[] }) {
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("all");

  const sites = useMemo(
    () =>
      Array.from(
        new Set(scans.map((scan) => scan.customerSiteName || "Tous les sites")),
      ).sort((left, right) => left.localeCompare(right, "fr")),
    [scans],
  );

  const filteredScans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return scans.filter((scan) => {
      const meta = getResultMeta(scan.result);
      const siteName = scan.customerSiteName || "Tous les sites";

      const matchesQuery =
        !normalizedQuery ||
        scan.token.toLowerCase().includes(normalizedQuery) ||
        siteName.toLowerCase().includes(normalizedQuery) ||
        (scan.locationLabel || "").toLowerCase().includes(normalizedQuery);

      const matchesResult = resultFilter === "all" || meta.label === resultFilter;
      const matchesSite = siteFilter === "all" || siteName === siteFilter;

      return matchesQuery && matchesResult && matchesSite;
    });
  }, [query, resultFilter, scans, siteFilter]);

  const stats = useMemo(() => {
    return filteredScans.reduce(
      (accumulator, scan) => {
        const meta = getResultMeta(scan.result);
        accumulator.total += 1;
        if (meta.label === "Validé") accumulator.validated += 1;
        if (meta.label === "Refusé") accumulator.refused += 1;
        if (meta.label === "À vérifier") accumulator.review += 1;
        return accumulator;
      },
      { total: 0, validated: 0, refused: 0, review: 0 },
    );
  }, [filteredScans]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Scans affichés" value={stats.total} tone="slate" />
        <StatCard label="Validés" value={stats.validated} tone="emerald" />
        <StatCard label="Refusés" value={stats.refused} tone="red" />
        <StatCard label="À vérifier" value={stats.review} tone="amber" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_240px]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
            placeholder="Rechercher un token, un site ou une localisation"
          />

          <select
            value={resultFilter}
            onChange={(event) => setResultFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
          >
            <option value="all">Tous les résultats</option>
            <option value="Validé">Validés</option>
            <option value="Refusé">Refusés</option>
            <option value="À vérifier">À vérifier</option>
          </select>

          <select
            value={siteFilter}
            onChange={(event) => setSiteFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
          >
            <option value="all">Tous les sites</option>
            {sites.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-xl font-bold text-slate-950">Journal des scans</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chaque ligne conserve le résultat du scan, le site visé et le contexte de validation.
          </p>
        </div>

        {filteredScans.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Aucun scan ne correspond à vos filtres.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredScans.map((scan) => {
              const meta = getResultMeta(scan.result);

              return (
                <div
                  key={scan.id}
                  className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_150px_210px_170px] lg:items-center"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-950">{scan.token}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {scan.customerSiteName || "Tous les sites"}
                      {scan.customerName ? ` - ${scan.customerName}` : ""}
                    </p>
                    {scan.locationLabel ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        {scan.locationLabel}
                      </p>
                    ) : null}
                  </div>

                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-bold ${meta.className}`}>
                    {meta.label}
                  </span>

                  <p className="text-sm font-medium text-slate-600">
                    {formatAccessStatus(scan.accessCodeStatus)}
                  </p>

                  <p className="text-sm text-slate-500">
                    {new Date(scan.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "emerald" | "red" | "amber";
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  } as const;

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
