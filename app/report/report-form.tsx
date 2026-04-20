"use client";

import { useState } from "react";

export default function ReportForm({ token }: { token: string }) {
  const [form, setForm] = useState({
    reason: "person_not_recognized",
    description: "",
    clientName: "",
    phone: "",
    email: "",
  });
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, token }),
    });

    if (!res.ok) {
      setMessage("Le signalement n'a pas pu etre envoye.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
        <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Signalement envoye</h1>
          <p className="mt-3 text-slate-600">Merci. Le back-office peut maintenant traiter cette anomalie.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Signaler une anomalie</h1>
        <p className="mt-2 text-sm text-slate-500">Votre signalement sera transmis au back-office.</p>

        <div className="mt-6 grid gap-3">
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="rounded-lg border px-4 py-3"
          >
            <option value="person_not_recognized">Personne non reconnue</option>
            <option value="photo_mismatch">Photo non conforme</option>
            <option value="wrong_vehicle">Mauvais vehicule</option>
            <option value="unexpected_visit">Intervention non prevue</option>
            <option value="validity_doubt">Doute sur la validite</option>
            <option value="other">Autre</option>
          </select>

          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="min-h-28 rounded-lg border px-4 py-3"
            placeholder="Description"
          />

          <input
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className="rounded-lg border px-4 py-3"
            placeholder="Votre nom"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Telephone"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Email"
            />
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <button type="submit" className="rounded-lg bg-black px-4 py-3 font-semibold text-white">
            Envoyer le signalement
          </button>
        </div>
      </form>
    </main>
  );
}
