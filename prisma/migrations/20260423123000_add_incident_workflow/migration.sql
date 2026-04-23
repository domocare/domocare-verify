ALTER TABLE "IncidentReport"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'todo',
  ADD COLUMN "adminComment" TEXT,
  ADD COLUMN "treatedAt" TIMESTAMP(3);
