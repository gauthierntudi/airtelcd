-- Jour d'invitation (12, 13 ou 14 juin 2026)
ALTER TABLE "Guest" ADD COLUMN "eventDay" DATE NOT NULL DEFAULT '2026-06-12'::date;
