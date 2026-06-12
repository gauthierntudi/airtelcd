"use client";

import { Loader2, Lock, Plane, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  fetchMpesaVisaState,
  isMpesaAuthError,
  peekMpesaVisaCache,
} from "@/lib/mpesa-visa/client";
import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import {
  formatExpiryInput,
  parseExpiryInput,
} from "@/lib/mpesa-visa/validate-payment";
import type {
  TravelerBilletOption,
  TravelerHotelOption,
} from "@/lib/traveler-journey";
import {
  computeTravelerBookingTotalUsd,
  formatTravelerPriceUsd,
  parseTravelerPriceUsd,
} from "@/lib/traveler-journey";

type Props = {
  open: boolean;
  billet: TravelerBilletOption;
  hotel: TravelerHotelOption;
  onClose: () => void;
  onComplete: () => void;
  onAuthRequired?: () => void;
};

function formatCardNumberInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function TravelerBookingRecapModal({
  open,
  billet,
  hotel,
  onClose,
  onComplete,
  onAuthRequired,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [experience, setExperience] = useState<MpesaVisaExperienceState | null>(
    null,
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const billetPrice = parseTravelerPriceUsd(billet.price);
  const hotelSubtotal = hotel.nights * hotel.pricePerNightUsd;
  const total = computeTravelerBookingTotalUsd(billet, hotel);
  const card = experience?.card;

  const expiryParsed = parseExpiryInput(expiry);
  const panDigits = cardNumber.replace(/\D/g, "");
  const canPay =
    Boolean(card) &&
    !card?.blocked &&
    panDigits.length === 16 &&
    Boolean(expiryParsed) &&
    cvv.length === 3 &&
    !paying;

  useEffect(() => setMounted(true), []);

  const loadState = useCallback(async () => {
    const cached = peekMpesaVisaCache();
    if (cached) {
      setExperience(cached);
      return;
    }
    setLoading(true);
    try {
      const state = await fetchMpesaVisaState();
      setExperience(state);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Session requise";
      if (isMpesaAuthError(message)) {
        onAuthRequired?.();
      } else {
        setPaymentError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [onAuthRequired]);

  useEffect(() => {
    if (!open) {
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setPaymentError(null);
      return;
    }
    void loadState();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, loadState]);

  async function handlePay() {
    if (!canPay || !expiryParsed) return;
    setPaying(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/traveler/booking-payment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment: {
            pan: panDigits,
            expiry,
            cvv,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          onAuthRequired?.();
          return;
        }
        throw new Error(data.error ?? "Paiement refusé");
      }
      onComplete();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Paiement refusé");
    } finally {
      setPaying(false);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[68] flex flex-col overflow-hidden font-vodafone-lt text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, #c40000 0%, #8b0000 42%, #1a1a1a 100%)",
        }}
        aria-hidden
      />
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.2em] text-white/55">
            Réservation
          </p>
          <h2 className="font-vodafone-exb text-lg sm:text-xl">
            Récapitulatif & paiement
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
          aria-label="Fermer"
        >
          <LucideIcon icon={X} size={18} />
        </button>
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto grid w-full max-w-lg gap-5">
          <section className="rounded-2xl border border-vodacom-silver/25 bg-white p-4 text-vodacom-black shadow-md">
            <div className="flex items-center gap-2">
              <LucideIcon icon={Plane} size={18} className="text-vodacom-red" />
              <h3 className="font-vodafone-rg-bd text-sm">Billet</h3>
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-vodacom-black/55">Trajet</dt>
                <dd className="text-right font-vodafone-rg-bd">
                  {billet.from} → {billet.to}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-vodacom-black/55">Date</dt>
                <dd>
                  {billet.date} · {billet.time}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-vodacom-black/55">Compagnie</dt>
                <dd>{billet.carrier}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-vodacom-silver/30 pt-2">
                <dt className="font-vodafone-rg-bd">Prix billet</dt>
                <dd className="font-vodafone-exb text-vodacom-red">
                  {formatTravelerPriceUsd(billetPrice)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-vodacom-silver/25 bg-white p-4 text-vodacom-black shadow-md">
            <div className="flex gap-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  fill
                  unoptimized
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-vodafone-rg-bd text-sm">Hôtel</h3>
                <p className="mt-1 font-vodafone-exb text-base leading-tight">
                  {hotel.name}
                </p>
                <p className="mt-0.5 text-xs text-vodacom-black/55">
                  {hotel.city} · {hotel.rating} · {hotel.nights} nuits
                </p>
              </div>
            </div>
            <dl className="mt-3 space-y-1.5 border-t border-vodacom-silver/30 pt-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-vodacom-black/55">
                  {formatTravelerPriceUsd(hotel.pricePerNightUsd)} / nuit
                </dt>
                <dd className="font-vodafone-rg-bd">
                  {formatTravelerPriceUsd(hotelSubtotal)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="font-vodafone-rg-bd">Total</span>
              <span className="font-vodafone-exb text-xl text-vodacom-red">
                {formatTravelerPriceUsd(total)}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-vodafone-rg-bd text-sm">Carte Visa M-Pesa</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/60">
              Saisissez les coordonnées reçues par SMS lors de l&apos;activation
              du forfait Privilège.
            </p>

            {loading ? (
              <div className="mt-6 flex justify-center py-8">
                <LucideIcon
                  icon={Loader2}
                  size={28}
                  className="animate-spin text-white/50"
                />
              </div>
            ) : !card ? (
              <p className="mt-4 rounded-xl bg-vodacom-red/15 px-3 py-2.5 text-sm text-white/90">
                Aucune Carte Visa M-Pesa active. Activez d&apos;abord votre
                forfait Privilège.
              </p>
            ) : (
              <>
                <div className="mt-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <p className="flex items-center gap-2 font-vodafone-rg-bd text-xs text-white/70">
                    <LucideIcon icon={Lock} size={14} />
                    Carte enregistrée : {card.cardMasked}
                  </p>
                </div>

                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canPay) void handlePay();
                  }}
                >
                  <label className="block">
                    <span className="text-xs text-white/70">
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
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 font-mono text-base tracking-wider text-white outline-none focus:border-vodacom-red/60 focus:ring-1 focus:ring-vodacom-red/40"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs text-white/70">Expiration</span>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiryInput(e.target.value))
                        }
                        placeholder="MM/AA"
                        maxLength={5}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 font-mono text-base text-white outline-none focus:border-vodacom-red/60 focus:ring-1 focus:ring-vodacom-red/40"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-white/70">CVV</span>
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
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 font-mono text-base text-white outline-none focus:border-vodacom-red/60 focus:ring-1 focus:ring-vodacom-red/40"
                      />
                    </label>
                  </div>

                  {paymentError ? (
                    <p className="rounded-xl border border-red-400/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                      {paymentError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canPay}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-vodafone-rg-bd text-base text-vodacom-red shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                  >
                    {paying ? (
                      <LucideIcon
                        icon={Loader2}
                        size={20}
                        className="animate-spin"
                      />
                    ) : (
                      <LucideIcon icon={Lock} size={18} />
                    )}
                    {paying
                      ? "Traitement…"
                      : `Payer ${formatTravelerPriceUsd(total)}`}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
