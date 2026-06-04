"use client";

import {
  CALENDAR_WEEKDAY_LABELS,
  EVENT_CALENDAR,
  buildEventMonthCalendarCells,
  formatInvitedDayLong,
  type EventDayId,
} from "@/lib/event-days";

type Props = {
  invitedDayIds: EventDayId[];
  selectedDayId?: EventDayId;
  onDayClick: (dayId: EventDayId) => void;
  variant?: "mobile" | "desktop";
  /** Admin / import : tous les jours 12–14 sont cliquables (sélection multiple) */
  selectableEventDays?: boolean;
};

export function InvitationEventMonthCalendar({
  invitedDayIds,
  selectedDayId,
  onDayClick,
  variant = "mobile",
  selectableEventDays = false,
}: Props) {
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const cells = buildEventMonthCalendarCells();
  const invitedSet = new Set(invitedDayIds);
  const isDark = isMobile || selectableEventDays;

  return (
    <div
      className={
        isDark
          ? "rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md"
          : "rounded-2xl border border-vodacom-silver/30 bg-white p-4"
      }
      role="group"
      aria-label={`Calendrier ${EVENT_CALENDAR.monthLabel}`}
    >
      <p
        className={
          isDark
            ? "mb-3 text-center font-vodafone-rg-bd text-sm text-white"
            : "mb-3 text-center font-vodafone-rg-bd text-sm text-vodacom-black"
        }
      >
        {EVENT_CALENDAR.monthLabel}
      </p>

      <div className="grid grid-cols-7 gap-1">
        {CALENDAR_WEEKDAY_LABELS.map((label, index) => (
          <div
            key={`weekday-${index}`}
            className={
              isDark
                ? "py-1 text-center font-vodafone-rg-bd text-[11px] font-normal uppercase leading-none text-white/55"
                : "py-1 text-center font-vodafone-rg-bd text-[11px] font-normal uppercase leading-none text-vodacom-black/60"
            }
          >
            {label}
          </div>
        ))}

        {cells.map((cell) => {
          if (cell.kind === "pad") {
            return <div key={cell.key} aria-hidden className="aspect-square" />;
          }

          const isEventSelectable =
            selectableEventDays && cell.isEventDay && cell.dayId !== null;
          const isInvited = cell.dayId !== null && invitedSet.has(cell.dayId);
          const isClickable = isInvited || isEventSelectable;
          const isSelected =
            isInvited && selectedDayId !== undefined && cell.dayId === selectedDayId;

          if (!isClickable) {
            return (
              <div
                key={cell.key}
                className="flex aspect-square items-center justify-center"
                aria-hidden={!cell.isEventDay}
              >
                <span
                  className={
                    isDark
                      ? "text-sm font-medium text-white"
                      : isDesktop && cell.isEventDay
                        ? "flex h-9 w-9 items-center justify-center rounded-full border border-vodacom-silver/45 font-vodafone-rg-bd text-sm text-vodacom-black/70"
                        : isDesktop
                          ? "font-vodafone-lt text-sm text-vodacom-black/50"
                          : cell.isEventDay
                            ? "text-sm text-vodacom-black/50"
                            : "text-sm text-vodacom-black/35"
                  }
                >
                  {cell.date}
                </span>
              </div>
            );
          }

          const circleClass = isSelected
            ? isDark
              ? "bg-white text-vodacom-red ring-2 ring-white/50 shadow-md"
              : "bg-vodacom-red text-white shadow-md shadow-vodacom-red/30 ring-2 ring-vodacom-red"
            : isInvited
              ? isDark
                ? "bg-vodacom-red text-white ring-2 ring-vodacom-red/60"
                : "bg-vodacom-red text-white ring-2 ring-vodacom-red/40"
              : isDark
                ? "border border-white/30 bg-white/10 text-white"
                : "border border-vodacom-silver/40 bg-vodacom-cream/80 font-vodafone-rg-bd text-vodacom-black/55";

          return (
            <div key={cell.key} className="flex aspect-square items-center justify-center">
              <button
                type="button"
                onClick={() => onDayClick(cell.dayId!)}
                aria-label={`Programme du ${formatInvitedDayLong(cell.dayId!)}`}
                aria-pressed={isSelected}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition active:scale-95 sm:h-10 sm:w-10 ${circleClass}`}
              >
                {cell.date}
              </button>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] ${
          isDark ? "text-white/50" : "text-vodacom-black/55"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-3 w-3 rounded-full ${isDark ? "bg-vodacom-red" : "bg-vodacom-red ring-1 ring-vodacom-red/40"}`}
          />
          {selectableEventDays ? "Sélectionné" : "Invité"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-3 w-3 rounded-full border ${isDark ? "border-white/40 bg-transparent" : "border-vodacom-silver/50 bg-vodacom-cream"}`}
          />
          Autre jour
        </span>
      </div>
    </div>
  );
}
