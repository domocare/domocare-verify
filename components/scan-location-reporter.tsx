"use client";

import { useEffect, useState } from "react";

type Props = {
  scanId: string;
};

export default function ScanLocationReporter({ scanId }: Props) {
  const [status, setStatus] = useState<"pending" | "saved" | "denied" | "unsupported">("pending");

  useEffect(() => {
    if (!scanId) return;

    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setStatus("unsupported"));
      void fetch("/api/scans/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          denied: true,
        }),
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetch("/api/scans/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scanId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        }).then((res) => {
          setStatus(res.ok ? "saved" : "denied");
        });
      },
      () => {
        setStatus("denied");
        void fetch("/api/scans/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scanId,
            denied: true,
          }),
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );
  }, [scanId]);

  if (status === "saved") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 text-slate-950 backdrop-blur">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
          Géolocalisation obligatoire
        </p>
        <h2 className="mt-3 text-2xl font-black">Preuve de contrôle</h2>
        {status === "pending" ? (
          <p className="mt-3 leading-7 text-slate-600">
            Autorisez la position GPS pour valider ce scan et enregistrer la preuve.
          </p>
        ) : (
          <p className="mt-3 leading-7 text-red-700">
            La géolocalisation est requise pour consulter le résultat du scan. Activez la
            position dans votre navigateur puis scannez à nouveau le QR code.
          </p>
        )}
      </div>
    </div>
  );
}
