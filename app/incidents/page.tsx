import Link from "next/link";
import type { ComponentType } from "react";
import { connection } from "next/server";
import {
  AlertTriangle,
  Car,
  CircleHelp,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  UserRound,
} from "lucide-react";
import { updateIncidentWorkflow } from "./actions";
import BackofficeShell from "@/components/backoffice-shell";
import DatabaseErrorPanel from "@/components/database-error-panel";
import { getAccessContext, getIncidentScopeWhere } from "@/lib/access-control";
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
  const access = await getAccessContext();
  if (!access || !access.permission.canManageIncidents) return [];

  const incidents = await prisma.incidentReport.findMany({
    where: await getIncidentScopeWhere(access),
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

function formatDate(date: Date | null) {
  if (!date) return "Non renseigné";

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
  const todo = incidents?.filter((incident) => incident.status !== "done").length || 0;
  const done = incidents?.filter((incident) => incident.status === "done").length || 0;

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
            <Metric label="À traiter" value={todo} tone="text-red-700" />
            <Metric label="Traités" value={done} tone="text-emerald-700" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            {incidents.length === 0 ? (
              <p className="p-6 text-slate-500">Aucun signalement enregistré.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {incidents.map((incident) => {
                  const reason = reasonLabels[incident.reason] || reasonLabels.other;
                  const Icon = reason.icon;
                  const isDone = incident.status === "done";

                  return (
                    <article key={incident.id} className="grid gap-4 p-5 xl:grid-cols-[260px_1fr_320px]">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${reason.tone}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {reason.label}
                          </span>
                          <StatusBadge isDone={isDone} />
                        </div>
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

                        {incident.adminComment ? (
                          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                              Commentaire back-office
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {incident.adminComment}
                            </p>
                            {incident.treatedAt ? (
                              <p className="mt-2 text-xs font-semibold text-emerald-700">
                                Traité le {formatDate(incident.treatedAt)}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-bold text-slate-950">Contact déclarant</p>
                        <ContactLine icon={UserRound} value={incident.clientName || "Nom non renseigné"} />
                        <ContactLine icon={Phone} value={incident.phone || "Téléphone non renseigné"} />
                        <ContactLine icon={Mail} value={incident.email || "Email non renseigné"} />
                        {incident.employee ? (
                          <Link
                            href={`/employees/${incident.employee.id}`}
                            className="inline-flex w-full justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Ouvrir la fiche
                          </Link>
                        ) : null}

                        <details className="group rounded-lg border border-slate-200 bg-white">
                          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-[#006b55]">
                            <MessageSquareText className="h-4 w-4" />
                            Commentaire
                          </summary>
                          <form action={updateIncidentWorkflow} className="space-y-3 border-t border-slate-100 p-3">
                            <input type="hidden" name="id" value={incident.id} />
                            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                              État
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                                <input
                                  type="radio"
                                  name="status"
                                  value="todo"
                                  defaultChecked={!isDone}
                                />
                                À traiter
                              </label>
                              <label className="flex items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                                <input
                                  type="radio"
                                  name="status"
                                  value="done"
                                  defaultChecked={isDone}
                                />
                                Traité
                              </label>
                            </div>
                            <textarea
                              name="adminComment"
                              defaultValue={incident.adminComment || ""}
                              rows={4}
                              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#006b55] focus:ring-2 focus:ring-emerald-100"
                              placeholder="Réponse ou action menée..."
                            />
                            <button
                              type="submit"
                              className="w-full rounded-lg bg-[#006b55] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#005844]"
                            >
                              Enregistrer
                            </button>
                          </form>
                        </details>
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

function StatusBadge({ isDone }: { isDone: boolean }) {
  return (
    <span
      className={
        isDone
          ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
          : "inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700"
      }
    >
      {isDone ? "Traité" : "À traiter"}
    </span>
  );
}

function Metric({
  label,
  value,
  tone = "text-slate-950",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p>
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
