"use client";

import { useState } from "react";
import BackofficeShell from "@/components/backoffice-shell";

export default function NewEmployeePage() {
const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  jobTitle: "",
  agency: "",
  company: "",
  photoUrl: "",
  phoneAgency: "",
  status: "active",
  expiresAt: "",
});

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

  return (
    <BackofficeShell
      title="Nouveau collaborateur"
      subtitle="Créer une nouvelle fiche intervenant"
    >
      <div className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Prénom"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
<div className="space-y-2">
  <label className="text-sm font-medium">Date d’expiration du QR code</label>
  <input
    type="date"
    value={form.expiresAt}
    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
    className="w-full rounded-xl border px-4 py-3"
  />
</div>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Nom"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Fonction"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Agence"
            value={form.agency}
            onChange={(e) => setForm({ ...form, agency: e.target.value })}
          />

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Société"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />

          <input
            className="w-full border rounded-xl p-3"
            placeholder="URL photo"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Téléphone agence"
            value={form.phoneAgency}
            onChange={(e) => setForm({ ...form, phoneAgency: e.target.value })}
          />

          <select
            className="w-full border rounded-xl p-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">active</option>
            <option value="expired">expired</option>
            <option value="suspended">suspended</option>
          </select>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-black text-white px-5 py-3 rounded-xl"
            >
              Créer le collaborateur
            </button>
          </div>
        </form>
      </div>
    </BackofficeShell>
  );
}