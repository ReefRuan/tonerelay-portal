// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

const offeredHint = vi.hoisted(() => ({ active: "star" as "star" | null }));

// Exercise the real app's wiring with an already-offered hint. Timer and
// dismissal state have their own tests; no browser layout runs during SSR.
vi.mock("./HeaderHints", async () => {
  const { createElement } = await import("react");
  return {
    useOnboardingHints: (enabled: boolean) => ({
      active: enabled ? offeredHint.active : null,
      resolve: vi.fn(),
      dismiss: vi.fn(),
    }),
    HeaderHint: ({ id }: { id: string }) => createElement("aside", { "data-header-hint": id }, "Star invitation"),
  };
});

beforeEach(() => {
  offeredHint.active = "star";
  vi.stubGlobal("window", {
    location: { hash: "#experience", search: "" },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("Star invitation in the portal", () => {
  it("mounts the offered Star hint beside the experience page's Star action", () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain(">Star MCP</a>");
    expect(html.includes('data-header-hint="star"')).toBe(true);
  });

  it("does not mount a hint that was dismissed for this page load", () => {
    offeredHint.active = null;
    expect(renderToStaticMarkup(createElement(App))).not.toContain("data-header-hint");
  });

  it("does not offer the Star hint on the gallery page", () => {
    window.location.hash = "#gallery";
    expect(renderToStaticMarkup(createElement(App))).not.toContain("data-header-hint");
  });
});
