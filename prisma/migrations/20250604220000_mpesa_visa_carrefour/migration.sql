-- CreateTable
CREATE TABLE "MpesaVisaCard" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "cardLastFour" TEXT NOT NULL,
    "cardMasked" TEXT NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "bonusBalanceUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MpesaVisaCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrefourPurchase" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "priceUsd" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarrefourPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MpesaVisaCard_guestId_key" ON "MpesaVisaCard"("guestId");

-- CreateIndex
CREATE INDEX "MpesaVisaCard_createdAt_idx" ON "MpesaVisaCard"("createdAt");

-- CreateIndex
CREATE INDEX "CarrefourPurchase_cardId_idx" ON "CarrefourPurchase"("cardId");

-- CreateIndex
CREATE INDEX "CarrefourPurchase_createdAt_idx" ON "CarrefourPurchase"("createdAt");

-- AddForeignKey
ALTER TABLE "MpesaVisaCard" ADD CONSTRAINT "MpesaVisaCard_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrefourPurchase" ADD CONSTRAINT "CarrefourPurchase_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "MpesaVisaCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
