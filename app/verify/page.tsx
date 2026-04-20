import { connection } from "next/server";
import { headers } from "next/headers";
import CompanyLogo from "@/components/company-logo";
import { getCompanyBrand } from "@/lib/company-branding";
import { prisma } from "@/lib/prisma";

type VerifyState = "valid" | "missing" | "invalid" | "expired" | "suspended" | "unavailable";

function formatDate(date?: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getStateMeta(state: VerifyState) {
  if (state === "valid") {
    return {
      label: "Habilitation valide",
      title: "Intervention autorisee",
      message: "Ce collaborateur est autorise a intervenir selon les informations affichees.",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
      pill: "bg-emerald-600 text-white",
      marker: "bg-emerald-500",
    };
  }

  if (state === "expired" || state === "unavailable") {
    return {
      label: state === "expired" ? "Habilitation expiree" : "Verification indisponible",
      title: state === "expired" ? "Intervention a verifier" : "Service momentanement indisponible",
      message:
        state === "expired"
          ? "La validite de cette habilitation est depassee. Contactez l'agence avant toute intervention."
          : "Le service de verification ne peut pas confirmer l'habilitation pour le moment.",
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      pill: "bg-amber-500 text-white",
      marker: "bg-amber-500",
    };
  }

  return {
    label: state === "suspended" ? "Habilitation suspendue" : "QR code non reconnu",
    title: state === "suspended" ? "Intervention non autorisee" : "Verification refusee",
    message:
      state === "suspended"
        ? "Cette habilitation a ete suspendue. Ne laissez pas l'intervention demarrer."
        : "Ce QR code est absent du referentiel Domocare Verify.",
    tone: "border-red-200 bg-red-50 text-red-800",
    pill: "bg-red-600 text-white",
    marker: "bg-red-500",
  };
}

function VerifyCard({
  state,
  message,
  company,
  companyLogoUrl,
  children,
}: {
  state: VerifyState;
  message?: string;
  company?: string | null;
  companyLogoUrl?: string | null;
  children?: React.ReactNode;
}) {
  const meta = getStateMeta(state);
  const fallbackBrand = getCompanyBrand(company);
  const brand = companyLogoUrl
    ? {
        ...fallbackBrand,
        name: company || fallbackBrand.name,
        logo: companyLogoUrl,
      }
    : fallbackBrand;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-900 sm:py-8">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <header className="flex items-center justify-between gap-3">
          <CompanyLogo brand={brand} preload className="h-16 w-36 p-3" />
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Domocare Verify
            </p>
            <p className="mt-1 text-sm text-slate-600">Controle QR securise</p>
          </div>
        </header>

        <section className={`rounded-lg border p-5 shadow-sm ${meta.tone}`}>
          <div className="flex items-start gap-4">
            <div className={`mt-1 h-4 w-4 shrink-0 rounded-full ${meta.marker}`} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em]">{meta.label}</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight">{meta.title}</h1>
              <p className="mt-3 text-base leading-7">{message || meta.message}</p>
            </div>
          </div>
        </section>

        {children ? (
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            {children}
          </div>
        ) : null}
      </div>
    </main>
  );
}

async function getEmployeeByToken(token: string) {
  return prisma.employee.findFirst({
    where: {
      qrToken: {
        token,
      },
    },
    include: {
      qrToken: true,
      authorization: true,
    },
  });
}

async function logScan({
  token,
  result,
  company,
}: {
  token: string;
  result: string;
  company?: string | null;
}) {
  const headersList = await headers();

  await prisma.scanLog.create({
    data: {
      token,
      result,
      company: company || null,
      ipAddress: headersList.get("x-forwarded-for"),
      userAgent: headersList.get("user-agent"),
    },
  });
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await connection();

  const { token } = await searchParams;

  if (!token) {
    return <VerifyCard state="missing" message="Le QR code scanne ne contient pas de token valide." />;
  }

  let employee: Awaited<ReturnType<typeof getEmployeeByToken>> | null = null;

  try {
    employee = await getEmployeeByToken(token);
  } catch (error) {
    console.error("Verify database error", error);

    return (
      <VerifyCard
        state="unavailable"
        message="Le service de verification est momentanement inaccessible."
      />
    );
  }

  if (!employee || !employee.qrToken) {
    await logScan({ token, result: "invalid" });

    return (
      <VerifyCard
        state="invalid"
        message="QR code invalide ou introuvable"
      />
    );
  }

  const isExpiredByDate =
    !!employee.qrToken.expiresAt &&
    new Date(employee.qrToken.expiresAt) < new Date();

  const isAuthorizationRevoked =
    employee.authorization?.status === "revoked" ||
    employee.authorization?.status === "suspended";

  const isAuthorizationExpired = employee.authorization?.status === "expired";

  const isRevoked =
    employee.qrToken.isActive === false ||
    !!employee.qrToken.revokedAt ||
    isAuthorizationRevoked;

  const isExpired = isExpiredByDate || isAuthorizationExpired;

  if (isRevoked || isExpired) {
    const result = isRevoked ? "suspended" : "expired";
    await logScan({ token, result, company: employee.company });
    const companyRecord = employee.company
      ? await prisma.company.findUnique({ where: { name: employee.company } })
      : null;

    return (
      <VerifyCard
        state={isRevoked ? "suspended" : "expired"}
        company={employee.company}
        companyLogoUrl={companyRecord?.logoUrl}
      >
        <PublicEmployeeSummary token={token} employee={employee} state={isRevoked ? "suspended" : "expired"} />
      </VerifyCard>
    );
  }

  await logScan({ token, result: "valid", company: employee.company });
  const companyRecord = employee.company
    ? await prisma.company.findUnique({ where: { name: employee.company } })
    : null;

  return (
    <VerifyCard state="valid" company={employee.company} companyLogoUrl={companyRecord?.logoUrl}>
      <PublicEmployeeSummary token={token} employee={employee} state="valid" />
    </VerifyCard>
  );
}

function PublicEmployeeSummary({
  token,
  employee,
  state,
}: {
  token: string;
  employee: NonNullable<Awaited<ReturnType<typeof getEmployeeByToken>>>;
  state: "valid" | "expired" | "suspended";
}) {
  const meta = getStateMeta(state);
  const validUntil = employee.authorization?.validUntil || employee.qrToken?.expiresAt;

  return (
    <div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {employee.photoUrl ? (
            <img
              src={employee.photoUrl}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="h-32 w-32 rounded-lg border bg-slate-50 object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-slate-50 text-sm text-slate-400">
              Photo
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${meta.pill}`}>
              {meta.label}
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              {employee.jobTitle || "Fonction non renseignee"}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {employee.company || "Societe non renseignee"} - {employee.agency || "Agence non renseignee"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <PublicInfo label="Validite" value={validUntil ? `Jusqu'au ${formatDate(validUntil)}` : "-"} />
          <PublicInfo label="Type d'intervention" value={employee.interventionType} />
          <PublicInfo label="Vehicule" value={employee.vehiclePlate} />
          <PublicInfo label="Site ou client autorise" value={employee.authorizedSite} />
          <PublicInfo label="Contact agence" value={employee.phoneAgency} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {employee.phoneAgency ? (
            <a
              href={`tel:${employee.phoneAgency.replace(/\s+/g, "")}`}
              className="rounded-lg border bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900"
            >
              Appeler l&apos;agence
            </a>
          ) : null}
          <a
            href={`/report?token=${encodeURIComponent(token)}`}
            className="rounded-lg bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Signaler une anomalie
          </a>
        </div>
      </div>

      <div className="border-t bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        {state === "valid"
          ? "Si la photo, le vehicule ou le motif d'intervention ne correspondent pas, signalez l'anomalie avant de laisser intervenir."
          : "Par securite, contactez l'agence ou signalez l'anomalie avant toute intervention."}
      </div>
    </div>
  );
}

function PublicInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-950">{value || "-"}</p>
    </div>
  );
}
