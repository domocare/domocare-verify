"use client";

import { useState } from "react";

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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Connexion</h1>
        <p className="mt-2 text-sm text-slate-500">Back-office Domocare Verify</p>

        <div className="mt-6 grid gap-3">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border px-4 py-3"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border px-4 py-3"
            placeholder="Mot de passe"
            required
          />
          <input
            value={form.mfaCode}
            onChange={(e) => setForm({ ...form, mfaCode: e.target.value })}
            className="rounded-lg border px-4 py-3"
            placeholder="Code MFA administrateur si active"
          />

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <button type="submit" className="rounded-lg bg-black px-4 py-3 font-semibold text-white">
            Se connecter
          </button>
        </div>
      </form>
    </main>
  );
}
