-- Une seule création Carte Visa M-Pesa par invité (même après suppression)
ALTER TABLE "Guest" ADD COLUMN "mpesaVisaCardIssuedAt" TIMESTAMP(3);

UPDATE "Guest" g
SET "mpesaVisaCardIssuedAt" = c."createdAt"
FROM "MpesaVisaCard" c
WHERE c."guestId" = g."id";
