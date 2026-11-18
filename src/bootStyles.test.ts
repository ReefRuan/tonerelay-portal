// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, expect, it } from "vitest";
import { deferBootStylesheets } from "./bootFallback";

describe("independent boot stylesheet loading", () => {
  it("keeps application CSS from blocking the inline installation entry", () => {
    const html = '<head><style>#boot{color:white}</style><link rel="stylesheet" crossorigin href="./assets/main.css"><link rel="modulepreload" href="./assets/main.js"></head><body><div id="boot"></div></body>';
    const result = deferBootStylesheets(html);
    const stylesheet = result.match(/<link\b[^>]*rel="stylesheet"[^>]*>/)?.[0];
    expect(stylesheet).toContain('href="./assets/main.css"');
    expect(stylesheet).toContain("crossorigin");
    expect(stylesheet).toContain('media="print"');
    expect(stylesheet).toContain('onload="this.media=\'all\'"');
    expect(result).toContain("<style>#boot{color:white}</style>");
    expect(result).toContain('<link rel="modulepreload" href="./assets/main.js">');
  });

  it("leaves pages without the independent entry unchanged", () => {
    const html = '<head><link rel="stylesheet" href="./assets/contact.css"></head><body>Contact Reef</body>';
    expect(deferBootStylesheets(html)).toBe(html);
  });
});
