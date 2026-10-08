// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import installPrompt from "../docs/install-prompt.md?raw";
import faqDocument from "../docs/faq.md?raw";
import experienceIntroduction from "../docs/experience-introduction.md?raw";
import { WorkflowComparisons } from "./WorkflowComparisons";

export type PortalPage = "gallery" | "experience";

const WORKBUDDY_DOWNLOAD = "https://www.workbuddy.cn/work/";

export const INSTALL_PROMPT = installPrompt.trim();
const heroMatch = experienceIntroduction.match(/^## 工具介绍\r?\n\r?\n### ([^\r\n]+)\r?\n\r?\n([^\r\n]+)\r?\n\r?\n([^\r\n]+)/m);
if (!heroMatch) throw new Error("docs/experience-introduction.md is missing its tool introduction");
const heroTitle = heroMatch[1];
const heroIntroduction = heroMatch[2];
const heroTagline = heroMatch[3];

const agents = [
  { name: "Codex" },
  { name: "WorkBuddy" },
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
          <span>还没有 Agent？从这里开始</span>
          <button ref={closeRef} onClick={onClose} aria-label="关闭"><Icon name="close" /></button>
        </div>
        <div className="agent-dialog-body">
          <span className="eyebrow">第一次使用？从这里开始</span>
          <h2 id="agent-dialog-title">还没有 Agent？<br />先装一个。</h2>
          <p className="agent-dialog-lead">Agent 负责理解你的话、制定步骤、调用工具并判断结果。各客户端的接入方式不同；先用提示词确认是否已有固定版本发行物。</p>
          <div className="agent-connection-guide">
            <strong>它怎样接入 ToneRelay？</strong>
            <p>Codex 使用 Plugin；WorkBuddy 使用官方文档支持的用户级 MCP；Kimi Work 的个人插件与 Kimi Code CLI 本地 MCP 不同。请勿互相替代。</p>
          </div>
          <ol>
            <li><span>1</span><div><strong>确认客户端</strong><p>明确你使用的是 Codex、WorkBuddy、Kimi Work，还是独立的 Kimi Code CLI。</p></div></li>
            <li><span>2</span><div><strong>复制安装提示词</strong><p>它会核对固定版本和对应客户端路径，并尽可能自主完成普通本机安装。</p></div></li>
            <li><span>3</span><div><strong>区分发行版与开发版</strong><p>没有公开发行物时不称一键成功；本机 checkout 只在你明确授权后用于开发版测试。</p></div></li>
          </ol>
          <div className="agent-dialog-actions">
            <a className="button-primary" href={WORKBUDDY_DOWNLOAD} target="_blank" rel="noreferrer">下载 WorkBuddy <Icon name="external" /></a>
            <a href="https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model" target="_blank" rel="noreferrer">模型配置说明 <Icon name="arrow" /></a>
          </div>
          <small>画廊中的六个正式风格包可分别下载；是否能按编号自动安装，仍以当前 Runtime 版本为准。</small>
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
        </div>
      </div>
      <div className="agent-picker">
        <span className="agent-list-label">推荐的客户端</span>
        <div className="agent-list" aria-label="推荐的客户端">
        {agents.map((agent) => (
          <div className="agent-chip" key={agent.name}>
            <strong>{agent.name}</strong>
          </div>
        ))}
        </div>
        <button className="agent-help-link" onClick={onExplain}>什么是 Agent？</button>
      </div>
    </section>
  );
}

function DialogueSection() {
  return (
    <section className="dialogue-section" aria-labelledby="dialogue-title">
      <header className="experience-section-heading">
        <span className="eyebrow">对话</span>
        <h2 id="dialogue-title">有疑问，直接问。</h2>
        <p>从最常问的问题开始，点开一条就能看到回答。复制安装提示词时，这些回答也会一并交给 Agent。</p>
      </header>
      <div className="dialogue-list">
        {faqItems.map((item, index) => (
          <details key={item.question} open={index === 0}>
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

export function Documents() {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <main className="document-main experience-main">
      <AgentStrip onExplain={() => setHelpOpen(true)} />
      <WorkflowComparisons />
      <DialogueSection />
      <DocumentFooter />
      {helpOpen && <AgentHelpDialog onClose={() => setHelpOpen(false)} />}
    </main>
  );
}
