"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AgendaList } from "@/components/invitation/AgendaList";
import { InvitationEventMonthCalendar } from "@/components/invitation/InvitationEventMonthCalendar";
import { InvitationProgrammeDayModal } from "@/components/invitation/InvitationProgrammeDayModal";
import {
  formatInvitedDayLong,
  getAgendaForDay,
  type EventDayId,
} from "@/lib/event-days";
import { sortEventDayIds } from "@/lib/parse-event-day";

type Props = {
  invitedDayIds: EventDayId[];
  variant?: "mobile" | "desktop";
  /** Agenda sous le calendrier (desktop) */
  showAgenda?: boolean;
  /** Mobile slide Programme : bottom sheet au clic sur une date marquée */
  openProgrammeInModal?: boolean;
};

export function InvitationEventDayCalendar({
  invitedDayIds,
  variant = "mobile",
  showAgenda = false,
  openProgrammeInModal = false,
}: Props) {
  const isMobile = variant === "mobile";
  const useSheet = isMobile && openProgrammeInModal;
  const invited = sortEventDayIds(invitedDayIds);
  const [selectedDayId, setSelectedDayId] = useState<EventDayId>(invited[0]);
  const [sheetDayId, setSheetDayId] = useState<EventDayId | null>(null);

  useEffect(() => {
    if (!invited.includes(selectedDayId)) {
      setSelectedDayId(invited[0]);
    }
  }, [invited, selectedDayId]);

  const multiDay = invited.length > 1;
  const showInlineAgenda = showAgenda && !useSheet;
  const agenda = showInlineAgenda ? getAgendaForDay(selectedDayId) : null;

  function handleDayClick(dayId: EventDayId) {
    if (useSheet) {
      setSheetDayId(dayId);
      return;
    }
    setSelectedDayId(dayId);
  }

  return (
    <>
      <div className="space-y-3">
        <p
          className={
            isMobile
              ? "text-[11px] font-bold uppercase tracking-[0.18em] text-white/55"
              : "text-xs font-bold uppercase tracking-wider text-vodacom-black/45"
          }
        >
          {multiDay ? "Vos jours d'invitation" : "Votre jour d'invitation"}
        </p>

        <InvitationEventMonthCalendar
          invitedDayIds={invited}
          selectedDayId={useSheet ? undefined : selectedDayId}
          onDayClick={handleDayClick}
          variant={variant}
        />

        <p
          className={
            isMobile
              ? "font-vodafone-lt text-sm leading-snug text-white/85"
              : "text-sm text-vodacom-black/70"
          }
        >
          {useSheet ? (
            <>
              Touchez une date{" "}
              <span className="font-vodafone-rg-bd text-vodacom-red">rouge</span> pour
              ouvrir le programme
            </>
          ) : (
            <>
              Programme du{" "}
              <span className={isMobile ? "font-vodafone-rg-bd text-white" : "font-semibold"}>
                {formatInvitedDayLong(selectedDayId)}
              </span>
              {multiDay && (
                <span className={isMobile ? "text-white/60" : "text-vodacom-black/50"}>
                  {" "}
                  — sélectionnez un autre jour invité
                </span>
              )}
            </>
          )}
        </p>

        {agenda && (
          <div className="space-y-2">
            <p
              className={
                isMobile
                  ? "font-vodafone-rg-bd text-xs uppercase tracking-wide text-white/45"
                  : "font-vodafone-rg-bd text-xs uppercase tracking-wide text-vodacom-black/45"
              }
            >
              {agenda.length} étape{agenda.length > 1 ? "s" : ""}
            </p>
            <AgendaList variant={variant} items={agenda} />
          </div>
        )}
      </div>

      {sheetDayId &&
        typeof document !== "undefined" &&
        createPortal(
          <InvitationProgrammeDayModal
            dayId={sheetDayId}
            onClose={() => setSheetDayId(null)}
          />,
          document.body,
        )}
    </>
  );
}
