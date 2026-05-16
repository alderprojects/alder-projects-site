-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ip" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "nickname" TEXT,
    "addressLine1Norm" TEXT NOT NULL,
    "addressLine2Norm" TEXT,
    "cityNorm" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "county" TEXT,
    "yearBuilt" INTEGER,
    "yearBuiltEstimate" BOOLEAN NOT NULL DEFAULT false,
    "sqftLiving" INTEGER,
    "lotSqft" INTEGER,
    "propertyType" TEXT,
    "valuationBaseline" INTEGER,
    "valuationSourceAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyProfile" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileJson" JSONB NOT NULL,
    "fetcherVersion" TEXT NOT NULL,

    CONSTRAINT "PropertyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "name" TEXT,
    "sqftEstimate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomSnapshot" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "captureContext" TEXT NOT NULL,
    "conditionScore" INTEGER,
    "finishEra" TEXT,
    "lastRenovatedEstimate" INTEGER,
    "confidence" DOUBLE PRECISION,
    "triggeredByEventId" TEXT,

    CONSTRAINT "RoomSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "roomSnapshotId" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "blobKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "perceptualHash" TEXT NOT NULL,
    "exifStrippedAt" TIMESTAMP(3),
    "captureMethod" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentFlagsJson" JSONB NOT NULL,
    "hiddenAt" TIMESTAMP(3),

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisionExtraction" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "extractionJson" JSONB NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewerNotes" TEXT,
    "correctedJson" JSONB,
    "apiCostCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisionExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValuationDelta" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baselineEstimateDollars" INTEGER NOT NULL,
    "baselineSource" TEXT NOT NULL,
    "alderAdjustedDollars" INTEGER NOT NULL,
    "deltaDollars" INTEGER NOT NULL,
    "deltaPct" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "inputsHash" TEXT NOT NULL,
    "attributionJson" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ValuationDelta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "propertyId" TEXT,
    "topic" TEXT NOT NULL,
    "scopeVariant" TEXT,
    "lane" TEXT,
    "intentDepthScore" DOUBLE PRECISION,
    "budgetBand" TEXT,
    "timelineBand" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartCart" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "priceCohort" TEXT NOT NULL,
    "pricePaidCents" INTEGER NOT NULL,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "photoAttached" BOOLEAN NOT NULL DEFAULT false,
    "cartJson" JSONB NOT NULL,
    "synthesisVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "purchasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,
    "stripeChargeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadIntent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "lane" TEXT NOT NULL,
    "contractorFitScoreJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "trades" TEXT[],
    "serviceAreas" TEXT[],
    "state" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "leadTier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorAcceptance" (
    "id" TEXT NOT NULL,
    "leadIntentId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "feePaidCents" INTEGER,
    "stripeChargeId" TEXT,
    "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractorAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "afterPhotosSnapshotId" TEXT,
    "completedAt" TIMESTAMP(3),
    "spendActualCents" INTEGER,
    "contractorUsed" TEXT,
    "userReportedJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventVersion" TEXT NOT NULL DEFAULT 'v1',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "anonId" TEXT,
    "subjectType" TEXT,
    "subjectId" TEXT,
    "payloadJson" JSONB NOT NULL,
    "sessionId" TEXT,
    "source" TEXT,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogProduct" (
    "universeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "amazonAsin" TEXT,
    "affiliateUrl" TEXT NOT NULL,
    "priceLow" DOUBLE PRECISION NOT NULL,
    "priceHigh" DOUBLE PRECISION NOT NULL,
    "tier" TEXT NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'in_stock',
    "unavailableReason" TEXT,
    "tagsJson" JSONB NOT NULL,
    "lastRefreshedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogProduct_pkey" PRIMARY KEY ("universeId")
);

-- CreateTable
CREATE TABLE "CatalogPriceSnapshot" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "asin" TEXT NOT NULL,
    "priceLow" DOUBLE PRECISION NOT NULL,
    "priceHigh" DOUBLE PRECISION NOT NULL,
    "availability" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorSession" (
    "id" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "signalsJson" JSONB NOT NULL,
    "firstSource" TEXT,
    "firstUtm" JSONB,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedByUserId" TEXT,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogExpansionCandidate" (
    "id" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "candidateType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "proposedSlot" TEXT,
    "proposedTier" TEXT,
    "proposedAffiliateUrl" TEXT,
    "proposedPriceRange" TEXT,
    "commodityRiskScore" INTEGER NOT NULL,
    "evidenceNeededJson" JSONB NOT NULL,
    "evidenceSuppliedJson" JSONB,
    "uniqueAngle" TEXT,
    "llmModelVersion" TEXT NOT NULL,
    "llmPromptVersion" TEXT NOT NULL,
    "estimatedBuyerValue" TEXT,
    "riskLevelJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewerNotes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedAsJson" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogExpansionCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationChange" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "asin" TEXT,
    "changeType" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "pctChange" DOUBLE PRECISION,
    "riskTier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewActionToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "candidateId" TEXT,
    "changeId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "consumedFromIp" TEXT,

    CONSTRAINT "ReviewActionToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GscPageStats" (
    "id" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "ctr" DOUBLE PRECISION NOT NULL,
    "avgPosition" DOUBLE PRECISION NOT NULL,
    "topQueriesJson" JSONB NOT NULL,
    "aiOverviewLikely" BOOLEAN NOT NULL DEFAULT false,
    "publishedFromCandidateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GscPageStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoContentUse" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "allowGuides" BOOLEAN NOT NULL DEFAULT true,
    "allowOutcomes" BOOLEAN NOT NULL DEFAULT true,
    "allowMarketing" BOOLEAN NOT NULL DEFAULT false,
    "attributionStyle" TEXT NOT NULL DEFAULT 'anonymous',
    "consentVersion" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "PhotoContentUse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_tokenHash_key" ON "MagicLink"("tokenHash");

-- CreateIndex
CREATE INDEX "MagicLink_userId_idx" ON "MagicLink"("userId");

-- CreateIndex
CREATE INDEX "MagicLink_tokenHash_idx" ON "MagicLink"("tokenHash");

-- CreateIndex
CREATE INDEX "HouseholdMember_householdId_idx" ON "HouseholdMember"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_userId_householdId_key" ON "HouseholdMember"("userId", "householdId");

-- CreateIndex
CREATE INDEX "Property_state_zip_idx" ON "Property"("state", "zip");

-- CreateIndex
CREATE INDEX "Property_householdId_idx" ON "Property"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_addressLine1Norm_cityNorm_state_zip_key" ON "Property"("addressLine1Norm", "cityNorm", "state", "zip");

-- CreateIndex
CREATE INDEX "PropertyProfile_propertyId_snapshotAt_idx" ON "PropertyProfile"("propertyId", "snapshotAt");

-- CreateIndex
CREATE INDEX "Room_propertyId_roomType_idx" ON "Room"("propertyId", "roomType");

-- CreateIndex
CREATE INDEX "RoomSnapshot_roomId_snapshotAt_idx" ON "RoomSnapshot"("roomId", "snapshotAt");

-- CreateIndex
CREATE INDEX "RoomSnapshot_captureContext_idx" ON "RoomSnapshot"("captureContext");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_blobKey_key" ON "Photo"("blobKey");

-- CreateIndex
CREATE INDEX "Photo_roomSnapshotId_idx" ON "Photo"("roomSnapshotId");

-- CreateIndex
CREATE INDEX "Photo_perceptualHash_idx" ON "Photo"("perceptualHash");

-- CreateIndex
CREATE INDEX "VisionExtraction_photoId_idx" ON "VisionExtraction"("photoId");

-- CreateIndex
CREATE INDEX "VisionExtraction_reviewStatus_createdAt_idx" ON "VisionExtraction"("reviewStatus", "createdAt");

-- CreateIndex
CREATE INDEX "VisionExtraction_overallConfidence_idx" ON "VisionExtraction"("overallConfidence");

-- CreateIndex
CREATE INDEX "ValuationDelta_propertyId_computedAt_idx" ON "ValuationDelta"("propertyId", "computedAt");

-- CreateIndex
CREATE INDEX "ValuationDelta_inputsHash_idx" ON "ValuationDelta"("inputsHash");

-- CreateIndex
CREATE INDEX "Project_householdId_status_idx" ON "Project"("householdId", "status");

-- CreateIndex
CREATE INDEX "Project_propertyId_status_idx" ON "Project"("propertyId", "status");

-- CreateIndex
CREATE INDEX "Project_topic_scopeVariant_idx" ON "Project"("topic", "scopeVariant");

-- CreateIndex
CREATE INDEX "SmartCart_userId_idx" ON "SmartCart"("userId");

-- CreateIndex
CREATE INDEX "SmartCart_projectId_idx" ON "SmartCart"("projectId");

-- CreateIndex
CREATE INDEX "SmartCart_status_purchasedAt_idx" ON "SmartCart"("status", "purchasedAt");

-- CreateIndex
CREATE INDEX "SmartCart_priceCohort_purchasedAt_idx" ON "SmartCart"("priceCohort", "purchasedAt");

-- CreateIndex
CREATE INDEX "LeadIntent_projectId_idx" ON "LeadIntent"("projectId");

-- CreateIndex
CREATE INDEX "LeadIntent_lane_status_idx" ON "LeadIntent"("lane", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_externalId_key" ON "Contractor"("externalId");

-- CreateIndex
CREATE INDEX "Contractor_state_status_idx" ON "Contractor"("state", "status");

-- CreateIndex
CREATE INDEX "ContractorAcceptance_leadIntentId_idx" ON "ContractorAcceptance"("leadIntentId");

-- CreateIndex
CREATE INDEX "ContractorAcceptance_contractorId_actionAt_idx" ON "ContractorAcceptance"("contractorId", "actionAt");

-- CreateIndex
CREATE INDEX "Outcome_projectId_idx" ON "Outcome"("projectId");

-- CreateIndex
CREATE INDEX "EventLog_eventType_occurredAt_idx" ON "EventLog"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "EventLog_actorId_occurredAt_idx" ON "EventLog"("actorId", "occurredAt");

-- CreateIndex
CREATE INDEX "EventLog_anonId_occurredAt_idx" ON "EventLog"("anonId", "occurredAt");

-- CreateIndex
CREATE INDEX "EventLog_subjectType_subjectId_idx" ON "EventLog"("subjectType", "subjectId");

-- CreateIndex
CREATE INDEX "Consent_userId_idx" ON "Consent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Consent_userId_purpose_dataType_key" ON "Consent"("userId", "purpose", "dataType");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProduct_amazonAsin_key" ON "CatalogProduct"("amazonAsin");

-- CreateIndex
CREATE INDEX "CatalogProduct_availability_idx" ON "CatalogProduct"("availability");

-- CreateIndex
CREATE INDEX "CatalogProduct_tier_availability_idx" ON "CatalogProduct"("tier", "availability");

-- CreateIndex
CREATE INDEX "CatalogPriceSnapshot_universeId_capturedAt_idx" ON "CatalogPriceSnapshot"("universeId", "capturedAt");

-- CreateIndex
CREATE INDEX "CatalogPriceSnapshot_asin_capturedAt_idx" ON "CatalogPriceSnapshot"("asin", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorSession_anonId_key" ON "VisitorSession"("anonId");

-- CreateIndex
CREATE INDEX "VisitorSession_anonId_idx" ON "VisitorSession"("anonId");

-- CreateIndex
CREATE INDEX "VisitorSession_claimedByUserId_idx" ON "VisitorSession"("claimedByUserId");

-- CreateIndex
CREATE INDEX "CatalogExpansionCandidate_status_createdAt_idx" ON "CatalogExpansionCandidate"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CatalogExpansionCandidate_scopeId_status_idx" ON "CatalogExpansionCandidate"("scopeId", "status");

-- CreateIndex
CREATE INDEX "CatalogExpansionCandidate_commodityRiskScore_idx" ON "CatalogExpansionCandidate"("commodityRiskScore");

-- CreateIndex
CREATE INDEX "RecommendationChange_status_createdAt_idx" ON "RecommendationChange"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RecommendationChange_universeId_idx" ON "RecommendationChange"("universeId");

-- CreateIndex
CREATE INDEX "RecommendationChange_riskTier_status_idx" ON "RecommendationChange"("riskTier", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewActionToken_token_key" ON "ReviewActionToken"("token");

-- CreateIndex
CREATE INDEX "ReviewActionToken_token_idx" ON "ReviewActionToken"("token");

-- CreateIndex
CREATE INDEX "ReviewActionToken_expiresAt_idx" ON "ReviewActionToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ReviewActionToken_candidateId_idx" ON "ReviewActionToken"("candidateId");

-- CreateIndex
CREATE INDEX "ReviewActionToken_changeId_idx" ON "ReviewActionToken"("changeId");

-- CreateIndex
CREATE INDEX "GscPageStats_windowStart_idx" ON "GscPageStats"("windowStart");

-- CreateIndex
CREATE INDEX "GscPageStats_publishedFromCandidateId_idx" ON "GscPageStats"("publishedFromCandidateId");

-- CreateIndex
CREATE UNIQUE INDEX "GscPageStats_pageUrl_windowStart_key" ON "GscPageStats"("pageUrl", "windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoContentUse_photoId_key" ON "PhotoContentUse"("photoId");

-- CreateIndex
CREATE INDEX "PhotoContentUse_granted_allowGuides_idx" ON "PhotoContentUse"("granted", "allowGuides");

-- CreateIndex
CREATE INDEX "PhotoContentUse_granted_allowOutcomes_idx" ON "PhotoContentUse"("granted", "allowOutcomes");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyProfile" ADD CONSTRAINT "PropertyProfile_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomSnapshot" ADD CONSTRAINT "RoomSnapshot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_roomSnapshotId_fkey" FOREIGN KEY ("roomSnapshotId") REFERENCES "RoomSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisionExtraction" ADD CONSTRAINT "VisionExtraction_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationDelta" ADD CONSTRAINT "ValuationDelta_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartCart" ADD CONSTRAINT "SmartCart_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartCart" ADD CONSTRAINT "SmartCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadIntent" ADD CONSTRAINT "LeadIntent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorAcceptance" ADD CONSTRAINT "ContractorAcceptance_leadIntentId_fkey" FOREIGN KEY ("leadIntentId") REFERENCES "LeadIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorAcceptance" ADD CONSTRAINT "ContractorAcceptance_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_afterPhotosSnapshotId_fkey" FOREIGN KEY ("afterPhotosSnapshotId") REFERENCES "RoomSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogPriceSnapshot" ADD CONSTRAINT "CatalogPriceSnapshot_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CatalogProduct"("universeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewActionToken" ADD CONSTRAINT "ReviewActionToken_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CatalogExpansionCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewActionToken" ADD CONSTRAINT "ReviewActionToken_changeId_fkey" FOREIGN KEY ("changeId") REFERENCES "RecommendationChange"("id") ON DELETE CASCADE ON UPDATE CASCADE;
