import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";

export default async function ScansPage() {
  const scans = await prisma.scanLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <BackofficeShell
      title="Historique des scans"
      subtitle="Journal des vérifications effectuées"
    >
      <div className="bg-white rounded-2xl shadow p-6">
        {scans.length === 0 ? (
          <p className="text-slate-500">Aucun scan enregistré</p>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="border rounded-2xl p-4 flex flex-col md:flex-row md:justify-between gap-3"
              >
                <div>
                  <div className="font-semibold break-all">Token : {scan.token}</div>
                  <div className="text-slate-600">Résultat : {scan.result}</div>
                  <div className="text-slate-600">
                    User Agent : {scan.userAgent || "-"}
                  </div>
                </div>

                <div className="text-sm text-slate-500">
                  {new Date(scan.createdAt).toLocaleString("fr-FR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BackofficeShell>
  );
}