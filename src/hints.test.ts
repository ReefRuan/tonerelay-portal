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

const unresolved: HintStatuses = { install: null, star: null };

describe("hint keys and delays", () => {
  it("uses the documented, namespaced storage keys", () => {
    expect(HINT_STORAGE_KEYS.install).toBe("tr.hint.install");
    expect(HINT_STORAGE_KEYS.star).toBe("tr.hint.star");
    expect(hintKey("install")).toBe("tr.hint.install");
    expect(hintKey("star")).toBe("tr.hint.star");
  });

  it("waits 5s for install and 8s for star", () => {
    expect(HINT_DELAY_MS.install).toBe(5000);
    expect(HINT_DELAY_MS.star).toBe(8000);
    expect(hintDelay("install")).toBe(5000);
    expect(hintDelay("star")).toBe(8000);
  });
});

describe("HINT_COPY", () => {
  // The copy is finalised: lock it so an accidental edit has to be deliberate.
  it("keeps the reviewed install hint copy verbatim", () => {
    expect(HINT_COPY.install).toBe("还没装？点「一键安装」复制提示词，把提示词发给你的 Agent 就行");
  });

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
    const storage = memoryStorage({ "tr.hint.install": "done" });
    expect(readHintStatus(storage, "install")).toBe("done");
    expect(readHintStatus(storage, "star")).toBeNull();
    expect(readHintStatuses(storage)).toEqual({ install: "done", star: null });
  });

  it("ignores unknown stored values", () => {
    const storage = memoryStorage({ "tr.hint.install": "banana" });
    expect(readHintStatus(storage, "install")).toBeNull();
  });

  it("writes a resolved status under the namespaced key", () => {
    const storage = memoryStorage();
    writeHintStatus(storage, "star", "dismissed");
    expect(storage.getItem("tr.hint.star")).toBe("dismissed");
  });

  it("never throws when storage is missing or failing", () => {
    expect(readHintStatus(null, "install")).toBeNull();
    expect(readHintStatuses(null)).toEqual({ install: null, star: null });
    expect(() => writeHintStatus(null, "install", "done")).not.toThrow();

    const broken: HintStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(readHintStatus(broken, "install")).toBeNull();
    expect(() => writeHintStatus(broken, "install", "done")).not.toThrow();
  });
});

describe("nextHint ordering", () => {
  it("offers the install hint first", () => {
    expect(nextHint({ install: null, star: null })).toBe("install");
    expect(nextHint({ install: null, star: "done" })).toBe("install");
  });

  it("offers the star hint only after install is resolved", () => {
    expect(nextHint({ install: "done", star: null })).toBe("star");
    expect(nextHint({ install: "dismissed", star: null })).toBe("star");
  });

  it("offers nothing once both are resolved", () => {
    expect(nextHint({ install: "done", star: "dismissed" })).toBeNull();
    expect(nextHint({ install: "dismissed", star: "done" })).toBeNull();
  });
});

describe("shouldShowHint", () => {
  it("hides when nothing was offered or a detail panel is open", () => {
    expect(shouldShowHint(null, unresolved, false)).toBe(false);
    expect(shouldShowHint("install", unresolved, true)).toBe(false);
  });

  it("shows an offered, unresolved hint", () => {
    expect(shouldShowHint("install", unresolved, false)).toBe(true);
    expect(shouldShowHint("star", { install: "done", star: null }, false)).toBe(true);
  });

  it("hides an offered hint that has since been resolved", () => {
    expect(shouldShowHint("install", { install: "done", star: null }, false)).toBe(false);
    expect(shouldShowHint("star", { install: "done", star: "dismissed" }, false)).toBe(false);
  });

  it("restores a still-unresolved hint after the detail panel closes", () => {
    const offered: HintId = "install";
    expect(shouldShowHint(offered, unresolved, true)).toBe(false);
    expect(shouldShowHint(offered, unresolved, false)).toBe(true);
  });
});

describe("resolveHint", () => {
  it("returns a new map without mutating the input", () => {
    const before: HintStatuses = { install: null, star: null };
    const after = resolveHint(before, "install", "done");
    expect(after).toEqual({ install: "done", star: null });
    expect(before).toEqual({ install: null, star: null });
    expect(after).not.toBe(before);
  });
});

describe("getBrowserHintStorage", () => {
  it("returns null when there is no window", () => {
    expect(getBrowserHintStorage()).toBeNull();
  });
});
