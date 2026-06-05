-- CreateEnum
CREATE TYPE "CheckinKioskStatus" AS ENUM ('SHOW_QR', 'WAITING_GUEST', 'WAITING_CONFIRM', 'SUCCESS');

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "checkedInAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CheckinKioskSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "CheckinKioskStatus" NOT NULL DEFAULT 'SHOW_QR',
    "guestId" TEXT,
    "displayName" TEXT,
    "scannedAt" TIMESTAMP(3),
    "successEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckinKioskSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckinKioskSession_token_key" ON "CheckinKioskSession"("token");

-- CreateIndex
CREATE INDEX "CheckinKioskSession_createdAt_idx" ON "CheckinKioskSession"("createdAt");

-- CreateIndex
CREATE INDEX "CheckinKioskSession_status_idx" ON "CheckinKioskSession"("status");

-- AddForeignKey
ALTER TABLE "CheckinKioskSession" ADD CONSTRAINT "CheckinKioskSession_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
