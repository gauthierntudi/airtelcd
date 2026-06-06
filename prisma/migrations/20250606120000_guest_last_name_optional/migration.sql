-- Nom facultatif à la création ; complété à la confirmation RSVP si absent
UPDATE "Guest" SET "lastName" = NULL WHERE TRIM("lastName") = '';
ALTER TABLE "Guest" ALTER COLUMN "lastName" DROP NOT NULL;
