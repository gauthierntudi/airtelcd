"use client";

type EventOption = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type Props = {
  id?: string;
  value: string;
  events: EventOption[];
  onChange: (eventId: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function EventSelect({
  id,
  value,
  events,
  onChange,
  disabled,
  required,
  className,
}: Props) {
  return (
    <select
      id={id}
      required={required}
      disabled={disabled || events.length === 0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">
        {events.length === 0 ? "Créez d’abord un événement" : "Choisir un événement"}
      </option>
      {events.map((event) => (
        <option key={event.id} value={event.id}>
          {event.name} — {formatPeriod(event.startDate, event.endDate)}
        </option>
      ))}
    </select>
  );
}

function formatPeriod(start: string, end: string) {
  const a = formatDate(start);
  const b = formatDate(end);
  return a === b ? a : `${a} – ${b}`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
