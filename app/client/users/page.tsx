import CustomerPortalShell from "@/components/customer-portal-shell";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import PortalUsersManager from "./portal-users-manager";

export default async function ClientUsersPage() {
  const customer = await getCustomerSession();
  if (!customer) return null;

  const users = await prisma.customerPortalUser.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isOwner: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      isOwner: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <CustomerPortalShell
      title="Utilisateurs"
      subtitle="Ajoutez les personnes de votre organisation qui doivent gérer les codes et suivre les scans."
      customer={customer}
      active="users"
    >
      <PortalUsersManager
        customer={customer}
        users={users}
      />
    </CustomerPortalShell>
  );
}
