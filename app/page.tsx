import { toDataURL } from "qrcode";
import { prisma } from "@/lib/prisma";

async function generateQR(token: string) {
const url = `https://verify.groupe-lantana.fr/verify?token=${token}`;
  return await toDataURL(url);
}

export default async function Page() {
  const employees = await prisma.employee.findMany({
    include: {
      authorization: true,
      qrToken: true,
    },
  });

  const employeesWithQr = await Promise.all(
    employees.map(async (emp) => {
      const qrImage =
        emp.qrToken?.token ? await generateQR(emp.qrToken.token) : null;

      return {
        ...emp,
        qrImage,
      };
    })
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-3xl font-bold">Domocare Verify</h1>
          <p className="text-slate-600 mt-2">Lecture réelle depuis Supabase</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Collaborateurs</h2>

          <div className="space-y-4">
            {employeesWithQr.map((emp) => (
              <div
                key={emp.id}
                className="border rounded-2xl p-4 flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="flex-1">
                  <div className="text-xl font-semibold">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-slate-600">{emp.jobTitle || "-"}</div>
                  <div className="text-slate-600">
                    {emp.company || "-"} · {emp.agency || "-"}
                  </div>
                  <div className="text-slate-600">
                    Statut : {emp.authorization?.status || "-"}
                  </div>
                  <div className="text-slate-600">
                    Token : {emp.qrToken?.token || "-"}
                  </div>
                </div>

                <div>
                  {emp.qrImage ? (
                    <img
                      src={emp.qrImage}
                      alt={`QR code ${emp.firstName} ${emp.lastName}`}
                      className="w-32 h-32 border rounded-xl bg-white p-2"
                    />
                  ) : (
                    <div className="text-sm text-slate-400">Pas de QR code</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}