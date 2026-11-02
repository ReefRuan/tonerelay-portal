import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import installDocument from "../docs/install-prompt.md?raw";
import faqDocument from "../docs/faq.md?raw";
import installDocumentEn from "../docs/install-prompt.en.md?raw";
import installTarget from "../docs/install-target.json";
import readme from "../README.md?raw";
import readmeEn from "../README.en.md?raw";
import shortInstallDocument from "../docs/install-short-prompt.md?raw";
import shortInstallDocumentEn from "../docs/install-short-prompt.en.md?raw";
import { Documents, getInstallPrompt, INSTALL_PROMPT, INSTALL_PROMPT_WITH_FAQ, WorkBuddyDownloadDialog } from "./Documents";

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

  it("copies the same pinned target in both languages and every short entry, including update instructions and FAQ", () => {
    for (const document of [getInstallPrompt("zh"), getInstallPrompt("en"), shortInstallDocument, shortInstallDocumentEn, readme, readmeEn]) {
      expect(document).toContain(`v${installTarget.version}`);
      expect(document).toContain(installTarget.commit);
    }
    expect(getInstallPrompt("zh")).toContain("## 已安装时：更新到本提示词版本");
    expect(getInstallPrompt("en")).toContain("## Existing installation: update to this prompt's target");
    expect(getInstallPrompt("zh")).toContain("## 已经安装，怎么更新到提示词最新版本？");
    expect(getInstallPrompt("en")).toContain("## Already installed? How do I update to the latest prompt version?");
    const html = renderToStaticMarkup(createElement(Documents));
    expect(html).toContain("复制安装与更新提示词");
    expect(html).toContain(`v${installTarget.version}`);
    expect(html).toContain(installTarget.commit.slice(0, 12));
    expect(html).toContain(`/blob/${installTarget.commit}/INSTALL.md`);
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
    expect(hero).toContain('aria-haspopup="dialog">二维码下载</button>');
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
