import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import installDocument from "../docs/install-prompt.md?raw";
import faqDocument from "../docs/faq.md?raw";
import faqDocumentEn from "../docs/faq.en.md?raw";
import installDocumentEn from "../docs/install-prompt.en.md?raw";
import installTarget from "../docs/install-target.json";
import readme from "../README.md?raw";
import readmeEn from "../README.en.md?raw";
import shortInstallDocument from "../docs/install-short-prompt.md?raw";
import shortInstallDocumentEn from "../docs/install-short-prompt.en.md?raw";
import { AgentHelpDialog, Documents, getInstallPrompt, INSTALL_PROMPT, INSTALL_PROMPT_WITH_FAQ, WorkBuddyDownloadDialog } from "./Documents";
import { InstallAction } from "./HeaderPanels";

describe("installation copy payload", () => {
  it("verifies upgraded MCP tools in the actual client without requiring a Plugin card", () => {
    for (const language of ["zh", "en"] as const) {
      const payload = getInstallPrompt(language);
      for (const name of ["trlr_list_folders", "trlr_list_folder_photos", "trlr_get_storage_usage"]) {
        expect(payload).toContain(name);
      }
      expect(payload).toContain("tonerelay-lightroom");
      expect(payload).toContain("https://learn.chatgpt.com/docs/extend/mcp");
    }
    expect(getInstallPrompt("zh")).toContain("不要求必须出现完整 Plugin 卡片");
    expect(getInstallPrompt("en")).toContain("a full Plugin card is optional");
  });

  it("keeps both short entries limited to the two official MCP repositories", () => {
    for (const [document, suffix] of [[shortInstallDocument, ""], [shortInstallDocumentEn, ".en"]]) {
      const prompt = document.match(/```text\r?\n([\s\S]*?)\r?\n```/)?.[1];
      expect(prompt).toBeDefined();
      expect(prompt!.match(/https:\/\/[^\s]+/g)).toEqual([
        "https://github.com/ReefRuan/tonerelay-lightroom-mcp",
        "https://gitee.com/ReefRuan/tonerelay-lightroom-mcp",
      ]);
      for (const file of [`INSTALL-PROMPT${suffix}.md`, `FAQ${suffix}.md`, `INSTALL${suffix}.md`]) {
        expect(prompt).toContain(file);
      }
    }
  });

  it("routes the complete prompts to bundled FAQ files without assuming an appended FAQ", () => {
    expect(installDocument).toContain("否则读取同一文档快照的 FAQ");
    expect(installDocument).toContain("不要求再连通 Portal");
    expect(installDocumentEn).toContain("otherwise open the FAQ from the same documentation snapshot");
    expect(installDocumentEn).toContain("without reaching Portal again");
    expect(installDocument).toContain("`INSTALL-PROMPT.md`、`FAQ.md`");
    expect(installDocumentEn).toContain("`INSTALL-PROMPT.en.md`, `FAQ.en.md`");
  });

  it("copies the standalone installation prompt and complete FAQ", () => {
    expect(INSTALL_PROMPT).toBe(installDocument.trim());
    expect(INSTALL_PROMPT_WITH_FAQ).toBe(`${installDocument.trim()}\n\n${faqDocument.trim()}`);
    expect(INSTALL_PROMPT).toContain("已有较旧版本即使健康也要更新");
    expect(INSTALL_PROMPT).toContain("不执行 `prepare` 或 Runtime `install`");
    expect(INSTALL_PROMPT_WITH_FAQ).toContain("换客户端还要重装吗？");
    expect(INSTALL_PROMPT_WITH_FAQ).not.toContain("请卸载 ToneRelay");
  });

  it("directs missing tools in the installation conversation to a new conversation without a duplicate FAQ", () => {
    const question = "安装完成后，Agent 提示当前会话没有 ToneRelay 工具，无法继续验证或绑定怎么办？";
    const questionEn = "After installation, why does the Agent say this conversation has no ToneRelay tools and cannot continue verification or Catalog binding?";
    const html = renderToStaticMarkup(createElement(Documents));
    expect(faqDocument.split(`## ${question}\n`)).toHaveLength(2);
    expect(faqDocumentEn.split(`## ${questionEn}\n`)).toHaveLength(2);
    expect(faqDocument).not.toContain("## 新会话里看不到 ToneRelay 工具？");
    expect(faqDocumentEn).not.toContain("## Why can't I see ToneRelay tools in a new session?");
    expect(html).toContain(question);
    expect(html).toContain("先在同一个 Agent 客户端新建一个会话");
    expect(html).toContain("连接器已启用并信任时");
    expect(html).toContain("不需要因此重复安装");
    expect(getInstallPrompt("zh")).toContain(faqDocument.trim());
    expect(getInstallPrompt("en")).toContain(faqDocumentEn.trim());
    expect(getInstallPrompt("en")).toContain("Start a new conversation in the same Agent client");
  });

  it("resolves latest main on every execution in both languages and all copy entry points", () => {
    for (const document of [getInstallPrompt("zh"), getInstallPrompt("en"), shortInstallDocument, shortInstallDocumentEn, readme, readmeEn]) {
      expect(document).toContain("main");
      expect(document).not.toMatch(/\b[a-f0-9]{40}\b/);
    }
    expect(getInstallPrompt("zh")).toContain("默认每次执行本提示词都重新查询");
    expect(getInstallPrompt("en")).toContain("Each execution must query the latest full commit");
    expect(getInstallPrompt("zh")).toContain("不得在不同阶段重新取 main 而混装组件");
    expect(getInstallPrompt("en")).toContain("Do not repeatedly fetch main at different stages and mix components");
    expect(getInstallPrompt("zh")).toContain("## 已经安装，怎么更新到最新代码？");
    expect(getInstallPrompt("en")).toContain("## Already installed? How do I update to the latest code?");
    const html = renderToStaticMarkup(createElement(Documents));
    expect(html).toContain("复制安装与更新提示词");
    expect(html).toContain("执行时查询最新提交");
    expect(html).toContain(`<code>${installTarget.branch}</code>`);
    expect(html).toContain(`/blob/${installTarget.branch}/INSTALL.md`);
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

  it("keeps the hero focused on installation, an Agent download link and author contact", () => {
    const html = renderToStaticMarkup(createElement(Documents));
    const hero = html.split('<section class="agent-strip"')[1].split('</section>')[0];
    expect(hero).toContain('class="intro-install-glow"');
    expect(hero).toContain("没有 Agent？下载一个");
    expect(hero).not.toContain("二维码下载");
    expect(hero).not.toContain("install-start-tag");
    expect(hero).toContain('class="author-contact"');
    expect(hero).not.toContain("/INSTALL");
    expect(hero).not.toContain("备用安装说明");
    expect(html).toContain("安装步骤与要求");
  });

  it("places the QR download action in the Agent explanation instead of the hero", () => {
    const html = renderToStaticMarkup(createElement(AgentHelpDialog, { onClose: () => {}, onDownloadQr: () => {} }));
    expect(html).toContain('id="agent-dialog-title">什么是 Agent？</h2>');
    expect(html).toContain('aria-haspopup="dialog">二维码下载</button>');
    expect(html).toContain('href="https://www.workbuddy.cn/events/invite?inviteCode=rozclpaflg2w"');
  });

  it("marks the header copy control without changing its accessible button name", () => {
    const html = renderToStaticMarkup(createElement(InstallAction, { onCopy: async () => true }));
    expect(html).toContain('class="install-start-hint" aria-hidden="true">');
    expect(html).toContain('d="M24 28 C 15 23, 31 16, 22 5"');
    expect(html).toContain("立即开始使用");
    expect(html).toContain("安装 / 更新提示词");
    expect(html).toContain('aria-label="展开安装与更新提示词"');
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
