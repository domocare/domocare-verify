"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Leaf, LockKeyhole, QrCode, ShieldCheck } from "lucide-react";
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

    window.location.href = "/dashboard";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111827] text-white">
      <Image
        src="/sassbeyond/banner_bg01.png"
        alt=""
        fill
        priority
        className="object-cover opacity-60"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(17,24,39,0.98)_0%,rgba(20,52,52,0.86)_52%,rgba(17,24,39,0.58)_100%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 md:py-12 lg:grid-cols-[1fr_460px] lg:px-8">
        <section className="space-y-8">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-400 text-slate-950">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <span>
              <span className="block text-xl font-black leading-5">Lantana Verify</span>
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                Groupe Lantana
              </span>
            </span>
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-emerald-50">
              <Leaf className="h-4 w-4 text-emerald-300" />
              Acces securise au back-office
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-tight md:text-6xl">
              Pilotez les habilitations terrain du Groupe Lantana.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100">
              Connectez-vous pour creer les collaborateurs, generer les QR codes,
              verifier les autorisations et suivre les controles realises sur chantier.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              <p className="mt-3 text-2xl font-black text-emerald-100">Valide</p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                Statut clair pour le client.
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
              <QrCode className="h-6 w-6 text-emerald-300" />
              <p className="mt-3 text-2xl font-black text-emerald-100">QR code</p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                Verification terrain rapide.
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
              <LockKeyhole className="h-6 w-6 text-emerald-300" />
              <p className="mt-3 text-2xl font-black text-emerald-100">Securise</p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                Acces reserve aux responsables.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-100">
              Entites connectees
            </p>
            <div className="flex flex-wrap gap-3">
              {companyBrands.map((brand, index) => (
                <CompanyLogo
                  key={brand.name}
                  brand={brand}
                  preload={index === 0}
                  className="h-14 w-36 border-white/20 bg-white p-3 shadow-xl"
                />
              ))}
            </div>
          </div>
        </section>

        <form
          onSubmit={submit}
          className="w-full rounded-lg border border-white/15 bg-white p-6 text-slate-950 shadow-[0_32px_90px_rgba(0,0,0,0.32)] sm:p-8"
        >
          <div className="border-b border-slate-100 pb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Connexion</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Acces responsable agence et administrateur groupe.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="nom@entreprise.fr"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Mot de passe
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Votre mot de passe"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Code MFA
              <input
                value={form.mfaCode}
                onChange={(e) => setForm({ ...form, mfaCode: e.target.value })}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
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
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-4 font-black text-slate-950 transition hover:bg-emerald-400"
            >
              Se connecter
              <LockKeyhole className="h-4 w-4" />
            </button>

            <Link
              href="/"
              className="text-center text-sm font-bold text-slate-500 transition hover:text-emerald-700"
            >
              Retour au site vitrine
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
