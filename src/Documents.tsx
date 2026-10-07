import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import installPrompt from "../docs/install-prompt.md?raw";
import experienceIntroduction from "../docs/experience-introduction.md?raw";
import { WorkflowComparisons } from "./WorkflowComparisons";

export type PortalPage = "gallery" | "experience";

const WORKBUDDY_DOWNLOAD = "https://www.workbuddy.cn/work/";

const installPromptMatch = installPrompt.match(
  /^## 安装、修复或升级：复制这一段\s*\r?\n```text\s*\r?\n([\s\S]*?)\r?\n```/m,
);

if (!installPromptMatch) {
  throw new Error("docs/install-prompt.md is missing its fenced installation prompt section");
}

export const INSTALL_PROMPT = installPromptMatch[1].trim();
const uninstallPromptMatch = installPrompt.match(
  /^## 卸载或干净重装准备：复制这一段\s*\r?\n```text\s*\r?\n([\s\S]*?)\r?\n```/m,
);
if (!uninstallPromptMatch) {
  throw new Error("docs/install-prompt.md is missing its fenced uninstallation prompt section");
}
export const UNINSTALL_PROMPT = uninstallPromptMatch[1].trim();
export const INSTALL_PROMPT_DOCUMENT = installPrompt.trim();

type DocumentsProps = {
  onCopyPrompt: () => void;
  onCopyUninstall: () => void;
  onCopyDocument: () => void;
};

const agents = [
  { name: "Codex" },
  { name: "WorkBuddy" },
  { name: "Kimi Work" },
];

// Product FAQ prose has one source: the introduction Markdown.
const faqSection = experienceIntroduction.match(
  /^## 常见问题\s*\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/m,
)?.[1];
if (!faqSection) throw new Error("experience-introduction.md is missing its FAQ section");
const faqItems = Array.from(
  faqSection.matchAll(/^### (.+)\r?\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm),
  (match) => ({ question: match[1].trim(), answer: match[2].trim() }),
);
if (!faqItems.length) throw new Error("experience-introduction.md has no FAQ entries");

function faqAnswer(markdown: string): ReactNode[] {
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
          <ol>
            <li><span>1</span><div><strong>确认客户端</strong><p>明确你使用的是 Codex、WorkBuddy、Kimi Work，还是独立的 Kimi Code CLI。</p></div></li>
            <li><span>2</span><div><strong>复制安装提示词</strong><p>它会核对固定版本和对应客户端路径，并尽可能自主完成普通本机安装。</p></div></li>
            <li><span>3</span><div><strong>区分发行版与开发版</strong><p>没有公开发行物时不称一键成功；本机 checkout 只在你明确授权后用于开发版测试。</p></div></li>
          </ol>
          <div className="agent-dialog-actions">
            <a className="button-primary" href={WORKBUDDY_DOWNLOAD} target="_blank" rel="noreferrer">下载 WorkBuddy <Icon name="external" /></a>
            <a href="https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model" target="_blank" rel="noreferrer">模型配置说明 <Icon name="arrow" /></a>
          </div>
          <small>画廊展示风格方向；没有公开下载入口时，不要按编号安装模板。</small>
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
          <h1 id="agent-strip-title">扩展 Agent 操作 Lightroom 的<br />能力。</h1>
          <p className="agent-intro">ToneRelay 是面向 Lightroom Classic 的本地 MCP 工具套件。Agent 理解修图目标并决定下一步；ToneRelay 通过 MCP 与 Lightroom 插件执行操作、回读结果。</p>
          <p>Catalog 批量操作 · Lightroom 渲染回读 · 图像测量与对比 · 多方案候选</p>
          <small className="agent-capabilities">Codex 使用 Plugin；WorkBuddy 使用官方文档支持的用户级 MCP；Kimi Work 的个人插件与 Kimi Code CLI 本地 MCP 不同。请勿互相替代。</small>
        </div>
      </div>
      <div className="agent-picker">
        <span className="agent-list-label">客户端接入路径</span>
        <div className="agent-list" aria-label="客户端接入路径">
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

function ActionBand({ onCopy }: { onCopy: () => void }) {
  return (
    <section className="experience-cta" aria-labelledby="experience-title">
      <div>
        <span className="eyebrow">安装介绍</span>
        <h2 id="experience-title">复制提示词，<em>发给你的 Agent。</em></h2>
        <p>把提示词交给你正在使用的客户端。它会核对固定版本和官方接入方式，并尽可能自主完成普通本机步骤；开发版测试必须由你明确授权。</p>
      </div>
      <div className="experience-cta-actions">
        <button className="button-primary" onClick={onCopy}><Icon name="copy" />复制安装提示词</button>
        <small>当前没有可验证的公开固定版本发行物，公开一键安装尚未就绪。画廊不代表模板下载或按编号安装已开放。</small>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="use-cases-section" aria-labelledby="use-cases-title">
      <header className="experience-section-heading compact-heading">
        <span className="eyebrow">使用场景</span>
        <h2 id="use-cases-title">从一张照片，到一组照片。</h2>
        <p>人像、旅行和成组作品都可以先从画面目标说起，再挑选适合的调整方向。</p>
      </header>
      <div className="values-section">
        <article><span className="eyebrow">人像</span><h3>人像更干净，<br />但还是像本人。</h3><ul><li>压住发灰或过红的肤色</li><li>保留窗边光和高光细节</li><li>让背景退后，主体更清楚</li></ul></article>
        <article><span className="eyebrow">旅行与街头</span><h3>让照片保留<br />当时的空气。</h3><ul><li>保留阴天、夜色或暖灯的气氛</li><li>让不同地点的照片自然连贯</li><li>尝试胶片、清透或低饱和方向</li></ul></article>
        <article><span className="eyebrow">一组照片</span><h3>不是一张好看，<br />是一组成立。</h3><ul><li>先挑一张做方向样片</li><li>比较几种色彩和对比关系</li><li>保留最适合这组照片的版本</li></ul></article>
      </div>
    </section>
  );
}

function InstallPrompt({ onCopyUninstall, onCopyDocument }: Pick<DocumentsProps, "onCopyUninstall" | "onCopyDocument">) {
  return (
    <section className="prompt-section experience-prompt" aria-labelledby="install-prompt-title">
      <div className="prompt-heading">
        <div><span>安装提示词</span><h2 id="install-prompt-title">安装与卸载参考文档</h2></div>
        <div className="prompt-actions">
          <button onClick={onCopyUninstall}><Icon name="copy" />复制卸载提示词</button>
          <button onClick={onCopyDocument}><Icon name="copy" />复制完整文档</button>
        </div>
      </div>
      <p className="prompt-intro">开始安装用页面上方的“复制安装提示词”；只卸载用“复制卸载提示词”。需要卸载并重装时，请同时明确要求“干净重装验收”及已授权的安装来源。完整文档包含两段提示词和审阅 FAQ，供你查看。</p>
      <pre><code>{INSTALL_PROMPT_DOCUMENT}</code></pre>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="document-section faq-section experience-faq" aria-labelledby="faq-title">
      <div className="section-index"><span>常见问题</span><strong id="faq-title">使用前的小问题</strong></div>
      <div className="faq-content">
        <p className="faq-intro">关于修图、模板和安装，先看这几个最常见的问题。</p>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i>+</i></summary>
              <p>{faqAnswer(item.answer)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocumentFooter() {
  return <footer className="document-footer"><span>ToneRelay · 先看照片，再做选择</span><a href="#gallery">回到画廊 <Icon name="arrow" /></a></footer>;
}

export function Documents({ onCopyPrompt, onCopyUninstall, onCopyDocument }: DocumentsProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <main className="document-main experience-main">
      <AgentStrip onExplain={() => setHelpOpen(true)} />
      <ActionBand onCopy={onCopyPrompt} />
      <WorkflowComparisons />
      <UseCasesSection />
      <InstallPrompt onCopyUninstall={onCopyUninstall} onCopyDocument={onCopyDocument} />
      <FaqSection />
      <DocumentFooter />
      {helpOpen && <AgentHelpDialog onClose={() => setHelpOpen(false)} />}
    </main>
  );
}
