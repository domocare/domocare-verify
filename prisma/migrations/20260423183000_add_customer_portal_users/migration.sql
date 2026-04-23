ALTER TABLE "Customer"
  ADD COLUMN "portalCanManageUsers" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "CustomerPortalUser" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT,
  "isOwner" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CustomerPortalUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerPortalUser_email_key" ON "CustomerPortalUser"("email");

ALTER TABLE "CustomerPortalUser"
  ADD CONSTRAINT "CustomerPortalUser_customerId_fkey"
  FOREIGN KEY ("customerId")
  REFERENCES "Customer"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
