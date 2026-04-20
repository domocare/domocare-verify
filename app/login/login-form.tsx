"use client";

import { useState } from "react";
import CompanyLogo from "@/components/company-logo";
import { companyBrands } from "@/lib/company-branding";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "", mfaCode: "" });
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setMessage("Connexion impossible. Verifie les identifiants et le code MFA si demande.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_440px]">
        <section className="space-y-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Domocare Verify
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Controle d&apos;habilitation terrain par QR code.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Un back-office sobre pour creer, verifier, suspendre et tracer les
              autorisations d&apos;intervention sur l&apos;ensemble des entites.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-white p-4">
              <p className="text-2xl font-semibold text-emerald-700">Valide</p>
              <p className="mt-1 text-sm text-slate-500">Statut clair pour le client.</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="text-2xl font-semibold text-amber-700">Expire</p>
              <p className="mt-1 text-sm text-slate-500">Controle immediat des dates.</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="text-2xl font-semibold text-red-700">Suspendu</p>
              <p className="mt-1 text-sm text-slate-500">Blocage temps reel.</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-500">Entites connectees</p>
            <div className="flex flex-wrap gap-3">
              {companyBrands.map((brand, index) => (
                <CompanyLogo key={brand.name} brand={brand} preload={index === 0} />
              ))}
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="w-full rounded-lg border bg-white p-6 shadow-sm">
          <div className="border-b pb-5">
            <h2 className="text-3xl font-semibold">Connexion</h2>
            <p className="mt-2 text-sm text-slate-500">
              Acces responsable agence et administrateur groupe.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border px-4 py-3 font-normal outline-none transition focus:border-slate-900"
                placeholder="nom@entreprise.fr"
                required
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Mot de passe
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="rounded-lg border px-4 py-3 font-normal outline-none transition focus:border-slate-900"
                placeholder="Votre mot de passe"
                required
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Code MFA
              <input
                value={form.mfaCode}
                onChange={(e) => setForm({ ...form, mfaCode: e.target.value })}
                className="rounded-lg border px-4 py-3 font-normal outline-none transition focus:border-slate-900"
                placeholder="Si active sur votre compte"
              />
            </label>

            {message ? (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-2 rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
