import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

type VerifyState = "valid" | "missing" | "invalid" | "expired" | "unavailable";

function VerifyCard({
  state,
  title,
  message,
  children,
}: {
  state: VerifyState;
  title: string;
  message?: string;
  children?: React.ReactNode;
}) {
  const tone =
    state === "valid"
      ? "bg-green-100 text-green-700"
      : state === "expired" || state === "unavailable"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border overflow-hidden text-center">
        <div className={`${tone} font-semibold text-2xl py-4`}>{title}</div>
        <div className="p-8">
          {message ? <p className="text-slate-700 text-lg">{message}</p> : null}
          {children}
        </div>
      </div>
    </div>
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

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await connection();

  const { token } = await searchParams;

  if (!token) {
    return <VerifyCard state="missing" title="Acces refuse" message="Token manquant" />;
  }

  let employee: Awaited<ReturnType<typeof getEmployeeByToken>> | null = null;

  try {
    employee = await getEmployeeByToken(token);
  } catch (error) {
    console.error("Verify database error", error);

    return (
      <VerifyCard
        state="unavailable"
        title="Verification indisponible"
        message="Le service de verification est momentanement inaccessible."
      />
    );
  }

  if (!employee || !employee.qrToken) {
    return (
      <VerifyCard
        state="invalid"
        title="Acces refuse"
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

  const isExpired = isRevoked || isExpiredByDate || isAuthorizationExpired;

  if (isExpired) {
    return (
      <VerifyCard
        state="expired"
        title="Acces expire"
        message="Ce QR code n'est plus valide."
      />
    );
  }

  return (
    <VerifyCard state="valid" title="Acces autorise">
      {employee.photoUrl ? (
        <img
          src={employee.photoUrl}
          alt={`${employee.firstName} ${employee.lastName}`}
          className="mx-auto mb-5 h-32 w-32 rounded-2xl object-cover border bg-slate-50"
        />
      ) : null}
      <p className="text-3xl font-bold">
        {employee.firstName} {employee.lastName}
      </p>
      <p className="mt-2 text-slate-700 text-lg">{employee.jobTitle}</p>
      <p className="text-slate-500">
        {employee.company} - {employee.agency}
      </p>
    </VerifyCard>
  );
}
