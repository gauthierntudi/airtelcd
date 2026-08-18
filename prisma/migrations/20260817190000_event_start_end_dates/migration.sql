-- AlterTable
ALTER TABLE "Event" ADD COLUMN "startDate" DATE;
ALTER TABLE "Event" ADD COLUMN "endDate" DATE;

UPDATE "Event" SET "startDate" = "date", "endDate" = "date";

ALTER TABLE "Event" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "endDate" SET NOT NULL;

DROP INDEX IF EXISTS "Event_date_idx";
ALTER TABLE "Event" DROP COLUMN "date";

CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");
