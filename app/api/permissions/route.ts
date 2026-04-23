import { prisma } from "@/lib/prisma";
import {
  ensureDefaultRolePermissions,
  ROLE_LABELS,
  ROLE_ORDER,
} from "@/lib/access-control";
import { requireRole } from "@/lib/auth-middleware";

const DATA_SCOPES = new Set(["group", "company", "agency"]);

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

export async function GET(req: Request) {
  const authError = await requireRole(req, ["SUPER_ADMIN_GROUP", "SECURITY_ADMIN"]);
  if (authError) return authError;

  await ensureDefaultRolePermissions();

  const permissions = await prisma.rolePermission.findMany();
  const sorted = [...permissions].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  return Response.json({ permissions: sorted });
}

export async function PATCH(req: Request) {
  const authError = await requireRole(req, ["SUPER_ADMIN_GROUP", "SECURITY_ADMIN"]);
  if (authError) return authError;

  const body = await req.json();
  const role = normalizeText(body.role);
  const dataScope = normalizeText(body.dataScope);

  if (!ROLE_ORDER.includes(role) || !DATA_SCOPES.has(dataScope)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const permission = await prisma.rolePermission.upsert({
    where: { role },
    create: {
      role,
      label: ROLE_LABELS[role] || role,
      dataScope,
      canManageEmployees: normalizeBoolean(body.canManageEmployees),
      canManageUsers: normalizeBoolean(body.canManageUsers),
      canManageSettings: normalizeBoolean(body.canManageSettings),
      canViewScans: normalizeBoolean(body.canViewScans),
      canManageIncidents: normalizeBoolean(body.canManageIncidents),
    },
    update: {
      dataScope,
      canManageEmployees: normalizeBoolean(body.canManageEmployees),
      canManageUsers: normalizeBoolean(body.canManageUsers),
      canManageSettings: normalizeBoolean(body.canManageSettings),
      canViewScans: normalizeBoolean(body.canViewScans),
      canManageIncidents: normalizeBoolean(body.canManageIncidents),
    },
  });

  return Response.json({ ok: true, permission });
}
