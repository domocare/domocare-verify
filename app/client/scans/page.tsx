import CustomerPortalShell from "@/components/customer-portal-shell";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export default async function ClientScansPage() {
  const customer = await getCustomerSession();
  if (!customer) return null;

  const scans = await prisma.scanLog.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <CustomerPortalShell
      title="Scans"
      subtitle="Historique des vérifications et validations d'accès de votre portail."
      customer={customer}
      active="scans"
    >
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {scans.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Aucun scan enregistré.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {scans.map((scan) => (
              <div key={scan.id} className="grid gap-3 p-5 md:grid-cols-[1fr_160px_160px_180px] md:items-center">
                <div>
                  <p className="break-all font-mono text-sm font-semibold text-slate-950">{scan.token}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {scan.customerSiteName || "Tous les sites"} - {scan.customerName || customer.name}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900">{scan.result}</p>
                <p className="text-sm text-slate-600">{scan.accessCodeStatus || "-"}</p>
                <p className="text-sm text-slate-500">
                  {new Date(scan.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerPortalShell>
  );
}
