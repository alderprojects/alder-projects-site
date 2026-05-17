-- CreateTable
CREATE TABLE "LearningStore" (
    "id" TEXT NOT NULL,
    "featureSignature" TEXT NOT NULL,
    "recommendationPayload" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "thumbsUpCount" INTEGER NOT NULL DEFAULT 0,
    "dismissCount" INTEGER NOT NULL DEFAULT 0,
    "doesntApplyCount" INTEGER NOT NULL DEFAULT 0,
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "modelVersion" TEXT,
    "promptVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningStore_featureSignature_key" ON "LearningStore"("featureSignature");

-- CreateIndex
CREATE INDEX "LearningStore_source_idx" ON "LearningStore"("source");

-- CreateIndex
CREATE INDEX "LearningStore_impressionCount_idx" ON "LearningStore"("impressionCount");

-- CreateIndex
CREATE INDEX "LearningStore_lastUpdatedAt_idx" ON "LearningStore"("lastUpdatedAt");
