"use client";

import { useEffect, useState } from "react";

type RolePermission = {
  id: string;
  role: string;
  label: string;
  dataScope: string;
  canManageEmployees: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewScans: boolean;
  canManageIncidents: boolean;
};

const scopes = [
  { value: "group", label: "Groupe", description: "Toutes les sociétés et agences" },
  { value: "company", label: "Société", description: "Uniquement la société de l'utilisateur" },
  { value: "agency", label: "Agence / site", description: "Uniquement l'agence ou le site de l'utilisateur" },
];

const permissionFields = [
  { key: "canManageEmployees", label: "Collaborateurs" },
  { key: "canManageUsers", label: "Utilisateurs" },
  { key: "canManageSettings", label: "Paramétrage" },
  { key: "canViewScans", label: "Scans" },
  { key: "canManageIncidents", label: "Signalements" },
] as const;

export default function PermissionsClient() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function loadPermissions() {
    const res = await fetch("/api/permissions", { cache: "no-store" });

    if (!res.ok) {
      setMessage("Impossible de charger les droits.");
      return;
    }

    const data = (await res.json()) as { permissions: RolePermission[] };
    setPermissions(data.permissions);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialPermissions() {
      const res = await fetch("/api/permissions", { cache: "no-store" });

      if (!isMounted) return;

      if (!res.ok) {
        setMessage("Impossible de charger les droits.");
        return;
      }

      const data = (await res.json()) as { permissions: RolePermission[] };

      if (!isMounted) return;

      setPermissions(data.permissions);
    }

    void loadInitialPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  async function updatePermission(permission: RolePermission, patch: Partial<RolePermission>) {
    const next = { ...permission, ...patch };
    setPermissions((current) =>
      current.map((item) => (item.role === permission.role ? next : item)),
    );
    setMessage(null);

    const res = await fetch("/api/permissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    if (!res.ok) {
      setMessage("La modification n'a pas pu être enregistrée.");
      await loadPermissions();
      return;
    }

    setMessage("Droits enregistrés.");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        Les droits de visibilité sont appliqués avec la société et l&apos;agence renseignées sur chaque utilisateur.
        Un profil au périmètre agence ne doit donc pas rester sur &quot;Toutes agences&quot;.
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {permissions.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Chargement des droits...</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {permissions.map((permission) => (
              <article key={permission.role} className="grid gap-5 p-5 xl:grid-cols-[280px_1fr]">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{permission.label}</h2>
                  <p className="mt-1 break-all font-mono text-xs text-slate-400">{permission.role}</p>
                </div>

                <div className="grid gap-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Visibilité des données
                    </p>
                    <div className="grid gap-2 md:grid-cols-3">
                      {scopes.map((scope) => (
                        <label
                          key={scope.value}
                          className={`rounded-lg border p-3 text-sm transition ${
                            permission.dataScope === scope.value
                              ? "border-[#006b55] bg-emerald-50 text-[#006b55]"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`scope-${permission.role}`}
                            value={scope.value}
                            checked={permission.dataScope === scope.value}
                            onChange={() => updatePermission(permission, { dataScope: scope.value })}
                            className="mr-2"
                          />
                          <span className="font-bold">{scope.label}</span>
                          <span className="mt-1 block text-xs">{scope.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Autorisations fonctionnelles
                    </p>
                    <div className="grid gap-2 md:grid-cols-5">
                      {permissionFields.map((field) => (
                        <label
                          key={field.key}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={permission[field.key]}
                            onChange={(event) =>
                              updatePermission(permission, { [field.key]: event.target.checked })
                            }
                          />
                          {field.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {message ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}
    </div>
  );
}
