"use client";

import { useEffect, useState } from "react";
import BackofficeShell from "@/components/backoffice-shell";

const MAX_PHOTO_SIZE = 1_500_000;

type SettingItem = {
  id: string;
  name: string;
};

type CompanyItem = SettingItem & {
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  director?: string | null;
};

type AgencyItem = SettingItem & {
  companyId: string | null;
  company?: SettingItem | null;
  siret?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  director?: string | null;
};

type InterventionTypeItem = SettingItem & {
  description?: string | null;
  isActive: boolean;
};

type CustomerSiteItem = {
  id: string;
  customerId: string;
  name: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  codeRequired: boolean;
  isActive: boolean;
};

type CustomerItem = SettingItem & {
  accessCodeEnabled: boolean;
  sites: CustomerSiteItem[];
};

type OptionsResponse = {
  companies: CompanyItem[];
  agencies: AgencyItem[];
};

function splitAgencyNames(value: string) {
  return value
    .split(",")
    .map((agency) => agency.trim())
    .filter(Boolean);
}

export default function NewEmployeePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    company: "",
    agency: "",
    photoUrl: "",
    phoneAgency: "",
    interventionTypeId: "",
    interventionType: "",
    customerId: "",
    customerSiteId: "",
    vehiclePlate: "",
    authorizedSite: "",
    status: "active",
    expiresAt: "",
  });
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [agencies, setAgencies] = useState<AgencyItem[]>([]);
  const [interventionTypes, setInterventionTypes] = useState<InterventionTypeItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const [res, interventionsRes, customersRes] = await Promise.all([
        fetch("/api/settings/options"),
        fetch("/api/intervention-types"),
        fetch("/api/customers"),
      ]);

      if (!res.ok || !interventionsRes.ok || !customersRes.ok) {
        setSettingsError("Impossible de charger les référentiels.");
        return;
      }

      const data = (await res.json()) as OptionsResponse;
      const interventionsData = (await interventionsRes.json()) as {
        interventionTypes: InterventionTypeItem[];
      };
      const customersData = (await customersRes.json()) as { customers: CustomerItem[] };
      setCompanies(data.companies);
      setAgencies(data.agencies);
      setInterventionTypes(interventionsData.interventionTypes.filter((item) => item.isActive));
      setCustomers(customersData.customers);
    }

    void loadSettings();
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoError(null);

    if (!file) {
      setForm((current) => ({ ...current, photoUrl: "" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Le fichier doit être une image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("La photo doit faire moins de 1,5 Mo.");
      e.target.value = "";
      return;
    }

    const photoUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    setForm((current) => ({ ...current, photoUrl }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Collaborateur créé");
      window.location.href = "/employees";
    } else {
      alert("Erreur lors de la création");
    }
  }

  const selectedCompany = companies.find((company) => company.name === form.company);
  const filteredAgencies = selectedCompany
    ? agencies.filter((agency) => agency.companyId === selectedCompany.id)
    : [];
  const selectedAgencyNames = splitAgencyNames(form.agency);
  const selectedAgencies = agencies.filter((agency) => selectedAgencyNames.includes(agency.name));
  const selectedAgencyPhones = Array.from(
    new Set(selectedAgencies.map((agency) => agency.phone).filter(Boolean)),
  );
  const selectedCustomer = customers.find((customer) => customer.id === form.customerId);
  const availableSites = selectedCustomer?.sites.filter((site) => site.isActive) || [];

  return (
    <BackofficeShell
      title="Nouveau collaborateur"
      subtitle="Créer une nouvelle fiche intervenant"
    >
      <div className="max-w-3xl rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="w-full rounded-lg border p-3"
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />

            <input
              className="w-full rounded-lg border p-3"
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <div className="flex items-center justify-center rounded-lg border bg-slate-50 p-3">
              {form.photoUrl ? (
                <img
                  src={form.photoUrl}
                  alt="Aperçu photo"
                  className="h-36 w-36 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-lg bg-white text-center text-sm text-slate-400">
                  Photo
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Photo du collaborateur</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full rounded-lg border px-4 py-3"
              />
              {photoError ? <p className="text-sm text-red-600">{photoError}</p> : null}
              {form.photoUrl ? (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, photoUrl: "" })}
                  className="text-sm underline"
                >
                  Retirer la photo
                </button>
              ) : null}
            </div>
          </div>

          <input
            className="w-full rounded-lg border p-3"
            placeholder="Fonction"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Société</label>
              <select
                className="w-full rounded-lg border p-3"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value, agency: "", phoneAgency: "" })
                }
              >
                <option value="">Choisir une société</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Agences</label>
              <select
                className="min-h-32 w-full rounded-lg border p-3"
                value={selectedAgencyNames}
                multiple
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                  const phones = Array.from(
                    new Set(
                      agencies
                        .filter((agency) => values.includes(agency.name))
                        .map((agency) => agency.phone)
                        .filter(Boolean),
                    ),
                  );

                  setForm({
                    ...form,
                    agency: values.join(", "),
                    phoneAgency: phones.join(" / ") || form.phoneAgency,
                  });
                }}
                disabled={!form.company}
              >
                {filteredAgencies.map((agency) => (
                  <option key={agency.id} value={agency.name}>
                    {agency.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Maintenez Ctrl pour sélectionner plusieurs agences.
              </p>
            </div>
          </div>

          {settingsError ? <p className="text-sm text-red-600">{settingsError}</p> : null}

          {companies.length === 0 || agencies.length === 0 ? (
            <a href="/settings" className="text-sm underline">
              Ajouter des sociétés ou agences dans Paramétrage
            </a>
          ) : null}

          <input
            className="w-full rounded-lg border p-3"
            placeholder="Téléphone agence"
            value={form.phoneAgency}
            onChange={(e) => setForm({ ...form, phoneAgency: e.target.value })}
          />
          {selectedAgencyPhones.length > 0 ? (
            <p className="text-sm text-slate-500">
              Téléphone repris depuis l&apos;agence : {selectedAgencyPhones.join(" / ")}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <select
              className="w-full rounded-lg border p-3"
              value={form.interventionTypeId}
              onChange={(e) => {
                const intervention = interventionTypes.find((item) => item.id === e.target.value);
                setForm({
                  ...form,
                  interventionTypeId: e.target.value,
                  interventionType: intervention?.name || "",
                });
              }}
            >
              <option value="">Type intervention autorisée</option>
              {interventionTypes.map((intervention) => (
                <option key={intervention.id} value={intervention.id}>
                  {intervention.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-lg border p-3"
              placeholder="Véhicule / plaque"
              value={form.vehiclePlate}
              onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
            />
            <select
              className="w-full rounded-lg border p-3"
              value={form.customerId}
              onChange={(e) => {
                const customer = customers.find((item) => item.id === e.target.value);
                setForm({
                  ...form,
                  customerId: e.target.value,
                  customerSiteId: "",
                  authorizedSite: customer?.name || "",
                });
              }}
            >
              <option value="">Client ou site autorisé</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer ? (
            <select
              className="w-full rounded-lg border p-3"
              value={form.customerSiteId}
              onChange={(e) => {
                const site = availableSites.find((item) => item.id === e.target.value);
                setForm({
                  ...form,
                  customerSiteId: e.target.value,
                  authorizedSite: site ? `${selectedCustomer.name} - ${site.name}` : selectedCustomer.name,
                });
              }}
            >
              <option value="">Tous les sites du client</option>
              {availableSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                  {site.codeRequired ? " - code requis" : ""}
                </option>
              ))}
            </select>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="w-full rounded-lg border p-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">active</option>
              <option value="expired">expired</option>
              <option value="revoked">revoked</option>
            </select>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date expiration du QR code</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-lg bg-black px-5 py-3 text-white"
            >
              Créer le collaborateur
            </button>
          </div>
        </form>
      </div>
    </BackofficeShell>
  );
}
