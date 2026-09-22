import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export type PortalPage = "gallery" | "experience";

const RUNTIME_REPOSITORY = "https://github.com/ReefRuan/tonerelay-lightroom-mcp";
const WORKBUDDY_DOWNLOAD = "https://www.workbuddy.cn/work/";

export const INSTALL_PROMPT = `请为我安装 ToneRelay for Lightroom Classic。

ToneRelay Runtime 官方仓库：
https://github.com/ReefRuan/tonerelay-lightroom-mcp

只使用上述官方仓库，以及该仓库文档明确列出的官方镜像。不要使用搜索结果中的第三方仓库、第三方脚本或第三方下载地址。

请按下面的顺序完成：
1. 完整读取仓库根目录最新的 CODEX_INSTALL.md。
2. 按文档安装 ToneRelay MCP，并注册到当前 Agent 客户端。
3. 安装 ToneRelay Lightroom Classic 插件。
4. 完成 MCP 工具发现、Lightroom 插件连接和无副作用健康检查。
5. 遇到已知问题时，读取仓库指定的 FAQ.md 或 TROUBLESHOOTING.md，按其中的诊断流程继续。
6. 全部成功后，告诉我回家页面、模板 Portal，以及“按编号安装模板”的使用方法。

不要仅因为打开了网页、复制了命令或下载了文件就宣布成功。如果 CODEX_INSTALL.md 尚未发布、缺少必要权限或当前环境不受支持，请明确说明并安全停止，不要猜测安装命令。`;

type DocumentsProps = {
  onCopyPrompt: () => void;
};

const agents = [
  { mark: "CX", name: "Codex", note: "OpenAI Agent" },
  { mark: "WB", name: "WorkBuddy", note: "桌面 Agent" },
  { mark: "OC", name: "OpenClaw", note: "MCP Client" },
  { mark: "+", name: "更多", note: "支持 MCP 的 Agent" },
];

const features = [
  {
    number: "01",
    title: "看见真实预览",
    description: "让 Agent 观察 Lightroom 实际渲染结果，再决定下一步。",
    boundary: "预览是证据，不用参数名代替画面。",
    asset: "feature-real-preview.webp",
    diagram: "preview",
  },
  {
    number: "02",
    title: "多 Agent，单执行队列",
    description: "多个 Agent 可以同时分析，Lightroom 写操作按顺序安全落地。",
    boundary: "并行的是观察与规划，不是 Lightroom 副作用。",
    asset: "feature-agent-queue.webp",
    diagram: "queue",
  },
  {
    number: "03",
    title: "候选方案放到后台跑",
    description: "参数变体进入后台任务，Agent 查询状态后再比较结果。",
    boundary: "任务可恢复；Lightroom 命令仍由队列执行。",
    asset: "feature-background-variants.webp",
    diagram: "background",
  },
  {
    number: "04",
    title: "少占上下文，少走回头路",
    description: "Measure 把像素变成稳定的标量、分布、矩阵和局部采样。",
    boundary: "减少重复传图与 Lightroom 往返；不虚构 token 或时间比例。",
    asset: "feature-measure-json.webp",
    diagram: "measure",
  },
];

const faqItems = [
  {
    question: "复制提示词后，会自动安装哪些东西？",
    answer: "目标流程会安装 ToneRelay MCP、把它注册到当前 Agent、安装 Lightroom Classic 插件，并运行工具发现、插件连接和无副作用健康检查。当前资料若尚未发布，提示词会要求 Agent 安全停止。",
  },
  {
    question: "为什么博客不直接放一长串安装命令？",
    answer: "博客可能被转载或长期缓存，所以只保留稳定提示词。Agent 每次从官方 Runtime 仓库读取最新 CODEX_INSTALL.md，安装方法可以更新，而旧文章不必同步改写。",
  },
  {
    question: "什么才算安装成功？",
    answer: "MCP 必须能被当前客户端发现，Lightroom 插件必须已经安装并连接，且无副作用健康检查通过。打开仓库、下载文件或复制命令都不算完成。",
  },
  {
    question: "GitHub 访问不稳定怎么办？",
    answer: "正式发布后，Runtime 会声明 GitHub、Gitee、GitCode 等官方仓库身份。MCP 只在权威白名单镜像之间切换，不会自行信任搜索结果里的第三方下载源。",
  },
  {
    question: "模板会让 Runtime 安装包越来越大吗？",
    answer: "不会。Runtime 不携带整座模板库。你选择模板编号后，Agent 才从官方分发仓库按需取得对应 Markdown、封面和参考图，并存入本地 Context Store。",
  },
  {
    question: "模板只是一个 Lightroom 预设吗？",
    answer: "不是。模板首先是给 Agent 阅读的风格上下文，包括文字说明和多张真实参考图。Agent 结合当前照片制定参数，Runtime 再负责确定性执行。",
  },
  {
    question: "会上传照片或 Lightroom Catalog 吗？",
    answer: "无后端分发只读取公开文档、目录和模板文件，不要求上传照片或 Catalog。模型是否读取图片、数据如何处理，仍以你选择的 Agent 和模型服务说明为准。",
  },
  {
    question: "安装失败时，要给 Agent 留下什么？",
    answer: "保留操作系统、Agent 版本、Lightroom 版本、失败步骤和完整错误原文，再让 Agent 读取官方 FAQ.md 或 TROUBLESHOOTING.md。缺权限、版本不支持或官方资料缺失时，应明确停止而不是猜命令。",
  },
];

function AgentHelpDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
      <section className="agent-dialog" role="dialog" aria-modal="true" aria-labelledby="agent-dialog-title">
        <div className="agent-dialog-topline">
          <span>NO AGENT YET? / START HERE</span>
          <button ref={closeRef} onClick={onClose} aria-label="关闭"><Icon name="close" /></button>
        </div>
        <div className="agent-dialog-body">
          <span className="eyebrow">给第一次使用 Agent 的人</span>
          <h2 id="agent-dialog-title">还没有 Agent？<br />先装一个。</h2>
          <p className="agent-dialog-lead">Agent 不只是聊天框。它能阅读安装文档、调用你授权的本机工具，并检查是否真的安装成功。</p>
          <ol>
            <li><span>1</span><div><strong>安装 WorkBuddy</strong><p>从官方中国站下载适合你系统的客户端。</p></div></li>
            <li><span>2</span><div><strong>登录并选择模型</strong><p>使用内置模型，或在设置中配置你自己的模型。</p></div></li>
            <li><span>3</span><div><strong>回到这里复制提示词</strong><p>把完整提示词发给 Agent，让它读取官方安装文档。</p></div></li>
          </ol>
          <div className="agent-dialog-actions">
            <a className="button-primary" href={WORKBUDDY_DOWNLOAD} target="_blank" rel="noreferrer">下载 WorkBuddy <Icon name="external" /></a>
            <a href="https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model" target="_blank" rel="noreferrer">模型配置说明 <Icon name="arrow" /></a>
          </div>
          <small>仅链接 WorkBuddy 官方站点；安装 ToneRelay 时仍应只信任 Runtime 文档列出的官方仓库。</small>
        </div>
      </section>
    </div>
  );
}

function AgentStrip({ onExplain }: { onExplain: () => void }) {
  return (
    <section className="agent-strip" aria-labelledby="agent-strip-title">
      <div className="agent-strip-heading">
        <div><span className="eyebrow">SUPPORTED AGENTS</span><h1 id="agent-strip-title">交给你正在使用的 Agent</h1></div>
        <button onClick={onExplain}>这是什么？ <Icon name="details" /></button>
      </div>
      <div className="agent-list" aria-label="支持的 Agent">
        {agents.map((agent) => (
          <div className="agent-chip" key={agent.name}>
            <i aria-hidden="true">{agent.mark}</i>
            <p><strong>{agent.name}</strong><span>{agent.note}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionBand({ onCopy }: { onCopy: () => void }) {
  return (
    <section className="experience-cta" aria-labelledby="experience-title">
      <div>
        <span className="eyebrow">TONE RELAY / START HERE</span>
        <h2 id="experience-title">一段提示词，<em>把安装交给 Agent。</em></h2>
        <p>不需要先理解 MCP。Agent 会读取官方文档、安装、连接 Lightroom，并验证结果。</p>
      </div>
      <div className="experience-cta-actions">
        <button className="button-primary" onClick={onCopy}><Icon name="copy" />复制安装提示词</button>
        <a className="button-secondary" href={RUNTIME_REPOSITORY} target="_blank" rel="noreferrer">去 GitHub 点 Star <Icon name="external" /></a>
        <small>当前为流程预览。正式安装文档未发布时，Agent 会安全停止。</small>
      </div>
    </section>
  );
}

function DiagramPlaceholder({ type, asset }: { type: string; asset: string }) {
  return (
    <div className={`feature-visual visual-${type}`} aria-label={`${asset} 图片占位`}>
      <div className="visual-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="visual-signal" aria-hidden="true"><i /><i /><i /></div>
      <span>{asset}</span><small>4:3 IMAGE PLACEHOLDER</small>
    </div>
  );
}

function FeatureSection() {
  return (
    <section className="feature-section" aria-labelledby="feature-title">
      <header className="experience-section-heading">
        <span className="eyebrow">WHAT CHANGES / 01—04</span>
        <h2 id="feature-title">不是更会猜。<br /><em>是更会看、更会等、更会验证。</em></h2>
      </header>
      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <DiagramPlaceholder type={feature.diagram} asset={feature.asset} />
            <div className="feature-copy"><span>{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.description}</p><small>{feature.boundary}</small></div></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompareSection() {
  return (
    <section className="compare-section" aria-labelledby="compare-title">
      <header className="experience-section-heading compact-heading">
        <span className="eyebrow">WORKFLOW COMPARISON</span>
        <h2 id="compare-title">同一张照片，两种工作方式。</h2>
      </header>
      <div className="compare-grid">
        <article className="compare-card compare-without">
          <div className="compare-visual" aria-label="compare-without.webp 图片占位">
            <div className="tangle-lines" aria-hidden="true"><i /><i /><i /><i /></div><span>compare-without.webp</span><small>16:10 IMAGE PLACEHOLDER</small>
          </div>
          <div><span>WITHOUT</span><h3>参考图、猜参数、窗口操作<br />混在一次对话里。</h3><p>上下文容易丢失，失败以后很难知道从哪里继续。</p></div>
        </article>
        <article className="compare-card compare-with">
          <div className="compare-visual" aria-label="compare-with.webp 图片占位">
            <div className="clean-flow" aria-hidden="true"><i>CTX</i><b /><i>QUEUE</i><b /><i>LR</i><b /><i>READ</i></div><span>compare-with.webp</span><small>16:10 IMAGE PLACEHOLDER</small>
          </div>
          <div><span>WITH TONERELAY</span><h3>上下文 → 队列 → Lightroom<br />→ 回读 → 再决策。</h3><p>每一步都有边界、状态和证据，可以暂停，也可以恢复。</p></div>
        </article>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="values-section" aria-label="设计理念、开源承诺与使用场景">
      <article><span className="eyebrow">DESIGN PRINCIPLES</span><h3>先看证据，<br />再改参数。</h3><ul><li>审美判断与确定性执行分开</li><li>用户选择风格，Runtime 不暗中推荐</li><li>原片优先，编辑落在虚拟副本</li></ul></article>
      <article><span className="eyebrow">OPEN SOURCE PROMISE</span><h3>公开，可审查，<br />不藏后端。</h3><ul><li>源码、安装文档与分发协议公开</li><li>只使用声明过的官方 Git 镜像</li><li>模板按需下载，不塞进 Runtime</li></ul></article>
      <article><span className="eyebrow">USE CASES</span><h3>从一张参考图，<br />到可恢复的实验。</h3><ul><li>单张参考风格匹配</li><li>批量候选与结构化比较</li><li>多 Agent 共用 Lightroom</li><li>长时间后台实验与复盘</li></ul></article>
    </section>
  );
}

function InstallPrompt({ onCopy }: { onCopy: () => void }) {
  return (
    <section className="prompt-section experience-prompt" aria-labelledby="install-prompt-title">
      <div className="prompt-heading"><div><span>FOR AGENT / COPY ALL</span><h2 id="install-prompt-title">完整安装提示词</h2></div><button onClick={onCopy}><Icon name="copy" />复制全部</button></div>
      <pre><code>{INSTALL_PROMPT}</code></pre>
      <p>这段文字是给 Agent 看的：它包含权威来源、执行顺序、成功条件与安全停止条件。</p>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="document-section faq-section experience-faq" aria-labelledby="faq-title">
      <div className="section-index"><span>FAQ / FOR HUMAN + AGENT</span><strong id="faq-title">安装与分发答疑</strong></div>
      <div className="faq-list">
        {faqItems.map((item, index) => (
          <details key={item.question} open={index === 0}>
            <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i>+</i></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function DocumentFooter() {
  return <footer className="document-footer"><span>TONE RELAY / EVIDENCE BEFORE ACTION</span><a href="#gallery">回到画廊 <Icon name="arrow" /></a></footer>;
}

export function Documents({ onCopyPrompt }: DocumentsProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <main className="document-main experience-main">
      <AgentStrip onExplain={() => setHelpOpen(true)} />
      <ActionBand onCopy={onCopyPrompt} />
      <FeatureSection />
      <CompareSection />
      <ValuesSection />
      <InstallPrompt onCopy={onCopyPrompt} />
      <FaqSection />
      <DocumentFooter />
      {helpOpen && <AgentHelpDialog onClose={() => setHelpOpen(false)} />}
    </main>
  );
}
