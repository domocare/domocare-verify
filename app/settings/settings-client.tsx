"use client";

import { useEffect, useState } from "react";

type SettingItem = {
  id: string;
  name: string;
};

type OptionsResponse = {
  companies: SettingItem[];
  agencies: SettingItem[];
};

export default function SettingsClient() {
  const [companies, setCompanies] = useState<SettingItem[]>([]);
  const [agencies, setAgencies] = useState<SettingItem[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function loadOptions() {
    const res = await fetch("/api/settings/options");

    if (!res.ok) {
      setMessage("Impossible de charger le parametrage.");
      return;
    }

    const data = (await res.json()) as OptionsResponse;
    setCompanies(data.companies);
    setAgencies(data.agencies);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialOptions() {
      const res = await fetch("/api/settings/options");

      if (!isMounted) return;

      if (!res.ok) {
        setMessage("Impossible de charger le parametrage.");
        return;
      }

      const data = (await res.json()) as OptionsResponse;

      if (!isMounted) return;

      setCompanies(data.companies);
      setAgencies(data.agencies);
    }

    void loadInitialOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  async function addCompany(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/settings/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName }),
    });

    if (!res.ok) {
      setMessage("La societe n'a pas pu etre ajoutee.");
      return;
    }

    setCompanyName("");
    await loadOptions();
  }

  async function addAgency(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/settings/agencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: agencyName }),
    });

    if (!res.ok) {
      setMessage("L'agence n'a pas pu etre ajoutee.");
      return;
    }

    setAgencyName("");
    await loadOptions();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Societes</h2>

        <form onSubmit={addCompany} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border px-4 py-3"
            placeholder="Nom de la societe"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white"
          >
            Ajouter
          </button>
        </form>

        <div className="mt-5 space-y-2">
          {companies.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune societe parametree.</p>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="rounded-lg bg-slate-50 px-4 py-3">
                {company.name}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Agences</h2>

        <form onSubmit={addAgency} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border px-4 py-3"
            placeholder="Nom de l'agence"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white"
          >
            Ajouter
          </button>
        </form>

        <div className="mt-5 space-y-2">
          {agencies.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune agence parametree.</p>
          ) : (
            agencies.map((agency) => (
              <div key={agency.id} className="rounded-lg bg-slate-50 px-4 py-3">
                {agency.name}
              </div>
            ))
          )}
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 lg:col-span-2">
          {message}
        </div>
      ) : null}
    </div>
  );
}
