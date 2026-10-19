// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Pure state logic for the Star hint shown once per page load.
 *
 * The React glue lives in `HeaderHints.tsx`; everything here is side-effect free and
 * unit tested in `hints.test.ts`.
 */

export type HintId = "star";

/** Terminal states for the current page load. */
export type HintStatus = "done" | "dismissed";

/** Copy for the Star hint. */
export const HINT_COPY: Record<HintId, string> = {
  star: "喜欢这个项目？欢迎点个 Star。",
};

/** Delay before each hint is offered. */
export const HINT_DELAY_MS: Record<HintId, number> = {
  star: 2000,
};

export interface HintStatuses {
  star: HintStatus | null;
}

/** A fresh page load always starts with an unresolved hint. */
export function initialHintStatuses(): HintStatuses {
  return { star: null };
}

/** A hint is resolved for this page load once completed or dismissed. */
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
