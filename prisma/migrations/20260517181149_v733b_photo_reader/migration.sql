-- DropIndex
DROP INDEX "Consent_userId_purpose_dataType_key";

-- AlterTable
ALTER TABLE "Consent" ADD COLUMN     "anonId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "version" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MagicLink" ADD COLUMN     "email" TEXT,
ADD COLUMN     "payloadJson" JSONB;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "blobConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "visitorAnonId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "visitorAnonId" TEXT,
ALTER COLUMN "householdId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RoomSnapshot" ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "roomType" TEXT,
ADD COLUMN     "visitorAnonId" TEXT,
ALTER COLUMN "roomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SmartCart" ADD COLUMN     "cartItemsJsonWithPhotos" JSONB,
ADD COLUMN     "cartItemsJsonWithoutPhotos" JSONB,
ADD COLUMN     "changeSummaryJson" JSONB,
ADD COLUMN     "photoChangedRecommendation" BOOLEAN,
ADD COLUMN     "visitorAnonId" TEXT,
ALTER COLUMN "priceCohort" DROP NOT NULL,
ALTER COLUMN "pricePaidCents" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Consent_anonId_idx" ON "Consent"("anonId");

-- CreateIndex
CREATE INDEX "MagicLink_purpose_expiresAt_idx" ON "MagicLink"("purpose", "expiresAt");

-- CreateIndex
CREATE INDEX "Photo_visitorAnonId_idx" ON "Photo"("visitorAnonId");

-- CreateIndex
CREATE INDEX "Photo_blobConfirmedAt_idx" ON "Photo"("blobConfirmedAt");

-- CreateIndex
CREATE INDEX "Project_visitorAnonId_idx" ON "Project"("visitorAnonId");

-- CreateIndex
CREATE INDEX "RoomSnapshot_projectId_idx" ON "RoomSnapshot"("projectId");

-- CreateIndex
CREATE INDEX "RoomSnapshot_visitorAnonId_idx" ON "RoomSnapshot"("visitorAnonId");

-- CreateIndex
CREATE INDEX "SmartCart_visitorAnonId_idx" ON "SmartCart"("visitorAnonId");

-- CreateIndex
CREATE INDEX "SmartCart_photoChangedRecommendation_idx" ON "SmartCart"("photoChangedRecommendation");

-- AddForeignKey
ALTER TABLE "RoomSnapshot" ADD CONSTRAINT "RoomSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- v7.3.3-B hand-added: Consent partial uniques + ownership CHECK
-- -- Prisma can't express partial unique indexes or CHECK constraints
-- -- natively; these are equivalent to:
-- --   @@unique([userId, purpose, dataType]) WHERE userId IS NOT NULL
-- --   @@unique([anonId, purpose, dataType]) WHERE anonId IS NOT NULL
-- --   CHECK (userId IS NOT NULL OR anonId IS NOT NULL)
CREATE UNIQUE INDEX "Consent_user_purpose_dataType_key"
  ON "Consent"("userId", "purpose", "dataType")
  WHERE "userId" IS NOT NULL;

CREATE UNIQUE INDEX "Consent_anon_purpose_dataType_key"
  ON "Consent"("anonId", "purpose", "dataType")
  WHERE "anonId" IS NOT NULL;

ALTER TABLE "Consent"
  ADD CONSTRAINT "Consent_owner_check"
  CHECK ("userId" IS NOT NULL OR "anonId" IS NOT NULL);
