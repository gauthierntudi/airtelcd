-- CreateTable
CREATE TABLE "InvitationAccessOtp" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationAccessOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvitationAccessOtp_address_channel_idx" ON "InvitationAccessOtp"("address", "channel");

-- CreateIndex
CREATE INDEX "InvitationAccessOtp_guestId_idx" ON "InvitationAccessOtp"("guestId");

-- AddForeignKey
ALTER TABLE "InvitationAccessOtp" ADD CONSTRAINT "InvitationAccessOtp_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
