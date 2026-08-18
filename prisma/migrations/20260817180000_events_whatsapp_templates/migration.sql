-- CreateEnum
CREATE TYPE "WhatsAppTemplateKind" AS ENUM ('INVITATION', 'CONFIRMATION', 'REMINDER', 'THANK_YOU', 'CUSTOM');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeRange" TEXT NOT NULL DEFAULT '14h00 – 19h00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventWhatsAppTemplate" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "kind" "WhatsAppTemplateKind" NOT NULL,
    "label" TEXT NOT NULL,
    "contentSid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventWhatsAppTemplate_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "eventId" TEXT;

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "EventWhatsAppTemplate_eventId_idx" ON "EventWhatsAppTemplate"("eventId");

-- CreateIndex
CREATE INDEX "Guest_eventId_idx" ON "Guest"("eventId");

-- AddForeignKey
ALTER TABLE "EventWhatsAppTemplate" ADD CONSTRAINT "EventWhatsAppTemplate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
