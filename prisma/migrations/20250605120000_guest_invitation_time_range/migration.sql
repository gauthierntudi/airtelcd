-- Horaire personnalisable par invité (email {{2}}/{{3}}, page invitation)
ALTER TABLE "Guest" ADD COLUMN "invitationTimeRange" TEXT NOT NULL DEFAULT '08h00 – 17h00';
