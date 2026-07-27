-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "visitorAnonId" TEXT,
    "userId" TEXT,
    "projectId" TEXT,
    "snapshotIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'CHECK_ISSUED',
    "tenure" TEXT,
    "userPrompt" TEXT,
    "excludedPhotoCount" INTEGER NOT NULL DEFAULT 0,
    "exclusionSummaryJson" JSONB,
    "recencyFlagged" BOOLEAN NOT NULL DEFAULT false,
    "modelVersion" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "rulesVersion" TEXT NOT NULL,
    "pipelineLogJson" JSONB,
    "emailCapturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "key" TEXT,
    "verdict" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "visibleEvidenceJson" JSONB NOT NULL,
    "costLow" INTEGER,
    "costHigh" INTEGER,
    "benefitType" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "confidenceLabel" TEXT NOT NULL,
    "assumptionsJson" JSONB NOT NULL,
    "limitationsJson" JSONB NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "clarifyingQuestionsJson" JSONB NOT NULL,
    "smartCartEligible" BOOLEAN NOT NULL DEFAULT false,
    "nextAction" TEXT NOT NULL,
    "rebateJson" JSONB,
    "citationsJson" JSONB NOT NULL,
    "disclosureTier" TEXT NOT NULL DEFAULT 'free',
    "disclosureOverridesJson" JSONB,
    "categorySearchQuery" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartCandidate" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "asin" TEXT,
    "searchQuery" TEXT NOT NULL,
    "priceLow" DOUBLE PRECISION,
    "priceHigh" DOUBLE PRECISION,
    "availability" TEXT NOT NULL DEFAULT 'unknown',
    "fitStatus" TEXT NOT NULL DEFAULT 'likely_fit',
    "requiredSpecsJson" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "installDifficulty" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lastPricedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClarifyingAnswer" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "recommendationId" TEXT,
    "questionKey" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "verdictChanged" BOOLEAN NOT NULL DEFAULT false,
    "changeSummaryJson" JSONB,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClarifyingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportFeedback" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "anonId" TEXT,
    "useful" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionRequest" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "anonId" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "detailJson" JSONB,

    CONSTRAINT "DeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryObservation" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "conditionBand" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'VT',
    "verdict" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryObservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_visitorAnonId_idx" ON "Report"("visitorAnonId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_projectId_idx" ON "Report"("projectId");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_reportId_sortOrder_idx" ON "Recommendation"("reportId", "sortOrder");

-- CreateIndex
CREATE INDEX "Recommendation_verdict_idx" ON "Recommendation"("verdict");

-- CreateIndex
CREATE INDEX "CartCandidate_recommendationId_tier_idx" ON "CartCandidate"("recommendationId", "tier");

-- CreateIndex
CREATE INDEX "ClarifyingAnswer_reportId_idx" ON "ClarifyingAnswer"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ClarifyingAnswer_reportId_recommendationId_questionKey_key" ON "ClarifyingAnswer"("reportId", "recommendationId", "questionKey");

-- CreateIndex
CREATE INDEX "ReportFeedback_reportId_idx" ON "ReportFeedback"("reportId");

-- CreateIndex
CREATE INDEX "DeletionRequest_status_requestedAt_idx" ON "DeletionRequest"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "CategoryObservation_category_createdAt_idx" ON "CategoryObservation"("category", "createdAt");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartCandidate" ADD CONSTRAINT "CartCandidate_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClarifyingAnswer" ADD CONSTRAINT "ClarifyingAnswer_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClarifyingAnswer" ADD CONSTRAINT "ClarifyingAnswer_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportFeedback" ADD CONSTRAINT "ReportFeedback_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

