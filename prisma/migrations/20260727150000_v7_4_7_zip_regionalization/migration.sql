-- v7.4.7 — Optional ZIP capture + regionalized synthesis.
-- R2 note: zip serves the consumer's own read (regional accuracy for
-- frost/humidity/codes guidance). Optional everywhere; omitting it
-- changes nothing in the flow.

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "zip" TEXT,
ADD COLUMN     "zipSource" TEXT,
ADD COLUMN     "regionContextUsed" BOOLEAN NOT NULL DEFAULT false;

-- Track A groundwork (counts only): sessions per ZIP3 queries filter on
-- zip presence.
CREATE INDEX "Report_zip_idx" ON "Report"("zip");
