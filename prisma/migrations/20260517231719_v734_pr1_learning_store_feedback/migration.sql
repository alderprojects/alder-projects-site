-- CreateTable
CREATE TABLE "LearningStoreFeedback" (
    "id" TEXT NOT NULL,
    "learningStoreId" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningStoreFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningStoreFeedback_learningStoreId_idx" ON "LearningStoreFeedback"("learningStoreId");

-- CreateIndex
CREATE INDEX "LearningStoreFeedback_anonId_idx" ON "LearningStoreFeedback"("anonId");

-- CreateIndex
CREATE INDEX "LearningStoreFeedback_cartId_idx" ON "LearningStoreFeedback"("cartId");

-- AddForeignKey
ALTER TABLE "LearningStoreFeedback" ADD CONSTRAINT "LearningStoreFeedback_learningStoreId_fkey" FOREIGN KEY ("learningStoreId") REFERENCES "LearningStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
