import Link from "next/link";
import { ReactNode } from "react";
import {
  Building2,
  FileClock,
  KeyRound,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  customer: {
    id: string;
    name: string;
    logoUrl?: string | null;
    brandColor?: string | null;
    portalCanManageUsers?: boolean;
    portalUser?: {
      name: string;
      email: string;
      isOwner: boolean;
    } | null;
  };
  active: "dashboard" | "codes" | "scans" | "users";
  children: ReactNode;
};

const items = [
  { href: "/client", key: "dashboard", label: "Vue d'ensemble", icon: Building2 },
  { href: "/client/codes", key: "codes", label: "Gestion des codes", icon: KeyRound },
  { href: "/client/scans", key: "scans", label: "Scans", icon: FileClock },
  { href: "/client/users", key: "users", label: "Utilisateurs", icon: Users },
] as const;

export default function CustomerPortalShell({
  title,
  subtitle,
  customer,
  active,
  children,
}: Props) {
  const brandColor = customer.brandColor || "#0f766e";
  const navigation = items.filter((item) => item.key !== "users" || customer.portalCanManageUsers);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[292px] border-r border-slate-200 bg-white xl:block">
        <div className="flex h-full flex-col">
          <div className="flex min-h-[88px] items-center border-b border-slate-100 px-6 py-4">
            <Link href="/client" className="flex items-center gap-3">
              {customer.logoUrl ? (
                <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                  <img src={customer.logoUrl} alt={customer.name} className="max-h-8 w-auto object-contain" />
                </span>
              ) : (
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  <ShieldCheck className="h-6 w-6" />
                </span>
              )}

              <span className="min-w-0">
                <span className="block truncate text-xl font-extrabold tracking-tight text-slate-950">
                  {customer.name}
                </span>
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Portail client final
                </span>
              </span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <nav className="grid gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                      isActive ? "text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                    style={isActive ? { backgroundColor: brandColor } : undefined}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-100 p-4">
            {customer.portalUser ? (
              <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                <p className="font-bold text-slate-900">{customer.portalUser.name}</p>
                <p className="mt-1 text-slate-500">{customer.portalUser.email}</p>
              </div>
            ) : null}

            <form action="/api/client/auth/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="xl:pl-[292px]">
        <div className="px-4 py-6 md:px-6 xl:px-8">
          <section
            className="mb-6 overflow-hidden rounded-lg text-white shadow-sm"
            style={{ backgroundColor: brandColor }}
          >
            <div className="px-5 py-6 md:px-7">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white/80">
                    <Building2 className="h-4 w-4" />
                    Espace client final
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
                  {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-white/85">{subtitle}</p> : null}
                </div>
              </div>
            </div>
          </section>

          {children}
        </div>
      </div>
    </main>
  );
}
