-- Réordonner les colonnes Guest (ordre logique métier)
CREATE TABLE "Guest_new" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "token" TEXT NOT NULL,
    "rsvpStatus" "RsvpStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "invitationSentAt" TIMESTAMP(3),
    "invitationSentVia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_new_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Guest_new" (
    "id",
    "firstName",
    "lastName",
    "email",
    "phone",
    "token",
    "rsvpStatus",
    "confirmedAt",
    "invitationSentAt",
    "invitationSentVia",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "firstName",
    "lastName",
    "email",
    "phone",
    "token",
    "rsvpStatus",
    "confirmedAt",
    "invitationSentAt",
    "invitationSentVia",
    "createdAt",
    "updatedAt"
FROM "Guest";

DROP TABLE "Guest";

ALTER TABLE "Guest_new" RENAME TO "Guest";

CREATE UNIQUE INDEX "Guest_token_key" ON "Guest"("token");
