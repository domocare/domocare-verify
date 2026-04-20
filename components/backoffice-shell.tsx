import Link from "next/link";
import { ReactNode } from "react";
import CompanyLogo from "@/components/company-logo";
import { companyBrands } from "@/lib/company-branding";

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

        <div className="rounded-lg bg-white shadow-sm border p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Domocare Verify
              </p>
              <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
              {subtitle && <p className="text-slate-500 mt-2 max-w-3xl">{subtitle}</p>}
              {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              {companyBrands.map((brand) => (
                <CompanyLogo key={brand.name} brand={brand} className="h-14 w-32 p-2 shadow-none" />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link className="rounded-lg border bg-white px-3 py-2 font-medium" href="/">Dashboard</Link>
          <Link className="rounded-lg border bg-white px-3 py-2 font-medium" href="/employees">Collaborateurs</Link>
          <Link className="rounded-lg border bg-white px-3 py-2 font-medium" href="/employees/new">Ajouter</Link>
          <Link className="rounded-lg border bg-white px-3 py-2 font-medium" href="/scans">Scans</Link>
          <Link className="rounded-lg border bg-white px-3 py-2 font-medium" href="/users">Utilisateurs</Link>
          <Link className="rounded-lg border bg-white px-3 py-2 font-medium" href="/security">Securite</Link>
          <Link className="rounded-lg border bg-white px-3 py-2 font-medium" href="/settings">Parametrage</Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="rounded-lg border bg-white px-3 py-2 font-medium text-red-700">
              Deconnexion
            </button>
          </form>
        </div>

        {children}
      </div>
    </main>
  );
}
