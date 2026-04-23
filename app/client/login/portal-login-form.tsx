"use client";
import Link from "next/link";
import { useState } from "react";

type BrandState = {
  name: string;
  email: string;
  logoUrl?: string | null;
  brandColor?: string | null;
};

export default function ClientLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [brand, setBrand] = useState<BrandState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadBrand(nextEmail: string) {
    if (!nextEmail) return;

    const res = await fetch("/api/client/auth/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: nextEmail }),
    });

    if (!res.ok) {
      setBrand(null);
      return;
    }

    const data = (await res.json()) as { customer: BrandState };
    setBrand(data.customer);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const res = await fetch("/api/client/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setMessage("Connexion impossible. Vérifiez l'email ou le mot de passe.");
      return;
    }

    window.location.href = "/client";
  }

  const brandColor = brand?.brandColor || "#0f766e";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-8 lg:grid-cols-[1.05fr_460px]">
        <section className="space-y-8">
          <div>
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold"
              style={{ backgroundColor: `${brandColor}22`, color: "#ffffff" }}
            >
              Portail client final
            </div>
            <h1 className="text-5xl font-black leading-[1.04] tracking-tight md:text-6xl">
              Vérifiez et validez les accès de vos intervenants.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Cet espace permet au client final de gérer ses codes d&apos;accès, ses sites et de suivre
              les scans réalisés sur ses interventions.
            </p>
          </div>

          {brand ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-4">
                {brand.logoUrl ? (
                  <div className="flex h-20 w-24 items-center justify-center rounded-lg bg-white p-3">
                    <img src={brand.logoUrl} alt={brand.name} className="max-h-14 w-auto object-contain" />
                  </div>
                ) : null}
                <div>
                  <p className="text-2xl font-black">{brand.name}</p>
                  <p className="mt-1 text-sm text-slate-300">{brand.email}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <form onSubmit={submit} className="rounded-lg bg-white p-8 text-slate-950 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight">Connexion client final</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Personnalisation automatique selon l&apos;email du client.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => void loadBrand(email)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="contact@client-final.fr"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="Votre mot de passe"
                required
              />
            </label>

            {message ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

            <button
              type="submit"
              className="rounded-lg px-4 py-4 text-sm font-black text-white"
              style={{ backgroundColor: brandColor }}
            >
              Se connecter
            </button>

            <Link href="/client/setup" className="text-center text-sm font-bold text-slate-500">
              Première connexion / création du mot de passe
            </Link>
            <Link href="/" className="text-center text-sm font-bold text-slate-400">
              Retour au site vitrine
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
