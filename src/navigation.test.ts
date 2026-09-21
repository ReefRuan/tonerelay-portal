import { describe, expect, it } from "vitest";
import { findSpatialTarget, type SpatialRect } from "./navigation";

const rects: SpatialRect[] = [
  { id: "a", left: 0, right: 100, top: 0, bottom: 100 },
  { id: "b", left: 130, right: 230, top: 10, bottom: 110 },
  { id: "c", left: 5, right: 105, top: 150, bottom: 250 },
  { id: "d", left: 140, right: 240, top: 165, bottom: 265 },
];

describe("findSpatialTarget", () => {
  it("moves toward the nearest card in the requested direction", () => {
    expect(findSpatialTarget("a", "right", rects)).toBe("b");
    expect(findSpatialTarget("a", "down", rects)).toBe("c");
    expect(findSpatialTarget("d", "left", rects)).toBe("c");
    expect(findSpatialTarget("d", "up", rects)).toBe("b");
  });

  it("wraps when there is no card in that direction", () => {
    expect(findSpatialTarget("d", "right", rects)).toBe("a");
    expect(findSpatialTarget("d", "down", rects)).toBe("a");
  });

  it("returns null when navigation is impossible", () => {
    expect(findSpatialTarget("a", "right", [rects[0]])).toBeNull();
  });
});
