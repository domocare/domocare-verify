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

function mapCustomerToForm(customer: Customer) {
  return {
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
  };
}

function mapSiteToForm(site: CustomerSite) {
  return {
    id: site.id,
    customerId: site.customerId,
    name: site.name,
    address: site.address || "",
    postalCode: site.postalCode || "",
    city: site.city || "",
    codeRequired: site.codeRequired,
    isActive: site.isActive,
  };
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [siteForm, setSiteForm] = useState(emptySiteForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.id === (siteForm.customerId || customerForm.id)) ||
      customers[0] ||
      null,
    [customers, siteForm.customerId, customerForm.id],
  );
  const editingCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerForm.id) || null,
    [customers, customerForm.id],
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
    let isMounted = true;

    async function loadInitialCustomers() {
      const res = await fetch("/api/customers", { cache: "no-store" });
      if (!isMounted) return;

      if (!res.ok) {
        setMessage("Impossible de charger les clients finaux.");
        return;
      }

      const data = (await res.json()) as { customers: Customer[] };
      if (isMounted) {
        setCustomers(data.customers);
      }
    }

    void loadInitialCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  function resetCustomerForm() {
    setCustomerForm(emptyCustomerForm);
  }

  function resetSiteForm(nextCustomerId = "") {
    setSiteForm({ ...emptySiteForm, customerId: nextCustomerId });
  }

  function startCustomerEdit(customer: Customer) {
    setCustomerForm(mapCustomerToForm(customer));
    resetSiteForm(customer.id);
    setMessage(null);
  }

  function startSiteEdit(site: CustomerSite) {
    setSiteForm(mapSiteToForm(site));
    setMessage(null);
  }

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Le logo doit etre une image.");
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

    const data = (await res.json().catch(() => null)) as { message?: string } | null;

    if (!res.ok) {
      setMessage(data?.message || "Le client final n'a pas pu etre enregistre.");
      return;
    }

    resetCustomerForm();
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

    const data = (await res.json().catch(() => null)) as { message?: string } | null;

    if (!res.ok) {
      setMessage(data?.message || "Le site n'a pas pu etre enregistre.");
      return;
    }

    resetSiteForm(customerId);
    await loadCustomers();
  }

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(`Supprimer le client final "${customer.name}" ?`);
    if (!confirmed) return;

    setMessage(null);

    const res = await fetch("/api/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: customer.id }),
    });

    const data = (await res.json().catch(() => null)) as { message?: string } | null;

    if (!res.ok) {
      setMessage(data?.message || "Le client final n'a pas pu etre supprime.");
      return;
    }

    if (customerForm.id === customer.id) {
      resetCustomerForm();
    }
    if (siteForm.customerId === customer.id) {
      resetSiteForm();
    }

    await loadCustomers();
  }

  async function deleteSite(site: CustomerSite) {
    const confirmed = window.confirm(`Supprimer le site "${site.name}" ?`);
    if (!confirmed) return;

    setMessage(null);

    const res = await fetch("/api/customers/sites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: site.id }),
    });

    const data = (await res.json().catch(() => null)) as { message?: string } | null;

    if (!res.ok) {
      setMessage(data?.message || "Le site n'a pas pu etre supprime.");
      return;
    }

    if (siteForm.id === site.id) {
      resetSiteForm(site.customerId);
    }

    await loadCustomers();
  }

  async function sendResetPassword() {
    if (!customerForm.id) return;

    setMessage(null);
    setIsSendingReset(true);

    const res = await fetch("/api/customers/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customerForm.id }),
    });

    const data = (await res.json().catch(() => null)) as
      | { message?: string; delivered?: number; skipped?: boolean; recipients?: string[] }
      | null;

    if (!res.ok) {
      setMessage(data?.message || "Le mail de reinitialisation n'a pas pu etre envoye.");
      setIsSendingReset(false);
      return;
    }

    if (data?.skipped) {
      setMessage("Aucun service d'email n'est configure sur le serveur.");
    } else {
      setMessage(
        `Mail de reinitialisation envoye a ${data?.delivered || 0} contact(s) : ${(data?.recipients || []).join(", ")}`,
      );
    }

    setIsSendingReset(false);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[480px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-950">
            {customerForm.id ? "Modifier le client final" : "Nouveau client final"}
          </h2>
          {customerForm.id ? (
            <button
              type="button"
              onClick={() => {
                resetCustomerForm();
                setMessage(null);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
            >
              Annuler
            </button>
          ) : null}
        </div>

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
              placeholder="Activite"
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
              Demander un code client final a chaque scan
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

          {customerForm.id && editingCustomer?.clientPortalEnabled ? (
            <>
              <button
                type="button"
                onClick={() => void sendResetPassword()}
                disabled={isSendingReset}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 disabled:opacity-60"
              >
                {isSendingReset ? "Envoi..." : "Reinitialiser le mot de passe"}
              </button>
              <p className="text-xs leading-5 text-slate-500">
                Un mail de reinitialisation sera envoye au contact principal et aux utilisateurs actifs du portail.
              </p>
            </>
          ) : null}

          {editingCustomer ? (
            <button
              type="button"
              onClick={() => void deleteCustomer(editingCustomer)}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              Supprimer le client final
            </button>
          ) : null}
        </form>
      </section>

      <section className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Clients finaux enregistres</h2>

          <div className="mt-4 grid gap-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-lg border border-slate-200 p-4 transition hover:border-[#006b55]"
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
                  {customer.email || "Email non renseigne"} - {customer.sites.length} site(s) -{" "}
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

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startCustomerEdit(customer)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetSiteForm(customer.id);
                      setMessage(null);
                    }}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700"
                  >
                    Gerer les sites
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCustomer(customer)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">Sites d&apos;intervention du client final</h2>
            {siteForm.id ? (
              <button
                type="button"
                onClick={() => {
                  resetSiteForm(siteForm.customerId || selectedCustomer?.id || "");
                  setMessage(null);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
              >
                Annuler
              </button>
            ) : null}
          </div>

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
              Code d&apos;acces obligatoire sur ce site
            </label>

            <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={siteForm.isActive}
                onChange={(event) => setSiteForm({ ...siteForm, isActive: event.target.checked })}
              />
              Site actif
            </label>

            <button className="rounded-lg bg-[#006b55] px-4 py-3 text-sm font-bold text-white">
              Enregistrer le site
            </button>

            {siteForm.id ? (
              <button
                type="button"
                onClick={() =>
                  void deleteSite({
                    id: siteForm.id,
                    customerId: siteForm.customerId,
                    name: siteForm.name,
                    address: siteForm.address || null,
                    postalCode: siteForm.postalCode || null,
                    city: siteForm.city || null,
                    codeRequired: siteForm.codeRequired,
                    isActive: siteForm.isActive,
                  })
                }
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                Supprimer le site
              </button>
            ) : null}
          </form>

          {selectedCustomer ? (
            <div className="mt-5 grid gap-2">
              {selectedCustomer.sites.map((site) => (
                <div key={site.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-950">{site.name}</span>
                    <span className="text-slate-500">{site.city || ""}</span>
                    {site.codeRequired ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        Code requis
                      </span>
                    ) : null}
                    {!site.isActive ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                        Inactif
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startSiteEdit(site)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteSite(site)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700 shadow-sm">
          Le back-office interne sert a creer le client final, ses sites, ses options et son premier email
          d&apos;activation. Les codes et les utilisateurs complementaires sont ensuite geres dans le portail du
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
