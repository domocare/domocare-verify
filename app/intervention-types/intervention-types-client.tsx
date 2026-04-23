"use client";

import { useEffect, useState } from "react";

type InterventionType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

const emptyForm = {
  id: "",
  name: "",
  description: "",
  isActive: true,
};

export default function InterventionTypesClient() {
  const [items, setItems] = useState<InterventionType[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadItems() {
    const res = await fetch("/api/intervention-types", { cache: "no-store" });

    if (!res.ok) {
      setMessage("Impossible de charger les types d'intervention.");
      return;
    }

    const data = (await res.json()) as { interventionTypes: InterventionType[] };
    setItems(data.interventionTypes);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialItems() {
      const res = await fetch("/api/intervention-types", { cache: "no-store" });
      if (!isMounted) return;

      if (!res.ok) {
        setMessage("Impossible de charger les types d'intervention.");
        return;
      }

      const data = (await res.json()) as { interventionTypes: InterventionType[] };
      if (isMounted) setItems(data.interventionTypes);
    }

    void loadInitialItems();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const res = await fetch("/api/intervention-types", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setMessage(data?.message || "Le type d'intervention n'a pas pu être enregistré.");
      setIsSubmitting(false);
      return;
    }

    setForm(emptyForm);
    await loadItems();
    setIsSubmitting(false);
  }

  async function deleteItem(item: InterventionType) {
    const confirmed = window.confirm(`Supprimer "${item.name}" ?`);
    if (!confirmed) return;

    setMessage(null);
    setDeletingId(item.id);

    const res = await fetch("/api/intervention-types", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setMessage(data?.message || "La suppression a échoué.");
      setDeletingId(null);
      return;
    }

    if (form.id === item.id) {
      setForm(emptyForm);
    }

    await loadItems();
    setDeletingId(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-950">
            {form.id ? "Modifier le type" : "Nouveau type"}
          </h2>
          {form.id ? (
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setMessage(null);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
            >
              Annuler
            </button>
          ) : null}
        </div>

        <form onSubmit={saveItem} className="mt-4 grid gap-3">
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="rounded-lg border border-slate-200 px-4 py-3"
            placeholder="Ex : Entretien espaces verts"
            required
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="min-h-28 rounded-lg border border-slate-200 px-4 py-3"
            placeholder="Données ou précisions transmises au client lors du scan"
          />
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            Actif dans les fiches collaborateurs
          </label>
          <button
            disabled={isSubmitting}
            className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {form.id ? "Mettre à jour" : "Enregistrer"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Interventions disponibles</h2>
        <div className="mt-4 grid gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun type enregistré.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-950">{item.name}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          id: item.id,
                          name: item.name,
                          description: item.description || "",
                          isActive: item.isActive,
                        })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteItem(item)}
                      disabled={deletingId === item.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-60"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
