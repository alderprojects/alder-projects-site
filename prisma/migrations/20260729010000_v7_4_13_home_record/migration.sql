-- CreateTable
CREATE TABLE "HomeRecord" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "propertyRecordId" TEXT,
    "schemaVersion" TEXT NOT NULL DEFAULT 'coverage-v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeRecordReport" (
    "id" TEXT NOT NULL,
    "homeRecordId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "attachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeRecordReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageSlot" (
    "id" TEXT NOT NULL,
    "homeRecordId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "filledByReportId" TEXT,
    "photoQualityScore" DOUBLE PRECISION NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL,
    "freshUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverageSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageSlotHistory" (
    "id" TEXT NOT NULL,
    "homeRecordId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "filledByReportId" TEXT,
    "photoQualityScore" DOUBLE PRECISION NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL,
    "supersededAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverageSlotHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSummary" (
    "id" TEXT NOT NULL,
    "homeRecordId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "itemsJson" JSONB,
    "sourceReportIds" TEXT[],
    "promptVersion" TEXT,
    "modelVersion" TEXT,
    "failureReason" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "emailedAt" TIMESTAMP(3),

    CONSTRAINT "HomeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeRecord_email_key" ON "HomeRecord"("email");

-- CreateIndex
CREATE INDEX "HomeRecord_userId_idx" ON "HomeRecord"("userId");

-- CreateIndex
CREATE INDEX "HomeRecord_propertyRecordId_idx" ON "HomeRecord"("propertyRecordId");

-- CreateIndex
CREATE INDEX "HomeRecordReport_reportId_idx" ON "HomeRecordReport"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeRecordReport_homeRecordId_reportId_key" ON "HomeRecordReport"("homeRecordId", "reportId");

-- CreateIndex
CREATE INDEX "CoverageSlot_homeRecordId_systemId_idx" ON "CoverageSlot"("homeRecordId", "systemId");

-- CreateIndex
CREATE INDEX "CoverageSlot_freshUntil_idx" ON "CoverageSlot"("freshUntil");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageSlot_homeRecordId_systemId_slotId_key" ON "CoverageSlot"("homeRecordId", "systemId", "slotId");

-- CreateIndex
CREATE INDEX "CoverageSlotHistory_homeRecordId_systemId_slotId_idx" ON "CoverageSlotHistory"("homeRecordId", "systemId", "slotId");

-- CreateIndex
CREATE INDEX "HomeSummary_homeRecordId_queuedAt_idx" ON "HomeSummary"("homeRecordId", "queuedAt");

-- CreateIndex
CREATE INDEX "HomeSummary_status_idx" ON "HomeSummary"("status");

-- AddForeignKey
ALTER TABLE "HomeRecordReport" ADD CONSTRAINT "HomeRecordReport_homeRecordId_fkey" FOREIGN KEY ("homeRecordId") REFERENCES "HomeRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeRecordReport" ADD CONSTRAINT "HomeRecordReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageSlot" ADD CONSTRAINT "CoverageSlot_homeRecordId_fkey" FOREIGN KEY ("homeRecordId") REFERENCES "HomeRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeSummary" ADD CONSTRAINT "HomeSummary_homeRecordId_fkey" FOREIGN KEY ("homeRecordId") REFERENCES "HomeRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

