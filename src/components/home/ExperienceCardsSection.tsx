"use client";

import { Lock } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { fetchInvitationSessionRedirect } from "@/lib/invitation-access/client-session";
import {
  fetchMpesaVisaState,
  peekMpesaVisaCache,
} from "@/lib/mpesa-visa/client";
import type { MpesaVisaExperienceState } from "@/lib/mpesa-visa/service";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { InvitationAccessModal } from "@/components/home/InvitationAccessModal";
import { VodacomMarketModal } from "@/components/vodacom-market/VodacomMarketModal";
import { MpesaVisaUssdModal } from "@/components/home/MpesaVisaUssdModal";
import { PLATFORM_MODULE_ICONS } from "@/lib/invitation-assets";
import { MPESA_VISA_WELCOME_BONUS_USD, VODACOM_MARKET_NAME } from "@/lib/mpesa-visa/constants";

type ModuleId = "invitation" | "mpesa" | "market" | "privilege" | "games";

const MODULES: {
  id: ModuleId;
  image: string;
  title: string;
  status: "Disponible" | "À venir";
  description: string;
  available: boolean;
  accessEnabled: boolean;
  accessLabel: string;
  background: string;
  light?: boolean;
}[] = [
  {
    id: "invitation",
    image: PLATFORM_MODULE_ICONS.invitation,
    title: "Invitation",
    status: "Disponible",
    description:
      "Invitation personnalisée par lien sécurisé, RSVP, QR code, calendrier et itinéraire.",
    available: true,
    accessEnabled: true,
    accessLabel: "Accéder à mon invitation",
    background: "linear-gradient(180deg, #850001 0%, #e60000 100%)",
  },
  {
    id: "mpesa",
    image: PLATFORM_MODULE_ICONS.mpesa,
    title: "Carte Visa M-pesa",
    status: "Disponible",
    description:
      "Parcours USSD interactif : création de carte, consultation, historique et assistance.",
    available: true,
    accessEnabled: true,
    accessLabel: "Obtenir Carte Visa",
    background: "#2b292c",
  },
  {
    id: "market",
    image: PLATFORM_MODULE_ICONS.market,
    title: VODACOM_MARKET_NAME,
    status: "Disponible",
    description: `Dépensez votre bonus ${MPESA_VISA_WELCOME_BONUS_USD} USD : spiritueux, accessoires tech et plus.`,
    available: true,
    accessEnabled: true,
    accessLabel: "Accéder au marché",
    background: "#ffffff",
    light: true,
  },
  {
    id: "privilege",
    image: PLATFORM_MODULE_ICONS.forfait,
    title: "Vodacom Privilege",
    status: "À venir",
    description: "Parcours et privilèges réservés aux membres Vodacom Privilege.",
    available: false,
    accessEnabled: false,
    accessLabel: "",
    background: "#e60000",
  },
  {
    id: "games",
    image: PLATFORM_MODULE_ICONS.games,
    title: "Jeux enfants",
    status: "À venir",
    description: "Coloriage, quiz éducatif et jeu de mémoire sur place.",
    available: false,
    accessEnabled: false,
    accessLabel: "",
    background: "#474b4e",
  },
];

export function ExperienceCardsSection() {
  const [accessOpen, setAccessOpen] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [mpesaExperience, setMpesaExperience] =
    useState<MpesaVisaExperienceState | null>(null);

  /** Précharge carte + bonus en arrière-plan si l'invité est déjà connecté (OTP). */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (peekMpesaVisaCache()) return;
      const redirectPath = await fetchInvitationSessionRedirect();
      if (!redirectPath || cancelled) return;
      try {
        await fetchMpesaVisaState();
      } catch {
        /* session expirée ou DB — ignoré */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openInvitationAccess = useCallback(async () => {
    setSessionLoading(true);
    try {
      const redirectPath = await fetchInvitationSessionRedirect();
      if (redirectPath) {
        window.location.href = redirectPath;
        return;
      }
      setAccessOpen(true);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const openMpesaExperience = useCallback(() => {
    setMpesaExperience(peekMpesaVisaCache());
    setMpesaOpen(true);
  }, []);

  const openMarketExperience = useCallback(() => {
    setMarketOpen(true);
  }, []);

  return (
    <>
      <p className="mt-3 font-vodafone-lt text-xs text-vodacom-black/45 sm:hidden">
        Glissez pour parcourir les expériences →
      </p>

      <ul className="mt-4 flex items-stretch gap-3 overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory sm:mt-8 sm:grid sm:grid-cols-2 sm:items-stretch sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {MODULES.map((mod) => (
          <ModuleCard
            key={mod.id}
            {...mod}
            onAccess={
              mod.accessEnabled
                ? mod.id === "invitation"
                  ? openInvitationAccess
                  : mod.id === "mpesa"
                    ? openMpesaExperience
                    : mod.id === "market"
                      ? openMarketExperience
                      : undefined
                : undefined
            }
            accessLoading={
              mod.id === "invitation" && mod.accessEnabled ? sessionLoading : false
            }
          />
        ))}
      </ul>

      <InvitationAccessModal open={accessOpen} onClose={() => setAccessOpen(false)} />
      <MpesaVisaUssdModal
        open={mpesaOpen}
        initialExperience={mpesaExperience}
        onClose={() => {
          setMpesaOpen(false);
          setMpesaExperience(null);
        }}
        onAuthRequired={() => {
          setMpesaOpen(false);
          setMpesaExperience(null);
          setAccessOpen(true);
        }}
      />
      <VodacomMarketModal
        open={marketOpen}
        onClose={() => setMarketOpen(false)}
        onAuthRequired={() => {
          setMarketOpen(false);
          setAccessOpen(true);
        }}
        onRequestVisaCard={() => {
          setMarketOpen(false);
          openMpesaExperience();
        }}
      />
    </>
  );
}

function ModuleCard({
  image,
  title,
  status,
  description,
  available,
  background,
  light = false,
  accessLabel,
  onAccess,
  accessLoading = false,
}: (typeof MODULES)[number] & {
  onAccess?: () => void;
  accessLoading?: boolean;
}) {
  const cardClassName = `flex h-full w-[min(82vw,17.5rem)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl shadow-md transition sm:w-full sm:shrink ${
    light ? "text-vodacom-black ring-1 ring-vodacom-silver/25" : "text-white"
  } ${onAccess ? "cursor-pointer text-left active:scale-[0.98] sm:hover:shadow-lg" : ""} ${
    available ? "" : "opacity-[0.97]"
  }`;

  const content = (
    <>
      <div className="relative flex h-28 shrink-0 items-center justify-center px-3 sm:h-32 sm:px-4">
        <StatusBadge
          status={status}
          onDark={!light}
          className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3"
        />
        <Image
          src={image}
          alt={title}
          width={220}
          height={140}
          unoptimized
          className={`h-20 w-auto max-w-full object-contain sm:h-24 ${
            available ? "" : "opacity-90"
          }`}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <h3
          className={`font-vodafone-exb text-base font-normal leading-tight sm:text-lg ${
            light ? "text-vodacom-black" : "text-white"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-1.5 flex-1 font-vodafone-lt text-[13px] leading-snug sm:mt-2 sm:text-sm sm:leading-relaxed ${
            light ? "text-vodacom-black/65" : "text-white/75"
          }`}
        >
          {description}
        </p>
        <div className="mt-auto min-h-[2.75rem] pt-3 sm:pt-4">
          {available && onAccess ? (
            <span
              className={`inline-flex w-full items-center justify-center rounded-xl py-2.5 font-vodafone-rg-bd text-sm ${
                light
                  ? "bg-vodacom-red text-white ring-1 ring-vodacom-red/20"
                  : "bg-white/15 text-white ring-1 ring-white/20"
              }`}
            >
              {accessLoading ? "Ouverture…" : accessLabel}
            </span>
          ) : available ? (
            <p
              className={`font-vodafone-lt text-[11px] leading-snug sm:text-xs ${
                light ? "text-vodacom-black/50" : "text-white/55"
              }`}
            >
              Accès via le lien reçu par e-mail ou WhatsApp.
            </p>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 font-vodafone-lt text-[11px] sm:text-xs ${
                light ? "text-vodacom-black/45" : "text-white/50"
              }`}
            >
              <LucideIcon icon={Lock} size={13} />
              Bientôt disponible
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (onAccess) {
    return (
      <li className="flex shrink-0 snap-center sm:h-full sm:min-h-0 sm:shrink">
        <button
          type="button"
          onClick={onAccess}
          disabled={accessLoading}
          style={{ background }}
          className={`${cardClassName} disabled:opacity-80`}
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li className="flex shrink-0 snap-center sm:h-full sm:min-h-0 sm:shrink">
      <div style={{ background }} className={cardClassName}>
        {content}
      </div>
    </li>
  );
}

function StatusBadge({
  status,
  className = "",
  onDark = false,
}: {
  status: "Disponible" | "À venir";
  className?: string;
  onDark?: boolean;
}) {
  const isLive = status === "Disponible";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:px-2.5 sm:py-1 sm:text-[10px] ${
        onDark
          ? isLive
            ? "bg-white text-emerald-800 ring-1 ring-white/30"
            : "bg-white/15 text-white/80 ring-1 ring-white/20"
          : isLive
            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
            : "bg-white/90 text-vodacom-black/50 ring-1 ring-vodacom-silver/30"
      } ${className}`}
    >
      {status}
    </span>
  );
}
