import BackofficeShell from "@/components/backoffice-shell";
import PermissionsClient from "./permissions-client";

export default function PermissionsPage() {
  return (
    <BackofficeShell
      title="Droits utilisateurs"
      subtitle="Paramétrage des droits par type d'utilisateur et périmètre de visibilité des données."
    >
      <PermissionsClient />
    </BackofficeShell>
  );
}
