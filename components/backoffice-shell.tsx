import Link from "next/link";
import { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronRight,
  CircleHelp,
  FileClock,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const navSections = [
  {
    label: "Pilotage",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/analytics", label: "Pilotage", icon: BarChart3 },
      { href: "/scans", label: "Scans terrain", icon: FileClock },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/employees", label: "Collaborateurs", icon: Users },
      { href: "/employees/new", label: "Ajouter", icon: Plus },
      { href: "/users", label: "Utilisateurs", icon: UserRound },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/security", label: "Sécurité", icon: ShieldCheck },
      { href: "/settings", label: "Paramétrage", icon: Settings },
    ],
  },
];

const mobileNavItems = navSections.flatMap((section) => section.items);

export default function BackofficeShell({
  title,
  subtitle,
  actions,
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[292px] border-r border-slate-200 bg-white xl:block">
        <div className="flex h-full flex-col">
          <div className="flex h-[76px] items-center border-b border-slate-100 px-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#006b55] text-white shadow-sm shadow-emerald-900/20">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-xl font-extrabold tracking-tight text-slate-950">
                  Lantana Verify
                </span>
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#006b55]">
                  Contrôle terrain
                </span>
              </span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#006b55]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">Back-office</p>
                  <p className="text-xs font-medium text-slate-500">
                    Accès QR, preuves et équipes
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-6">
              {navSections.map((section) => (
                <div key={section.label}>
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    {section.label}
                  </p>
                  <div className="grid gap-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-[#006b55] hover:text-white"
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-white/15 group-hover:text-white">
                              <Icon className="h-[18px] w-[18px]" />
                            </span>
                            {item.label}
                          </span>
                          <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 rounded-lg bg-slate-950 p-4 text-white">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <CircleHelp className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">Besoin d&apos;assistance ?</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Contrôlez les accès, cartes et exports depuis un espace unifié.
                  </p>
                </div>
              </div>
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-h-screen xl:pl-[292px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] flex-col gap-3 px-4 py-4 md:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
            <div className="flex items-center justify-between gap-3 xl:hidden">
              <Link href="/dashboard" className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#006b55] text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-extrabold text-slate-950">Lantana Verify</span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Back-office
                  </span>
                </span>
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
                  aria-label="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>

            <div className="relative hidden w-full max-w-[440px] lg:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#006b55] focus:bg-white"
                placeholder="Recherche rapide..."
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <nav className="flex gap-2 overflow-x-auto pb-1 text-sm xl:hidden">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-600"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden items-center gap-3 md:flex">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-[#006b55]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-xs font-extrabold text-white">
                    LV
                  </span>
                  <span className="hidden text-sm lg:block">
                    <span className="block font-bold leading-4">Admin</span>
                    <span className="block text-xs font-medium text-slate-500">
                      Groupe Lantana
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 md:px-6 xl:px-8">
          <section className="mb-6 overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm">
            <div className="relative px-5 py-6 md:px-7">
              <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(0,171,120,0.32),transparent_34%),linear-gradient(135deg,transparent,rgba(255,255,255,0.08))] lg:block" />
              <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-200">
                    <Building2 className="h-4 w-4" />
                    Back-office Lantana Verify
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
              </div>
            </div>
          </section>

          {children}
        </div>
      </div>
    </main>
  );
}
