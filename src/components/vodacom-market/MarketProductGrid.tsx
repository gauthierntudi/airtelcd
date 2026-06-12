"use client";

import { ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { getCarrefourProductUi } from "@/lib/mpesa-visa/carrefour-products-ui";
import {
  CARREFOUR_PRODUCTS,
  getCarrefourProductsBySection,
  MARKET_MENU_SECTIONS,
  type CarrefourProductId,
  type MarketMenuSection,
} from "@/lib/mpesa-visa/constants";

type Props = {
  balance: number;
  cardBlocked: boolean;
  onBuy: (productId: CarrefourProductId) => void;
};

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="inline-flex items-center gap-0.5 text-[#FFA41C]">
        {Array.from({ length: 5 }).map((_, i) => (
          <LucideIcon
            key={i}
            icon={Star}
            size={11}
            className={
              i < Math.floor(rating)
                ? "fill-[#FFA41C] text-[#FFA41C]"
                : "text-[#FFA41C]/30"
            }
          />
        ))}
      </span>
      <span className="font-vodafone-lt text-[11px] text-vodacom-black/45">
        {rating.toFixed(1)} · {reviewCount} avis
      </span>
    </div>
  );
}

function MarketProductCard({
  productId,
  name,
  priceUsd,
  balance,
  cardBlocked,
  onBuy,
}: {
  productId: CarrefourProductId;
  name: string;
  priceUsd: number;
  balance: number;
  cardBlocked: boolean;
  onBuy: (productId: CarrefourProductId) => void;
}) {
  const ui = getCarrefourProductUi(productId);
  const affordable = balance >= priceUsd;
  const disabled = cardBlocked || !affordable;

  return (
    <li className="min-w-0">
      <article
        className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-vodacom-silver/20 transition duration-300 ${
          disabled
            ? "opacity-[0.92]"
            : "hover:-translate-y-0.5 hover:ring-vodacom-red/20"
        }`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-vodacom-cream/40">
          {ui ? (
            <Image
              src={ui.image}
              alt={name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain p-4 shadow-none transition duration-500 ${
                disabled ? "grayscale-[0.35]" : "group-hover:scale-[1.03]"
              }`}
            />
          ) : null}

          <span className="absolute left-2.5 top-2.5 flex h-11 w-11 flex-col items-center justify-center rounded-full bg-vodacom-red text-white sm:h-12 sm:w-12">
            <span className="font-vodafone-exb text-sm leading-none sm:text-[0.95rem]">
              {priceUsd}
            </span>
            <span className="mt-0.5 font-vodafone-rg-bd text-[8px] uppercase leading-none tracking-wide sm:text-[9px]">
              USD
            </span>
          </span>

          {!affordable && !cardBlocked ? (
            <span className="absolute right-2.5 top-2.5 max-w-[46%] rounded-lg bg-vodacom-black/75 px-2 py-1 text-right font-vodafone-lt text-[10px] leading-tight text-white backdrop-blur-sm">
              Solde insuffisant
            </span>
          ) : null}

          {cardBlocked ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/55 px-3 text-center font-vodafone-rg-bd text-xs text-vodacom-black/70 backdrop-blur-[2px]">
              Carte bloquée
            </span>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3.5 pt-3 sm:p-4">
          {ui?.tagline ? (
            <p className="line-clamp-1 font-vodafone-lt text-[10px] uppercase tracking-[0.14em] text-vodacom-red/80">
              {ui.tagline}
            </p>
          ) : null}

          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] font-vodafone-rg-bd text-[13px] leading-snug text-vodacom-black sm:min-h-[2.75rem] sm:text-sm">
            {name}
          </h3>

          {ui ? (
            <div className="mt-2">
              <StarRating rating={ui.rating} reviewCount={ui.reviewCount} />
            </div>
          ) : null}

          <div className="mt-auto pt-3">
            {!affordable && !cardBlocked ? (
              <p className="mb-2 text-center font-vodafone-lt text-[11px] text-vodacom-black/50">
                Disponible : {balance.toFixed(2)} USD
              </p>
            ) : null}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onBuy(productId)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-2.5 font-vodafone-rg-bd text-sm text-white transition hover:bg-[#c40000] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-vodacom-silver/35 disabled:text-vodacom-black/40 disabled:active:scale-100"
            >
              <LucideIcon icon={ShoppingBag} size={16} />
              Acheter
            </button>
          </div>
        </div>
      </article>
    </li>
  );
}

function ProductSection({
  sectionId,
  label,
  balance,
  cardBlocked,
  onBuy,
}: {
  sectionId: MarketMenuSection;
  label: string;
  balance: number;
  cardBlocked: boolean;
  onBuy: (productId: CarrefourProductId) => void;
}) {
  const products = getCarrefourProductsBySection(sectionId);
  if (products.length === 0) return null;

  return (
    <div className="mt-6 first:mt-0">
      <h4 className="font-vodafone-exb text-base text-vodacom-black sm:text-lg">
        {label}
      </h4>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
        {products.map((product) => (
          <MarketProductCard
            key={product.id}
            productId={product.id}
            name={product.name}
            priceUsd={product.priceUsd}
            balance={balance}
            cardBlocked={cardBlocked}
            onBuy={onBuy}
          />
        ))}
      </ul>
    </div>
  );
}

export function MarketProductGrid({ balance, cardBlocked, onBuy }: Props) {
  return (
    <section className="mt-6" aria-labelledby="market-catalog-title">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3
            id="market-catalog-title"
            className="font-vodafone-exb text-lg text-vodacom-black sm:text-xl"
          >
            Menu cocktail & boutique
          </h3>
          <p className="mt-0.5 font-vodafone-lt text-sm text-vodacom-black/55">
            {CARREFOUR_PRODUCTS.length} articles · bonus Carte Visa M-Pesa
          </p>
        </div>
        <p className="shrink-0 rounded-full bg-white px-3 py-1.5 font-vodafone-rg-bd text-xs text-vodacom-black ring-1 ring-vodacom-silver/30">
          Solde {balance.toFixed(2)} USD
        </p>
      </div>

      {MARKET_MENU_SECTIONS.map((section) => (
        <ProductSection
          key={section.id}
          sectionId={section.id}
          label={section.label}
          balance={balance}
          cardBlocked={cardBlocked}
          onBuy={onBuy}
        />
      ))}
    </section>
  );
}
