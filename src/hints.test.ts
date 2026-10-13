// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it } from "vitest";
import {
  HINT_COPY,
  HINT_DELAY_MS,
  HINT_STORAGE_KEYS,
  getBrowserHintStorage,
  hintDelay,
  hintKey,
  isHintStatus,
  isResolved,
  nextHint,
  readHintStatus,
  readHintStatuses,
  resolveHint,
  shouldShowHint,
  writeHintStatus,
  type HintId,
  type HintStorage,
  type HintStatuses,
} from "./hints";

/** In-memory storage double. */
function memoryStorage(seed: Record<string, string> = {}): HintStorage {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

const unresolved: HintStatuses = { star: null };

describe("hint keys and delays", () => {
  it("uses the documented, namespaced storage keys", () => {
    expect(HINT_STORAGE_KEYS.star).toBe("tr.hint.star");
    expect(hintKey("star")).toBe("tr.hint.star");
  });

  it("waits 8s for the Star hint", () => {
    expect(HINT_DELAY_MS.star).toBe(8000);
    expect(hintDelay("star")).toBe(8000);
  });
});

describe("HINT_COPY", () => {
  it("keeps the reviewed star hint copy verbatim", () => {
    expect(HINT_COPY.star).toBe("点击 ⭐ 支持作者");
  });
});

describe("isHintStatus / isResolved", () => {
  it("accepts only the two terminal states", () => {
    expect(isHintStatus("done")).toBe(true);
    expect(isHintStatus("dismissed")).toBe(true);
    expect(isHintStatus("")).toBe(false);
    expect(isHintStatus(null)).toBe(false);
    expect(isHintStatus("pending")).toBe(false);
  });

  it("treats any stored status as resolved", () => {
    expect(isResolved(null)).toBe(false);
    expect(isResolved("done")).toBe(true);
    expect(isResolved("dismissed")).toBe(true);
  });
});

describe("readHintStatus / writeHintStatus", () => {
  it("reads back persisted statuses", () => {
    const storage = memoryStorage({ "tr.hint.star": "done" });
    expect(readHintStatus(storage, "star")).toBe("done");
    expect(readHintStatuses(storage)).toEqual({ star: "done" });
  });

  it("ignores unknown stored values", () => {
    const storage = memoryStorage({ "tr.hint.star": "banana" });
    expect(readHintStatus(storage, "star")).toBeNull();
  });

  it("writes a resolved status under the namespaced key", () => {
    const storage = memoryStorage();
    writeHintStatus(storage, "star", "dismissed");
    expect(storage.getItem("tr.hint.star")).toBe("dismissed");
  });

  it("never throws when storage is missing or failing", () => {
    expect(readHintStatus(null, "star")).toBeNull();
    expect(readHintStatuses(null)).toEqual({ star: null });
    expect(() => writeHintStatus(null, "star", "done")).not.toThrow();

    const broken: HintStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(readHintStatus(broken, "star")).toBeNull();
    expect(() => writeHintStatus(broken, "star", "done")).not.toThrow();
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

describe("getBrowserHintStorage", () => {
  it("returns null when there is no window", () => {
    expect(getBrowserHintStorage()).toBeNull();
  });
});
