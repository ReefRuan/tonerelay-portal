import { describe, expect, it } from "vitest";
import icon from "../public/brand/tonerelay-icon.svg?raw";
import entry from "../index.html?raw";
import contact from "../contact.html?raw";
import readmeChinese from "../README.md?raw";
import readmeEnglish from "../README.en.md?raw";

describe("ToneRelay curve branding", () => {
  it("uses a self-contained square SVG with an editable S-curve motif", () => {
    expect(icon).toContain('width="64" height="64" viewBox="0 0 64 64"');
    expect(icon).toContain('d="M12 52C34 52 30 12 52 12" stroke="#FFFFFF"');
    expect(icon.match(/<circle /g)).toHaveLength(6);
    for (const point of ['cx="12" cy="12"', 'cx="52" cy="52"', 'cx="12" cy="52"', 'cx="52" cy="12"']) {
      expect(icon).toContain(point);
    }
    expect(icon).not.toMatch(/<script|<image|<foreignObject|https?:\/\/(?!www\.w3\.org)/);
  });

  it("reuses the curve asset for the favicon, boot screen, contact page and README headers", () => {
    const favicon = '<link rel="icon" type="image/svg+xml" href="/brand/tonerelay-icon.svg"';
    expect(entry).toContain(favicon);
    expect(contact).toContain(favicon);
    expect(entry).toContain('<img class="boot-mark" src="/brand/tonerelay-icon.svg"');
    expect(entry).not.toMatch(/data:image\/svg\+xml|boot-spin|boot-mark i/);
    for (const readme of [readmeChinese, readmeEnglish]) {
      expect(readme).toContain('src="public/brand/tonerelay-icon.svg"');
    }
  });
});
