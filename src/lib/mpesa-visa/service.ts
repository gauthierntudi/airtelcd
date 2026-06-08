import { Prisma } from "@prisma/client";
import { guestDisplayName } from "@/lib/event";
import {
  getCarrefourProduct,
  MPESA_VISA_WELCOME_BONUS_USD,
  VODACOM_MARKET_NAME,
} from "@/lib/mpesa-visa/constants";
import {
  assertVisaPayment,
  type VisaPaymentInput,
} from "@/lib/mpesa-visa/validate-payment";
import { generateVisaCardDetails } from "@/lib/mpesa-visa/card-generator";
import { isTwilioSmsConfigured } from "@/lib/messaging/config";
import { sendMpesaCardCredentialsSms } from "@/lib/messaging/send-mpesa-card-sms";
import { normalizeMpesaVodacomPhone } from "@/lib/mpesa-visa/mpesa-phone";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-query";

export type MpesaVisaCardView = {
  id: string;
  cardMasked: string;
  cardPanFormatted: string;
  cardLastFour: string;
  expiryDisplay: string;
  cvvDisplay: string;
  bonusBalanceUsd: number;
  blocked: boolean;
  createdAt: string;
};

export type CarrefourPurchaseView = {
  id: string;
  productId: string;
  productName: string;
  priceUsd: number;
  createdAt: string;
};

export type MpesaVisaExperienceState = {
  guest: {
    id: string;
    displayName: string;
  };
  card: MpesaVisaCardView | null;
  purchases: CarrefourPurchaseView[];
  /** True si une carte a déjà été créée (même supprimée ensuite). */
  visaCardEverIssued: boolean;
};

function decimalToNumber(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

function mapCard(
  card: {
    id: string;
    cardMasked: string;
    cardLastFour: string;
    expiryMonth: number;
    expiryYear: number;
    bonusBalanceUsd: Prisma.Decimal;
    blocked: boolean;
    createdAt: Date;
  },
  details: ReturnType<typeof generateVisaCardDetails>,
): MpesaVisaCardView {
  return {
    id: card.id,
    cardMasked: card.cardMasked,
    cardPanFormatted: details.panFormatted,
    cardLastFour: card.cardLastFour,
    expiryDisplay: details.expiryDisplay,
    cvvDisplay: details.cvv,
    bonusBalanceUsd: decimalToNumber(card.bonusBalanceUsd),
    blocked: card.blocked,
    createdAt: card.createdAt.toISOString(),
  };
}

export async function getMpesaVisaExperienceState(
  guestId: string,
): Promise<MpesaVisaExperienceState | null> {
  const guest = await withPrismaRetry(() =>
    prisma.guest.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        fullName: true,
        mpesaVisaCardIssuedAt: true,
        mpesaVisaCard: {
          include: {
            purchases: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    }),
  );

  if (!guest) return null;

  const details = generateVisaCardDetails(guest.id);
  const card = guest.mpesaVisaCard ? mapCard(guest.mpesaVisaCard, details) : null;

  const purchases =
    guest.mpesaVisaCard?.purchases.map((p) => ({
      id: p.id,
      productId: p.productId,
      productName: p.productName,
      priceUsd: decimalToNumber(p.priceUsd),
      createdAt: p.createdAt.toISOString(),
    })) ?? [];

  return {
    guest: {
      id: guest.id,
      displayName: guestDisplayName(guest.fullName),
    },
    card,
    purchases,
    visaCardEverIssued: guest.mpesaVisaCardIssuedAt != null,
  };
}

const MPESA_VISA_ALREADY_ISSUED =
  "Une Carte Visa M-Pesa a déjà été créée pour votre compte. Une seule carte par invité.";

export async function createMpesaVisaCard(guestId: string) {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      id: true,
      fullName: true,
      phone: true,
      mpesaVisaCardIssuedAt: true,
      mpesaVisaCard: { select: { id: true } },
    },
  });
  if (!guest) {
    throw new Error("Invité introuvable.");
  }

  if (guest.mpesaVisaCardIssuedAt || guest.mpesaVisaCard) {
    throw new Error(MPESA_VISA_ALREADY_ISSUED);
  }

  const phoneRaw = guest.phone?.trim();
  if (!phoneRaw) {
    throw new Error(
      "Aucun numéro de téléphone enregistré pour votre invitation. Contactez l'organisateur.",
    );
  }

  const phone = normalizeMpesaVodacomPhone(phoneRaw);
  if (!phone.ok) {
    throw new Error(phone.error);
  }

  if (!isTwilioSmsConfigured()) {
    throw new Error(
      "Envoi SMS indisponible (Twilio SMS non configuré). Impossible de délivrer les coordonnées de la carte.",
    );
  }

  const details = generateVisaCardDetails(guestId);
  await prisma.mpesaVisaCard.create({
    data: {
      guestId,
      cardLastFour: details.cardLastFour,
      cardMasked: details.cardMasked,
      expiryMonth: details.expiryMonth,
      expiryYear: details.expiryYear,
      bonusBalanceUsd: MPESA_VISA_WELCOME_BONUS_USD,
    },
  });

  try {
    await sendMpesaCardCredentialsSms({
      phoneE164: phone.e164,
      pan16: details.pan16,
      expiryDisplay: details.expiryDisplay,
      cvv: details.cvv,
    });
  } catch (e) {
    await prisma.mpesaVisaCard.deleteMany({ where: { guestId } });
    throw e;
  }

  await prisma.guest.update({
    where: { id: guestId },
    data: { mpesaVisaCardIssuedAt: new Date() },
  });

  return getMpesaVisaExperienceState(guestId);
}

export async function deleteMpesaVisaCard(guestId: string) {
  await prisma.mpesaVisaCard.deleteMany({ where: { guestId } });
  return getMpesaVisaExperienceState(guestId);
}

export async function setMpesaVisaCardBlocked(
  guestId: string,
  blocked: boolean,
) {
  const card = await prisma.mpesaVisaCard.findUnique({ where: { guestId } });
  if (!card) throw new Error("Aucune carte Visa M-Pesa.");
  await prisma.mpesaVisaCard.update({
    where: { id: card.id },
    data: { blocked },
  });
  return getMpesaVisaExperienceState(guestId);
}

export async function purchaseCarrefourProduct(
  guestId: string,
  productId: string,
  payment?: VisaPaymentInput,
) {
  const product = getCarrefourProduct(productId);
  if (!product) throw new Error("Produit inconnu.");

  const card = await prisma.mpesaVisaCard.findUnique({
    where: { guestId },
  });
  if (!card) {
    throw new Error("Créez d'abord votre Carte Visa M-Pesa.");
  }
  if (card.blocked) {
    throw new Error("Carte bloquée — achat impossible.");
  }

  if (payment) {
    assertVisaPayment(guestId, payment);
  }

  const balance = decimalToNumber(card.bonusBalanceUsd);
  if (balance < product.priceUsd) {
    throw new Error(
      `Solde insuffisant (${balance.toFixed(0)} USD). Prix : ${product.priceUsd} USD.`,
    );
  }

  await prisma.$transaction([
    prisma.carrefourPurchase.create({
      data: {
        cardId: card.id,
        productId: product.id,
        productName: product.name,
        priceUsd: product.priceUsd,
      },
    }),
    prisma.mpesaVisaCard.update({
      where: { id: card.id },
      data: {
        bonusBalanceUsd: balance - product.priceUsd,
      },
    }),
  ]);

  return getMpesaVisaExperienceState(guestId);
}

export type AdminMpesaCardRow = {
  cardId: string;
  guestId: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  cardMasked: string;
  cardLastFour: string;
  expiryDisplay: string;
  bonusBalanceUsd: number;
  blocked: boolean;
  cardCreatedAt: string;
  purchases: CarrefourPurchaseView[];
  totalSpentUsd: number;
};

export async function listAdminMpesaOverview(): Promise<AdminMpesaCardRow[]> {
  const cards = await prisma.mpesaVisaCard.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      guest: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      purchases: { orderBy: { createdAt: "desc" } },
    },
  });

  return cards.map((card) => {
    const purchases = card.purchases.map((p) => ({
      id: p.id,
      productId: p.productId,
      productName: p.productName,
      priceUsd: decimalToNumber(p.priceUsd),
      createdAt: p.createdAt.toISOString(),
    }));
    const totalSpentUsd = purchases.reduce((sum, p) => sum + p.priceUsd, 0);

    return {
      cardId: card.id,
      guestId: card.guestId,
      guestName: guestDisplayName(card.guest.fullName),
      guestEmail: card.guest.email,
      guestPhone: card.guest.phone,
      cardMasked: card.cardMasked,
      cardLastFour: card.cardLastFour,
      expiryDisplay: `${String(card.expiryMonth).padStart(2, "0")}/${card.expiryYear}`,
      bonusBalanceUsd: decimalToNumber(card.bonusBalanceUsd),
      blocked: card.blocked,
      cardCreatedAt: card.createdAt.toISOString(),
      purchases,
      totalSpentUsd,
    };
  });
}

export { MPESA_VISA_WELCOME_BONUS_USD, VODACOM_MARKET_NAME };
