import BackofficeShell from "@/components/backoffice-shell";
import CustomersClient from "./customers-client";

export default function CustomersPage() {
  return (
    <BackofficeShell
      title="Clients finaux"
      subtitle="Clients et sites d'intervention des sociétés clientes de Lantana Verify."
    >
      <CustomersClient />
    </BackofficeShell>
  );
}
