import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN_GROUP: "Super admin groupe",
  SECURITY_ADMIN: "Admin sécurité / conformité",
  AUDITOR: "Pilotage KPI / audit",
  AGENCY_ADMIN: "Admin entité / agence",
  ADMIN_ASSISTANT: "Assistant administratif",
  HR_OPERATIONS: "RH / exploitation",
  OPERATIONAL_MANAGER: "Manager opérationnel",
  READ_ONLY: "Lecture seule",
};

export const ROLE_ORDER = Object.keys(ROLE_LABELS);

export const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN_GROUP: {
    dataScope: "group",
    canManageEmployees: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewScans: true,
    canManageIncidents: true,
  },
  SECURITY_ADMIN: {
    dataScope: "group",
    canManageEmployees: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewScans: true,
    canManageIncidents: true,
  },
  AUDITOR: {
    dataScope: "group",
    canManageEmployees: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewScans: true,
    canManageIncidents: false,
  },
  AGENCY_ADMIN: {
    dataScope: "agency",
    canManageEmployees: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewScans: true,
    canManageIncidents: true,
  },
  ADMIN_ASSISTANT: {
    dataScope: "agency",
    canManageEmployees: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewScans: true,
    canManageIncidents: true,
  },
  HR_OPERATIONS: {
    dataScope: "company",
    canManageEmployees: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewScans: true,
    canManageIncidents: false,
  },
  OPERATIONAL_MANAGER: {
    dataScope: "agency",
    canManageEmployees: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewScans: true,
    canManageIncidents: true,
  },
  READ_ONLY: {
    dataScope: "agency",
    canManageEmployees: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewScans: true,
    canManageIncidents: false,
  },
} as const;

export type AccessContext = Awaited<ReturnType<typeof getAccessContext>>;

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1)) : null;
}

export async function ensureDefaultRolePermissions() {
  await Promise.all(
    ROLE_ORDER.map((role) => {
      const defaults = DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS];

      return prisma.rolePermission.upsert({
        where: { role },
        create: {
          role,
          label: ROLE_LABELS[role],
          ...defaults,
        },
        update: {},
      });
    }),
  );
}

export async function getAccessContextFromToken(token?: string | null) {
  const session = verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.appUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      company: true,
      agency: true,
      isActive: true,
    },
  });

  if (!user?.isActive) return null;

  await ensureDefaultRolePermissions();
  const permission = await prisma.rolePermission.findUnique({ where: { role: user.role } });
  const fallback = DEFAULT_ROLE_PERMISSIONS[user.role as keyof typeof DEFAULT_ROLE_PERMISSIONS];

  return {
    user,
    permission: permission || {
      id: "default",
      role: user.role,
      label: ROLE_LABELS[user.role] || user.role,
      dataScope: fallback?.dataScope || "agency",
      canManageEmployees: fallback?.canManageEmployees || false,
      canManageUsers: fallback?.canManageUsers || false,
      canManageSettings: fallback?.canManageSettings || false,
      canViewScans: fallback?.canViewScans ?? true,
      canManageIncidents: fallback?.canManageIncidents || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

export async function getAccessContext() {
  const cookieStore = await cookies();
  return getAccessContextFromToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function getAccessContextFromRequest(request: Request) {
  return getAccessContextFromToken(parseCookieHeader(request.headers.get("cookie")));
}

export function getEmployeeScopeWhere(context: NonNullable<AccessContext>): Prisma.EmployeeWhereInput {
  const scope = context.permission.dataScope;

  if (scope === "group") return {};

  if (scope === "company" && context.user.company) {
    return { company: context.user.company };
  }

  if (scope === "agency" && context.user.company && context.user.agency) {
    return {
      company: context.user.company,
      agency: {
        contains: context.user.agency,
      },
    };
  }

  return { id: "__no_access__" };
}

export async function getAccessibleTokens(context: NonNullable<AccessContext>) {
  if (context.permission.dataScope === "group") return null;

  const employees = await prisma.employee.findMany({
    where: getEmployeeScopeWhere(context),
    select: {
      qrToken: {
        select: {
          token: true,
        },
      },
    },
  });

  return employees
    .map((employee) => employee.qrToken?.token)
    .filter((token): token is string => Boolean(token));
}

export async function getScanScopeWhere(context: NonNullable<AccessContext>): Promise<Prisma.ScanLogWhereInput> {
  if (context.permission.dataScope === "group") return {};

  const tokens = await getAccessibleTokens(context);
  if (!tokens?.length) return { id: "__no_access__" };

  return { token: { in: tokens } };
}

export async function getIncidentScopeWhere(context: NonNullable<AccessContext>): Promise<Prisma.IncidentReportWhereInput> {
  if (context.permission.dataScope === "group") return {};

  const tokens = await getAccessibleTokens(context);
  if (!tokens?.length) return { id: "__no_access__" };

  return { token: { in: tokens } };
}
