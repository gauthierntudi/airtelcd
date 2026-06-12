export type FinishCircleKind = "purchased" | "privilege";

export type FinishCircleDef = {
  id: string;
  kind: FinishCircleKind;
  sizePx: number;
};

export type PlacedFinishCircle = FinishCircleDef & {
  x: number;
  y: number;
  zIndex: number;
};

const STACK_GAP_PX = 4;

export function circlesHorizontallyOverlap(
  x1: number,
  size1: number,
  x2: number,
  size2: number,
): boolean {
  const minDist = (size1 + size2) / 2 - 2;
  return Math.abs(x1 - x2) < minDist;
}

/** Y du bord supérieur : pose au sol ou sur le support le plus haut sous cette position. */
export function resolveLandingY(
  x: number,
  size: number,
  others: PlacedFinishCircle[],
  floorY: number,
  excludeId?: string,
): number {
  const peers = others.filter((c) => c.id !== excludeId);
  let landingY = floorY - size;

  for (const other of peers) {
    if (!circlesHorizontallyOverlap(x, size, other.x, other.sizePx)) continue;
    const onTop = other.y - size - STACK_GAP_PX;
    landingY = Math.min(landingY, onTop);
  }

  return landingY;
}

export function clampCenterX(
  x: number,
  size: number,
  playWidth: number,
): number {
  const half = size / 2;
  return Math.max(half + 8, Math.min(playWidth - half - 8, x));
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Recalcule toute la pile : chaque cercle repose sur le sol ou sur un cercle déjà stabilisé. */
export function reconcileAllCircles(
  circles: PlacedFinishCircle[],
  floorY: number,
  playWidth: number,
  pinnedIds: ReadonlySet<string> = new Set(),
): PlacedFinishCircle[] {
  const pinned = circles.filter((c) => pinnedIds.has(c.id));
  const waitingDrop = circles.filter((c) => !pinnedIds.has(c.id) && c.y < 0);
  const mobile = circles.filter((c) => !pinnedIds.has(c.id) && c.y >= 0);

  const sorted = [...mobile].sort((a, b) => b.y - a.y);
  const placed: PlacedFinishCircle[] = [];

  for (const circle of sorted) {
    const x = clampCenterX(circle.x, circle.sizePx, playWidth);
    const y = resolveLandingY(x, circle.sizePx, placed, floorY);
    placed.push({ ...circle, x, y });
  }

  const combined = [...placed, ...pinned, ...waitingDrop].sort(
    (a, b) => a.y - b.y,
  );

  return combined.map((circle, index) => ({
    ...circle,
    zIndex: pinnedIds.has(circle.id) ? 200 : index + 1,
  }));
}

export function placeCircleOnStack(
  def: FinishCircleDef,
  alreadyPlaced: PlacedFinishCircle[],
  floorY: number,
  playWidth: number,
  preferredX?: number,
): PlacedFinishCircle {
  const x = clampCenterX(
    preferredX ?? playWidth * (0.12 + Math.random() * 0.76),
    def.sizePx,
    playWidth,
  );
  const y = resolveLandingY(x, def.sizePx, alreadyPlaced, floorY);
  const maxZ = Math.max(0, ...alreadyPlaced.map((c) => c.zIndex));

  return {
    ...def,
    x,
    y,
    zIndex: maxZ + 1,
  };
}

export function buildInitialStack(
  defs: FinishCircleDef[],
  floorY: number,
  playWidth: number,
): PlacedFinishCircle[] {
  const placed: PlacedFinishCircle[] = [];

  shuffleArray(defs).forEach((def) => {
    placed.push(placeCircleOnStack(def, placed, floorY, playWidth));
  });

  return reconcileAllCircles(placed, floorY, playWidth);
}

/** Y max pendant le drag : le cercle ne peut pas descendre sous le sol ou un support. */
export function resolveDragY(
  x: number,
  size: number,
  others: PlacedFinishCircle[],
  floorY: number,
  excludeId: string,
  rawY: number,
  ceilingY: number,
): number {
  const landingY = resolveLandingY(x, size, others, floorY, excludeId);
  return Math.max(ceilingY, Math.min(landingY, rawY));
}

export function settleAfterDrop(
  circle: PlacedFinishCircle,
  others: PlacedFinishCircle[],
  floorY: number,
  playWidth: number,
): PlacedFinishCircle {
  const reconciled = reconcileAllCircles(
    [...others, circle],
    floorY,
    playWidth,
  );
  return reconciled.find((c) => c.id === circle.id)!;
}
