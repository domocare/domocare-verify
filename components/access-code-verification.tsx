"use client";

import { useState } from "react";
import ScanLocationReporter from "@/components/scan-location-reporter";

type Props = {
  token: string;
  customerName?: string | null;
  siteName?: string | null;
};

export default function AccessCodeVerification({ token, customerName, siteName }: Props) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    scanId?: string;
  } | null>(null);

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const res = await fetch("/api/verify/access-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, code }),
    });

    const data = (await res.json()) as {
      ok: boolean;
      message?: string;
      scanId?: string;
    };

    setResult({
      ok: res.ok && data.ok,
      message: data.message || (res.ok ? "Accès validé." : "Accès refusé."),
      scanId: data.scanId,
    });
    setIsSubmitting(false);
  }

  return (
    <div className="border-t bg-white p-5 sm:p-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <p className="text-sm font-black uppercase tracking-[0.14em]">Double authentification</p>
        <p className="mt-2 text-sm leading-6">
          Le client doit saisir son code d&apos;accès pour confirmer l&apos;entrée sur
          {siteName ? ` le site ${siteName}` : customerName ? ` ${customerName}` : " ce site"}.
        </p>
      </div>

      <form onSubmit={submitCode} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
          className="rounded-lg border border-slate-200 px-4 py-3 text-center text-2xl font-black tracking-[0.2em] outline-none focus:border-[#006b55] focus:ring-2 focus:ring-emerald-100"
          inputMode="numeric"
          minLength={6}
          maxLength={8}
          placeholder="000000"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#006b55] px-5 py-3 text-sm font-black text-white disabled:opacity-60"
        >
          Valider l&apos;accès
        </button>
      </form>

      {result ? (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm font-bold ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {result.message}
        </div>
      ) : null}

      {result?.scanId ? <ScanLocationReporter scanId={result.scanId} /> : null}
    </div>
  );
}
