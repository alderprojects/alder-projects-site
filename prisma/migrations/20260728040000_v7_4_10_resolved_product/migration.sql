-- v7.4.10 — Commerce resolution layer.
--
-- CR5: imageUrl holds a PA-API primary image URL for ASIN-resolved rows
-- ONLY. Everything else renders a Blob-hosted brand illustration chosen
-- by `category`. There is no third image source in the render path.

-- CreateTable
CREATE TABLE "ResolvedProduct" (
    "specHash" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "asin" TEXT,
    "detailUrl" TEXT,
    "searchUrl" TEXT,
    "imageUrl" TEXT,
    "title" TEXT,
    "price" DOUBLE PRECISION,
    "priceAsOf" TIMESTAMP(3),
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resolutionMode" TEXT NOT NULL,
    "category" TEXT,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResolvedProduct_pkey" PRIMARY KEY ("specHash")
);

-- CreateIndex
CREATE INDEX "ResolvedProduct_resolutionMode_idx" ON "ResolvedProduct"("resolutionMode");
CREATE INDEX "ResolvedProduct_resolvedAt_idx" ON "ResolvedProduct"("resolvedAt");

-- AlterTable: per-item resolution outcome
ALTER TABLE "Recommendation" ADD COLUMN     "resolutionJson" JSONB;
