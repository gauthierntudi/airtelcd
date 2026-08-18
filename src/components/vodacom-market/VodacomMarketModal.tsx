"use client";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { brandIconSrc } from "@/lib/branding";
import { getCarrefourProductUi } from "@/lib/mpesa-visa/carrefour-products-ui";
import {
  getCarrefourProduct,
  MPESA_VISA_WELCOME_BONUS_USD,
  VODACOM_MARKET_NAME,
  type CarrefourProductId,
} from "@/lib/mpesa-visa/constants";
import {
  fetchMpesaVisaState,
  isMpesaAuthError,
  peekMpesaVisaCache,
  runMpesaVisaAction,
} from "@/lib/mpesa-visa/client";
import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import {
  formatExpiryInput,
  parseExpiryInput,
} from "@/lib/mpesa-visa/validate-payment";
import { MarketProductGrid } from "@/components/vodacom-market/MarketProductGrid";
import {
  MarketPurchaseSuccessScreen,
  type MarketCompletedPurchase,
} from "@/components/vodacom-market/MarketPurchaseSuccessScreen";
import { notify } from "@/lib/toast";

type Props = {
  open: boolean;
  /** Fermeture — destruction session invité (cookie). */
  onClose: () => void | Promise<void>;
  onAuthRequired?: () => void;
  onRequestVisaCard?: () => void;
};

type View = "shop" | "payment";

function formatPurchaseDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCardNumberInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function VodacomMarketModal({
  open,
  onClose,
  onAuthRequired,
  onRequestVisaCard,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [experience, setExperience] = useState<MpesaVisaExperienceState | null>(
    null,
  );
  const [view, setView] = useState<View>("shop");
  const [selectedProductId, setSelectedProductId] =
    useState<CarrefourProductId | null>(null);
  const [completedPurchase, setCompletedPurchase] =
    useState<MarketCompletedPurchase | null>(null);
  const [finishingExperience, setFinishingExperience] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const resetCheckout = useCallback(() => {
    setView("shop");
    setSelectedProductId(null);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setPaymentError(null);
  }, []);

  const loadState = useCallback(async () => {
    const cached = peekMpesaVisaCache();
    if (cached) {
      setExperience(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchMpesaVisaState();
      setExperience(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Session requise";
      if (isMpesaAuthError(msg)) {
        onAuthRequired?.();
        return;
      }
      notify.error(msg);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onAuthRequired, onClose]);

  useEffect(() => {
    if (!open) {
      resetCheckout();
      setCompletedPurchase(null);
      setFinishingExperience(false);
      setLoading(false);
      return;
    }

    const cached = peekMpesaVisaCache();
    if (cached) {
      setExperience(cached);
      setLoading(false);
      return;
    }

    setExperience(null);
    void loadState();
  }, [open, loadState, resetCheckout]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleStartCheckout = (productId: CarrefourProductId) => {
    setSelectedProductId(productId);
    setView("payment");
    setPaymentError(null);
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const handleClose = async () => {
    if (finishingExperience) return;
    setFinishingExperience(true);
    try {
      await onClose();
    } finally {
      setFinishingExperience(false);
    }
  };

  const handleDismiss = () => {
    void handleClose();
  };

  const handlePurchase = async () => {
    if (!selectedProductId || purchasing) return;
    setPaymentError(null);

    const pan = cardNumber.replace(/\D/g, "");
    const parsedExpiry = parseExpiryInput(expiry);
    const cvvDigits = cvv.replace(/\D/g, "");

    if (pan.length !== 16) {
      setPaymentError("Saisissez les 16 chiffres de votre carte Visa M-Pesa.");
      return;
    }
    if (!parsedExpiry) {
      setPaymentError("Date d'expiration invalide (MM/AA).");
      return;
    }
    if (cvvDigits.length !== 3) {
      setPaymentError("Le CVV doit contenir 3 chiffres.");
      return;
    }

    setPurchasing(true);
    try {
      const next = await runMpesaVisaAction({
        type: "purchase",
        productId: selectedProductId,
        payment: {
          pan,
          expiryMonth: parsedExpiry.expiryMonth,
          expiryYear: parsedExpiry.expiryYear,
          cvv: cvvDigits,
        },
      });
      setExperience(next);
      const product = getCarrefourProduct(selectedProductId);
      const ui = getCarrefourProductUi(selectedProductId);
      resetCheckout();
      setCompletedPurchase({
        productName: product?.name ?? "Article",
        priceUsd: product?.priceUsd ?? 0,
        newBalanceUsd: next.card?.bonusBalanceUsd ?? 0,
        productImage: ui?.image,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur";
      setPaymentError(msg);
      notify.error(msg);
    } finally {
      setPurchasing(false);
    }
  };

  if (!open || !mounted) return null;

  const card = experience?.card ?? null;
  const balance = card?.bonusBalanceUsd ?? 0;
  const selectedProduct = selectedProductId
    ? getCarrefourProduct(selectedProductId)
    : null;
  const selectedUi = selectedProductId
    ? getCarrefourProductUi(selectedProductId)
    : null;

  const panReady = cardNumber.replace(/\D/g, "").length === 16;
  const expiryReady = parseExpiryInput(expiry) !== null;
  const cvvReady = cvv.replace(/\D/g, "").length === 3;
  const canPay =
    panReady && expiryReady && cvvReady && !purchasing && !card?.blocked;

  const firstName = experience?.guest.displayName?.split(" ")[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[75] flex min-h-[100dvh] flex-col overflow-hidden bg-vodacom-cream"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vodacom-market-title"
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {completedPurchase ? (
          <MarketPurchaseSuccessScreen
            {...completedPurchase}
            onFinish={() => void handleClose()}
            finishing={finishingExperience}
          />
        ) : null}
        <header className="shrink-0 bg-[linear-gradient(135deg,#e60000_0%,#b30000_55%,#8b0000_100%)] text-white">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-2 ring-white/90">
              <Image
                src={brandIconSrc()}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.18em] text-white/75">
                Bonus Carte Visa M-Pesa
              </p>
              <h2
                id="vodacom-market-title"
                className="truncate font-vodafone-exb text-lg font-normal leading-tight sm:text-xl"
              >
                {VODACOM_MARKET_NAME}
              </h2>
              {firstName ? (
                <p className="truncate font-vodafone-lt text-xs text-white/80">
                  Bonjour, {firstName}
                </p>
              ) : null}
            </div>
            {card && !loading ? (
              <div className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-right ring-1 ring-white/20 backdrop-blur-sm">
                <p className="font-vodafone-lt text-[10px] uppercase tracking-wide text-white/75">
                  Solde bonus
                </p>
                <p className="font-vodafone-exb text-base leading-tight">
                  {balance.toFixed(2)}{" "}
                  <span className="text-xs font-vodafone-rg-bd">USD</span>
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleDismiss}
              disabled={finishingExperience}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 disabled:opacity-50"
              aria-label="Fermer"
            >
              <LucideIcon icon={X} size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 border-t border-white/15 px-4 py-2.5 sm:px-5">
            <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-xl bg-white shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center text-vodacom-red/60">
                <LucideIcon icon={Search} size={18} />
              </span>
              <input
                readOnly
                placeholder="Rechercher dans M-pesa Mall"
                className="h-10 min-w-0 flex-1 bg-transparent pr-3 font-vodafone-lt text-sm text-vodacom-black outline-none placeholder:text-vodacom-black/40"
              />
            </div>
            <span className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3 font-vodafone-rg-bd text-sm ring-1 ring-white/20">
              <LucideIcon icon={ShoppingCart} size={18} />
              <span className="hidden sm:inline">Panier</span>
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 bg-white py-20 text-vodacom-black/55">
              <LucideIcon
                icon={Loader2}
                size={32}
                className="animate-spin text-vodacom-red"
              />
              <p className="font-vodafone-lt text-sm">Chargement du marché…</p>
            </div>
          ) : !card ? (
            <NoCardState
              onRequestVisaCard={onRequestVisaCard}
              onClose={() => void handleClose()}
            />
          ) : view === "shop" ? (
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2b292c_0%,#474b4e_100%)] p-4 text-white shadow-md sm:p-5">
                <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-white/70">
                  Vodacom Privilège Golf
                </p>
                <p className="mt-1 font-vodafone-exb text-lg leading-snug sm:text-xl">
                  Dépensez votre bonus {MPESA_VISA_WELCOME_BONUS_USD} USD
                </p>
                <p className="mt-1 font-vodafone-lt text-sm text-white/75">
                  Menu cocktail & accessoires — paiement Carte Visa M-Pesa.
                </p>
              </div>

              {card.blocked ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <LucideIcon icon={AlertCircle} size={18} className="mt-0.5" />
                  Carte bloquée — débloquez-la via le menu USSD pour acheter.
                </div>
              ) : null}

              <MarketProductGrid
                balance={balance}
                cardBlocked={card.blocked}
                onBuy={handleStartCheckout}
              />

              <section className="mt-8 rounded-2xl bg-white p-5 shadow-md ring-1 ring-vodacom-silver/20">
                <h3 className="font-vodafone-exb text-base text-vodacom-black">
                  Vos commandes récentes
                </h3>
                {experience && experience.purchases.length > 0 ? (
                  <ul className="mt-3 divide-y divide-[#EAEDED]">
                    {experience.purchases.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-vodafone-rg-bd text-sm text-[#0F1111]">
                            {p.productName}
                          </p>
                          <p className="font-vodafone-lt text-xs text-[#565959]">
                            {formatPurchaseDate(p.createdAt)}
                          </p>
                        </div>
                        <span className="shrink-0 font-vodafone-exb text-sm text-[#B12704]">
                          {p.priceUsd} USD
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 font-vodafone-lt text-sm text-vodacom-black/55">
                    Aucune commande pour le moment.
                  </p>
                )}
              </section>
            </div>
          ) : (
            selectedProduct &&
            selectedUi && (
              <div className="mx-auto w-full max-w-md px-4 py-3 sm:max-w-lg sm:py-4">
                <button
                  type="button"
                  onClick={resetCheckout}
                  className="mb-3 inline-flex items-center gap-1 font-vodafone-lt text-xs text-vodacom-red sm:text-sm"
                >
                  <LucideIcon icon={ArrowLeft} size={15} />
                  Retour
                </button>

                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] ring-1 ring-vodacom-silver/20">
                  <div className="flex items-center gap-3 border-b border-vodacom-silver/20 bg-vodacom-cream/35 p-3.5 sm:p-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image
                        src={selectedUi.image}
                        alt={selectedProduct.name}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-vodafone-rg-bd text-sm leading-snug text-vodacom-black">
                        {selectedProduct.name}
                      </p>
                      <p className="mt-0.5 font-vodafone-exb text-base text-vodacom-red">
                        {selectedProduct.priceUsd}{" "}
                        <span className="text-xs font-vodafone-rg-bd">USD</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-vodafone-lt text-[10px] text-vodacom-black/45">
                        Solde après
                      </p>
                      <p className="font-vodafone-rg-bd text-xs text-vodacom-black">
                        {(balance - selectedProduct.priceUsd).toFixed(2)} USD
                      </p>
                    </div>
                  </div>

                <form
                  className="p-4 sm:p-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canPay) void handlePurchase();
                  }}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-vodacom-silver/20 pb-3">
                    <p className="font-vodafone-exb text-sm text-vodacom-black">
                      Carte Visa M-Pesa
                    </p>
                    <p className="flex items-center gap-1 font-vodafone-lt text-[11px] text-vodacom-black/55">
                      <LucideIcon icon={Lock} size={12} />
                      {card.cardMasked}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    <label className="block">
                      <span className="font-vodafone-lt text-[11px] text-vodacom-black/55">
                        Numéro de carte
                      </span>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumberInput(e.target.value))
                        }
                        placeholder="4532 1234 5678 9012"
                        className="mt-0.5 w-full rounded-lg border border-vodacom-silver/40 px-3 py-2 font-mono text-sm tracking-wider text-vodacom-black outline-none focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="block">
                        <span className="font-vodafone-lt text-[11px] text-vodacom-black/55">
                          Expiration
                        </span>
                        <input
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          value={expiry}
                          onChange={(e) =>
                            setExpiry(formatExpiryInput(e.target.value))
                          }
                          placeholder="MM/AA"
                          maxLength={5}
                          className="mt-0.5 w-full rounded-lg border border-vodacom-silver/40 px-3 py-2 font-mono text-sm text-vodacom-black outline-none focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15"
                        />
                      </label>
                      <label className="block">
                        <span className="font-vodafone-lt text-[11px] text-vodacom-black/55">
                          CVV
                        </span>
                        <input
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          type="password"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                          }
                          placeholder="•••"
                          maxLength={3}
                          className="mt-0.5 w-full rounded-lg border border-vodacom-silver/40 px-3 py-2 font-mono text-sm text-vodacom-black outline-none focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/15"
                        />
                      </label>
                    </div>
                  </div>

                  {paymentError ? (
                    <p className="mt-2.5 rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-800 ring-1 ring-red-100">
                      {paymentError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canPay}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-2.5 font-vodafone-rg-bd text-sm text-white transition hover:bg-[#c40000] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {purchasing ? (
                      <LucideIcon icon={Loader2} size={17} className="animate-spin" />
                    ) : (
                      <LucideIcon icon={Lock} size={15} />
                    )}
                    {purchasing
                      ? "Traitement…"
                      : `Payer ${selectedProduct.priceUsd} USD`}
                  </button>
                </form>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NoCardState({
  onRequestVisaCard,
  onClose,
}: {
  onRequestVisaCard?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center bg-white px-4 py-14 text-center sm:px-8">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-vodacom-cream shadow-md ring-2 ring-vodacom-red/20">
        <Image
          src={brandIconSrc()}
          alt=""
          width={48}
          height={48}
          unoptimized
          className="h-12 w-12 object-contain"
        />
      </div>
      <h3 className="mt-5 font-vodafone-exb text-xl text-vodacom-black">
        Carte Visa M-Pesa requise
      </h3>
      <p className="mt-2 max-w-md font-vodafone-lt text-sm leading-relaxed text-vodacom-black/65">
        Créez votre carte pour recevoir{" "}
        <strong className="text-vodacom-black">
          {MPESA_VISA_WELCOME_BONUS_USD} USD
        </strong>{" "}
        de bonus {VODACOM_MARKET_NAME}, puis payez avec vos 16 chiffres, date
        d&apos;expiration et CVV.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        {onRequestVisaCard ? (
          <button
            type="button"
            onClick={() => onRequestVisaCard()}
            className="w-full rounded-xl bg-vodacom-red py-3 font-vodafone-rg-bd text-sm text-white shadow-sm hover:bg-[#c40000]"
          >
            Obtenir Carte Visa
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-vodacom-silver/40 py-2.5 font-vodafone-rg-bd text-sm text-vodacom-black hover:bg-vodacom-cream"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
