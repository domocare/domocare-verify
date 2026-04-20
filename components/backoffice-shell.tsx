import Link from "next/link";
import { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  FileClock,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
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
  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "Collaborateurs", icon: Users },
    { href: "/employees/new", label: "Ajouter", icon: Plus },
    { href: "/scans", label: "Scans", icon: FileClock },
    { href: "/users", label: "Utilisateurs", icon: UserRound },
    { href: "/security", label: "Securite", icon: ShieldCheck },
    { href: "/settings", label: "Parametrage", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 px-6 py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">Domocare</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Verify
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Pilotage
            </p>
            <div className="mt-3 grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-white group-hover:text-emerald-700">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-emerald-700">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-950">Controle terrain</p>
                  <p className="text-xs text-emerald-700">QR, habilitations, scans</p>
                </div>
              </div>
            </div>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Deconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 flex-col gap-3 px-4 py-4 md:px-6 xl:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">Domocare Verify</p>
                  <p className="text-xs text-slate-500">Back-office</p>
                </div>
              </div>

              <div className="relative hidden w-full max-w-md md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                  placeholder="Recherche rapide..."
                />
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="hidden flex-wrap gap-2 xl:flex">
                  {companyBrands.map((brand) => (
                    <CompanyLogo
                      key={brand.name}
                      brand={brand}
                      className="h-11 w-28 p-2 shadow-none"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                    DV
                  </div>
                  <div className="hidden text-sm sm:block">
                    <p className="font-semibold leading-4">Admin</p>
                    <p className="text-xs text-slate-500">Groupe</p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 text-sm lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <div className="px-4 py-6 md:px-6 xl:px-8">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Back-office Domocare Verify
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {title}
              </h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-slate-500">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
