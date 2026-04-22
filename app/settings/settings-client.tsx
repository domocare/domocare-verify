"use client";

import { useEffect, useState } from "react";

const MAX_LOGO_SIZE = 1_500_000;

type CompanyItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  director: string | null;
};

type AgencyItem = {
  id: string;
  name: string;
  companyId: string | null;
  company?: CompanyItem | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  director: string | null;
};

type CompanyForm = {
  name: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  director: string;
};

type AgencyForm = {
  name: string;
  companyId: string;
  address: string;
  phone: string;
  email: string;
  director: string;
};

type OptionsResponse = {
  companies: CompanyItem[];
  agencies: AgencyItem[];
};

const emptyCompanyForm: CompanyForm = {
  name: "",
  logoUrl: "",
  address: "",
  phone: "",
  email: "",
  director: "",
};

const emptyAgencyForm: AgencyForm = {
  name: "",
  companyId: "",
  address: "",
  phone: "",
  email: "",
  director: "",
};

export default function SettingsClient() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [agencies, setAgencies] = useState<AgencyItem[]>([]);
  const [companyForm, setCompanyForm] = useState<CompanyForm>(emptyCompanyForm);
  const [agencyForm, setAgencyForm] = useState<AgencyForm>(emptyAgencyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingAgencyId, setEditingAgencyId] = useState<string | null>(null);

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
    let ignore = false;

    fetch("/api/settings/options")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("settings-load-failed");
        }

        return (await res.json()) as OptionsResponse;
      })
      .then((data) => {
        if (ignore) return;
        setCompanies(data.companies);
        setAgencies(data.agencies);
      })
      .catch(() => {
        if (ignore) return;
        setMessage("Impossible de charger le parametrage.");
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function readError(res: Response, fallback: string) {
    try {
      const data = (await res.json()) as { message?: string };
      return data.message || fallback;
    } catch {
      return fallback;
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Le logo doit être une image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setMessage("Le logo doit faire moins de 1,5 Mo.");
      e.target.value = "";
      return;
    }

    const logoUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    setCompanyForm((current) => ({ ...current, logoUrl }));
  }

  async function saveCompany(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/settings/companies", {
      method: editingCompanyId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingCompanyId, ...companyForm }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "La société n'a pas pu être enregistrée."));
      return;
    }

    setCompanyForm(emptyCompanyForm);
    setEditingCompanyId(null);
    await loadOptions();
  }

  async function saveAgency(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/settings/agencies", {
      method: editingAgencyId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingAgencyId, ...agencyForm }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "L'agence n'a pas pu être enregistrée."));
      return;
    }

    setAgencyForm(emptyAgencyForm);
    setEditingAgencyId(null);
    await loadOptions();
  }

  async function deleteCompany(company: CompanyItem) {
    if (!window.confirm(`Supprimer la société "${company.name}" ?`)) return;

    setMessage(null);

    const res = await fetch("/api/settings/companies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: company.id }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "La société n'a pas pu être supprimée."));
      return;
    }

    await loadOptions();
  }

  async function deleteAgency(agency: AgencyItem) {
    if (!window.confirm(`Supprimer l'agence "${agency.name}" ?`)) return;

    setMessage(null);

    const res = await fetch("/api/settings/agencies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: agency.id }),
    });

    if (!res.ok) {
      setMessage(await readError(res, "L'agence n'a pas pu être supprimée."));
      return;
    }

    await loadOptions();
  }

  function editCompany(company: CompanyItem) {
    setEditingCompanyId(company.id);
    setCompanyForm({
      name: company.name,
      logoUrl: company.logoUrl || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      director: company.director || "",
    });
  }

  function editAgency(agency: AgencyItem) {
    setEditingAgencyId(agency.id);
    setAgencyForm({
      name: agency.name,
      companyId: agency.companyId || "",
      address: agency.address || "",
      phone: agency.phone || "",
      email: agency.email || "",
      director: agency.director || "",
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Société</h2>
              <p className="mt-1 text-sm text-slate-500">Identite, logo et coordonnees groupe.</p>
            </div>
            {editingCompanyId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingCompanyId(null);
                  setCompanyForm(emptyCompanyForm);
                }}
                className="rounded-lg border px-3 py-2 text-sm font-semibold"
              >
                Annuler
              </button>
            ) : null}
          </div>

          <form onSubmit={saveCompany} className="mt-4 grid gap-3">
            <input
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Nom de la société"
              required
            />

            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              <div className="flex h-28 items-center justify-center rounded-lg border bg-slate-50 p-3">
                {companyForm.logoUrl ? (
                  <img src={companyForm.logoUrl} alt="Logo société" className="max-h-20 w-auto object-contain" />
                ) : (
                  <span className="text-sm text-slate-400">Logo</span>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full rounded-lg border px-4 py-3"
                />
                {companyForm.logoUrl ? (
                  <button
                    type="button"
                    onClick={() => setCompanyForm({ ...companyForm, logoUrl: "" })}
                    className="text-sm font-semibold text-red-700 underline"
                  >
                    Retirer le logo
                  </button>
                ) : null}
              </div>
            </div>

            <textarea
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              className="min-h-24 rounded-lg border px-4 py-3"
              placeholder="Adresse de la société"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="rounded-lg border px-4 py-3"
                placeholder="Téléphone"
              />
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="rounded-lg border px-4 py-3"
                placeholder="Email"
              />
              <input
                value={companyForm.director}
                onChange={(e) => setCompanyForm({ ...companyForm, director: e.target.value })}
                className="rounded-lg border px-4 py-3"
                placeholder="Directeur / responsable"
              />
            </div>

            <button type="submit" className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white">
              {editingCompanyId ? "Enregistrer la société" : "Ajouter la société"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Agence / site</h2>
              <p className="mt-1 text-sm text-slate-500">
                Rattachement à une société et coordonnées utilisées par défaut.
              </p>
            </div>
            {editingAgencyId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingAgencyId(null);
                  setAgencyForm(emptyAgencyForm);
                }}
                className="rounded-lg border px-3 py-2 text-sm font-semibold"
              >
                Annuler
              </button>
            ) : null}
          </div>

          <form onSubmit={saveAgency} className="mt-4 grid gap-3">
            <input
              value={agencyForm.name}
              onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Nom de l'agence ou du site"
              required
            />
            <select
              value={agencyForm.companyId}
              onChange={(e) => setAgencyForm({ ...agencyForm, companyId: e.target.value })}
              className="rounded-lg border px-4 py-3"
              required
            >
              <option value="">Rattacher à une société</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <textarea
              value={agencyForm.address}
              onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
              className="min-h-24 rounded-lg border px-4 py-3"
              placeholder="Adresse de l'agence ou du site"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                value={agencyForm.phone}
                onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                className="rounded-lg border px-4 py-3"
                placeholder="Téléphone agence"
              />
              <input
                type="email"
                value={agencyForm.email}
                onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                className="rounded-lg border px-4 py-3"
                placeholder="Email agence"
              />
              <input
                value={agencyForm.director}
                onChange={(e) => setAgencyForm({ ...agencyForm, director: e.target.value })}
                className="rounded-lg border px-4 py-3"
                placeholder="Directeur / responsable"
              />
            </div>
            <button type="submit" className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white">
              {editingAgencyId ? "Enregistrer l'agence" : "Ajouter l'agence"}
            </button>
          </form>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ReferenceList
          title="Sociétés enregistrées"
          emptyLabel="Aucune société paramétrée."
          items={companies}
          renderMeta={(company) => [company.director, company.phone, company.email].filter(Boolean).join(" - ")}
          renderLogo={(company) => company.logoUrl}
          onEdit={editCompany}
          onDelete={deleteCompany}
        />

        <ReferenceList
          title="Agences / sites enregistres"
          emptyLabel="Aucune agence paramétrée."
          items={agencies}
          renderMeta={(agency) =>
            [
              agency.company?.name || "Aucune société rattachée",
              agency.director,
              agency.phone,
              agency.email,
            ]
              .filter(Boolean)
              .join(" - ")
          }
          onEdit={editAgency}
          onDelete={deleteAgency}
        />
      </div>

      {message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function ReferenceList<T extends { id: string; name: string }>({
  title,
  emptyLabel,
  items,
  renderMeta,
  renderLogo,
  onEdit,
  onDelete,
}: {
  title: string;
  emptyLabel: string;
  items: T[];
  renderMeta: (item: T) => string;
  renderLogo?: (item: T) => string | null;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        ) : (
          items.map((item) => {
            const logo = renderLogo?.(item);

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  {logo ? (
                    <div className="flex h-14 w-20 items-center justify-center rounded-lg border bg-white p-2">
                      <img src={logo} alt={`Logo ${item.name}`} className="max-h-10 w-auto object-contain" />
                    </div>
                  ) : null}
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{renderMeta(item) || "-"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
