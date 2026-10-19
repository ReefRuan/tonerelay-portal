// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import installPrompt from "../docs/install-prompt.md?raw";
import installPromptEnglish from "../docs/install-prompt.en.md?raw";
import uninstallPrompt from "../docs/uninstall-prompt.md?raw";
import uninstallPromptEnglish from "../docs/uninstall-prompt.en.md?raw";
import faqDocument from "../docs/faq.md?raw";
import faqDocumentEnglish from "../docs/faq.en.md?raw";
import experienceIntroduction from "../docs/experience-introduction.md?raw";
import experienceIntroductionEnglish from "../docs/experience-introduction.en.md?raw";
import { WorkflowComparisons } from "./WorkflowComparisons";
import { useLanguage, type Language } from "./i18n";

export type PortalPage = "gallery" | "experience";

const WORKBUDDY_INVITE_URL = "https://www.workbuddy.cn/events/invite?inviteCode=rozclpaflg2w";
const AUTHOR_CONTACT_URL = "./contact.html";

/**
 * Link to the ToneRelay introduction article.
 *
 * The article currently lives in a private repo with no public URL, so this
 * stays empty and every "阅读介绍文章" CTA renders nothing. Once the article
 * is published (Bilibili column / personal blog), fill in the URL here and
 * all CTAs light up automatically — it is the single source of truth.
 */
export const ARTICLE_URL = "";

export const INSTALL_PROMPT = installPrompt.trim();
export const UNINSTALL_PROMPT = uninstallPrompt.trim();
function readHero(markdown: string) {
  const match = markdown.match(/^### ([^\r\n]+)\r?\n\r?\n([^\r\n]+)\r?\n\r?\n([^\r\n]+)\r?\n\r?\n([^\r\n]+)/m);
  if (!match) throw new Error("An experience introduction is missing its tool introduction");
  return { title: match[1], introduction: match[2], capabilities: match[3], comparison: match[4] };
}
const heroByLanguage = {
  zh: readHero(experienceIntroduction),
  en: readHero(experienceIntroductionEnglish),
};

const agents: { name: string; href?: string }[] = [
  { name: "Codex" },
  { name: "WorkBuddy", href: WORKBUDDY_INVITE_URL },
  { name: "Kimi Work" },
];

// Both the copy payload and the accordion use the same standalone FAQ document.
export const INSTALL_PROMPT_WITH_FAQ = `${INSTALL_PROMPT}\n\n${faqDocument.trim()}`;
export function getInstallPrompt(language: Language): string {
  return language === "en"
    ? `${installPromptEnglish.trim()}\n\n${faqDocumentEnglish.trim()}`
    : INSTALL_PROMPT_WITH_FAQ;
}
export function getUninstallPrompt(language: Language): string {
  return language === "en" ? uninstallPromptEnglish.trim() : UNINSTALL_PROMPT;
}
function readFaq(markdown: string) {
  const items = Array.from(
    markdown.matchAll(/^## (.+)\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm),
    (match) => ({ question: match[1].trim(), answer: match[2].trim() }),
  );
  if (!items.length) throw new Error("A FAQ document has no FAQ entries");
  return items;
}
const faqByLanguage = { zh: readFaq(faqDocument), en: readFaq(faqDocumentEnglish) };

function inlineMarkdown(markdown: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const tokens = /\[([^\]]+)\]\(([^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const match of markdown.matchAll(tokens)) {
    const offset = match.index!;
    parts.push(markdown.slice(cursor, offset));
    if (match[1]) {
      const href = match[2];
      parts.push(/^https?:\/\//.test(href)
        ? <a key={offset} href={href} target="_blank" rel="noreferrer">{match[1]}</a>
        : match[1]);
    } else if (match[3]) {
      parts.push(<code key={offset}>{match[3]}</code>);
    } else {
      parts.push(<strong key={offset}>{match[4]}</strong>);
    }
    cursor = offset + match[0].length;
  }
  parts.push(markdown.slice(cursor));
  return parts;
}

function AgentHelpDialog({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, textarea, [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="agent-dialog-layer" role="presentation">
      <button className="agent-dialog-backdrop" aria-label={t("关闭说明", "Close explanation")} onClick={onClose} />
      <section ref={dialogRef} className="agent-dialog" role="dialog" aria-modal="true" aria-labelledby="agent-dialog-title">
        <div className="agent-dialog-topline">
          <span>Agent / ToneRelay / Lightroom</span>
          <button ref={closeRef} onClick={onClose} aria-label={t("关闭", "Close")}><Icon name="close" /></button>
        </div>
        <div className="agent-dialog-body">
          <span className="eyebrow">{t("第一次使用？从这里开始", "New here? Start with the basics")}</span>
          <h2 id="agent-dialog-title">{t("什么是 Agent？", "What is an Agent?")}</h2>
          <p className="agent-dialog-lead">{t("Agent 是能听懂要求、调用工具做事的 AI 助手。ToneRelay 不是 Agent，而是让 Agent 操作 Lightroom 的本地工具。", "An Agent is an AI assistant that understands requests and uses tools to act on them. ToneRelay is not an Agent; it is a local tool that lets an Agent work with Lightroom.")}</p>
          <p className="agent-model-tip">{t("建议选择能看图的模型", "Choose a model that can understand images")}</p>
          <figure className="agent-architecture" aria-label={t("Agent、ToneRelay MCP、Lightroom 插件与 Lightroom Classic 的连接", "Connections between the Agent, ToneRelay MCP, Lightroom plugin, and Lightroom Classic")}>
            <div className="agent-architecture-flow">
              <div className="agent-architecture-node"><strong>Agent</strong><span>{t("理解与判断", "Understand and decide")}</span></div>
              <span className="agent-architecture-arrow" aria-hidden="true">⇄</span>
              <div className="agent-architecture-node"><strong>ToneRelay MCP</strong><span>{t("传递操作与预览", "Relay actions and previews")}</span></div>
              <span className="agent-architecture-arrow" aria-hidden="true">⇄</span>
              <div className="agent-architecture-node"><strong>{t("Lightroom 插件", "Lightroom plugin")}</strong><span>{t("执行与回读", "Execute and read back")}</span></div>
              <span className="agent-architecture-arrow" aria-hidden="true">⇄</span>
              <div className="agent-architecture-node"><strong>Lightroom</strong><span>{t("Classic · 照片与目录", "Classic · Photos and Catalogs")}</span></div>
            </div>
          </figure>
          <div className="agent-dialog-actions">
            <a className="button-primary workbuddy-download" href={WORKBUDDY_INVITE_URL} target="_blank" rel="noopener noreferrer" title={t("打开 WorkBuddy 网站", "Open the WorkBuddy website")}>{t("立即下载 WorkBuddy", "Download WorkBuddy")} <Icon name="external" /></a>
            <span>{t("将打开 WorkBuddy 网站", "Opens the WorkBuddy website")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function WorkBuddyDownloadDialog({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);

  return <dialog ref={dialogRef} className="agent-dialog workbuddy-dialog" aria-labelledby="workbuddy-download-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="agent-dialog-topline">
      <h2 id="workbuddy-download-title">{t("扫码下载你的第一个 Agent 客户端", "Scan to get your first Agent client")}</h2>
      <button type="button" onClick={onClose} aria-label={t("关闭二维码", "Close QR code")}><Icon name="close" /></button>
    </div>
    <img className="workbuddy-download-poster" src={`${import.meta.env.BASE_URL}agents/workbuddy-download.jpg`} width={750} height={1110}
      alt={t("WorkBuddy 下载海报，右下方二维码可扫码打开 WorkBuddy 活动页面", "WorkBuddy download poster with a QR code in the lower-right corner linking to the WorkBuddy invitation page")} />
    <a className="workbuddy-poster-link" href={WORKBUDDY_INVITE_URL} target="_blank" rel="noopener noreferrer">
      {t("也可以直接打开下载页面", "Or open the download page")}<Icon name="external" />
    </a>
  </dialog>;
}

function AgentStrip({ onExplain, onCopyInstall, onDownloadQr }: {
  onExplain: () => void;
  onCopyInstall?: () => void;
  onDownloadQr: () => void;
}) {
  const { language, t } = useLanguage();
  const hero = heroByLanguage[language];
  return (
    <section className="agent-strip" aria-labelledby="agent-strip-title">
      <div className="agent-strip-heading">
        <div>
          <span className="eyebrow">{t("工具介绍", "Tool introduction")}</span>
          <h1 id="agent-strip-title">{hero.title}</h1>
          <p className="agent-intro">{inlineMarkdown(hero.introduction)}</p>
          <p className="agent-benefits">{inlineMarkdown(hero.capabilities)}</p>
          <p className="agent-comparison">{inlineMarkdown(hero.comparison)}</p>

          <div className="intro-cta-row">
            <span className="intro-install-glow">
              <button type="button" className="intro-cta is-primary" onClick={onCopyInstall} disabled={!onCopyInstall}>
                <Icon name="copy" />{t("复制安装提示词，发给 Agent", "Copy installation prompt for your Agent")}
              </button>
            </span>
            <a className="intro-cta is-quiet" href={WORKBUDDY_INVITE_URL} target="_blank" rel="noopener noreferrer">
              {t("没有 Agent？下载一个", "No Agent? Download one")}<Icon name="external" />
            </a>
            <button type="button" className="intro-cta is-quiet" onClick={onDownloadQr} aria-haspopup="dialog">
              {t("扫码下载 Agent", "Scan to get an Agent")}
            </button>
            {ARTICLE_URL ? (
              <a className="intro-cta is-quiet" href={ARTICLE_URL} target="_blank" rel="noreferrer">
                {t("阅读介绍文章", "Read the introduction")}<Icon name="external" />
              </a>
            ) : null}
            <a className="author-contact" href={`${AUTHOR_CONTACT_URL}${language === "en" ? "?lang=en" : ""}`}>
              {t("联系作者", "Contact the author")} <Icon name="arrow" />
            </a>
          </div>
        </div>
      </div>
      <div className="agent-picker">
        <span className="agent-list-label">{t("推荐的客户端", "Recommended clients")}</span>
        <div className="agent-list" aria-label={t("推荐的客户端", "Recommended clients")}>
          {agents.map((agent) => agent.href ? (
            <a className="agent-chip agent-chip-link" href={agent.href} target="_blank" rel="noopener noreferrer" key={agent.name}>
              <strong>{agent.name}</strong><Icon name="external" />
            </a>
          ) : (
            <div className="agent-chip" key={agent.name}><strong>{agent.name}</strong></div>
          ))}
        </div>
        <button className="agent-help-link" onClick={onExplain}>{t("什么是 Agent？", "What is an Agent?")}</button>
      </div>
    </section>
  );
}

function DialogueSection({ onCopyUninstall }: { onCopyUninstall?: () => Promise<boolean> }) {
  const { language, t } = useLanguage();
  const faqItems = faqByLanguage[language];
  return (
    <section className="dialogue-section" aria-labelledby="dialogue-title">
      <header className="experience-section-heading">
        <span className="eyebrow">{t("对话", "Questions")}</span>
        <h2 id="dialogue-title">{t("有疑问，直接问。", "Questions? Just ask.")}</h2>
        <p>{t("点开问题查看回答。复制安装提示词时，FAQ 也会一起交给 Agent。", "Open a question to see the answer. Copying the installation prompt also includes the FAQ for your Agent.")}</p>
        {onCopyUninstall && <div className="dialogue-actions">
          <button className="prompt-copy-button" onClick={() => void onCopyUninstall()}><Icon name="copy" />{t("复制卸载提示词", "Copy uninstallation prompt")}</button>
          <span>{t("发给 Agent，让它先核对范围，再按当前版本的说明卸载。", "Send it to your Agent to confirm the scope, then uninstall using the current version’s instructions.")}</span>
        </div>}
      </header>
      <div className="dialogue-list">
        {faqItems.map((item, index) => (
          <details key={item.question} name="experience-faq" open={index === 0}>
            <summary>
              <span className="dialogue-number">{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.question}</strong>
              <span className="dialogue-toggle" aria-hidden="true">＋</span>
            </summary>
            <div className="dialogue-answer"><span>{t("回答", "Answer")}</span><div className="dialogue-answer-body">
              {item.answer.split(/\r?\n\r?\n/).filter(Boolean).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{inlineMarkdown(paragraph)}</p>)}
            </div></div>
          </details>
        ))}
      </div>
    </section>
  );
}

function InstallationCallout({ onCopyInstall }: { onCopyInstall?: () => void }) {
  const { language, t } = useLanguage();
  const suffix = language === "en" ? ".en" : "";
  return <section className="installation-callout" id="installation" aria-labelledby="installation-title">
    <span className="eyebrow">{t("开始使用", "Get started")}</span>
    <h2 id="installation-title">{t("把安装交给 Agent，接着开始修图。", "Let your Agent help you install, then start editing.")}</h2>
    <p>{t("复制完整安装提示词和 FAQ，发给正在使用的 Agent。它会先检查已有安装与本机条件，再按官方说明继续。", "Copy the complete installation prompt and FAQ to your Agent. It will check existing components and local requirements before following the official instructions.")}</p>
    <div className="installation-callout-actions">
      <button type="button" className="intro-cta is-primary" onClick={onCopyInstall} disabled={!onCopyInstall}><Icon name="copy" />{t("复制安装提示词", "Copy installation prompt")}</button>
      <a className="intro-cta is-quiet" href={`https://github.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt${suffix}.md`} target="_blank" rel="noreferrer">{t("在 GitHub 查看并复制全文", "Read and copy the full prompt on GitHub")}<Icon name="external" /></a>
      <a className="intro-cta is-quiet" href={`https://gitee.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt${suffix}.md`} target="_blank" rel="noreferrer">{t("Gitee 备用提示词全文", "Full prompt on Gitee")}<Icon name="external" /></a>
      <a className="intro-cta is-quiet" href={`https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL${suffix}.md`} target="_blank" rel="noreferrer">{t("安装步骤与要求", "Installation steps and requirements")}<Icon name="external" /></a>
    </div>
    <p>{t("复制提示词不等于完成安装；请让 Agent 核对版本、权限与连接状态。", "Copying the prompt does not complete installation. Ask your Agent to verify the version, permissions, and connection.")}</p>
  </section>;
}

function DocumentFooter() {
  const { language, t } = useLanguage();
  return <footer className="document-footer"><span>© 2026 Reef Ruan · ToneRelay · <a href={`${import.meta.env.BASE_URL}${language === "en" ? "?lang=en" : ""}#experience`}>{t("安装与使用", "Install & use")}</a> · <a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE" target="_blank" rel="noreferrer">AGPL-3.0-only</a> · <a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE-SCOPE.md" target="_blank" rel="noreferrer">{t("授权范围与照片许可", "License scope and photo licenses")}</a></span><a href={`${language === "en" ? "?lang=en" : ""}#gallery`}>{t("回到画廊", "Back to gallery")} <Icon name="arrow" /></a></footer>;
}

export function Documents({ onCopyUninstall, onCopyInstall, onCopyPrompt }: {
  onCopyUninstall?: () => Promise<boolean>;
  onCopyInstall?: () => void;
  onCopyPrompt?: (value: string, message: string) => Promise<boolean>;
} = {}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [downloadQrOpen, setDownloadQrOpen] = useState(false);
  return (
    <main className="document-main experience-main">
      <AgentStrip onExplain={() => setHelpOpen(true)} onCopyInstall={onCopyInstall} onDownloadQr={() => setDownloadQrOpen(true)} />
      <WorkflowComparisons onCopyPrompt={onCopyPrompt} />
      <DialogueSection onCopyUninstall={onCopyUninstall} />
      <InstallationCallout onCopyInstall={onCopyInstall} />
      <DocumentFooter />
      {helpOpen && typeof document !== "undefined" && createPortal(
        <AgentHelpDialog onClose={() => setHelpOpen(false)} />,
        document.body,
      )}
      {downloadQrOpen && typeof document !== "undefined" && createPortal(
        <WorkBuddyDownloadDialog onClose={() => setDownloadQrOpen(false)} />,
        document.body,
      )}
    </main>
  );
}
