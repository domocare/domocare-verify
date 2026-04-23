"use client";

import Link from "next/link";
import { ShieldCheck, KeyRound, MapPin, ScanLine } from "lucide-react";
import { useMemo, useState } from "react";

type BrandState = {
  name: string;
  email: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  city?: string | null;
  activity?: string | null;
};

const previewStats = [
  { label: "Scan QR", icon: ScanLine },
  { label: "Code client", icon: KeyRound },
  { label: "Site validé", icon: MapPin },
] as const;

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function ClientLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [brand, setBrand] = useState<BrandState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadBrand(nextEmail: string) {
    if (!nextEmail) {
      setBrand(null);
      return;
    }

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
  const panelStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${hexToRgba(brandColor, 0.98)} 0%, #0f172a 88%)`,
    }),
    [brandColor],
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[1.2fr_520px]">
        <section className="relative hidden overflow-hidden xl:block" style={panelStyle}>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

          <div className="relative flex h-full flex-col justify-between px-12 py-10 text-white">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Portail client final
              </div>

              <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-tight">
                Gérez les validations d&apos;accès de vos intervenants sur chacun de vos sites.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/82">
                Votre portail centralise les scans, les codes d&apos;accès et les validations réalisées par
                votre accueil ou votre sécurité.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-3">
                {previewStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
                      <Icon className="h-5 w-5 text-white/85" />
                      <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-white/70">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="max-w-xl rounded-lg border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/12">
                    {brand?.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="max-h-10 w-auto object-contain" />
                    ) : (
                      <ShieldCheck className="h-7 w-7 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                      Espace personnalisé
                    </p>
                    <p className="mt-1 text-2xl font-black">{brand?.name || "Votre client final"}</p>
                    <p className="mt-1 text-sm text-white/72">
                      {[brand?.activity, brand?.city].filter(Boolean).join(" - ") || "Identité visuelle chargée depuis votre paramétrage interne."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <form onSubmit={submit} className="w-full max-w-[460px] rounded-lg border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Connexion</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Accès client final
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                La page se personnalise automatiquement avec votre logo et vos couleurs.
              </p>
            </div>

            {brand ? (
              <div
                className="mb-5 rounded-lg border p-4"
                style={{
                  borderColor: hexToRgba(brandColor, 0.18),
                  backgroundColor: hexToRgba(brandColor, 0.06),
                }}
              >
                <div className="flex items-center gap-4">
                  {brand.logoUrl ? (
                    <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-white p-3">
                      <img src={brand.logoUrl} alt={brand.name} className="max-h-10 w-auto object-contain" />
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xl font-black text-slate-950">{brand.name}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">{brand.email}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => void loadBrand(email)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950"
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
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950"
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
        </section>
      </div>
    </main>
  );
}
