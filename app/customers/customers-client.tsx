"use client";

import { useEffect, useMemo, useState } from "react";

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

type Customer = {
  id: string;
  name: string;
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
  sites: CustomerSite[];
  accessCodes: CustomerAccessCode[];
};

type CustomerAccessCode = {
  id: string;
  siteId: string | null;
  label: string;
  codeLast4: string | null;
  scope: string;
  isOneTime: boolean;
  isActive: boolean;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
};

const emptyCustomerForm = {
  id: "",
  name: "",
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

const emptyCodeForm = {
  customerId: "",
  siteId: "",
  label: "",
  code: "",
  isOneTime: false,
  isActive: true,
  expiresAt: "",
};

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [siteForm, setSiteForm] = useState(emptySiteForm);
  const [codeForm, setCodeForm] = useState(emptyCodeForm);
  const [message, setMessage] = useState<string | null>(null);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === siteForm.customerId) || customers[0],
    [customers, siteForm.customerId],
  );

  async function loadCustomers() {
    const res = await fetch("/api/customers", { cache: "no-store" });

    if (!res.ok) {
      setMessage("Impossible de charger les clients.");
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
        setMessage("Impossible de charger les clients.");
        return;
      }

      const data = (await res.json()) as { customers: Customer[] };
      if (isMounted) setCustomers(data.customers);
    }

    void loadInitialCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveCustomer(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const res = await fetch("/api/customers", {
      method: customerForm.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerForm),
    });

    if (!res.ok) {
      setMessage("Le client n'a pas pu être enregistré.");
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

  async function saveCode(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const customerId = codeForm.customerId || selectedCustomer?.id || "";
    const res = await fetch("/api/customers/access-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...codeForm, customerId }),
    });

    if (!res.ok) {
      setMessage("Le code n'a pas pu être enregistré. Il doit contenir 6 à 8 chiffres.");
      return;
    }

    setCodeForm({ ...emptyCodeForm, customerId });
    await loadCustomers();
  }

  async function toggleCode(code: CustomerAccessCode) {
    const res = await fetch("/api/customers/access-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: code.id, isActive: !code.isActive }),
    });

    if (!res.ok) {
      setMessage("Le statut du code n'a pas pu être modifié.");
      return;
    }

    await loadCustomers();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[440px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          {customerForm.id ? "Modifier le client final" : "Nouveau client final"}
        </h2>
        <form onSubmit={saveCustomer} className="mt-4 grid gap-3">
          <input className="rounded-lg border px-4 py-3" placeholder="Nom du client final" value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border px-4 py-3" placeholder="SIRET" value={customerForm.siret} onChange={(event) => setCustomerForm({ ...customerForm, siret: event.target.value })} />
            <input className="rounded-lg border px-4 py-3" placeholder="Activité" value={customerForm.activity} onChange={(event) => setCustomerForm({ ...customerForm, activity: event.target.value })} />
          </div>
          <input className="rounded-lg border px-4 py-3" placeholder="Adresse du client final" value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border px-4 py-3" placeholder="Code postal" value={customerForm.postalCode} onChange={(event) => setCustomerForm({ ...customerForm, postalCode: event.target.value })} />
            <input className="rounded-lg border px-4 py-3" placeholder="Ville" value={customerForm.city} onChange={(event) => setCustomerForm({ ...customerForm, city: event.target.value })} />
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-sm font-bold text-slate-950">Gestion de code d&apos;accès</p>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={customerForm.accessCodeEnabled} onChange={(event) => setCustomerForm({ ...customerForm, accessCodeEnabled: event.target.checked })} />
              Demander un code client final à chaque scan
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={customerForm.clientPortalEnabled} onChange={(event) => setCustomerForm({ ...customerForm, clientPortalEnabled: event.target.checked })} />
              Activer le futur back-office client final
            </label>
            <div className="mt-3 grid gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={customerForm.portalCanViewCodes} onChange={(event) => setCustomerForm({ ...customerForm, portalCanViewCodes: event.target.checked })} /> Codes</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={customerForm.portalCanViewSites} onChange={(event) => setCustomerForm({ ...customerForm, portalCanViewSites: event.target.checked })} /> Sites</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={customerForm.portalCanViewScans} onChange={(event) => setCustomerForm({ ...customerForm, portalCanViewScans: event.target.checked })} /> Scans</label>
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
                  });
                  setSiteForm({ ...emptySiteForm, customerId: customer.id });
                  setCodeForm({ ...emptyCodeForm, customerId: customer.id });
                }}
                className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-[#006b55]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">{customer.name}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${customer.accessCodeEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {customer.accessCodeEnabled ? "Code actif" : "Code inactif"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {customer.siret || "SIRET non renseigné"} - {customer.sites.length} site(s)
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Sites d&apos;intervention du client final</h2>
          <form onSubmit={saveSite} className="mt-4 grid gap-3">
            <select className="rounded-lg border px-4 py-3" value={siteForm.customerId || selectedCustomer?.id || ""} onChange={(event) => setSiteForm({ ...siteForm, customerId: event.target.value })} required>
              <option value="">Choisir un client final</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
            <input className="rounded-lg border px-4 py-3" placeholder="Nom du site" value={siteForm.name} onChange={(event) => setSiteForm({ ...siteForm, name: event.target.value })} required />
            <input className="rounded-lg border px-4 py-3" placeholder="Adresse du site" value={siteForm.address} onChange={(event) => setSiteForm({ ...siteForm, address: event.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-lg border px-4 py-3" placeholder="Code postal" value={siteForm.postalCode} onChange={(event) => setSiteForm({ ...siteForm, postalCode: event.target.value })} />
              <input className="rounded-lg border px-4 py-3" placeholder="Ville" value={siteForm.city} onChange={(event) => setSiteForm({ ...siteForm, city: event.target.value })} />
            </div>
            <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
              <input type="checkbox" checked={siteForm.codeRequired} onChange={(event) => setSiteForm({ ...siteForm, codeRequired: event.target.checked })} />
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
                  onClick={() => setSiteForm({
                    id: site.id,
                    customerId: site.customerId,
                    name: site.name,
                    address: site.address || "",
                    postalCode: site.postalCode || "",
                    city: site.city || "",
                    codeRequired: site.codeRequired,
                    isActive: site.isActive,
                  })}
                  className="rounded-lg border border-slate-200 p-3 text-left text-sm"
                >
                  <span className="font-bold text-slate-950">{site.name}</span>
                  <span className="ml-2 text-slate-500">{site.city || ""}</span>
                  {site.codeRequired ? (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">Code requis</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Gestion des codes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Code de 6 à 8 chiffres saisi par l&apos;accueil ou la sécurité du client final après le scan QR.
          </p>
          <form onSubmit={saveCode} className="mt-4 grid gap-3">
            <select
              className="rounded-lg border px-4 py-3"
              value={codeForm.customerId || selectedCustomer?.id || ""}
              onChange={(event) => setCodeForm({ ...codeForm, customerId: event.target.value, siteId: "" })}
              required
            >
              <option value="">Choisir un client final</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
            <select
              className="rounded-lg border px-4 py-3"
              value={codeForm.siteId}
              onChange={(event) => setCodeForm({ ...codeForm, siteId: event.target.value })}
            >
              <option value="">Code valable pour tous les sites du client final</option>
              {(customers.find((customer) => customer.id === (codeForm.customerId || selectedCustomer?.id))?.sites || []).map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-lg border px-4 py-3"
                placeholder="Libellé du code"
                value={codeForm.label}
                onChange={(event) => setCodeForm({ ...codeForm, label: event.target.value })}
              />
              <input
                className="rounded-lg border px-4 py-3"
                placeholder="Code 6 à 8 chiffres"
                value={codeForm.code}
                onChange={(event) => setCodeForm({ ...codeForm, code: event.target.value.replace(/\D/g, "").slice(0, 8) })}
                inputMode="numeric"
                minLength={6}
                maxLength={8}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={codeForm.isOneTime}
                  onChange={(event) => setCodeForm({ ...codeForm, isOneTime: event.target.checked })}
                />
                Usage unique
              </label>
              <input
                type="date"
                className="rounded-lg border px-4 py-3"
                value={codeForm.expiresAt}
                onChange={(event) => setCodeForm({ ...codeForm, expiresAt: event.target.value })}
              />
            </div>
            <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              Créer le code
            </button>
          </form>

          {selectedCustomer ? (
            <div className="mt-5 grid gap-2">
              {selectedCustomer.accessCodes.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun code enregistré pour ce client final.</p>
              ) : (
                selectedCustomer.accessCodes.map((code) => {
                  const site = selectedCustomer.sites.find((item) => item.id === code.siteId);

                  return (
                    <div key={code.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">{code.label}</p>
                        <p className="text-sm text-slate-500">
                          {site ? site.name : "Tous les sites"} - finit par {code.codeLast4 || "----"}
                          {code.isOneTime ? " - usage unique" : ""}
                          {code.usedAt ? " - utilisé" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCode(code)}
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
          ) : null}
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
