// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import type { PortalPage } from "./Documents";

export function resolvePortalPage(hash: string, search = ""): PortalPage {
  const value = hash.slice(1);
  if (value === "gallery") return "gallery";
  if (value === "experience" || value === "about" || value === "help") return "experience";

  // Preserve old preset links without a fragment; explicit page links win.
  if (!value && new URLSearchParams(search).get("preset")) return "gallery";
  return "experience";
}
