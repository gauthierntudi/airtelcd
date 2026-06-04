import type { AgendaItem } from "@/lib/event-days";

/** Découpe « 08h00 – 09h00 » pour afficher un tiret typographique mis en forme */
function parseTimeRange(time: string): { start: string; end: string } | null {
  const match = time.match(/^(.+?)\s*[–-]\s*(.+)$/u);
  if (!match) return null;
  return { start: match[1].trim(), end: match[2].trim() };
}

/** Pastilles numérotation — une couleur par étape (sheet + desktop) */
const STEP_BADGE_COLORS = [
  "#f70118",
  "#e85d04",
  "#0d9488",
  "#7c3aed",
  "#0284c7",
  "#db2777",
] as const;

function AgendaCompactTime({
  time,
  tone,
}: {
  time: string;
  tone: "light" | "dark";
}) {
  const range = parseTimeRange(time);
  const timeClass = "font-vodafone-rg-bd text-sm tabular-nums text-vodacom-red";
  const dashClass = tone === "dark" ? "text-white/50" : "text-vodacom-black/35";

  if (!range) {
    return <span className={timeClass}>{time}</span>;
  }

  return (
    <span className="inline-flex items-baseline gap-x-1.5 text-sm tabular-nums leading-snug">
      <span className={timeClass}>{range.start}</span>
      <span className={`font-vodafone-rg-bd ${dashClass}`}>-</span>
      <span className={timeClass}>{range.end}</span>
    </span>
  );
}

function AgendaSheetTime({ time }: { time: string }) {
  return <AgendaCompactTime time={time} tone="dark" />;
}

export function AgendaTimeRange({
  time,
  variant = "mobile",
  className = "",
}: {
  time: string;
  variant?: "mobile" | "desktop" | "sheet";
  className?: string;
}) {
  if (variant === "sheet" || variant === "desktop") {
    if (variant === "sheet") {
      return <AgendaSheetTime time={time} />;
    }
    return <AgendaCompactTime time={time} tone="light" />;
  }

  const range = parseTimeRange(time);
  const dashMuted = "text-white/50";

  if (!range) {
    return <span className={className}>{time}</span>;
  }

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums ${className}`}
    >
      <span>{range.start}</span>
      <span className="inline-flex items-center gap-1" aria-hidden>
        <span className="h-0.5 w-3 rounded-full bg-vodacom-red/80" />
        <span
          className={`min-w-[0.5rem] px-0.5 text-center text-sm font-semibold leading-none ${dashMuted}`}
        >
          –
        </span>
        <span className="h-0.5 w-3 rounded-full bg-vodacom-red/80" />
      </span>
      <span>{range.end}</span>
    </span>
  );
}

type AgendaListProps = {
  variant: "mobile" | "desktop" | "sheet";
  items: readonly AgendaItem[];
};

function StepBadge({
  index,
  variant,
}: {
  index: number;
  variant: "mobile" | "desktop" | "sheet";
}) {
  const color = STEP_BADGE_COLORS[index % STEP_BADGE_COLORS.length];
  const isSheet = variant === "sheet";
  const isDesktop = variant === "desktop";

  return (
    <span
      className={`relative z-[1] mt-0.5 flex shrink-0 items-center justify-center rounded-full font-vodafone-rg-bd text-white ${
        isSheet
          ? "h-9 w-9 text-sm font-normal shadow-md shadow-black/25"
          : isDesktop
            ? "h-9 w-9 text-sm font-normal shadow-sm"
            : "h-8 w-8 bg-vodacom-red text-xs font-bold shadow-md shadow-vodacom-red/25 ring-2 ring-vodacom-black/40"
      }`}
      style={isSheet || isDesktop ? { backgroundColor: color } : undefined}
    >
      {index + 1}
    </span>
  );
}

export function AgendaList({ variant, items }: AgendaListProps) {
  const isMobile = variant === "mobile";
  const isSheet = variant === "sheet";
  const isDesktop = variant === "desktop";
  const isDark = isMobile || isSheet;

  return (
    <ul
      className={
        isSheet
          ? "space-y-2 pb-2"
          : isDesktop
            ? "space-y-2"
            : isMobile
              ? "rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2"
              : "divide-y divide-vodacom-silver/20"
      }
    >
      {items.map((item, i) => (
        <li
          key={`${item.time}-${i}`}
          className={
            isSheet
              ? "relative flex gap-3.5 rounded-2xl bg-white/[0.06] px-3.5 py-3.5 ring-1 ring-white/8"
              : isDesktop
                ? "relative flex gap-4 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-vodacom-silver/20"
                : `relative flex gap-3 ${
                    isMobile ? "py-2.5 last:pb-1" : "py-3.5 first:pt-4 last:pb-4"
                  }`
          }
        >
          {isMobile && i < items.length - 1 && (
            <span
              className="absolute top-9 bottom-0 left-4 w-[2px] -translate-x-1/2 bg-gradient-to-b from-vodacom-red to-white/15"
              aria-hidden
            />
          )}

          <StepBadge index={i} variant={variant} />

          <div className={`min-w-0 flex-1 ${isSheet || isDesktop ? "" : "pt-0.5"}`}>
            <p
              className={
                isSheet || isDesktop
                  ? "leading-none"
                  : "font-vodafone-rg-bd text-xs font-normal text-vodacom-red"
              }
            >
              <AgendaTimeRange time={item.time} variant={variant} />
            </p>
            <p
              className={`${isSheet || isDesktop ? "mt-1" : "mt-1.5"} leading-snug ${
                isSheet
                  ? "font-vodafone-rg-bd text-[0.9375rem] font-normal text-white"
                  : isDesktop
                    ? "font-vodafone-rg-bd text-[0.9375rem] font-normal text-vodacom-black/90"
                    : isDark
                      ? "font-vodafone-lt text-[0.9375rem] text-white"
                      : "text-sm text-vodacom-black/85"
              }`}
            >
              {isSheet || isDesktop ? (
                item.label
              ) : (
                <span className="flex gap-2">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-vodacom-red"
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
