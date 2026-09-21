export type SpatialRect = {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type Direction = "left" | "right" | "up" | "down";

const center = (rect: SpatialRect) => ({
  x: (rect.left + rect.right) / 2,
  y: (rect.top + rect.bottom) / 2,
});

export function findSpatialTarget(
  currentId: string,
  direction: Direction,
  rects: SpatialRect[],
): string | null {
  const current = rects.find((rect) => rect.id === currentId);
  if (!current || rects.length < 2) return null;

  const origin = center(current);
  const horizontal = direction === "left" || direction === "right";
  const sign = direction === "left" || direction === "up" ? -1 : 1;

  const candidates = rects
    .filter((rect) => rect.id !== currentId)
    .map((rect) => {
      const target = center(rect);
      const primary = horizontal ? target.x - origin.x : target.y - origin.y;
      const secondary = horizontal
        ? Math.abs(target.y - origin.y)
        : Math.abs(target.x - origin.x);
      return { rect, primary, secondary };
    })
    .filter(({ primary }) => primary * sign > 8)
    .sort((a, b) => {
      const scoreA = Math.abs(a.primary) + a.secondary * 1.25;
      const scoreB = Math.abs(b.primary) + b.secondary * 1.25;
      return scoreA - scoreB;
    });

  if (candidates[0]) return candidates[0].rect.id;

  const wrapped = rects
    .filter((rect) => rect.id !== currentId)
    .sort((a, b) => {
      const ca = center(a);
      const cb = center(b);
      if (horizontal) {
        return direction === "right" ? ca.x - cb.x : cb.x - ca.x;
      }
      return direction === "down" ? ca.y - cb.y : cb.y - ca.y;
    });

  return wrapped[0]?.id ?? null;
}
