type EmployeeCardProps = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string | null;
    agency: string | null;
    company: string | null;
    qrToken?: { token: string } | null;
    authorization?: { status: string | null } | null;
    qrImage?: string | null;
  };
};

function badgeClass(status?: string | null) {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "expired") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 border flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-semibold">
            {employee.firstName} {employee.lastName}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass(
              employee.authorization?.status
            )}`}
          >
            {employee.authorization?.status || "inconnu"}
          </span>
        </div>

        <div className="text-slate-600">{employee.jobTitle || "-"}</div>
        <div className="text-slate-600">
          {employee.company || "-"} · {employee.agency || "-"}
        </div>


        {employee.qrToken?.token && (
          <a
            href={`/verify?token=${employee.qrToken.token}`}
            className="inline-block text-sm underline"
          >
            Tester la vérification
          </a>
        )}
      </div>

      <div className="w-full lg:w-40 flex justify-center items-start">
        {employee.qrImage ? (
          <img
            src={employee.qrImage}
            alt="QR code"
            className="w-32 h-32 rounded-xl border bg-white p-2"
          />
        ) : (
          <div className="text-sm text-slate-400">Pas de QR code</div>
        )}
      </div>
    </div>
  );
}