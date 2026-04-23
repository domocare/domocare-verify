"use client";

import { useEffect } from "react";

type Props = {
  scanId: string;
};

export default function ScanLocationReporter({ scanId }: Props) {
  useEffect(() => {
    if (!scanId || !("geolocation" in navigator)) return;

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
        });
      },
      () => {
        // Le scan reste valide si le GPS est refusé ; la localisation réseau reste affichée.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );
  }, [scanId]);

  return null;
}
