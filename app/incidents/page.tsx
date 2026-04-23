import Link from "next/link";
import type { ComponentType } from "react";
import { connection } from "next/server";
import { AlertTriangle, Car, CircleHelp, Clock3, Mail, Phone, UserRound } from "lucide-react";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import { prisma } from "@/lib/prisma";

type ReasonLabel = {
  label: string;
  tone: string;
  icon: ComponentType<{ className?: string }>;
};

const reasonLabels: Record<string, ReasonLabel> = {
  person_not_recognized: {
    label: "Personne non reconnue",
    tone: "border-red-200 bg-red-50 text-red-700",
    icon: UserRound,
  },
  photo_mismatch: {
    label: "Photo non conforme",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    icon: AlertTriangle,
  },
  wrong_vehicle: {
    label: "Mauvais véhicule",
    tone: "border-orange-200 bg-orange-50 text-orange-700",
    icon: Car,
  },
  unexpected_visit: {
    label: "Intervention non prévue",
    tone: "border-purple-200 bg-purple-50 text-purple-700",
    icon: Clock3,
  },
  validity_doubt: {
    label: "Doute sur la validité",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
    icon: CircleHelp,
  },
  other: {
    label: "Autre anomalie",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
    icon: AlertTriangle,
  },
};

async function getIncidents() {
  const incidents = await prisma.incidentReport.findMany({
    orderBy: { createdAt: "desc" },
  });

  const tokens = Array.from(
    new Set(
      incidents
        .map((incident) => incident.token)
        .filter((token): token is string => Boolean(token)),
    ),
  );

  const employees = tokens.length
    ? await prisma.employee.findMany({
        where: {
          qrToken: {
            token: { in: tokens },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          company: true,
          agency: true,
          qrToken: {
            select: {
              token: true,
            },
          },
        },
      })
    : [];

  const employeesByToken = new Map(
    employees
      .filter((employee) => employee.qrToken?.token)
      .map((employee) => [employee.qrToken?.token as string, employee]),
  );

  return incidents.map((incident) => ({
    ...incident,
    employee: incident.token ? employeesByToken.get(incident.token) || null : null,
  }));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function IncidentsPage() {
  await connection();

  let incidents: Awaited<ReturnType<typeof getIncidents>> | null = null;

  try {
    incidents = await getIncidents();
  } catch (error) {
    console.error("Incidents database error", error);
  }

  const total = incidents?.length || 0;
  const linked = incidents?.filter((incident) => incident.employee).length || 0;

  return (
    <BackofficeShell
      title="Signalements"
      subtitle="Anomalies remontées depuis la page publique de vérification QR."
      actions={
        <Link
          href="/scans"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Voir les scans
        </Link>
      }
    >
      {incidents ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Signalements" value={total} />
            <Metric label="Liés à un collaborateur" value={linked} />
            <Metric label="Non rattachés" value={total - linked} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            {incidents.length === 0 ? (
              <p className="p-6 text-slate-500">Aucun signalement enregistré.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {incidents.map((incident) => {
                  const reason = reasonLabels[incident.reason] || reasonLabels.other;
                  const Icon = reason.icon;

                  return (
                    <article key={incident.id} className="grid gap-4 p-5 xl:grid-cols-[260px_1fr_280px]">
                      <div>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${reason.tone}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {reason.label}
                        </span>
                        <p className="mt-3 text-sm font-semibold text-slate-900">
                          {formatDate(incident.createdAt)}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-500">
                          {incident.token || "Token non transmis"}
                        </p>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-950">
                          {incident.employee
                            ? `${incident.employee.firstName} ${incident.employee.lastName}`
                            : "Collaborateur non identifié"}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {incident.employee
                            ? `${incident.employee.company || "Société non renseignée"} - ${incident.employee.agency || "Agence non renseignée"}`
                            : "Le token ne correspond à aucune fiche active connue."}
                        </p>
                        <div className="mt-4 rounded-lg bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Description
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {incident.description || "Aucune description fournie."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-bold text-slate-950">Contact déclarant</p>
                        <ContactLine icon={UserRound} value={incident.clientName || "Nom non renseigné"} />
                        <ContactLine icon={Phone} value={incident.phone || "Téléphone non renseigné"} />
                        <ContactLine icon={Mail} value={incident.email || "Email non renseigné"} />
                        {incident.employee ? (
                          <Link
                            href={`/employees/${incident.employee.id}`}
                            className="mt-2 inline-flex w-full justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Ouvrir la fiche
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <DatabaseErrorPanel title="Signalements indisponibles" />
      )}
    </BackofficeShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function ContactLine({
  icon: Icon,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}
