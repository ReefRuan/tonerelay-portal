// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Pure state logic for the one-off Star hint.
 *
 * The React glue lives in `HeaderHints.tsx`; everything here is side-effect free and
 * unit tested in `hints.test.ts`. Storage access is injected so the module can
 * be exercised without a browser.
 */

export type HintId = "star";

/** Terminal states persisted to storage. */
export type HintStatus = "done" | "dismissed";

/** Copy for the remaining one-off hint. */
export const HINT_COPY: Record<HintId, string> = {
  star: "点击 ⭐ 支持作者",
};

/** localStorage keys, prefixed so they never clash with unrelated state. */
export const HINT_STORAGE_KEYS: Record<HintId, string> = {
  star: "tr.hint.star",
};

/** Delay before each hint is offered. */
export const HINT_DELAY_MS: Record<HintId, number> = {
  star: 8000,
};

/** Minimal storage surface so tests can inject an in-memory double. */
export interface HintStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface HintStatuses {
  star: HintStatus | null;
}

/** Storage key for a hint. */
export function hintKey(id: HintId): string {
  return HINT_STORAGE_KEYS[id];
}

/** Type guard for a persisted hint value. */
export function isHintStatus(value: unknown): value is HintStatus {
  return value === "done" || value === "dismissed";
}

/** Reads one hint's persisted status, tolerating missing/throwing storage. */
export function readHintStatus(storage: HintStorage | null, id: HintId): HintStatus | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(hintKey(id));
    return isHintStatus(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Reads the Star hint status. */
export function readHintStatuses(storage: HintStorage | null): HintStatuses {
  return {
    star: readHintStatus(storage, "star"),
  };
}

/** Persists one hint's terminal status, tolerating unavailable storage. */
export function writeHintStatus(storage: HintStorage | null, id: HintId, status: HintStatus): void {
  if (!storage) return;
  try {
    storage.setItem(hintKey(id), status);
  } catch {
    /* Storage can be disabled (private mode); hints simply re-appear next visit. */
  }
}

/** A hint is resolved once it has been completed or dismissed. */
export function isResolved(status: HintStatus | null): boolean {
  return status !== null;
}

/**
 * The single hint that may be offered next.
 */
export function nextHint(statuses: HintStatuses): HintId | null {
  if (!isResolved(statuses.star)) return "star";
  return null;
}

/** Delay (ms) before the given hint is offered. */
export function hintDelay(id: HintId): number {
  return HINT_DELAY_MS[id];
}

/** Whether a hint should currently render (offered, unresolved, no detail open). */
export function shouldShowHint(
  offered: HintId | null,
  statuses: HintStatuses,
  detailOpen: boolean,
): boolean {
  if (!offered || detailOpen) return false;
  return !isResolved(statuses[offered]);
}

/** Returns a new status map with one hint resolved. */
export function resolveHint(statuses: HintStatuses, id: HintId, status: HintStatus): HintStatuses {
  return { ...statuses, [id]: status };
}

/** Returns the browser localStorage, or null when it is unavailable. */
export function getBrowserHintStorage(): HintStorage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}
