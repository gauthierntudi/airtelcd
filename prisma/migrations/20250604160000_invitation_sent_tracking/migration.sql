-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "invitationSentAt" TIMESTAMP(3);
ALTER TABLE "Guest" ADD COLUMN "invitationSentVia" TEXT;
