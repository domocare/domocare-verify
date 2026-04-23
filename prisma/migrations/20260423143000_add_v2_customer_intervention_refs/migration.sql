CREATE TABLE "InterventionType" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InterventionType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "siret" TEXT,
  "address" TEXT,
  "postalCode" TEXT,
  "city" TEXT,
  "activity" TEXT,
  "accessCodeEnabled" BOOLEAN NOT NULL DEFAULT false,
  "clientPortalEnabled" BOOLEAN NOT NULL DEFAULT false,
  "portalCanViewCodes" BOOLEAN NOT NULL DEFAULT true,
  "portalCanViewSites" BOOLEAN NOT NULL DEFAULT true,
  "portalCanViewScans" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerSite" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "postalCode" TEXT,
  "city" TEXT,
  "codeRequired" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerSite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerAccessCode" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "siteId" TEXT,
  "label" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "codeLast4" TEXT,
  "scope" TEXT NOT NULL DEFAULT 'site',
  "isOneTime" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerAccessCode_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Employee"
  ADD COLUMN "interventionTypeId" TEXT,
  ADD COLUMN "customerId" TEXT,
  ADD COLUMN "customerSiteId" TEXT;

CREATE UNIQUE INDEX "InterventionType_name_key" ON "InterventionType"("name");
CREATE UNIQUE INDEX "Customer_name_key" ON "Customer"("name");
CREATE UNIQUE INDEX "CustomerSite_customerId_name_key" ON "CustomerSite"("customerId", "name");

ALTER TABLE "Employee" ADD CONSTRAINT "Employee_interventionTypeId_fkey" FOREIGN KEY ("interventionTypeId") REFERENCES "InterventionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_customerSiteId_fkey" FOREIGN KEY ("customerSiteId") REFERENCES "CustomerSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerSite" ADD CONSTRAINT "CustomerSite_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerAccessCode" ADD CONSTRAINT "CustomerAccessCode_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerAccessCode" ADD CONSTRAINT "CustomerAccessCode_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "CustomerSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
