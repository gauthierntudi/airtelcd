"use client";

type PanelProps = {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
};

/** Carte dashboard — hauteur et en-tête uniformes */
export function AdminPanel({ title, description, badge, children }: PanelProps) {
  return (
    <section className="flex h-full min-h-[300px] flex-col rounded-2xl border border-white/10 bg-[#161616] p-5">
      <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <p className="mt-0.5 text-sm text-white/50">{description}</p>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

export function ProgressBar({
  segments,
}: {
  segments: { width: number; className: string; label: string }[];
}) {
  const hasData = segments.some((s) => s.width > 0);

  return (
    <div
      className="mb-5 flex h-3 shrink-0 overflow-hidden rounded-full bg-white/10"
      role="img"
      aria-label={segments.map((s) => `${s.label} ${s.width}%`).join(", ")}
    >
      {hasData ? (
        segments.map(
          (s) =>
            s.width > 0 && (
              <div
                key={s.label}
                className={`${s.className} transition-all`}
                style={{ width: `${s.width}%` }}
                title={`${s.label}: ${s.width}%`}
              />
            ),
        )
      ) : (
        <div className="h-full w-full bg-white/5" />
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  dotClass,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  dotClass?: string;
  highlight?: boolean;
}) {
  return (
    <li
      className={`flex flex-col rounded-xl border px-4 py-3.5 ${
        highlight
          ? "border-vodacom-red/30 bg-vodacom-red/10"
          : "border-white/10 bg-[#1f1f1f]"
      }`}
    >
      <div className="flex items-center gap-2">
        {dotClass && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />}
        <span className="text-xs font-medium text-white/55">{label}</span>
      </div>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums ${
          highlight ? "text-vodacom-red" : "text-white"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
    </li>
  );
}
