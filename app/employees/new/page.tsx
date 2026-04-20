"use client";

import { useState } from "react";
import BackofficeShell from "@/components/backoffice-shell";

const MAX_PHOTO_SIZE = 1_500_000;

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
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoError(null);

    if (!file) {
      setForm((current) => ({ ...current, photoUrl: "" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Le fichier doit etre une image.");
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
      alert("Collaborateur cree");
      window.location.href = "/employees";
    } else {
      alert("Erreur lors de la creation");
    }
  }

  return (
    <BackofficeShell
      title="Nouveau collaborateur"
      subtitle="Creer une nouvelle fiche intervenant"
    >
      <div className="bg-white rounded-2xl shadow p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Prenom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <div className="flex items-center justify-center rounded-xl border bg-slate-50 p-3">
              {form.photoUrl ? (
                <img
                  src={form.photoUrl}
                  alt="Apercu photo"
                  className="h-36 w-36 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-xl bg-white text-center text-sm text-slate-400">
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
                className="w-full rounded-xl border px-4 py-3"
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
            className="w-full border rounded-xl p-3"
            placeholder="Fonction"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Agence"
              value={form.agency}
              onChange={(e) => setForm({ ...form, agency: e.target.value })}
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Societe"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Telephone agence"
            value={form.phoneAgency}
            onChange={(e) => setForm({ ...form, phoneAgency: e.target.value })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="w-full border rounded-xl p-3"
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
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-black text-white px-5 py-3 rounded-xl"
            >
              Creer le collaborateur
            </button>
          </div>
        </form>
      </div>
    </BackofficeShell>
  );
}
