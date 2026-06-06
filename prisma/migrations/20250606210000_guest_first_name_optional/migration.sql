-- Prénom facultatif à la création — nom complet demandé à la confirmation RSVP si absent
UPDATE "Guest" SET "firstName" = NULL WHERE TRIM("firstName") = '';
ALTER TABLE "Guest" ALTER COLUMN "firstName" DROP NOT NULL;
