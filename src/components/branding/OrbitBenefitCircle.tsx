import {
  ORBIT_CIRCLE_PALETTE,
  type OrbitalBenefitCircle,
} from "@/lib/orbital-home";

const ORBIT_BENEFIT_SIZE = {
  md: "h-11 w-11 text-[7px] sm:h-14 sm:w-14 sm:text-[8px]",
  lg: "h-[3.25rem] w-[3.25rem] text-[7px] sm:h-16 sm:w-16 sm:text-[8px]",
} as const;

type Props = {
  circle: OrbitalBenefitCircle;
  size?: keyof typeof ORBIT_BENEFIT_SIZE;
  className?: string;
};

export function OrbitBenefitCircle({
  circle,
  size = "md",
  className = "",
}: Props) {
  const isWhite = circle.color === ORBIT_CIRCLE_PALETTE.white;
  const shadowColor = circle.gradient
    ? "#c4000066"
    : isWhite
      ? "rgba(0,0,0,0.22)"
      : `${circle.color ?? "#474b4e"}55`;

  return (
    <div
      data-benefit-circle
      className={`flex items-center justify-center rounded-full p-1 text-center font-vodafone-exb uppercase leading-tight tracking-[0.06em] shadow-md ${ORBIT_BENEFIT_SIZE[size]} ${
        isWhite ? "ring-2 ring-white/40" : "text-white ring-2 ring-white/60"
      } ${className}`}
      style={{
        color: circle.textColor ?? "#ffffff",
        background: circle.gradient
          ? `linear-gradient(135deg, ${circle.gradient[0]}, ${circle.gradient[1]})`
          : circle.color,
        boxShadow: `0 6px 18px ${shadowColor}`,
      }}
    >
      <span className="max-w-[92%]">{circle.label}</span>
    </div>
  );
}
