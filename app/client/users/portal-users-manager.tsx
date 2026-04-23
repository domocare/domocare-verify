"use client";

import { useMemo, useState } from "react";

type PortalUser = {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  isActive: boolean;
  createdAt: Date | string;
};

type Customer = {
  portalCanManageUsers?: boolean;
  portalUser?: {
    id?: string;
    name: string;
    email: string;
    isOwner: boolean;
  } | null;
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  isOwner: false,
};

export default function PortalUsersManager({
  customer,
  users: initialUsers,
}: {
  customer: Customer;
  users: PortalUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", password: "", isOwner: false, isActive: true });

  const currentUser = useMemo(
    () => users.find((user) => user.email === customer.portalUser?.email) || null,
    [customer.portalUser?.email, users],
  );

  async function refreshUsers() {
    const res = await fetch("/api/client/users", { cache: "no-store" });
    if (!res.ok) {
      setMessage("Impossible de charger les utilisateurs.");
      return;
    }

    const data = (await res.json()) as { users: PortalUser[] };
    setUsers(data.users);
  }

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const res = await fetch("/api/client/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setMessage(data?.message || "L'utilisateur n'a pas pu être créé.");
      return;
    }

    setForm(emptyForm);
    await refreshUsers();
  }

  async function saveEdition(event: React.FormEvent) {
    event.preventDefault();
    if (!editingId) return;

    setMessage(null);
    const res = await fetch("/api/client/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        ...editForm,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setMessage(data?.message || "La mise à jour a échoué.");
      return;
    }

    setEditingId(null);
    setEditForm({ name: "", password: "", isOwner: false, isActive: true });
    await refreshUsers();
  }

  if (!customer.portalCanManageUsers) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        La gestion des utilisateurs n&apos;est pas activée pour ce portail.
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Nouvel utilisateur</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ajoutez un autre membre de votre équipe pour gérer les accès et le suivi des scans.
        </p>

        <form onSubmit={createUser} className="mt-4 grid gap-3">
          <input
            className="rounded-lg border px-4 py-3"
            placeholder="Nom et prénom"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            type="email"
            className="rounded-lg border px-4 py-3"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            type="password"
            className="rounded-lg border px-4 py-3"
            placeholder="Mot de passe temporaire"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            minLength={10}
            required
          />
          <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isOwner}
              onChange={(event) => setForm({ ...form, isOwner: event.target.checked })}
            />
            Donner les droits administrateur
          </label>

          <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
            Ajouter l&apos;utilisateur
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Équipe portail</h2>
            <p className="mt-1 text-sm text-slate-500">
              {users.length} compte(s) actif(s) ou disponibles sur votre espace client.
            </p>
          </div>
          {currentUser ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              Connecté : {currentUser.name}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          {users.map((user) => {
            const isEditing = editingId === user.id;

            return (
              <div key={user.id} className="rounded-lg border border-slate-200 p-4">
                {isEditing ? (
                  <form onSubmit={saveEdition} className="grid gap-3">
                    <input
                      className="rounded-lg border px-4 py-3"
                      value={editForm.name}
                      onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                      required
                    />
                    <input
                      type="password"
                      className="rounded-lg border px-4 py-3"
                      placeholder="Nouveau mot de passe (optionnel)"
                      value={editForm.password}
                      onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={editForm.isOwner}
                          onChange={(event) => setEditForm({ ...editForm, isOwner: event.target.checked })}
                        />
                        Administrateur
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(event) => setEditForm({ ...editForm, isActive: event.target.checked })}
                        />
                        Compte actif
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-950">{user.name}</p>
                        {user.isOwner ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            Admin
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            user.isActive ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(user.id);
                        setEditForm({
                          name: user.name,
                          password: "",
                          isOwner: user.isOwner,
                          isActive: user.isActive,
                        });
                      }}
                      className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
