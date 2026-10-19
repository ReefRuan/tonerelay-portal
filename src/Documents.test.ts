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
    expect(INSTALL_PROMPT).toContain("仅新增客户端时");
    expect(INSTALL_PROMPT).toContain("不执行 `prepare` 或 Runtime `install`");
    expect(INSTALL_PROMPT_WITH_FAQ).toContain("换客户端还要重装吗？");
    expect(INSTALL_PROMPT_WITH_FAQ).not.toContain("请卸载 ToneRelay");
  });

  it("shows the concise tool introduction without a separate installation section", () => {
    const html = renderToStaticMarkup(createElement(Documents));
    expect(html).toContain("扩展 Agent 操作 Lightroom 的能力");
    expect(html).toContain("<strong>50+ MCP 工具</strong>");
    expect(html).toContain("<strong>XMP 显影参数透传与回读</strong>");
    expect(html).toContain("相比让 Agent 对着 Lightroom 截图找按钮");
    expect(html).toContain("ToneRelay 是连接 Agent 和 Lightroom Classic 的");
    expect(html).toContain("<div class=\"dialogue-answer-body\">");
    expect(html).not.toContain("安装介绍");
    expect(html).toContain('href="./contact.html"');
    expect(html).toContain('href="https://www.workbuddy.cn/events/invite?inviteCode=rozclpaflg2w"');
  });
});
