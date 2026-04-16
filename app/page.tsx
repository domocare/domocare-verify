import { prisma } from "@/lib/prisma";
import BackofficeShell from "@/components/backoffice-shell";
import StatCard from "@/components/stat-card";
import Link from "next/link";

export default async function DashboardPage() {
  const [employees, active, expired, suspended, scans] = await Promise.all([
    prisma.employee.count(),
    prisma.authorization.count({ where: { status: "active" } }),
    prisma.authorization.count({ where: { status: "expired" } }),
    prisma.authorization.count({ where: { status: "suspended" } }),
    prisma.scanLog.count(),
  ]);

  return (
    <BackofficeShell
      title="Contrôle d’habilitation par QR code"
      subtitle="Back-office Domocare / Lantana pour vérifier, sécuriser et tracer les interventions terrain."
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
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Collaborateurs" value={employees} subtitle="Toutes entités" />
        <StatCard title="Actifs" value={active} subtitle="Habilitations valides" />
        <StatCard title="Expirés" value={expired} subtitle="À renouveler" />
        <StatCard title="Suspendus" value={suspended} subtitle="Non autorisés" />
        <StatCard title="Scans" value={scans} subtitle="Historique total" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Accès rapides</h2>
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
                Créer un nouvel intervenant
              </div>
            </Link>

            <Link
              href="/scans"
              className="rounded-2xl border p-4 hover:bg-slate-50"
            >
              <div className="font-medium">Scans</div>
              <div className="text-sm text-slate-500 mt-1">
                Historique des vérifications
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Lecture métier</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              L’outil permet de rassurer le client final, de sécuriser l’accès
              aux interventions, et de standardiser les pratiques à l’échelle
              Domocare.
            </p>
            <p>
              La valeur groupe vient de la traçabilité, de la maîtrise des
              habilitations et de la capacité à déployer un même standard sur
              plusieurs agences.
            </p>
          </div>
        </div>
      </div>
    </BackofficeShell>
  );
}