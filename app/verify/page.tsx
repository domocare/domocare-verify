import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold">QR code invalide</h1>
          <p className="text-slate-600 mt-2">Aucun token transmis</p>
        </div>
      </main>
    );
  }

  const qr = await prisma.qrToken.findUnique({
    where: { token },
    include: {
      employee: {
        include: {
          authorization: true,
        },
      },
    },
  });
const isValid = qr && qr.isActive;

await prisma.scanLog.create({
  data: {
    token: token,
    result: isValid ? "valid" : "invalid",
    userAgent: "mobile", // on améliorera après
  },
});
  if (!qr || !qr.isActive) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
          <p className="text-slate-600 mt-2">
            Intervenant non reconnu ou QR code inactif
          </p>
        </div>
      </main>
    );
  }

  const emp = qr.employee;
  const status = emp.authorization?.status || "inconnu";

  const colorClass =
    status === "active"
      ? "bg-green-100 text-green-700"
      : status === "expired"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  const title =
    status === "active"
      ? "Accès autorisé"
      : status === "expired"
      ? "Habilitation expirée"
      : "Accès refusé";

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow max-w-md w-full overflow-hidden">
        <div className={`p-4 text-center font-semibold ${colorClass}`}>
          {title}
        </div>

        <div className="p-6 text-center space-y-4">
          {emp.photoUrl && (
            <img
              src={emp.photoUrl}
              alt={`${emp.firstName} ${emp.lastName}`}
              className="w-28 h-28 rounded-2xl object-cover mx-auto"
            />
          )}

          <div>
            <p className="text-2xl font-bold">
              {emp.firstName} {emp.lastName}
            </p>
            <p className="text-slate-600">{emp.jobTitle || "-"}</p>
            <p className="text-slate-600">
              {emp.company || "-"} · {emp.agency || "-"}
            </p>
          </div>

          <div className="text-sm text-slate-500 space-y-1">
            <p>Statut : {status}</p>
            <p>
              Validité :{" "}
              {emp.authorization?.validUntil
                ? new Date(emp.authorization.validUntil).toLocaleDateString("fr-FR")
                : "-"}
            </p>
            <p>Agence : {emp.phoneAgency || "-"}</p>
          </div>

          {emp.phoneAgency && (
            <a
              href={`tel:${emp.phoneAgency}`}
              className="inline-block rounded-xl bg-black text-white px-4 py-2"
            >
              Contacter l’agence
            </a>
          )}
        </div>
      </div>
    </main>
  );
}