CREATE TABLE "RolePermission" (
  "id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "dataScope" TEXT NOT NULL DEFAULT 'agency',
  "canManageEmployees" BOOLEAN NOT NULL DEFAULT false,
  "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
  "canManageSettings" BOOLEAN NOT NULL DEFAULT false,
  "canViewScans" BOOLEAN NOT NULL DEFAULT true,
  "canManageIncidents" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RolePermission_role_key" ON "RolePermission"("role");

INSERT INTO "RolePermission" (
  "id",
  "role",
  "label",
  "dataScope",
  "canManageEmployees",
  "canManageUsers",
  "canManageSettings",
  "canViewScans",
  "canManageIncidents"
) VALUES
  (gen_random_uuid()::text, 'SUPER_ADMIN_GROUP', 'Super admin groupe', 'group', true, true, true, true, true),
  (gen_random_uuid()::text, 'SECURITY_ADMIN', 'Admin sécurité / conformité', 'group', true, true, true, true, true),
  (gen_random_uuid()::text, 'AUDITOR', 'Pilotage KPI / audit', 'group', false, false, false, true, false),
  (gen_random_uuid()::text, 'AGENCY_ADMIN', 'Admin entité / agence', 'agency', true, false, false, true, true),
  (gen_random_uuid()::text, 'ADMIN_ASSISTANT', 'Assistant administratif', 'agency', true, false, false, true, true),
  (gen_random_uuid()::text, 'HR_OPERATIONS', 'RH / exploitation', 'company', true, false, false, true, false),
  (gen_random_uuid()::text, 'OPERATIONAL_MANAGER', 'Manager opérationnel', 'agency', false, false, false, true, true),
  (gen_random_uuid()::text, 'READ_ONLY', 'Lecture seule', 'agency', false, false, false, true, false)
ON CONFLICT ("role") DO NOTHING;
