-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "accessKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Report_accessKey_key" ON "Report"("accessKey");

