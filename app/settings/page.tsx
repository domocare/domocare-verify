import BackofficeShell from "@/components/backoffice-shell";
import SettingsClient from "./settings-client";

export default function SettingsPage() {
  return (
    <BackofficeShell
      title="Paramétrage"
      subtitle="Référentiels utilisés dans les fiches collaborateurs."
    >
      <SettingsClient />
    </BackofficeShell>
  );
}
