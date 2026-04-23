"use client";

import { useEffect, useMemo, useState } from "react";

const MAX_LOGO_SIZE = 1_500_000;

type CustomerSite = {
  id: string;
  customerId: string;
  name: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  codeRequired: boolean;
  isActive: boolean;
};

type PortalUser = {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  isActive: boolean;
};

type Customer = {
  id: string;
  name: string;
  email: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  siret: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  activity: string | null;
  accessCodeEnabled: boolean;
  clientPortalEnabled: boolean;
  portalCanViewCodes: boolean;
  portalCanViewSites: boolean;
  portalCanViewScans: boolean;
  portalCanManageUsers: boolean;
  portalUsers: PortalUser[];
  sites: CustomerSite[];
};

const emptyCustomerForm = {
  id: "",
  name: "",
  email: "",
  logoUrl: "",
  brandColor: "#0f766e",
  siret: "",
  address: "",
  postalCode: "",
  city: "",
  activity: "",
  accessCodeEnabled: false,
  clientPortalEnabled: false,
  portalCanViewCodes: true,
  portalCanViewSites: true,
  portalCanViewScans: true,
  portalCanManageUsers: true,
};

const emptySiteForm = {
  id: "",
  customerId: "",
  name: "",
  address: "",
  postalCode: "",
  city: "",
  codeRequired: false,
  isActive: true,
};

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [siteForm, setSiteForm] = useState(emptySiteForm);
  const [message, setMessage] = useState<string | null>(null);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === siteForm.customerId) || customers[0],
    [customers, siteForm.customerId],
  );

  async function loadCustomers() {
    const res = await fetch("/api/customers", { cache: "no-store" });

    if (!res.ok) {
      setMessage("Impossible de charger les clients finaux.");
      return;
    }

    const data = (await res.json()) as { customers: Customer[] };
    setCustomers(data.customers);
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialCustomers() {
      const res = await fetch("/api/customers", { cache: "no-store" });
      if (!mounted) return;

      if (!res.ok) {
        setMessage("Impossible de charger les clients finaux.");
        return;
      }

      const data = (await res.json()) as { customers: Customer[] };
      if (mounted) setCustomers(data.customers);
    }

    void loadInitialCustomers();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Le logo doit être une image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setMessage("Le logo doit faire moins de 1,5 Mo.");
      event.target.value = "";
      return;
    }

    const logoUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    setCustomerForm((current) => ({ ...current, logoUrl }));
  }

  async function saveCustomer(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const res = await fetch("/api/customers", {
      method: customerForm.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerForm),
    });

    if (!res.ok) {
      setMessage("Le client final n'a pas pu être enregistré.");
      return;
    }

    setCustomerForm(emptyCustomerForm);
    await loadCustomers();
  }

  async function saveSite(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const customerId = siteForm.customerId || selectedCustomer?.id || "";
    const res = await fetch("/api/customers/sites", {
      method: siteForm.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...siteForm, customerId }),
    });

    if (!res.ok) {
      setMessage("Le site n'a pas pu être enregistré.");
      return;
    }

    setSiteForm({ ...emptySiteForm, customerId });
    await loadCustomers();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[480px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          {customerForm.id ? "Modifier le client final" : "Nouveau client final"}
        </h2>

        <form onSubmit={saveCustomer} className="mt-4 grid gap-3">
          <input
            className="rounded-lg border px-4 py-3"
            placeholder="Nom du client final"
            value={customerForm.name}
            onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })}
            required
          />

          <input
            type="email"
            className="rounded-lg border px-4 py-3"
            placeholder="Email du premier administrateur client final"
            value={customerForm.email}
            onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-[132px_1fr]">
            <div className="flex h-24 items-center justify-center rounded-lg border bg-slate-50 p-2">
              {customerForm.logoUrl ? (
                <img src={customerForm.logoUrl} alt="Logo client final" className="max-h-16 w-auto object-contain" />
              ) : (
                <span className="text-xs text-slate-400">Logo</span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full rounded-lg border px-4 py-3"
              />
              <input
                type="color"
                value={customerForm.brandColor}
                onChange={(event) => setCustomerForm({ ...customerForm, brandColor: event.target.value })}
                className="h-12 w-full rounded-lg border px-2 py-2"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border px-4 py-3"
              placeholder="SIRET"
              value={customerForm.siret}
              onChange={(event) => setCustomerForm({ ...customerForm, siret: event.target.value })}
            />
            <input
              className="rounded-lg border px-4 py-3"
              placeholder="Activité"
              value={customerForm.activity}
              onChange={(event) => setCustomerForm({ ...customerForm, activity: event.target.value })}
            />
          </div>

          <input
            className="rounded-lg border px-4 py-3"
            placeholder="Adresse du client final"
            value={customerForm.address}
            onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border px-4 py-3"
              placeholder="Code postal"
              value={customerForm.postalCode}
              onChange={(event) => setCustomerForm({ ...customerForm, postalCode: event.target.value })}
            />
            <input
              className="rounded-lg border px-4 py-3"
              placeholder="Ville"
              value={customerForm.city}
              onChange={(event) => setCustomerForm({ ...customerForm, city: event.target.value })}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-sm font-bold text-slate-950">Options du portail client final</p>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={customerForm.accessCodeEnabled}
                onChange={(event) =>
                  setCustomerForm({ ...customerForm, accessCodeEnabled: event.target.checked })
                }
              />
              Demander un code client final à chaque scan
            </label>

            <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={customerForm.clientPortalEnabled}
                onChange={(event) =>
                  setCustomerForm({ ...customerForm, clientPortalEnabled: event.target.checked })
                }
              />
              Activer l&apos;espace client final
            </label>

            <div className="mt-3 grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customerForm.portalCanViewCodes}
                  onChange={(event) =>
                    setCustomerForm({ ...customerForm, portalCanViewCodes: event.target.checked })
                  }
                />
                Gestion des codes
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customerForm.portalCanViewSites}
                  onChange={(event) =>
                    setCustomerForm({ ...customerForm, portalCanViewSites: event.target.checked })
                  }
                />
                Sites
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customerForm.portalCanViewScans}
                  onChange={(event) =>
                    setCustomerForm({ ...customerForm, portalCanViewScans: event.target.checked })
                  }
                />
                Scans
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customerForm.portalCanManageUsers}
                  onChange={(event) =>
                    setCustomerForm({ ...customerForm, portalCanManageUsers: event.target.checked })
                  }
                />
                Utilisateurs du portail
              </label>
            </div>
          </div>

          <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
            Enregistrer le client final
          </button>
        </form>
      </section>

      <section className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Clients finaux enregistrés</h2>

          <div className="mt-4 grid gap-3">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  setCustomerForm({
                    id: customer.id,
                    name: customer.name,
                    email: customer.email || "",
                    logoUrl: customer.logoUrl || "",
                    brandColor: customer.brandColor || "#0f766e",
                    siret: customer.siret || "",
                    address: customer.address || "",
                    postalCode: customer.postalCode || "",
                    city: customer.city || "",
                    activity: customer.activity || "",
                    accessCodeEnabled: customer.accessCodeEnabled,
                    clientPortalEnabled: customer.clientPortalEnabled,
                    portalCanViewCodes: customer.portalCanViewCodes,
                    portalCanViewSites: customer.portalCanViewSites,
                    portalCanViewScans: customer.portalCanViewScans,
                    portalCanManageUsers: customer.portalCanManageUsers,
                  });
                  setSiteForm({ ...emptySiteForm, customerId: customer.id });
                }}
                className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-[#006b55]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">{customer.name}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: customer.brandColor || "#0f766e" }}
                    />
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        customer.clientPortalEnabled
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {customer.clientPortalEnabled ? "Portail actif" : "Portail inactif"}
                    </span>
                  </div>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {customer.email || "Email non renseigné"} - {customer.sites.length} site(s) -{" "}
                  {customer.portalUsers.length} utilisateur(s)
                </p>

                {customer.portalUsers.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {customer.portalUsers.slice(0, 3).map((portalUser) => (
                      <span
                        key={portalUser.id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {portalUser.name}
                        {portalUser.isOwner ? " (admin)" : ""}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Sites d&apos;intervention du client final</h2>

          <form onSubmit={saveSite} className="mt-4 grid gap-3">
            <select
              className="rounded-lg border px-4 py-3"
              value={siteForm.customerId || selectedCustomer?.id || ""}
              onChange={(event) => setSiteForm({ ...siteForm, customerId: event.target.value })}
              required
            >
              <option value="">Choisir un client final</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <input
              className="rounded-lg border px-4 py-3"
              placeholder="Nom du site"
              value={siteForm.name}
              onChange={(event) => setSiteForm({ ...siteForm, name: event.target.value })}
              required
            />

            <input
              className="rounded-lg border px-4 py-3"
              placeholder="Adresse du site"
              value={siteForm.address}
              onChange={(event) => setSiteForm({ ...siteForm, address: event.target.value })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-lg border px-4 py-3"
                placeholder="Code postal"
                value={siteForm.postalCode}
                onChange={(event) => setSiteForm({ ...siteForm, postalCode: event.target.value })}
              />
              <input
                className="rounded-lg border px-4 py-3"
                placeholder="Ville"
                value={siteForm.city}
                onChange={(event) => setSiteForm({ ...siteForm, city: event.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={siteForm.codeRequired}
                onChange={(event) => setSiteForm({ ...siteForm, codeRequired: event.target.checked })}
              />
              Code d&apos;accès obligatoire sur ce site
            </label>

            <button className="rounded-lg bg-[#006b55] px-4 py-3 text-sm font-bold text-white">
              Enregistrer le site
            </button>
          </form>

          {selectedCustomer ? (
            <div className="mt-5 grid gap-2">
              {selectedCustomer.sites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() =>
                    setSiteForm({
                      id: site.id,
                      customerId: site.customerId,
                      name: site.name,
                      address: site.address || "",
                      postalCode: site.postalCode || "",
                      city: site.city || "",
                      codeRequired: site.codeRequired,
                      isActive: site.isActive,
                    })
                  }
                  className="rounded-lg border border-slate-200 p-3 text-left text-sm"
                >
                  <span className="font-bold text-slate-950">{site.name}</span>
                  <span className="ml-2 text-slate-500">{site.city || ""}</span>
                  {site.codeRequired ? (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      Code requis
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700 shadow-sm">
          Le back-office interne sert à créer le client final, ses sites, ses options et son premier email
          d&apos;activation. Les codes et les utilisateurs complémentaires sont ensuite gérés dans le portail du
          client final.
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 xl:col-span-2">
          {message}
        </div>
      ) : null}
    </div>
  );
}
