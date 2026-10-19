import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import installDocument from "../docs/install-prompt.md?raw";
import faqDocument from "../docs/faq.md?raw";
import { Documents, INSTALL_PROMPT, INSTALL_PROMPT_WITH_FAQ, WorkBuddyDownloadDialog } from "./Documents";

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

  it("replaces only the two hero guide links with Agent download actions", () => {
    const html = renderToStaticMarkup(createElement(Documents));
    const hero = html.split('<section class="agent-strip"')[1].split('</section>')[0];
    expect(hero).toContain('class="intro-install-glow"');
    expect(hero).toContain("没有 Agent？下载一个");
    expect(hero).toContain('aria-haspopup="dialog">扫码下载 Agent</button>');
    expect(hero).not.toContain("/INSTALL");
    expect(hero).not.toContain("备用安装说明");
    expect(html).toContain("安装步骤与要求");
  });

  it("uses the provided WorkBuddy poster with a close control and direct-link fallback", () => {
    const html = renderToStaticMarkup(createElement(WorkBuddyDownloadDialog, { onClose: () => {} }));
    expect(html).toContain('<dialog');
    expect(html).toContain('aria-labelledby="workbuddy-download-title"');
    expect(html).toContain('agents/workbuddy-download.jpg');
    expect(html).toContain('width="750" height="1110"');
    expect(html).toContain('aria-label="关闭二维码"');
    expect(html).toContain('https://www.workbuddy.cn/events/invite?inviteCode=rozclpaflg2w');
  });
});
