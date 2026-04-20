import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import StatCard from "@/components/stat-card";

async function getDashboardStats() {
  const [employees, active, expired, suspended, scans] = await Promise.all([
    prisma.employee.count(),
    prisma.authorization.count({ where: { status: "active" } }),
    prisma.authorization.count({ where: { status: "expired" } }),
    prisma.authorization.count({ where: { status: { in: ["revoked", "suspended"] } } }),
    prisma.scanLog.count(),
  ]);

  return { employees, active, expired, suspended, scans };
}

export default async function DashboardPage() {
  await connection();

  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null;

  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error("Dashboard database error", error);
  }

  return (
    <BackofficeShell
      title="Controle d'habilitation par QR code"
      subtitle="Back-office Domocare / Lantana pour verifier, securiser et tracer les interventions terrain."
      actions={
        <>
          <Link
            href="/employees"
            className="rounded-2xl px-4 py-2 border bg-black text-white"
          >
            Vue collaborateurs
          </Link>
          <Link
            href="/employees/new"
            className="rounded-2xl px-4 py-2 border bg-white"
          >
            Ajouter un collaborateur
          </Link>
        </>
      }
    >
      {stats ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Collaborateurs" value={stats.employees} subtitle="Toutes entites" />
          <StatCard title="Actifs" value={stats.active} subtitle="Habilitations valides" />
          <StatCard title="Expires" value={stats.expired} subtitle="A renouveler" />
          <StatCard title="Suspendus" value={stats.suspended} subtitle="Non autorises" />
          <StatCard title="Scans" value={stats.scans} subtitle="Historique total" />
        </div>
      ) : (
        <DatabaseErrorPanel />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Acces rapides</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/employees"
              className="rounded-2xl border p-4 hover:bg-slate-50"
            >
              <div className="font-medium">Collaborateurs</div>
              <div className="text-sm text-slate-500 mt-1">
                Voir les fiches, statuts et QR codes
              </div>
            </Link>

            <Link
              href="/employees/new"
              className="rounded-2xl border p-4 hover:bg-slate-50"
            >
              <div className="font-medium">Ajouter</div>
              <div className="text-sm text-slate-500 mt-1">
                Creer un nouvel intervenant
              </div>
            </Link>

            <Link
              href="/scans"
              className="rounded-2xl border p-4 hover:bg-slate-50"
            >
              <div className="font-medium">Scans</div>
              <div className="text-sm text-slate-500 mt-1">
                Historique des verifications
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Lecture metier</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Cet outil permet de rassurer le client final, de securiser les acces
              aux interventions, et de standardiser les pratiques a l echelle
              Domocare.
            </p>
            <p>
              La valeur groupe vient de la tracabilite, de la maitrise des
              habilitations et de la capacite a deployer un meme standard sur
              plusieurs agences.
            </p>
          </div>
        </div>
      </div>
    </BackofficeShell>
  );
}
