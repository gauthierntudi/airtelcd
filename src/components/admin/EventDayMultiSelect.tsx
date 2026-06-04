"use client";

import { InvitationEventMonthCalendar } from "@/components/invitation/InvitationEventMonthCalendar";
import {
  DEFAULT_EVENT_DAY_ID,
  formatInvitedDaysLong,
  type EventDayId,
} from "@/lib/event-days";
import { sortEventDayIds } from "@/lib/parse-event-day";

type Props = {
  value: EventDayId[];
  onChange: (value: EventDayId[]) => void;
};

export function EventDayMultiSelect({ value, onChange }: Props) {
  const sorted = sortEventDayIds(value);

  function toggle(dayId: EventDayId) {
    if (sorted.includes(dayId)) {
      if (sorted.length <= 1) return;
      onChange(sorted.filter((id) => id !== dayId));
    } else {
      onChange(sortEventDayIds([...sorted, dayId]));
    }
  }

  return (
    <div className="space-y-2">
      <InvitationEventMonthCalendar
        invitedDayIds={sorted}
        onDayClick={toggle}
        variant="mobile"
        selectableEventDays
      />
      <p className="text-xs text-white/50">
        {formatInvitedDaysLong(sorted)} — au moins 1 jour (12, 13 ou 14)
      </p>
    </div>
  );
}

export { DEFAULT_EVENT_DAY_ID };
