import CustomerPortalShell from "@/components/customer-portal-shell";
import ClientCodesManager from "./portal-codes-manager";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ClientCodesPage() {
  const customer = await getCustomerSession();
  if (!customer) return null;

  const accessCodes = await prisma.customerAccessCode.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      siteId: true,
      label: true,
      codeLast4: true,
      scope: true,
      isOneTime: true,
      isActive: true,
      expiresAt: true,
      usedAt: true,
      createdAt: true,
    },
  });

  return (
    <CustomerPortalShell
      title="Gestion des codes"
      subtitle="Créez vos codes d'accès pour valider les entrées après scan QR."
      customer={customer}
      active="codes"
    >
      <div className="mb-5 flex justify-end">
        <Link
          href="/api/client/export/codes"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
        >
          Export Excel
        </Link>
      </div>
      <ClientCodesManager customer={customer} accessCodes={accessCodes} />
    </CustomerPortalShell>
  );
}
