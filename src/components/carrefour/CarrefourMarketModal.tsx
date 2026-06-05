"use client";

import {
  AlertCircle,
  Check,
  CreditCard,
  Loader2,
  ShoppingBag,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { PLATFORM_MODULE_ICONS } from "@/lib/invitation-assets";
import {
  CARREFOUR_MARKET_NAME,
  CARREFOUR_PRODUCTS,
  getCarrefourProduct,
  MPESA_VISA_WELCOME_BONUS_USD,
  type CarrefourProductId,
} from "@/lib/mpesa-visa/constants";
import { getCarrefourProductUi } from "@/lib/mpesa-visa/carrefour-products-ui";
import {
  fetchMpesaVisaState,
  isMpesaAuthError,
  peekMpesaVisaCache,
  runMpesaVisaAction,
} from "@/lib/mpesa-visa/client";
import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import { notify } from "@/lib/toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
  onRequestVisaCard?: () => void;
};

function formatPurchaseDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CarrefourMarketModal({
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
  const [confirmProductId, setConfirmProductId] =
    useState<CarrefourProductId | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => setMounted(true), []);

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
      setConfirmProductId(null);
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
  }, [open, loadState]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePurchase = async () => {
    if (!confirmProductId || purchasing) return;
    setPurchasing(true);
    setPurchaseSuccess(false);
    try {
      const next = await runMpesaVisaAction({
        type: "purchase",
        productId: confirmProductId,
      });
      setExperience(next);
      setConfirmProductId(null);
      setPurchaseSuccess(true);
      const product = getCarrefourProduct(confirmProductId);
      notify.success(
        product ? `${product.name} — achat confirmé` : "Achat confirmé",
      );
      window.setTimeout(() => setPurchaseSuccess(false), 4000);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPurchasing(false);
    }
  };

  if (!open || !mounted) return null;

  const card = experience?.card ?? null;
  const balance = card?.bonusBalanceUsd ?? 0;
  const confirmProduct = confirmProductId
    ? getCarrefourProduct(confirmProductId)
    : null;
  const confirmUi = confirmProductId
    ? getCarrefourProductUi(confirmProductId)
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[75] flex flex-col bg-[#f4f5f6] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carrefour-market-title"
    >
      <div className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden bg-white shadow-xl sm:my-auto sm:max-h-[min(92dvh,52rem)] sm:rounded-2xl sm:ring-1 sm:ring-vodacom-silver/30">
        <header className="flex shrink-0 items-center gap-3 border-b border-vodacom-silver/25 px-4 py-3 sm:px-5">
          <Image
            src={PLATFORM_MODULE_ICONS.market}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.18em] text-vodacom-red">
              Boutique événement
            </p>
            <h2
              id="carrefour-market-title"
              className="truncate font-vodafone-exb text-lg font-normal text-vodacom-black"
            >
              {CARREFOUR_MARKET_NAME}
            </h2>
            {experience?.guest.displayName ? (
              <p className="truncate font-vodafone-lt text-xs text-vodacom-black/50">
                {experience.guest.displayName}
              </p>
            ) : null}
          </div>
          {card && !loading ? (
            <div
              className="shrink-0 rounded-xl px-3 py-2 text-right text-white"
              style={{ backgroundColor: "#2b292c" }}
            >
              <p className="font-vodafone-lt text-[10px] uppercase tracking-wide text-white/70">
                Bonus disponible
              </p>
              <p className="font-vodafone-exb text-lg leading-none text-white">
                {balance.toFixed(2)}{" "}
                <span className="text-sm font-vodafone-rg-bd">USD</span>
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vodacom-black/5 text-vodacom-black hover:bg-vodacom-black/10"
            aria-label="Fermer"
          >
            <LucideIcon icon={X} size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-vodacom-black/50">
              <LucideIcon icon={Loader2} size={32} className="animate-spin" />
              <p className="font-vodafone-lt text-sm">Chargement du marché…</p>
            </div>
          ) : !card ? (
            <NoCardState onRequestVisaCard={onRequestVisaCard} onClose={onClose} />
          ) : (
            <>
              {purchaseSuccess ? (
                <div
                  className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200/80"
                  role="status"
                >
                  <LucideIcon icon={Check} size={18} className="shrink-0" />
                  <span className="font-vodafone-rg-bd">
                    Achat enregistré — votre solde a été mis à jour.
                  </span>
                </div>
              ) : null}

              {card.blocked ? (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200/80">
                  <LucideIcon icon={AlertCircle} size={18} className="mt-0.5 shrink-0" />
                  <p className="font-vodafone-lt leading-snug">
                    Votre carte Visa M-Pesa est bloquée. Débloquez-la via le menu
                    USSD pour effectuer des achats.
                  </p>
                </div>
              ) : null}

              <p className="font-vodafone-lt text-sm text-vodacom-black/60">
                Utilisez votre bonus de {MPESA_VISA_WELCOME_BONUS_USD} USD (offert
                à la création de carte) pour commander sur place.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-1">
                {CARREFOUR_PRODUCTS.map((product) => {
                  const ui = getCarrefourProductUi(product.id);
                  const affordable = balance >= product.priceUsd;
                  const disabled = card.blocked || !affordable;

                  return (
                    <li key={product.id}>
                      <article
                        className={`overflow-hidden rounded-2xl ring-1 ${
                          disabled
                            ? "bg-vodacom-black/[0.02] ring-vodacom-silver/30 opacity-75"
                            : "bg-white ring-vodacom-silver/40 shadow-sm"
                        }`}
                      >
                        <div className="flex items-stretch">
                          {ui ? (
                            <div className="relative h-28 w-28 shrink-0 bg-vodacom-black/[0.04] sm:h-32 sm:w-32">
                              <Image
                                src={ui.image}
                                alt={product.name}
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 112px, 128px"
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
                            <h3 className="font-vodafone-exb text-base text-vodacom-black">
                              {product.name}
                            </h3>
                            {ui ? (
                              <p className="mt-0.5 font-vodafone-lt text-xs text-vodacom-black/55">
                                {ui.tagline}
                              </p>
                            ) : null}
                            <p className="mt-2 font-vodafone-exb text-xl text-vodacom-red">
                              {product.priceUsd} USD
                            </p>
                            {!affordable && !card.blocked ? (
                              <p className="mt-1 font-vodafone-lt text-xs text-amber-800">
                                Solde insuffisant ({balance.toFixed(2)} USD
                                disponibles)
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center pr-4">
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => {
                                setConfirmProductId(product.id);
                                setPurchaseSuccess(false);
                              }}
                              className="rounded-xl bg-vodacom-red px-4 py-2.5 font-vodafone-rg-bd text-sm text-white transition hover:bg-vodacom-red-dark disabled:cursor-not-allowed disabled:bg-vodacom-black/15 disabled:text-vodacom-black/40"
                            >
                              Acheter
                            </button>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>

              <section className="mt-8 border-t border-vodacom-silver/25 pt-6">
                <h3 className="flex items-center gap-2 font-vodafone-exb text-sm text-vodacom-black">
                  <LucideIcon icon={ShoppingBag} size={16} className="text-vodacom-red" />
                  Mes achats
                </h3>
                {experience && experience.purchases.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {experience.purchases.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-vodacom-black/[0.03] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-vodafone-rg-bd text-sm text-vodacom-black">
                            {p.productName}
                          </p>
                          <p className="font-vodafone-lt text-xs text-vodacom-black/45">
                            {formatPurchaseDate(p.createdAt)}
                          </p>
                        </div>
                        <span className="shrink-0 font-vodafone-exb text-sm text-vodacom-red">
                          −{p.priceUsd} USD
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 font-vodafone-lt text-sm text-vodacom-black/45">
                    Aucun achat pour le moment.
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        {confirmProduct && confirmUi && card ? (
          <div
            className="absolute inset-0 flex items-end justify-center bg-vodacom-black/40 p-4 sm:items-center"
            role="presentation"
            onClick={() => !purchasing && setConfirmProductId(null)}
          >
            <div
              role="dialog"
              aria-labelledby="carrefour-confirm-title"
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-vodacom-silver/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                id="carrefour-confirm-title"
                className="font-vodafone-exb text-lg text-vodacom-black"
              >
                Confirmer l&apos;achat
              </h3>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-vodacom-black/[0.03] p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-vodacom-silver/30">
                  <Image
                    src={confirmUi.image}
                    alt={confirmProduct.name}
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-vodafone-rg-bd text-sm text-vodacom-black">
                    {confirmProduct.name}
                  </p>
                  <p className="font-vodafone-exb text-vodacom-red">
                    {confirmProduct.priceUsd} USD
                  </p>
                </div>
              </div>
              <p className="mt-3 font-vodafone-lt text-sm text-vodacom-black/60">
                Solde après achat :{" "}
                <strong className="text-vodacom-black">
                  {(balance - confirmProduct.priceUsd).toFixed(2)} USD
                </strong>
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={purchasing}
                  onClick={() => setConfirmProductId(null)}
                  className="rounded-xl border border-vodacom-silver/40 py-2.5 font-vodafone-rg-bd text-sm text-vodacom-black hover:bg-vodacom-black/5 disabled:opacity-60"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={purchasing || card.blocked}
                  onClick={() => void handlePurchase()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-vodacom-red py-2.5 font-vodafone-rg-bd text-sm text-white hover:bg-vodacom-red-dark disabled:opacity-60"
                >
                  {purchasing ? (
                    <LucideIcon icon={Loader2} size={18} className="animate-spin" />
                  ) : null}
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
    <div className="flex flex-col items-center px-2 py-8 text-center sm:py-12">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vodacom-red/10 text-vodacom-red">
        <LucideIcon icon={CreditCard} size={32} />
      </span>
      <h3 className="mt-4 font-vodafone-exb text-lg text-vodacom-black">
        Carte Visa requise
      </h3>
      <p className="mt-2 max-w-sm font-vodafone-lt text-sm leading-relaxed text-vodacom-black/60">
        Créez votre Carte Visa M-Pesa pour recevoir{" "}
        <strong className="text-vodacom-black">
          {MPESA_VISA_WELCOME_BONUS_USD} USD
        </strong>{" "}
        de bonus Carrefour, puis revenez ici pour vos achats.
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        {onRequestVisaCard ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestVisaCard();
            }}
            className="w-full rounded-xl bg-vodacom-red py-3 font-vodafone-rg-bd text-sm text-white hover:bg-vodacom-red-dark"
          >
            Obtenir Carte Visa
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-vodacom-silver/40 py-2.5 font-vodafone-rg-bd text-sm text-vodacom-black hover:bg-vodacom-black/5"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
