"use client";

import { useRef, useState } from "react";

type ImportResult = {
  ok: boolean;
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  message?: string;
};

export default function EmployeeExcelActions() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/employees/import", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as ImportResult;
    setResult(data);
    setIsImporting(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (response.ok && data.ok) {
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  }

  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Import / export Excel</h2>
          <p className="mt-1 text-sm text-slate-500">
            Téléchargez le modèle, complétez les lignes, puis importez le fichier .xlsx.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/api/employees/template"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Modele Excel
          </a>
          <a
            href="/api/employees/export"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Exporter
          </a>
          <label className="cursor-pointer rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            {isImporting ? "Import en cours..." : "Importer"}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              onChange={handleImport}
              disabled={isImporting}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {result ? (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {result.ok ? (
            <p>
              Import terminé : {result.created || 0} créé(s), {result.updated || 0} mis à jour,
              {" "}
              {result.skipped || 0} ignore(s).
            </p>
          ) : (
            <p>{result.message || "Import impossible."}</p>
          )}

          {result.errors && result.errors.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.errors.slice(0, 5).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
