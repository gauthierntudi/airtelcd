-- Fusion prénom + nom → nom complet
ALTER TABLE "Guest" ADD COLUMN "fullName" TEXT;

UPDATE "Guest"
SET "fullName" = NULLIF(
  TRIM(CONCAT(COALESCE("firstName", ''), ' ', COALESCE("lastName", ''))),
  ''
);

ALTER TABLE "Guest" DROP COLUMN "firstName";
ALTER TABLE "Guest" DROP COLUMN "lastName";
