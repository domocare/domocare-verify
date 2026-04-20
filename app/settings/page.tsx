import BackofficeShell from "@/components/backoffice-shell";
import SettingsClient from "./settings-client";

export default function SettingsPage() {
  return (
    <BackofficeShell
      title="Parametrage"
      subtitle="Referentiels utilises dans les fiches collaborateurs."
    >
      <SettingsClient />
    </BackofficeShell>
  );
}
