import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import installDocument from "../docs/install-prompt.md?raw";
import faqDocument from "../docs/faq.md?raw";
import { Documents, INSTALL_PROMPT, INSTALL_PROMPT_WITH_FAQ } from "./Documents";

describe("installation copy payload", () => {
  it("copies the standalone installation prompt and complete FAQ", () => {
    expect(INSTALL_PROMPT).toBe(installDocument.trim());
    expect(INSTALL_PROMPT_WITH_FAQ).toBe(`${installDocument.trim()}\n\n${faqDocument.trim()}`);
    expect(INSTALL_PROMPT_WITH_FAQ).not.toContain("请卸载 ToneRelay");
  });

  it("shows the concise tool introduction without a separate installation section", () => {
    const html = renderToStaticMarkup(createElement(Documents));
    expect(html).toContain("扩展 Agent 操作 Lightroom 的能力。");
    expect(html).toContain("<strong>Catalog 批量操作</strong>");
    expect(html).not.toContain("安装介绍");
  });
});
