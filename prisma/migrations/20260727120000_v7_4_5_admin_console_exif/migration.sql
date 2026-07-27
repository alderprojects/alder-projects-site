-- v7.4.5 — Admin review console + EXIF discipline.
--
-- R1 GUARD (do not remove): No GPS/lat/lng/location column may ever be
-- added to "Photo" or any photo-derived table. GPS coordinates from
-- uploaded photos are never persisted, logged as values, or used in
-- synthesis. The boolean "hadGps" (presence only) is the sole permitted
-- derivative. See the v7.4.5–v7.4.8 series brief, cardinal rule R1.

-- AlterTable: EXIF fields retained before the strip (stored bytes carry zero EXIF)
ALTER TABLE "Photo" ADD COLUMN     "capturedAt" TIMESTAMP(3),
ADD COLUMN     "deviceMake" TEXT,
ADD COLUMN     "deviceModel" TEXT,
ADD COLUMN     "origWidth" INTEGER,
ADD COLUMN     "origHeight" INTEGER,
ADD COLUMN     "orientation" INTEGER,
ADD COLUMN     "hadGps" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: QA review stamp
ALTER TABLE "Report" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;

-- CreateTable
CREATE TABLE "QAFlag" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QAFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAccessLog" (
    "id" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QAFlag_reportId_idx" ON "QAFlag"("reportId");
CREATE INDEX "QAFlag_type_createdAt_idx" ON "QAFlag"("type", "createdAt");
CREATE INDEX "AdminAccessLog_adminEmail_createdAt_idx" ON "AdminAccessLog"("adminEmail", "createdAt");
CREATE INDEX "AdminAccessLog_action_createdAt_idx" ON "AdminAccessLog"("action", "createdAt");
CREATE INDEX "AdminAccessLog_createdAt_idx" ON "AdminAccessLog"("createdAt");

-- AddForeignKey
ALTER TABLE "QAFlag" ADD CONSTRAINT "QAFlag_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
