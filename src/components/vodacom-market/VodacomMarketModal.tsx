"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Lock,
  Search,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { BRAND } from "@/lib/branding";
import { getCarrefourProductUi } from "@/lib/mpesa-visa/carrefour-products-ui";
import {
  CARREFOUR_PRODUCTS,
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
import { notify } from "@/lib/toast";

type Props = {
  open: boolean;
  onClose: () => void;
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

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#FFA41C]">
      {Array.from({ length: 5 }).map((_, i) => (
        <LucideIcon
          key={i}
          icon={Star}
          size={12}
          className={
            i < Math.floor(rating)
              ? "fill-[#FFA41C] text-[#FFA41C]"
              : "text-[#FFA41C]/35"
          }
        />
      ))}
      <span className="ml-1 font-vodafone-lt text-xs text-[#007185]">
        {rating.toFixed(1)}
      </span>
    </span>
  );
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
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
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
        onClose();
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
      setPurchaseSuccess(false);
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
    setPurchaseSuccess(false);
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
      resetCheckout();
      setPurchaseSuccess(true);
      const product = getCarrefourProduct(selectedProductId);
      notify.success(
        product ? `${product.name} — commande confirmée` : "Commande confirmée",
      );
      window.setTimeout(() => setPurchaseSuccess(false), 4000);
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
      className="fixed inset-0 z-[75] flex flex-col bg-vodacom-cream sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vodacom-market-title"
    >
      <div className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden shadow-2xl ring-1 ring-black/5 sm:my-auto sm:max-h-[min(94dvh,56rem)] sm:rounded-2xl">
        <header className="shrink-0 bg-[linear-gradient(135deg,#e60000_0%,#b30000_55%,#8b0000_100%)] text-white">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-2 ring-white/90">
              <Image
                src={BRAND.icon}
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
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
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
                placeholder="Rechercher dans Vodacom Market"
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
            <NoCardState onRequestVisaCard={onRequestVisaCard} onClose={onClose} />
          ) : view === "shop" ? (
            <div className="px-4 py-5 sm:px-6">
              <div className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2b292c_0%,#474b4e_100%)] p-4 text-white shadow-md sm:p-5">
                <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-white/70">
                  Vodacom Privilège Golf
                </p>
                <p className="mt-1 font-vodafone-exb text-lg leading-snug sm:text-xl">
                  Dépensez votre bonus {MPESA_VISA_WELCOME_BONUS_USD} USD
                </p>
                <p className="mt-1 font-vodafone-lt text-sm text-white/75">
                  Spiritueux et accessoires premium — paiement Carte Visa M-Pesa.
                </p>
              </div>

              {purchaseSuccess ? (
                <div
                  className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                  role="status"
                >
                  <LucideIcon icon={Check} size={18} />
                  Commande enregistrée — solde mis à jour.
                </div>
              ) : null}

              {card.blocked ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <LucideIcon icon={AlertCircle} size={18} className="mt-0.5" />
                  Carte bloquée — débloquez-la via le menu USSD pour acheter.
                </div>
              ) : null}

              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CARREFOUR_PRODUCTS.map((product) => {
                  const ui = getCarrefourProductUi(product.id);
                  const affordable = balance >= product.priceUsd;
                  const disabled = card.blocked || !affordable;

                  return (
                    <li key={product.id}>
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-md ring-1 ring-vodacom-silver/20 transition hover:shadow-lg">
                        {ui ? (
                          <div className="relative mx-auto aspect-square w-full max-w-[220px] rounded-xl bg-vodacom-cream/60">
                            <Image
                              src={ui.image}
                              alt={product.name}
                              fill
                              unoptimized
                              sizes="220px"
                              className="object-contain p-3"
                            />
                          </div>
                        ) : null}
                        {ui?.tagline ? (
                          <p className="mt-3 font-vodafone-lt text-[11px] uppercase tracking-wide text-vodacom-black/45">
                            {ui.tagline}
                          </p>
                        ) : null}
                        <h3 className="mt-1 line-clamp-2 font-vodafone-rg-bd text-sm leading-snug text-vodacom-black">
                          {product.name}
                        </h3>
                        {ui ? (
                          <>
                            <StarRating rating={ui.rating} />
                            <p className="mt-1 font-vodafone-lt text-xs text-vodacom-black/50">
                              {ui.reviewCount} avis
                            </p>
                          </>
                        ) : null}
                        <p className="mt-2 font-vodafone-exb text-2xl text-vodacom-red">
                          {product.priceUsd}{" "}
                          <span className="text-xs font-vodafone-rg-bd">USD</span>
                        </p>
                        {!affordable && !card.blocked ? (
                          <p className="mt-1 text-xs text-vodacom-red/80">
                            Solde insuffisant ({balance.toFixed(2)} USD)
                          </p>
                        ) : null}
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleStartCheckout(product.id)}
                          className="mt-auto pt-4"
                        >
                          <span className="flex w-full items-center justify-center rounded-xl bg-vodacom-red py-2.5 font-vodafone-rg-bd text-sm text-white shadow-sm transition hover:bg-[#c40000] disabled:cursor-not-allowed disabled:bg-vodacom-silver/40 disabled:text-vodacom-black/45">
                            Acheter
                          </span>
                        </button>
                      </article>
                    </li>
                  );
                })}
              </ul>

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
              <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
                <div className="border-b border-[#D5D9D9] bg-white px-4 py-4 lg:border-b-0 lg:border-r">
                  <button
                    type="button"
                    onClick={resetCheckout}
                    className="mb-4 inline-flex items-center gap-1 font-vodafone-lt text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
                  >
                    <LucideIcon icon={ArrowLeft} size={16} />
                    Retour aux produits
                  </button>
                  <h3 className="font-vodafone-exb text-lg text-[#0F1111]">
                    Paiement sécurisé
                  </h3>
                  <p className="mt-1 font-vodafone-lt text-sm text-[#565959]">
                    Saisissez les coordonnées de votre Carte Visa M-Pesa (celles
                    reçues par SMS à la création).
                  </p>

                  <div className="mt-4 rounded border border-[#D5D9D9] bg-[#F7FAFA] p-3">
                    <p className="flex items-center gap-2 font-vodafone-rg-bd text-xs text-[#565959]">
                      <LucideIcon icon={Lock} size={14} />
                      Carte enregistrée : {card.cardMasked}
                    </p>
                  </div>

                  <form
                    className="mt-5 space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (canPay) void handlePurchase();
                    }}
                  >
                    <label className="block">
                      <span className="font-vodafone-rg-bd text-sm text-[#0F1111]">
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
                        className="mt-1 w-full rounded border border-[#888C8C] px-3 py-2.5 font-mono text-base tracking-wider text-[#0F1111] outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600]"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="font-vodafone-rg-bd text-sm text-[#0F1111]">
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
                          className="mt-1 w-full rounded border border-[#888C8C] px-3 py-2.5 font-mono text-base text-[#0F1111] outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600]"
                        />
                      </label>
                      <label className="block">
                        <span className="font-vodafone-rg-bd text-sm text-[#0F1111]">
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
                          className="mt-1 w-full rounded border border-[#888C8C] px-3 py-2.5 font-mono text-base text-[#0F1111] outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600]"
                        />
                      </label>
                    </div>

                    {paymentError ? (
                      <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                        {paymentError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={!canPay}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-3 font-vodafone-rg-bd text-sm text-white shadow-sm transition hover:bg-[#c40000] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {purchasing ? (
                        <LucideIcon icon={Loader2} size={18} className="animate-spin" />
                      ) : (
                        <LucideIcon icon={Lock} size={16} />
                      )}
                      {purchasing
                        ? "Traitement…"
                        : `Payer ${selectedProduct.priceUsd} USD`}
                    </button>
                  </form>
                </div>

                <aside className="bg-[#F7FAFA] px-4 py-5">
                  <h4 className="font-vodafone-exb text-base text-[#0F1111]">
                    Récapitulatif
                  </h4>
                  <div className="mt-3 flex gap-3 rounded border border-[#D5D9D9] bg-white p-3">
                    <div className="relative h-16 w-16 shrink-0">
                      <Image
                        src={selectedUi.image}
                        alt={selectedProduct.name}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-vodafone-lt text-sm text-[#0F1111]">
                        {selectedProduct.name}
                      </p>
                      <p className="mt-1 font-vodafone-exb text-[#B12704]">
                        {selectedProduct.priceUsd} USD
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-2 border-t border-[#D5D9D9] pt-4 text-sm">
                    <div className="flex justify-between font-vodafone-lt text-[#565959]">
                      <dt>Sous-total</dt>
                      <dd>{selectedProduct.priceUsd} USD</dd>
                    </div>
                    <div className="flex justify-between font-vodafone-exb text-[#B12704]">
                      <dt>Total</dt>
                      <dd>{selectedProduct.priceUsd} USD</dd>
                    </div>
                    <div className="flex justify-between font-vodafone-lt text-xs text-[#565959]">
                      <dt>Solde après paiement</dt>
                      <dd>
                        {(balance - selectedProduct.priceUsd).toFixed(2)} USD
                      </dd>
                    </div>
                  </dl>
                </aside>
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
          src={BRAND.icon}
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
            onClick={() => {
              onClose();
              onRequestVisaCard();
            }}
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
