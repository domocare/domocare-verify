import { connection } from "next/server";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import { prisma } from "@/lib/prisma";

async function getLoginLogs() {
  return prisma.loginLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}

export default async function SecurityPage() {
  await connection();

  let logs: Awaited<ReturnType<typeof getLoginLogs>> | null = null;

  try {
    logs = await getLoginLogs();
  } catch (error) {
    console.error("Security logs database error", error);
  }

  return (
    <BackofficeShell
      title="Securite"
      subtitle="Journal des connexions et tentatives d'acces."
    >
      {logs ? (
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune connexion journalisee.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="grid gap-2 rounded-lg border p-4 md:grid-cols-[1fr_140px]"
                >
                  <div>
                    <div className="font-semibold">{log.email}</div>
                    <div className="text-sm text-slate-600">
                      {log.success ? "Succes" : "Echec"} {log.reason ? `- ${log.reason}` : ""}
                    </div>
                    <div className="text-xs text-slate-500">
                      {log.ipAddress || "IP inconnue"} - {log.userAgent || "Terminal inconnu"}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <DatabaseErrorPanel title="Journal de securite indisponible" />
      )}
    </BackofficeShell>
  );
}
