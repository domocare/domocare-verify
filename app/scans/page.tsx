import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";

async function getScans() {
  return prisma.scanLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function ScansPage() {
  await connection();

  let scans: Awaited<ReturnType<typeof getScans>> | null = null;

  try {
    scans = await getScans();
  } catch (error) {
    console.error("Scans database error", error);
  }

  return (
    <BackofficeShell
      title="Historique des scans"
      subtitle="Journal des verifications effectuees"
    >
      {scans ? (
        <div className="bg-white rounded-2xl shadow p-6">
          {scans.length === 0 ? (
            <p className="text-slate-500">Aucun scan enregistre</p>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="border rounded-2xl p-4 flex flex-col md:flex-row md:justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold break-all">Token : {scan.token}</div>
                  <div className="text-slate-600">Resultat : {scan.result}</div>
                  <div className="text-slate-600">Societe : {scan.company || "-"}</div>
                  <div className="text-slate-600">IP : {scan.ipAddress || "-"}</div>
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
      ) : (
        <DatabaseErrorPanel title="Historique indisponible" />
      )}
    </BackofficeShell>
  );
}
