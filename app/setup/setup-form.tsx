"use client";

import { useState } from "react";

export default function SetupForm() {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setMessage("Initialisation impossible. Un utilisateur existe peut-etre deja.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Initialisation</h1>
        <p className="mt-2 text-sm text-slate-500">Creer le premier super admin groupe.</p>

        <div className="mt-6 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Prenom"
              required
            />
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="rounded-lg border px-4 py-3"
              placeholder="Nom"
              required
            />
          </div>
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
            placeholder="Mot de passe 10 caracteres minimum"
            minLength={10}
            required
          />

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <button type="submit" className="rounded-lg bg-black px-4 py-3 font-semibold text-white">
            Creer le super admin
          </button>
        </div>
      </form>
    </main>
  );
}
