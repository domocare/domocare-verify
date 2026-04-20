type Props = {
  title?: string;
};

export default function DatabaseErrorPanel({
  title = "Base de donnees indisponible",
}: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm">
        Le service ne parvient pas a joindre Supabase pour le moment. Verifie
        la connexion reseau, le VPN ou pare-feu et la variable DATABASE_URL.
      </p>
    </div>
  );
}
