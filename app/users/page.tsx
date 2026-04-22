import BackofficeShell from "@/components/backoffice-shell";
import UsersClient from "./users-client";

export default function UsersPage() {
  return (
    <BackofficeShell
      title="Utilisateurs"
      subtitle="Profils internes, rôles et périmètres d'accès."
    >
      <UsersClient />
    </BackofficeShell>
  );
}
