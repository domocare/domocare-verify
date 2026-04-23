import BackofficeShell from "@/components/backoffice-shell";
import InterventionTypesClient from "./intervention-types-client";

export default function InterventionTypesPage() {
  return (
    <BackofficeShell
      title="Types d'intervention"
      subtitle="Référentiel des interventions autorisées à associer aux collaborateurs."
    >
      <InterventionTypesClient />
    </BackofficeShell>
  );
}
