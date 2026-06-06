import type { EventDayProgramme } from "@/lib/event-programmes";

type Props = {
  programme: EventDayProgramme;
  variant: "mobile" | "desktop" | "sheet";
};

export function ProgrammeDayContent({ programme, variant }: Props) {
  const isSheet = variant === "sheet";
  const isDesktop = variant === "desktop";
  const isDark = variant === "mobile" || isSheet;

  const titleClass = isSheet
    ? "font-vodafone-exb text-xl leading-tight text-white"
    : isDesktop
      ? "font-vodafone-exb text-lg leading-tight text-vodacom-black"
      : "font-vodafone-exb text-lg leading-tight text-white";

  const subtitleClass = isDark
    ? "font-vodafone-rg-bd text-base text-vodacom-red"
    : "font-vodafone-rg-bd text-base text-vodacom-red";

  const bodyClass = isDark
    ? "font-vodafone-lt text-[0.9375rem] leading-relaxed text-white/85"
    : "font-vodafone-lt text-sm leading-relaxed text-vodacom-black/80";

  const sectionLabelClass = isDark
    ? "font-vodafone-rg-bd text-xs uppercase tracking-wide text-white/45"
    : "font-vodafone-rg-bd text-xs uppercase tracking-wide text-vodacom-black/45";

  const listItemClass = isSheet
    ? "rounded-xl bg-white/[0.06] px-3.5 py-3 ring-1 ring-white/8"
    : isDesktop
      ? "rounded-xl bg-white px-3.5 py-3 shadow-sm ring-1 ring-vodacom-silver/20"
      : "py-1";

  const bulletTextClass = isDark
    ? "font-vodafone-lt text-[0.9375rem] leading-snug text-white"
    : "text-sm leading-snug text-vodacom-black/85";

  return (
    <div className={isSheet ? "space-y-4 pb-2" : "space-y-3"}>
      <div className="space-y-1">
        <h3 className={titleClass}>{programme.title}</h3>
        <p className={subtitleClass}>{programme.subtitle}</p>
      </div>

      <p className={bodyClass}>{programme.description}</p>

      <div className="space-y-2">
        <p className={sectionLabelClass}>Expériences mises en avant</p>
        <ul className={isSheet || isDesktop ? "space-y-2" : "space-y-1.5 pl-0"}>
          {programme.experiences.map((item) => (
            <li key={item} className={listItemClass}>
              <span className="flex gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-vodacom-red"
                  aria-hidden
                />
                <span className={bulletTextClass}>{item}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
