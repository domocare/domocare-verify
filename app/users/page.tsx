import BackofficeShell from "@/components/backoffice-shell";
import UsersClient from "./users-client";

export default function UsersPage() {
  return (
    <BackofficeShell
      title="Utilisateurs"
      subtitle="Profils internes, roles et perimetres d'acces."
    >
      <UsersClient />
    </BackofficeShell>
  );
}
