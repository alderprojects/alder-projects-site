-- v7.4.9 — RecScore + auto-eval.
--
-- CR1: grounding is a GATE, not a weight. `suppressed` is set by the
-- gate only; CurationRule can never suppress, only demote.
-- CR3: compositeScore/subScoresJson/scoreVersion are written ONCE at
-- synthesis and never updated for a served row.

-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN     "compositeScore" DOUBLE PRECISION,
ADD COLUMN     "subScoresJson" JSONB,
ADD COLUMN     "scoreVersion" TEXT,
ADD COLUMN     "suppressed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suppressedReason" TEXT,
ADD COLUMN     "claimLinksJson" JSONB;

-- CreateTable
CREATE TABLE "SignaturePrior" (
    "signatureHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "dismissCount" INTEGER NOT NULL DEFAULT 0,
    "doesntApplyCount" INTEGER NOT NULL DEFAULT 0,
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "n" INTEGER NOT NULL DEFAULT 0,
    "prior" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignaturePrior_pkey" PRIMARY KEY ("signatureHash")
);

-- CreateTable
CREATE TABLE "CurationRule" (
    "id" TEXT NOT NULL,
    "signatureHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "evidenceN" INTEGER NOT NULL DEFAULT 0,
    "evidenceJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'autoeval',
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,

    CONSTRAINT "CurationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeVerdict" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "extractionHash" TEXT NOT NULL,
    "synthesisHash" TEXT NOT NULL,
    "unsupportedJson" JSONB NOT NULL,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JudgeVerdict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEvalMetrics" (
    "id" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "groundingViolationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "suppressionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreP10" DOUBLE PRECISION,
    "scoreP50" DOUBLE PRECISION,
    "scoreP90" DOUBLE PRECISION,
    "laneMixJson" JSONB,
    "skipWaitShare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "photoChangedRate" DOUBLE PRECISION,
    "decodeFailureRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reactionsPerSession" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "judgeFlagsCreated" INTEGER NOT NULL DEFAULT 0,
    "autoRulesCreated" INTEGER NOT NULL DEFAULT 0,
    "linkCoverageJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyEvalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignaturePrior_n_idx" ON "SignaturePrior"("n");
CREATE INDEX "SignaturePrior_updatedAt_idx" ON "SignaturePrior"("updatedAt");
CREATE INDEX "CurationRule_signatureHash_revokedAt_idx" ON "CurationRule"("signatureHash", "revokedAt");
CREATE INDEX "CurationRule_source_createdAt_idx" ON "CurationRule"("source", "createdAt");
CREATE INDEX "CurationRule_revokedAt_idx" ON "CurationRule"("revokedAt");
CREATE UNIQUE INDEX "JudgeVerdict_extractionHash_synthesisHash_key" ON "JudgeVerdict"("extractionHash", "synthesisHash");
CREATE INDEX "JudgeVerdict_reportId_idx" ON "JudgeVerdict"("reportId");
CREATE INDEX "JudgeVerdict_createdAt_idx" ON "JudgeVerdict"("createdAt");
CREATE UNIQUE INDEX "DailyEvalMetrics_day_key" ON "DailyEvalMetrics"("day");
CREATE INDEX "DailyEvalMetrics_day_idx" ON "DailyEvalMetrics"("day");
