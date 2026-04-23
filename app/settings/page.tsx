import BackofficeShell from "@/components/backoffice-shell";
import SettingsClient from "./settings-client";

export default function SettingsPage() {
  return (
    <BackofficeShell
      title="Agences/Sites"
      subtitle="Sociétés clientes Lantana Verify, agences et sites rattachés."
    >
      <SettingsClient />
    </BackofficeShell>
  );
}
