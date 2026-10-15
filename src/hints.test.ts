// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it } from "vitest";
import {
  HINT_COPY,
  HINT_DELAY_MS,
  hintDelay,
  initialHintStatuses,
  isResolved,
  nextHint,
  resolveHint,
  shouldShowHint,
  type HintId,
  type HintStatuses,
} from "./hints";

const unresolved: HintStatuses = { star: null };

describe("hint delay", () => {
  it("waits 2s for the Star hint", () => {
    expect(HINT_DELAY_MS.star).toBe(2000);
    expect(hintDelay("star")).toBe(2000);
  });
});

describe("HINT_COPY", () => {
  it("keeps the reviewed star hint copy verbatim", () => {
    expect(HINT_COPY.star).toBe("点击 ⭐ 支持作者");
  });
});

describe("isResolved", () => {
  it("treats either status as resolved for this page load", () => {
    expect(isResolved(null)).toBe(false);
    expect(isResolved("done")).toBe(true);
    expect(isResolved("dismissed")).toBe(true);
  });
});

describe("initialHintStatuses", () => {
  it("starts unresolved again on each fresh page load", () => {
    const firstLoad = resolveHint(initialHintStatuses(), "star", "dismissed");
    expect(nextHint(firstLoad)).toBeNull();
    expect(nextHint(initialHintStatuses())).toBe("star");
  });
});

describe("nextHint", () => {
  it("offers the Star hint until it is resolved", () => {
    expect(nextHint({ star: null })).toBe("star");
    expect(nextHint({ star: "done" })).toBeNull();
    expect(nextHint({ star: "dismissed" })).toBeNull();
  });
});

describe("shouldShowHint", () => {
  it("hides when nothing was offered or a detail panel is open", () => {
    expect(shouldShowHint(null, unresolved, false)).toBe(false);
    expect(shouldShowHint("star", unresolved, true)).toBe(false);
  });

  it("shows an offered, unresolved hint", () => {
    expect(shouldShowHint("star", unresolved, false)).toBe(true);
  });

  it("hides an offered hint that has since been resolved", () => {
    expect(shouldShowHint("star", { star: "dismissed" }, false)).toBe(false);
  });

  it("restores a still-unresolved hint after the detail panel closes", () => {
    const offered: HintId = "star";
    expect(shouldShowHint(offered, unresolved, true)).toBe(false);
    expect(shouldShowHint(offered, unresolved, false)).toBe(true);
  });
});

describe("resolveHint", () => {
  it("returns a new map without mutating the input", () => {
    const before: HintStatuses = { star: null };
    const after = resolveHint(before, "star", "done");
    expect(after).toEqual({ star: "done" });
    expect(before).toEqual({ star: null });
    expect(after).not.toBe(before);
  });
});
