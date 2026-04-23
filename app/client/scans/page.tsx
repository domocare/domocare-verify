import CustomerPortalShell from "@/components/customer-portal-shell";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PortalScansBoard from "./portal-scans-board";

export default async function ClientScansPage() {
  const customer = await getCustomerSession();
  if (!customer) return null;

  const scans = await prisma.scanLog.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 150,
    select: {
      id: true,
      token: true,
      result: true,
      accessCodeStatus: true,
      customerName: true,
      customerSiteName: true,
      locationLabel: true,
      createdAt: true,
    },
  });

  return (
    <CustomerPortalShell
      title="Scans"
      subtitle="Historique des vérifications et validations d'accès sur vos sites."
      customer={customer}
      active="scans"
    >
      <div className="mb-5 flex justify-end">
        <Link
          href="/api/client/export/scans"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
        >
          Export Excel
        </Link>
      </div>
      <PortalScansBoard scans={scans} />
    </CustomerPortalShell>
  );
}
