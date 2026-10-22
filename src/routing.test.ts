import { describe, expect, it } from "vitest";
import { resolvePortalPage } from "./routing";

describe("Portal entry page", () => {
  it.each(["", "?lang=en", "?v=9456a0f", "?preset="])("opens experience by default with %s", (search) => {
    expect(resolvePortalPage("", search)).toBe("experience");
  });

  it("preserves explicit gallery links", () => {
    expect(resolvePortalPage("#gallery")).toBe("gallery");
    expect(resolvePortalPage("#gallery", "?preset=fuji-film-pro-160ns")).toBe("gallery");
  });

  it.each(["#experience", "#about", "#help"])("keeps %s on experience even with a preset query", (hash) => {
    expect(resolvePortalPage(hash, "?preset=fuji-film-pro-160ns")).toBe("experience");
  });

  it("preserves preset deep links that omit the fragment", () => {
    expect(resolvePortalPage("", "?preset=fuji-film-pro-160ns")).toBe("gallery");
  });

  it("falls back to experience for unrecognized fragments", () => {
    expect(resolvePortalPage("#unknown", "?preset=fuji-film-pro-160ns")).toBe("experience");
  });
});
