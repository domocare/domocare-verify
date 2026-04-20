"use client";

import { useEffect, useState } from "react";

type AppUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string | null;
  agency: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
};

type SettingItem = {
  id: string;
  name: string;
};

type OptionsResponse = {
  companies: SettingItem[];
  agencies: SettingItem[];
};

const roles = [
  { value: "SUPER_ADMIN_GROUP", label: "Super admin groupe" },
  { value: "SECURITY_ADMIN", label: "Admin securite / conformite" },
  { value: "AUDITOR", label: "Pilotage KPI / audit" },
  { value: "AGENCY_ADMIN", label: "Admin entite / agence" },
  { value: "ADMIN_ASSISTANT", label: "Assistant administratif" },
  { value: "HR_OPERATIONS", label: "RH / exploitation" },
  { value: "OPERATIONAL_MANAGER", label: "Manager operationnel" },
  { value: "READ_ONLY", label: "Lecture seule" },
];

function roleLabel(role: string) {
  return roles.find((item) => item.value === role)?.label || role;
}

export default function UsersClient() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<SettingItem[]>([]);
  const [agencies, setAgencies] = useState<SettingItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "AGENCY_ADMIN",
    company: "",
    agency: "",
    password: "",
    mfaEnabled: false,
    mfaCode: "",
  });

  async function loadUsers() {
    const res = await fetch("/api/users");

    if (!res.ok) {
      setMessage("Impossible de charger les utilisateurs.");
      return;
    }

    const data = (await res.json()) as { users: AppUser[] };
    setUsers(data.users);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      const [usersRes, optionsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/settings/options"),
      ]);

      if (!isMounted) return;

      if (!usersRes.ok || !optionsRes.ok) {
        setMessage("Impossible de charger les profils utilisateurs.");
        return;
      }

      const usersData = (await usersRes.json()) as { users: AppUser[] };
      const optionsData = (await optionsRes.json()) as OptionsResponse;

      if (!isMounted) return;

      setUsers(usersData.users);
      setCompanies(optionsData.companies);
      setAgencies(optionsData.agencies);
    }

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setMessage("Utilisateur non cree. Verifie les champs obligatoires.");
      return;
    }

    setForm({
      email: "",
      firstName: "",
      lastName: "",
      role: "AGENCY_ADMIN",
      company: "",
      agency: "",
      password: "",
      mfaEnabled: false,
      mfaCode: "",
    });
    await loadUsers();
  }

  async function toggleUser(user: AppUser) {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
    });

    if (!res.ok) {
      setMessage("Le statut utilisateur n'a pas pu etre modifie.");
      return;
    }

    await loadUsers();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Nouveau profil</h2>

        <form onSubmit={createUser} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Prenom"
              required
            />
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Nom"
              required
            />
          </div>

          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border px-4 py-3"
            placeholder="Email"
            required
          />

          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border px-4 py-3"
            placeholder="Mot de passe initial"
            minLength={10}
            required
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-lg border px-4 py-3"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <select
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="rounded-lg border px-4 py-3"
          >
            <option value="">Toutes societes</option>
            {companies.map((company) => (
              <option key={company.id} value={company.name}>
                {company.name}
              </option>
            ))}
          </select>

          <select
            value={form.agency}
            onChange={(e) => setForm({ ...form, agency: e.target.value })}
            className="rounded-lg border px-4 py-3"
          >
            <option value="">Toutes agences</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.name}>
                {agency.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.mfaEnabled}
              onChange={(e) => setForm({ ...form, mfaEnabled: e.target.checked })}
            />
            MFA administrateur
          </label>

          {form.mfaEnabled ? (
            <input
              value={form.mfaCode}
              onChange={(e) => setForm({ ...form, mfaCode: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Code MFA a 6 chiffres minimum"
              minLength={6}
              required
            />
          ) : null}

          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white"
          >
            Enregistrer le profil
          </button>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Profils existants</h2>

        <div className="mt-4 space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun profil utilisateur.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-slate-600">{user.email}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {roleLabel(user.role)} - {user.company || "Toutes societes"} /{" "}
                    {user.agency || "Toutes agences"} - MFA {user.mfaEnabled ? "actif" : "inactif"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleUser(user)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                    user.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {user.isActive ? "Actif" : "Inactif"}
                </button>
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
