"use client";

import { useState } from "react";

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

export default function ClientCodesManager({
  customer,
  accessCodes,
}: {
  customer: Customer;
  accessCodes: AccessCode[];
}) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

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

  if (!customer.portalCanViewCodes) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        La gestion des codes n&apos;est pas activée pour ce portail.
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Nouveau code</h2>
        <form onSubmit={createCode} className="mt-4 grid gap-3">
          <select
            className="rounded-lg border px-4 py-3"
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
            className="rounded-lg border px-4 py-3"
            placeholder="Libellé du code"
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
          />
          <input
            className="rounded-lg border px-4 py-3"
            placeholder="Code 6 à 8 chiffres"
            value={form.code}
            onChange={(event) => setForm({ ...form, code: event.target.value.replace(/\D/g, "").slice(0, 8) })}
            minLength={6}
            maxLength={8}
            required
          />
          <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isOneTime}
              onChange={(event) => setForm({ ...form, isOneTime: event.target.checked })}
            />
            Usage unique
          </label>
          <input
            type="date"
            className="rounded-lg border px-4 py-3"
            value={form.expiresAt}
            onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
          />
          <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
            Créer le code
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Codes enregistrés</h2>
        <div className="mt-4 grid gap-3">
          {accessCodes.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun code créé.</p>
          ) : (
            accessCodes.map((code) => {
              const site = customer.sites.find((item) => item.id === code.siteId);

              return (
                <div key={code.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">{code.label || "Code d&apos;accès"}</p>
                    <p className="text-sm text-slate-500">
                      {site ? site.name : "Tous les sites"} - finit par {code.codeLast4 || "----"}
                      {code.isOneTime ? " - usage unique" : ""}
                      {code.usedAt ? " - utilisé" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCode(code.id, !code.isActive)}
                    className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                      code.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {code.isActive ? "Actif" : "Inactif"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
