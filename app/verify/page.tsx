import { prisma } from "@/lib/prisma";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border overflow-hidden text-center">
          <div className="bg-red-100 text-red-700 font-semibold text-2xl py-4">
            Accès refusé
          </div>
          <div className="p-8">
            <p className="text-slate-700 text-lg">Token manquant</p>
          </div>
        </div>
      </div>
    );
  }

  const employee = await prisma.employee.findFirst({
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

  if (!employee || !employee.qrToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border overflow-hidden text-center">
          <div className="bg-red-100 text-red-700 font-semibold text-2xl py-4">
            Accès refusé
          </div>
          <div className="p-8">
            <p className="text-slate-700 text-lg">QR code invalide ou introuvable</p>
          </div>
        </div>
      </div>
    );
  }

  const isExpiredByDate =
  !!employee.qrToken.expiresAt &&
  new Date(employee.qrToken.expiresAt) < new Date();

const isRevoked =
  employee.qrToken.isActive === false || !!employee.qrToken.revokedAt;

const isExpired = isRevoked || isExpiredByDate;

if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border overflow-hidden text-center">
          <div className="bg-amber-100 text-amber-700 font-semibold text-2xl py-4">
            Accès expiré
          </div>
          <div className="p-8">
            <p className="text-slate-700 text-lg">
              Ce QR code n’est plus valide.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border overflow-hidden text-center">
        <div className="bg-green-100 text-green-700 font-semibold text-2xl py-4">
          Accès autorisé
        </div>

        <div className="p-8">
          <p className="text-3xl font-bold">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="mt-2 text-slate-700 text-lg">{employee.jobTitle}</p>
          <p className="text-slate-500">
            {employee.company} · {employee.agency}
          </p>
        </div>
      </div>
    </div>
  );
}