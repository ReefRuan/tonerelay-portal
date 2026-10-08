import { describe, expect, it } from "vitest";
import installDocument from "../docs/install-prompt.md?raw";
import faqDocument from "../docs/faq.md?raw";
import { INSTALL_PROMPT, INSTALL_PROMPT_WITH_FAQ } from "./Documents";

describe("installation copy payload", () => {
  it("copies the standalone installation prompt and complete FAQ", () => {
    expect(INSTALL_PROMPT).toBe(installDocument.trim());
    expect(INSTALL_PROMPT_WITH_FAQ).toBe(`${installDocument.trim()}\n\n${faqDocument.trim()}`);
    expect(INSTALL_PROMPT_WITH_FAQ).not.toContain("请卸载 ToneRelay");
  });
});
