// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import installPrompt from "../docs/install-prompt.md?raw";
import uninstallPrompt from "../docs/uninstall-prompt.md?raw";
import faqDocument from "../docs/faq.md?raw";
import experienceIntroduction from "../docs/experience-introduction.md?raw";
import { WorkflowComparisons } from "./WorkflowComparisons";

export type PortalPage = "gallery" | "experience";

const WORKBUDDY_INVITE_URL = "https://www.workbuddy.cn/events/invite?inviteCode=rozclpaflg2w";
const AUTHOR_CONTACT_URL = "./contact.html";

export const INSTALL_PROMPT = installPrompt.trim();
export const UNINSTALL_PROMPT = uninstallPrompt.trim();
const heroMatch = experienceIntroduction.match(/^## 工具介绍\r?\n\r?\n### ([^\r\n]+)\r?\n\r?\n([^\r\n]+)\r?\n\r?\n([^\r\n]+)/m);
if (!heroMatch) throw new Error("docs/experience-introduction.md is missing its tool introduction");
const heroTitle = heroMatch[1];
const heroIntroduction = heroMatch[2];
const heroTagline = heroMatch[3];

const agents: { name: string; href?: string }[] = [
  { name: "Codex" },
  { name: "WorkBuddy", href: WORKBUDDY_INVITE_URL },
  { name: "Kimi Work" },
];

// Both the copy payload and the accordion use the same standalone FAQ document.
export const INSTALL_PROMPT_WITH_FAQ = `${INSTALL_PROMPT}\n\n${faqDocument.trim()}`;
const faqItems = Array.from(
  faqDocument.matchAll(/^## (.+)\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm),
  (match) => ({ question: match[1].trim(), answer: match[2].trim() }),
);
if (!faqItems.length) throw new Error("docs/faq.md has no FAQ entries");

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
      <button className="agent-dialog-backdrop" aria-label="关闭说明" onClick={onClose} />
      <section ref={dialogRef} className="agent-dialog" role="dialog" aria-modal="true" aria-labelledby="agent-dialog-title">
        <div className="agent-dialog-topline">
          <span>Agent / ToneRelay / Lightroom</span>
          <button ref={closeRef} onClick={onClose} aria-label="关闭"><Icon name="close" /></button>
        </div>
        <div className="agent-dialog-body">
          <span className="eyebrow">第一次使用？从这里开始</span>
          <h2 id="agent-dialog-title">什么是 Agent？</h2>
          <p className="agent-dialog-lead">Agent 是能理解你的目标、选择工具、执行步骤，并根据返回结果继续判断的 AI 助手。ToneRelay 不是 Agent，而是让 Agent 操作 Lightroom 的本地工具。</p>
          <p className="agent-model-tip">推荐使用能看图的多模态模型</p>
          <figure className="agent-architecture" aria-label="Agent、ToneRelay MCP、Lightroom 插件与 Lightroom Classic 的连接">
            <div className="agent-architecture-flow">
              <div className="agent-architecture-node"><strong>Agent</strong><span>理解与判断</span></div>
              <span className="agent-architecture-arrow" aria-hidden="true">⇄</span>
              <div className="agent-architecture-node"><strong>ToneRelay MCP</strong><span>传递操作与预览</span></div>
              <span className="agent-architecture-arrow" aria-hidden="true">⇄</span>
              <div className="agent-architecture-node"><strong>Lightroom 插件</strong><span>执行与回读</span></div>
              <span className="agent-architecture-arrow" aria-hidden="true">⇄</span>
              <div className="agent-architecture-node"><strong>Lightroom</strong><span>Classic · 照片与 Catalog</span></div>
            </div>
          </figure>
          <div className="agent-dialog-actions">
            <a className="button-primary workbuddy-download" href={WORKBUDDY_INVITE_URL} target="_blank" rel="noopener noreferrer">立即下载 WorkBuddy <Icon name="external" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}

function AgentStrip({ onExplain }: { onExplain: () => void }) {
  return (
    <section className="agent-strip" aria-labelledby="agent-strip-title">
      <div className="agent-strip-heading">
        <div>
          <span className="eyebrow">工具介绍</span>
          <h1 id="agent-strip-title">{heroTitle}</h1>
          <p className="agent-intro">{inlineMarkdown(heroIntroduction)}</p>
          <p className="agent-benefits">{inlineMarkdown(heroTagline)}</p>
          <a className="author-contact" href={AUTHOR_CONTACT_URL}>
            联系作者 <Icon name="arrow" />
          </a>
        </div>
      </div>
      <div className="agent-picker">
        <span className="agent-list-label">推荐的客户端</span>
        <div className="agent-list" aria-label="推荐的客户端">
          {agents.map((agent) => agent.href ? (
            <a className="agent-chip agent-chip-link" href={agent.href} target="_blank" rel="noopener noreferrer" key={agent.name}>
              <strong>{agent.name}</strong><Icon name="external" />
            </a>
          ) : (
            <div className="agent-chip" key={agent.name}><strong>{agent.name}</strong></div>
          ))}
        </div>
        <button className="agent-help-link" onClick={onExplain}>什么是 Agent？</button>
      </div>
    </section>
  );
}

function DialogueSection({ onCopyUninstall }: { onCopyUninstall?: () => Promise<boolean> }) {
  return (
    <section className="dialogue-section" aria-labelledby="dialogue-title">
      <header className="experience-section-heading">
        <span className="eyebrow">对话</span>
        <h2 id="dialogue-title">有疑问，直接问。</h2>
        <p>从最常问的问题开始，点开一条就能看到回答。复制安装提示词时，这些回答也会一并交给 Agent。</p>
        {onCopyUninstall && <div className="dialogue-actions">
          <button className="prompt-copy-button" onClick={() => void onCopyUninstall()}><Icon name="copy" />复制卸载提示词</button>
          <span>发给 Agent，由它核对范围并完成卸载。</span>
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
            <div className="dialogue-answer"><span>回答</span><p>{inlineMarkdown(item.answer)}</p></div>
          </details>
        ))}
      </div>
    </section>
  );
}

function DocumentFooter() {
  return <footer className="document-footer"><span>© 2026 Reef Ruan · ToneRelay · <a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE" target="_blank" rel="noreferrer">AGPL-3.0-only</a> · <a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE-SCOPE.md" target="_blank" rel="noreferrer">授权范围与照片许可</a></span><a href="#gallery">回到画廊 <Icon name="arrow" /></a></footer>;
}

export function Documents({ onCopyUninstall }: { onCopyUninstall?: () => Promise<boolean> } = {}) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <main className="document-main experience-main">
      <AgentStrip onExplain={() => setHelpOpen(true)} />
      <WorkflowComparisons />
      <DialogueSection onCopyUninstall={onCopyUninstall} />
      <DocumentFooter />
      {helpOpen && typeof document !== "undefined" && createPortal(
        <AgentHelpDialog onClose={() => setHelpOpen(false)} />,
        document.body,
      )}
    </main>
  );
}
