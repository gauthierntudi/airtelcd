"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { VODACOM_MARKET_NAME } from "@/lib/mpesa-visa/constants";

export type MarketCompletedPurchase = {
  productName: string;
  priceUsd: number;
  newBalanceUsd: number;
  productImage?: string;
};

type Props = MarketCompletedPurchase & {
  onFinish: () => void;
  finishing?: boolean;
};

export function MarketPurchaseSuccessScreen({
  productName,
  priceUsd,
  newBalanceUsd,
  productImage,
  onFinish,
  finishing = false,
}: Props) {
  return (
    <div
      className="market-purchase-success-enter absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[linear-gradient(160deg,#0a0a0a_0%,#1a1a1a_42%,#2b1212_100%)] px-4 py-8"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(230,0,0,0.45), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(16,185,129,0.2), transparent 50%)",
        }}
      />

      <div className="market-purchase-success-card relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
        <div className="bg-[linear-gradient(135deg,#e60000_0%,#b30000_100%)] px-6 pb-14 pt-8 text-center text-white">
          <p className="font-vodafone-rg-bd text-[10px] uppercase tracking-[0.22em] text-white/75">
            {VODACOM_MARKET_NAME}
          </p>
          <div className="market-purchase-success-check mx-auto mt-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white text-emerald-600 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
            <LucideIcon icon={Check} size={40} strokeWidth={2.5} />
          </div>
        </div>

        <div className="-mt-9 px-6 pb-6 pt-0">
          {productImage ? (
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl bg-vodacom-cream shadow-lg ring-4 ring-white">
              <Image
                src={productImage}
                alt={productName}
                fill
                unoptimized
                sizes="112px"
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl bg-vodacom-cream shadow-lg ring-4 ring-white">
              <LucideIcon icon={Sparkles} size={36} className="text-vodacom-red/70" />
            </div>
          )}

          <h3 className="mt-5 text-center font-vodafone-exb text-2xl leading-tight text-vodacom-black">
            Paiement réussi
          </h3>
          <p className="mt-2 text-center font-vodafone-lt text-sm leading-relaxed text-vodacom-black/60">
            Votre commande est confirmée. Vous pouvez terminer votre parcours
            M-pesa Mall.
          </p>

          <dl className="mt-6 space-y-3 rounded-2xl bg-vodacom-cream/80 p-4 ring-1 ring-vodacom-silver/25">
            <div className="flex items-start justify-between gap-3">
              <dt className="font-vodafone-lt text-sm text-vodacom-black/55">
                Article
              </dt>
              <dd className="max-w-[58%] text-right font-vodafone-rg-bd text-sm text-vodacom-black">
                {productName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-vodacom-silver/30 pt-3">
              <dt className="font-vodafone-lt text-sm text-vodacom-black/55">
                Montant débité
              </dt>
              <dd className="font-vodafone-exb text-lg text-vodacom-red">
                {priceUsd.toFixed(2)}{" "}
                <span className="text-xs font-vodafone-rg-bd">USD</span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-vodacom-silver/30 pt-3">
              <dt className="font-vodafone-lt text-sm text-vodacom-black/55">
                Solde bonus restant
              </dt>
              <dd className="font-vodafone-exb text-base text-emerald-700">
                {newBalanceUsd.toFixed(2)}{" "}
                <span className="text-xs font-vodafone-rg-bd">USD</span>
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onFinish}
            disabled={finishing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-vodacom-red py-3.5 font-vodafone-rg-bd text-base text-white shadow-lg transition active:scale-[0.98] hover:bg-[#c40000] disabled:opacity-60"
          >
            {finishing ? (
              <LucideIcon icon={Loader2} size={20} className="animate-spin" />
            ) : null}
            {finishing ? "Fermeture…" : "Terminer"}
          </button>
        </div>
      </div>
    </div>
  );
}
