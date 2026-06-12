"use client";

/** Rayons décor — plus grands que l’orbite forfait standard */
const DECOR_INNER_ORBIT_RADIUS = 46;
const DECOR_OUTER_ORBIT_RADIUS = 64;

/** Anneaux orbitaux — décoration uniquement (les 4 cercles forfait restent à gauche). */
export function TravelerConversionOrbitDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden
    >
      <div className="relative aspect-square w-[min(100vw,32rem)] opacity-30 sm:w-[min(98vw,38rem)] sm:opacity-35">
        <OrbitRing diameterPercent={DECOR_OUTER_ORBIT_RADIUS * 2} />
        <OrbitRing
          diameterPercent={DECOR_INNER_ORBIT_RADIUS * 2}
          dashed
        />
      </div>
    </div>
  );
}

function OrbitRing({
  diameterPercent,
  dashed = false,
}: {
  diameterPercent: number;
  dashed?: boolean;
}) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] ${
        dashed ? "border-white/12" : "border-white/20"
      }`}
      style={{
        width: `${diameterPercent}%`,
        height: `${diameterPercent}%`,
        borderStyle: dashed ? "dashed" : "solid",
      }}
    />
  );
}
