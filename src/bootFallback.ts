// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

/** Keep the zero-JS installation entry in sync with the copyable source docs. */
export function extractShortPrompt(markdown: string): string {
  const match = /^```text\s*\r?\n([\s\S]*?)^```\s*$/m.exec(markdown);
  if (!match?.[1].trim()) throw new Error("Short installation prompt is missing its text block");
  return match[1].trim();
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Vite's generated app CSS must not block the independent inline entry. */
export function deferBootStylesheets(html: string): string {
  if (!html.includes('id="boot"')) return html;
  return html.replace(/<link\b[^>]*>/gi, (link) => {
    if (!/\brel="stylesheet"/i.test(link) || /\bdata-boot-style\b/.test(link)) return link;
    return link.replace(/\s*\/?>$/, ' data-boot-style media="print" onload="this.media=\'all\'" fetchpriority="high">');
  });
}

/** Generated into index.html, independent of the application bundle and CSS. */
export function renderBootInstallFallback(chineseMarkdown: string, englishMarkdown: string): string {
  const panels = (["zh", "en"] as const).map((language) => {
    const english = language === "en";
    const prompt = escapeHtml(extractShortPrompt(english ? englishMarkdown : chineseMarkdown));
    const suffix = english ? ".en" : "";
    return `<div data-boot-language="${language}" lang="${english ? "en" : "zh-CN"}"${english ? " hidden" : ""}>
      <p class="boot-eyebrow">TONERELAY · ${english ? "QUICK INSTALL" : "安装入口"}</p>
      <h1 id="boot-title-${language}">${english ? "Taking a little longer." : "页面加载有点慢。"}</h1>
      <p class="boot-description">${english ? "Refresh the page, or install directly: copy this short prompt into your Agent. You don’t need to wait for this website." : "你可以刷新页面，或直接安装：把下面的短提示词发给 Agent，不必等网页加载。"}</p>
      <div class="boot-actions">
        <button class="boot-primary" type="button" data-boot-copy="boot-prompt-${language}" aria-describedby="boot-feedback-${language}">${english ? "Copy installation prompt" : "复制短安装提示词"}</button>
        <a class="boot-refresh" href="" data-boot-refresh>${english ? "Refresh page" : "刷新页面"}</a>
        <button type="button" data-boot-enter hidden>${english ? "Open the full page" : "进入完整页面"}</button>
      </div>
      <p class="boot-feedback" id="boot-feedback-${language}" role="status" aria-live="polite">${english ? "Paste it into the Agent client you want to use." : "复制后，粘贴到你要使用的 Agent 客户端。"}</p>
      <noscript><p class="boot-description">${english ? "JavaScript is disabled. Select and copy the prompt below manually." : "浏览器未开启 JavaScript，请手动选中并复制下面的提示词。"}</p></noscript>
      <label class="boot-prompt-label" for="boot-prompt-${language}">${english ? "Short installation prompt" : "短安装提示词"}</label>
      <textarea id="boot-prompt-${language}" class="boot-prompt" rows="10" readonly spellcheck="false">${prompt}</textarea>
      <p class="boot-doc-links">${english ? "Full installation instructions: " : "完整安装说明："}<a href="https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL-PROMPT${suffix}.md" target="_blank" rel="noopener noreferrer">GitHub</a><span aria-hidden="true"> / </span><a href="https://gitee.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL-PROMPT${suffix}.md" target="_blank" rel="noopener noreferrer">${english ? "Gitee fallback" : "Gitee 备用源"}</a>${english ? ". If a mirror is missing the file, use the other source." : "。如镜像缺少文件，请使用另一来源。"}</p>
      <footer class="boot-contact"><span>${english ? "Contact Reef" : "联系作者 Reef"}</span><span>QQ 1843727310</span><a href="mailto:leningruan1@gmail.com">leningruan1@gmail.com</a><a href="https://github.com/ReefRuan" target="_blank" rel="noopener noreferrer">@ReefRuan</a></footer>
    </div>`;
  }).join("\n");
  return `<section id="boot-fallback" class="boot-fallback" aria-labelledby="boot-title-zh" hidden>${panels}</section>`;
}
