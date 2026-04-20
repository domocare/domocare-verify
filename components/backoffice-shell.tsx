import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function BackofficeShell({
  title,
  subtitle,
  actions,
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

        <div className="rounded-[28px] bg-white shadow-sm border p-5 md:p-6">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
          {actions && <div className="mt-4 flex gap-2">{actions}</div>}
        </div>

        <div className="flex gap-3 text-sm">
          <Link href="/">Dashboard</Link>
          <Link href="/employees">Collaborateurs</Link>
          <Link href="/employees/new">Ajouter</Link>
          <Link href="/scans">Scans</Link>
          <Link href="/users">Utilisateurs</Link>
          <Link href="/security">Securite</Link>
          <Link href="/settings">Parametrage</Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="underline">
              Deconnexion
            </button>
          </form>
        </div>

        {children}
      </div>
    </main>
  );
}
