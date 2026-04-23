"use client";

import { useMemo, useState } from "react";

type Site = {
  id: string;
  name: string;
  codeRequired: boolean;
  isActive: boolean;
};

type Customer = {
  id: string;
  name: string;
  sites: Site[];
  portalCanViewCodes: boolean;
};

type AccessCode = {
  id: string;
  siteId: string | null;
  label: string;
  codeLast4: string | null;
  scope: string;
  isOneTime: boolean;
  isActive: boolean;
  expiresAt: Date | string | null;
  usedAt: Date | string | null;
  createdAt: Date | string;
};

const emptyForm = {
  siteId: "",
  label: "",
  code: "",
  isOneTime: false,
  expiresAt: "",
};

function formatDate(value: Date | string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
}

function getCodeState(code: AccessCode) {
  if (code.usedAt) {
    return {
      label: "Utilisé",
      className: "bg-amber-50 text-amber-700",
    };
  }

  if (code.isActive) {
    return {
      label: "Actif",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "Inactif",
    className: "bg-red-50 text-red-700",
  };
}

export default function ClientCodesManager({
  customer,
  accessCodes,
}: {
  customer: Customer;
  accessCodes: AccessCode[];
}) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  async function createCode(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const res = await fetch("/api/customers/access-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setMessage("Le code n'a pas pu être créé.");
      return;
    }

    window.location.reload();
  }

  async function toggleCode(id: string, nextValue: boolean) {
    const res = await fetch("/api/customers/access-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: nextValue }),
    });

    if (!res.ok) {
      setMessage("Le code n'a pas pu être mis à jour.");
      return;
    }

    window.location.reload();
  }

  const filteredCodes = useMemo(() => {
    return accessCodes.filter((code) => {
      const siteName = customer.sites.find((item) => item.id === code.siteId)?.name || "Tous les sites";
      const state = getCodeState(code).label;

      const matchesSite = siteFilter === "all" || siteName === siteFilter;
      const matchesStatus = statusFilter === "all" || state === statusFilter;

      return matchesSite && matchesStatus;
    });
  }, [accessCodes, customer.sites, siteFilter, statusFilter]);

  const stats = useMemo(() => {
    return accessCodes.reduce(
      (accumulator, code) => {
        accumulator.total += 1;
        if (code.isActive && !code.usedAt) accumulator.active += 1;
        if (code.isOneTime) accumulator.oneTime += 1;
        if (code.usedAt) accumulator.used += 1;
        return accumulator;
      },
      { total: 0, active: 0, oneTime: 0, used: 0 },
    );
  }, [accessCodes]);

  if (!customer.portalCanViewCodes) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        La gestion des codes n&apos;est pas activée pour ce portail.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Codes total" value={stats.total} tone="slate" />
        <StatCard label="Actifs" value={stats.active} tone="emerald" />
        <StatCard label="Usage unique" value={stats.oneTime} tone="amber" />
        <StatCard label="Déjà utilisés" value={stats.used} tone="red" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Nouveau code</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Créez un code de 6 à 8 chiffres pour un site précis ou pour l&apos;ensemble de vos sites.
          </p>

          <form onSubmit={createCode} className="mt-4 grid gap-3">
            <select
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              value={form.siteId}
              onChange={(event) => setForm({ ...form, siteId: event.target.value })}
            >
              <option value="">Code valable pour tous vos sites</option>
              {customer.sites.filter((site) => site.isActive).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>

            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Libellé du code"
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
            />

            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Code 6 à 8 chiffres"
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value.replace(/\D/g, "").slice(0, 8) })
              }
              minLength={6}
              maxLength={8}
              required
            />

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.isOneTime}
                onChange={(event) => setForm({ ...form, isOneTime: event.target.checked })}
              />
              Usage unique
            </label>

            <input
              type="date"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              value={form.expiresAt}
              onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
            />

            <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              Créer le code
            </button>
          </form>

          {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-xl font-bold text-slate-950">Codes enregistrés</h2>
            <p className="mt-1 text-sm text-slate-500">
              Activez, désactivez et contrôlez vos codes par site et par usage.
            </p>
          </div>

          <div className="grid gap-3 border-b border-slate-100 px-5 py-4 md:grid-cols-2">
            <select
              value={siteFilter}
              onChange={(event) => setSiteFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
            >
              <option value="all">Tous les sites</option>
              {Array.from(
                new Set(
                  accessCodes.map(
                    (code) => customer.sites.find((site) => site.id === code.siteId)?.name || "Tous les sites",
                  ),
                ),
              )
                .sort((left, right) => left.localeCompare(right, "fr"))
                .map((siteName) => (
                  <option key={siteName} value={siteName}>
                    {siteName}
                  </option>
                ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
            >
              <option value="all">Tous les états</option>
              <option value="Actif">Actifs</option>
              <option value="Inactif">Inactifs</option>
              <option value="Utilisé">Utilisés</option>
            </select>
          </div>

          <div className="grid gap-3 p-5">
            {filteredCodes.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun code ne correspond à vos filtres.</p>
            ) : (
              filteredCodes.map((code) => {
                const site = customer.sites.find((item) => item.id === code.siteId);
                const state = getCodeState(code);

                return (
                  <div
                    key={code.id}
                    className="grid gap-3 rounded-lg border border-slate-200 p-4 lg:grid-cols-[1fr_170px_180px] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-950">{code.label || "Code d&apos;accès"}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${state.className}`}>
                          {state.label}
                        </span>
                        {code.isOneTime ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            Usage unique
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {site ? site.name : "Tous les sites"} - finit par {code.codeLast4 || "----"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        Créé le {formatDate(code.createdAt)} - expire le {formatDate(code.expiresAt)}
                        {code.usedAt ? ` - utilisé le ${formatDate(code.usedAt)}` : ""}
                      </p>
                    </div>

                    <div className="text-sm text-slate-600">
                      <p>Portée : {site ? "Site ciblé" : "Tous les sites"}</p>
                      <p className="mt-1">Statut technique : {code.scope}</p>
                    </div>

                    <div className="flex justify-start lg:justify-end">
                      <button
                        type="button"
                        onClick={() => toggleCode(code.id, !code.isActive)}
                        disabled={Boolean(code.usedAt)}
                        className={`rounded-lg border px-4 py-3 text-sm font-bold ${
                          code.usedAt
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : code.isActive
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {code.usedAt ? "Verrouillé" : code.isActive ? "Désactiver" : "Réactiver"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
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
  tone: "slate" | "emerald" | "amber" | "red";
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
  } as const;

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
