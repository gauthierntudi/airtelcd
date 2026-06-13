-- Walk-in kiosque : accès Privilège / M-Pesa sans invitation événement
ALTER TABLE "Guest" ADD COLUMN "experienceOnly" BOOLEAN NOT NULL DEFAULT false;
