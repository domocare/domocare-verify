import BackofficeShell from "@/components/backoffice-shell";
import CustomersClient from "./customers-client";

export default function CustomersPage() {
  return (
    <BackofficeShell
      title="Clients et sites"
      subtitle="Référentiel clients, sites d'intervention et options d'accès sécurisé."
    >
      <CustomersClient />
    </BackofficeShell>
  );
}
