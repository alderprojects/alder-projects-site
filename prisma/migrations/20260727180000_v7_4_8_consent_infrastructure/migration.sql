-- v7.4.8 — Consented address pipeline (SHIPS DARK behind
-- ADDRESS_CAPTURE_ENABLED; no UI surface exists while the flag is off).
--
-- ConsentRecord is a NEW table rather than an extension of "Consent"
-- because "Consent" carries partial UNIQUE indexes on
-- (userId, purpose, dataType) and (anonId, purpose, dataType) — one row
-- per owner+purpose. Licensing consent must be append-only: revocation
-- never mutates the granting row and re-consent inserts a new row with
-- its own policyVersion + textHash. That is impossible under those
-- uniques. Photo-upload consents keep using "Consent" unchanged.

-- CreateTable
CREATE TABLE "PropertyRecord" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "visitorAnonId" TEXT,
    "userId" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "normalizedHash" TEXT NOT NULL,
    "verifiedVia" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "visitorAnonId" TEXT,
    "userId" TEXT,
    "reportId" TEXT,
    "propertyRecordId" TEXT,
    "policyVersion" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartCartCredit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "visitorAnonId" TEXT,
    "userId" TEXT,
    "reportId" TEXT,
    "consentRecordId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),
    "redeemedForReportId" TEXT,

    CONSTRAINT "SmartCartCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyRecord_visitorAnonId_idx" ON "PropertyRecord"("visitorAnonId");
CREATE INDEX "PropertyRecord_userId_idx" ON "PropertyRecord"("userId");
CREATE INDEX "PropertyRecord_reportId_idx" ON "PropertyRecord"("reportId");
CREATE INDEX "PropertyRecord_normalizedHash_idx" ON "PropertyRecord"("normalizedHash");
CREATE INDEX "ConsentRecord_scope_revokedAt_idx" ON "ConsentRecord"("scope", "revokedAt");
CREATE INDEX "ConsentRecord_visitorAnonId_idx" ON "ConsentRecord"("visitorAnonId");
CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord"("userId");
CREATE INDEX "ConsentRecord_propertyRecordId_idx" ON "ConsentRecord"("propertyRecordId");
CREATE UNIQUE INDEX "SmartCartCredit_code_key" ON "SmartCartCredit"("code");
CREATE INDEX "SmartCartCredit_visitorAnonId_idx" ON "SmartCartCredit"("visitorAnonId");
CREATE INDEX "SmartCartCredit_userId_idx" ON "SmartCartCredit"("userId");
CREATE INDEX "SmartCartCredit_redeemedAt_idx" ON "SmartCartCredit"("redeemedAt");
