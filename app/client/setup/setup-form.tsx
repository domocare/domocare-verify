"use client";

import Link from "next/link";
import { ShieldCheck, LockKeyhole, ScanLine, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";

type BrandState = {
  name: string;
  email: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  city?: string | null;
  activity?: string | null;
};

const previewSteps = [
  { label: "1re activation", icon: LockKeyhole },
  { label: "Scan QR", icon: ScanLine },
  { label: "Code client", icon: KeyRound },
] as const;

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized.split("").map((part) => `${part}${part}`).join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function ClientSetupForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    if (form.password !== form.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch("/api/client/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setMessage("Impossible d'activer le compte. Vérifiez l'email transmis par Lantana Verify.");
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
                Activation du portail client final
              </div>

              <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-tight">
                Activez votre espace pour gérer les accès, les scans et vos codes client final.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/82">
                Une fois activé, votre portail vous permet de valider les entrées sur vos sites et
                d&apos;administrer les utilisateurs autorisés de votre organisation.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-3">
                {previewSteps.map((item) => {
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
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Activation</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Activer l&apos;espace client final
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Créez votre mot de passe avec l&apos;email configuré dans le back-office Lantana Verify.
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
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                onBlur={() => void loadBrand(form.email)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Email de connexion"
                required
              />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Mot de passe"
                minLength={10}
                required
              />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Confirmer le mot de passe"
                minLength={10}
                required
              />

              {message ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

              <button
                type="submit"
                className="rounded-lg px-4 py-4 text-sm font-black text-white"
                style={{ backgroundColor: brandColor }}
              >
                Activer mon espace
              </button>
              <Link href="/client/login" className="text-center text-sm font-bold text-slate-500">
                Déjà activé ? Se connecter
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
