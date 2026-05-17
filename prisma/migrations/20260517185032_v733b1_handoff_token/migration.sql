-- CreateTable
CREATE TABLE "HandoffToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "consumedFromIp" TEXT,

    CONSTRAINT "HandoffToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HandoffToken_tokenHash_key" ON "HandoffToken"("tokenHash");

-- CreateIndex
CREATE INDEX "HandoffToken_anonId_idx" ON "HandoffToken"("anonId");

-- CreateIndex
CREATE INDEX "HandoffToken_expiresAt_idx" ON "HandoffToken"("expiresAt");
