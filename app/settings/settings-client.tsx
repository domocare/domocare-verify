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
  const [editingCompany, setEditingCompany] = useState<SettingItem | null>(null);
  const [editingAgency, setEditingAgency] = useState<SettingItem | null>(null);
  const [companyEditName, setCompanyEditName] = useState("");
  const [agencyEditName, setAgencyEditName] = useState("");

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

  async function readError(res: Response, fallback: string) {
    try {
      const data = (await res.json()) as { message?: string };
      return data.message || fallback;
    } catch {
      return fallback;
    }
  }

  async function updateCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCompany) return;

    setMessage(null);

    const res = await fetch("/api/settings/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingCompany.id, name: companyEditName }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "La societe n'a pas pu etre modifiee."));
      return;
    }

    setEditingCompany(null);
    setCompanyEditName("");
    await loadOptions();
  }

  async function updateAgency(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAgency) return;

    setMessage(null);

    const res = await fetch("/api/settings/agencies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingAgency.id, name: agencyEditName }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "L'agence n'a pas pu etre modifiee."));
      return;
    }

    setEditingAgency(null);
    setAgencyEditName("");
    await loadOptions();
  }

  async function deleteCompany(company: SettingItem) {
    if (!window.confirm(`Supprimer la societe "${company.name}" ?`)) return;

    setMessage(null);

    const res = await fetch("/api/settings/companies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: company.id }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "La societe n'a pas pu etre supprimee."));
      return;
    }

    await loadOptions();
  }

  async function deleteAgency(agency: SettingItem) {
    if (!window.confirm(`Supprimer l'agence "${agency.name}" ?`)) return;

    setMessage(null);

    const res = await fetch("/api/settings/agencies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: agency.id }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "L'agence n'a pas pu etre supprimee."));
      return;
    }

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
              <SettingRow
                key={company.id}
                item={company}
                editingItem={editingCompany}
                editName={companyEditName}
                setEditName={setCompanyEditName}
                startEdit={() => {
                  setEditingCompany(company);
                  setCompanyEditName(company.name);
                }}
                cancelEdit={() => {
                  setEditingCompany(null);
                  setCompanyEditName("");
                }}
                onSubmit={updateCompany}
                onDelete={() => deleteCompany(company)}
              />
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
              <SettingRow
                key={agency.id}
                item={agency}
                editingItem={editingAgency}
                editName={agencyEditName}
                setEditName={setAgencyEditName}
                startEdit={() => {
                  setEditingAgency(agency);
                  setAgencyEditName(agency.name);
                }}
                cancelEdit={() => {
                  setEditingAgency(null);
                  setAgencyEditName("");
                }}
                onSubmit={updateAgency}
                onDelete={() => deleteAgency(agency)}
              />
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

function SettingRow({
  item,
  editingItem,
  editName,
  setEditName,
  startEdit,
  cancelEdit,
  onSubmit,
  onDelete,
}: {
  item: SettingItem;
  editingItem: SettingItem | null;
  editName: string;
  setEditName: (value: string) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
}) {
  const isEditing = editingItem?.id === item.id;

  if (isEditing) {
    return (
      <form onSubmit={onSubmit} className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border bg-white px-4 py-2"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium text-slate-900">{item.name}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={startEdit}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
