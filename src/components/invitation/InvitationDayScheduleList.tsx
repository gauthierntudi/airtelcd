import { Clock } from "lucide-react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { formatInvitedDayLong, type EventDayId } from "@/lib/event-days";
import { getEventDayInvitationTimeRange } from "@/lib/invitation-time-range";
import { sortEventDayIds } from "@/lib/parse-event-day";

type Props = {
  dayIds: EventDayId[];
};

/** Date + horaire par jour — slide Date & horaires (mobile). */
export function InvitationDayScheduleList({ dayIds }: Props) {
  const sorted = sortEventDayIds(dayIds);

  return (
    <ul className="space-y-2.5">
      {sorted.map((dayId) => (
        <li
          key={dayId}
          className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 backdrop-blur-sm"
        >
          <p className="font-vodafone-rg-bd text-[1.35rem] leading-snug text-white">
            {formatInvitedDayLong(dayId)}
          </p>
          <p className="mt-1.5 flex items-center gap-2 font-vodafone-lt text-lg leading-snug text-white/90">
            <LucideIcon
              icon={Clock}
              size={18}
              className="shrink-0 text-white/75"
              aria-hidden
            />
            <span>{getEventDayInvitationTimeRange(dayId)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
