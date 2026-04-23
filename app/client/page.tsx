import CustomerPortalShell from "@/components/customer-portal-shell";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export default async function ClientDashboardPage() {
  const customer = await getCustomerSession();

  if (!customer) {
    return null;
  }

  const [sites, codes, scans] = await Promise.all([
    prisma.customerSite.count({ where: { customerId: customer.id, isActive: true } }),
    prisma.customerAccessCode.count({ where: { customerId: customer.id, isActive: true } }),
    prisma.scanLog.count({ where: { customerId: customer.id } }),
  ]);

  return (
    <CustomerPortalShell
      title="Vue d'ensemble"
      subtitle="Pilotage des accès terrain du client final."
      customer={customer}
      active="dashboard"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Sites actifs" value={sites} />
        <Metric label="Codes actifs" value={codes} />
        <Metric label="Scans" value={scans} />
      </div>
    </CustomerPortalShell>
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
