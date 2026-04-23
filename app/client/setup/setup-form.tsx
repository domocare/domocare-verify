"use client";

import Link from "next/link";
import { useState } from "react";

export default function ClientSetupForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white">
      <form onSubmit={submit} className="w-full max-w-[460px] rounded-lg bg-white p-8 text-slate-950 shadow-2xl">
        <h1 className="text-3xl font-black tracking-tight">Activer l&apos;espace client final</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Créez votre mot de passe avec l&apos;email configuré dans le back-office Lantana Verify.
        </p>

        <div className="mt-6 grid gap-4">
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
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

          <button type="submit" className="rounded-lg bg-slate-950 px-4 py-4 text-sm font-black text-white">
            Activer mon espace
          </button>
          <Link href="/client/login" className="text-center text-sm font-bold text-slate-500">
            Déjà activé ? Se connecter
          </Link>
        </div>
      </form>
    </main>
  );
}
