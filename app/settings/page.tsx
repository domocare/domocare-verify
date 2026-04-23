import BackofficeShell from "@/components/backoffice-shell";
import SettingsClient from "./settings-client";

export default function SettingsPage() {
  return (
    <BackofficeShell
      title="Paramétrage"
      subtitle="Sociétés clientes Lantana Verify, agences et sites rattachés."
    >
      <SettingsClient />
    </BackofficeShell>
  );
}
