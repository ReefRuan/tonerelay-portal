// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "./Icon";
import {
  HINT_COPY,
  hintDelay,
  initialHintStatuses,
  nextHint,
  resolveHint as resolveHintStatuses,
  shouldShowHint,
  type HintId,
  type HintStatus,
  type HintStatuses,
} from "./hints";

export interface OnboardingHints {
  /** The hint that should currently be visible, or null. */
  active: HintId | null;
  /** Resolve the hint for this page load (done/dismissed). */
  resolve: (id: HintId, status: HintStatus) => void;
  /** Convenience wrapper for the close button. */
  dismiss: (id: HintId) => void;
}

/**
 * Drives the Star hint once per page load.
 *
 * - The Star hint is offered after 2s on the experience page.
 * - Dismissing or clicking Star hides it until the next full page reload.
 * - While a detail panel is open hints are suppressed but not resolved, so they
 *   re-appear when the panel closes.
 */
export function useOnboardingHints(enabled: boolean, detailOpen: boolean): OnboardingHints {
  const [statuses, setStatuses] = useState<HintStatuses>(initialHintStatuses);
  const [offered, setOffered] = useState<HintId | null>(null);

  const resolve = useCallback((id: HintId, status: HintStatus) => {
    setStatuses((current) => resolveHintStatuses(current, id, status));
    setOffered((current) => (current === id ? null : current));
  }, []);

  const dismiss = useCallback((id: HintId) => resolve(id, "dismissed"), [resolve]);

  useEffect(() => {
    if (!enabled) {
      setOffered(null);
      return;
    }
    const pending = nextHint(statuses);
    if (!pending) {
      setOffered(null);
      return;
    }
    const timer = window.setTimeout(() => setOffered(pending), hintDelay(pending));
    return () => window.clearTimeout(timer);
  }, [enabled, statuses]);

  const active = enabled && shouldShowHint(offered, statuses, detailOpen) ? offered : null;

  return { active, resolve, dismiss };
}

interface HintPosition {
  top: number;
  left: number;
  width: number;
  arrowLeft: number;
}

const HINT_GAP = 30;
const HINT_MIN_EDGE = 12;
const HINT_MAX_WIDTH = 320;
const ARROW_WIDTH = 46;

/** Measures where the hint bubble should sit relative to its target button. */
function measureHint(anchor: HTMLElement | null): HintPosition | null {
  if (!anchor || typeof window === "undefined") return null;
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(HINT_MAX_WIDTH, window.innerWidth - HINT_MIN_EDGE * 2);
  const center = rect.left + rect.width / 2;
  const left = Math.min(
    Math.max(center - width / 2, HINT_MIN_EDGE),
    Math.max(window.innerWidth - width - HINT_MIN_EDGE, HINT_MIN_EDGE),
  );
  const arrowCenter = Math.min(Math.max(center - left, ARROW_WIDTH / 2 + 6), width - ARROW_WIDTH / 2 - 6);
  return {
    top: rect.bottom + HINT_GAP,
    left,
    width,
    arrowLeft: arrowCenter - ARROW_WIDTH / 2,
  };
}

/**
 * A dismissible onboarding hint anchored below a header button, with a
 * hand-drawn arrow pointing back up at the target.
 */
export function HeaderHint({ id, anchor, onDismiss }: {
  id: HintId;
  anchor: HTMLElement | null;
  onDismiss: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState<HintPosition | null>(() => measureHint(anchor));
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setPosition(measureHint(anchor));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor]);

  useEffect(() => {
    window.requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
  }, []);

  if (!position) return null;

  return (
    <motion.div
      className="header-hint"
      role="status"
      aria-live="polite"
      style={{ top: position.top, left: position.left, width: position.width }}
      initial={reducedMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
    >
      <svg
        className="header-hint-arrow"
        style={{ left: position.arrowLeft }}
        viewBox="0 0 46 30"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M24 28 C 15 23, 31 16, 22 5" />
        <path d="M22 4 l -6 6" />
        <path d="M22 4 l 6 6" />
      </svg>
      <p>{HINT_COPY[id]}</p>
      <button ref={closeRef} className="header-hint-close" type="button" aria-label="关闭提示" onClick={onDismiss}>
        <Icon name="close" />
      </button>
    </motion.div>
  );
}
