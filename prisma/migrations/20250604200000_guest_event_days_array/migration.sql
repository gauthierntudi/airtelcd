-- Plusieurs jours d'invitation par invité (1 à n)
ALTER TABLE "Guest" ADD COLUMN "eventDays" DATE[] NOT NULL DEFAULT ARRAY['2026-06-12'::date];

UPDATE "Guest" SET "eventDays" = ARRAY["eventDay"];

ALTER TABLE "Guest" DROP COLUMN "eventDay";
