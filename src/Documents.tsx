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
    title: "把一张照片调到位",
    description: "说清楚你想要的明暗、颜色和情绪，再从结果里继续细调。",
    boundary: "例：保留夕阳的暖意，让人物肤色自然。",
    asset: "feature-real-preview.webp",
    diagram: "preview",
  },
  {
    number: "02",
    title: "跟着参考图找感觉",
    description: "选一张喜欢的风格参考，让调整朝同一种光线和色彩关系靠近。",
    boundary: "例：把阴天旅行照变成清爽、克制的彩色负片。",
    asset: "feature-agent-queue.webp",
    diagram: "queue",
  },
  {
    number: "03",
    title: "让一组照片看起来像一组",
    description: "给同一趟旅行、婚礼或日常记录建立连贯的整体观感。",
    boundary: "例：统一室内、户外和混合光下的色彩倾向。",
    asset: "feature-background-variants.webp",
    diagram: "background",
  },
  {
    number: "04",
    title: "先试几种，再选一张",
    description: "面对拿不准的照片，可以先比较几种方向，再保留最喜欢的版本。",
    boundary: "例：同一张夜景分别试胶片、干净数码和电影感。",
    asset: "feature-measure-json.webp",
    diagram: "measure",
  },
];

const faqItems = [
  {
    question: "我可以怎么描述想要的效果？",
    answer: "直接用日常语言即可，例如“保留傍晚的暖色，但让人物肤色更干净”“调成低饱和、阴影有层次的街头照片”，或“让这组旅行照看起来像同一天拍的”。",
  },
  {
    question: "需要先懂 Lightroom 参数吗？",
    answer: "不需要。先说出你想留下什么、改变什么；看到结果后，再继续说“更暖一点”“压住高光”或“不要动肤色”。",
  },
  {
    question: "模板和普通预设有什么不同？",
    answer: "预设是一组固定滑块；模板更像一个调色方向。Agent 会结合当前照片和模板的视觉目标，决定如何调整。",
  },
  {
    question: "怎样选择模板？",
    answer: "先在画廊看示例和一句话说明，选中喜欢的编号；之后可以让 Agent 将它用于当前照片或一组照片。",
  },
  {
    question: "会直接覆盖我的原片吗？",
    answer: "不会。ToneRelay 的编辑目标是 Lightroom 中的虚拟副本；确认喜欢结果后，再由你决定是否保留。",
  },
  {
    question: "怎么开始安装？",
    answer: "点击“复制安装提示词”，把它交给你正在使用的 Agent。它会按安装说明完成 MCP 和 Lightroom 插件的配置。",
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
          <span>还没有 Agent？从这里开始</span>
          <button ref={closeRef} onClick={onClose} aria-label="关闭"><Icon name="close" /></button>
        </div>
        <div className="agent-dialog-body">
          <span className="eyebrow">给第一次使用 Agent 的人</span>
          <h2 id="agent-dialog-title">还没有 Agent？<br />先装一个。</h2>
          <p className="agent-dialog-lead">Agent 不只是聊天框。它能在你的电脑上完成安装步骤，也能和 Lightroom 一起工作。</p>
          <ol>
            <li><span>1</span><div><strong>安装 WorkBuddy</strong><p>从官方中国站下载适合你系统的客户端。</p></div></li>
            <li><span>2</span><div><strong>登录并选择模型</strong><p>使用内置模型，或在设置中配置你自己的模型。</p></div></li>
            <li><span>3</span><div><strong>回到这里复制提示词</strong><p>把完整提示词发给 Agent，剩下的交给它完成。</p></div></li>
          </ol>
          <div className="agent-dialog-actions">
            <a className="button-primary" href={WORKBUDDY_DOWNLOAD} target="_blank" rel="noreferrer">下载 WorkBuddy <Icon name="external" /></a>
            <a href="https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model" target="_blank" rel="noreferrer">模型配置说明 <Icon name="arrow" /></a>
          </div>
          <small>安装完成后，回到画廊选一张风格模板开始修图。</small>
        </div>
      </section>
    </div>
  );
}

function AgentStrip({ onExplain }: { onExplain: () => void }) {
  return (
    <section className="agent-strip" aria-labelledby="agent-strip-title">
      <div className="agent-strip-heading">
        <div><span className="eyebrow">支持的 Agent</span><h1 id="agent-strip-title">交给你正在使用的 Agent</h1></div>
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
        <span className="eyebrow">从这里开始</span>
        <h2 id="experience-title">一段提示词，<em>把安装交给 Agent。</em></h2>
        <p>不需要先理解 MCP。把安装交给 Agent，之后直接告诉它你想要怎样的照片。</p>
      </div>
      <div className="experience-cta-actions">
        <button className="button-primary" onClick={onCopy}><Icon name="copy" />复制安装提示词</button>
        <a className="button-secondary" href={RUNTIME_REPOSITORY} target="_blank" rel="noreferrer">去 GitHub 点 Star <Icon name="external" /></a>
        <small>适用于支持 MCP 的桌面 Agent 与 Lightroom Classic。</small>
      </div>
    </section>
  );
}

function DiagramPlaceholder({ type, asset }: { type: string; asset: string }) {
  return (
    <div className={`feature-visual visual-${type}`} aria-label={`${asset} 图片占位`}>
      <div className="visual-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="visual-signal" aria-hidden="true"><i /><i /><i /></div>
      <span>效果图待补</span><small>4 : 3</small>
    </div>
  );
}

function FeatureSection() {
  return (
    <section className="feature-section" aria-labelledby="feature-title">
      <header className="experience-section-heading">
        <span className="eyebrow">修图例子</span>
        <h2 id="feature-title">你想修成什么样？<br /><em>从一句话开始。</em></h2>
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
        <span className="eyebrow">一张照片，两种方法</span>
        <h2 id="compare-title">同一张照片，两种修法。</h2>
      </header>
      <div className="compare-grid">
        <article className="compare-card compare-without">
          <div className="compare-visual" aria-label="compare-without.webp 图片占位">
            <div className="tangle-lines" aria-hidden="true"><i /><i /><i /><i /></div><span>效果对比待补</span><small>16 : 10</small>
          </div>
          <div><span>自己慢慢试</span><h3>打开照片、推拉滑块，<br />反复比较。</h3><p>适合你已经清楚知道每一步要怎么调。</p></div>
        </article>
        <article className="compare-card compare-with">
          <div className="compare-visual" aria-label="compare-with.webp 图片占位">
            <div className="clean-flow" aria-hidden="true"><i>目标</i><b /><i>调整</i><b /><i>LR</i><b /><i>结果</i></div><span>效果对比待补</span><small>16 : 10</small>
          </div>
          <div><span>和 ToneRelay 一起</span><h3>说出目标、看结果，<br />再继续细调。</h3><p>适合你知道想要什么画面，但不想从一排滑块开始。</p></div>
        </article>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="values-section" aria-label="常见修图例子">
      <article><span className="eyebrow">人像</span><h3>人像更干净，<br />但还是像本人。</h3><ul><li>压住发灰或过红的肤色</li><li>保留窗边光和高光细节</li><li>让背景退后，主体更清楚</li></ul></article>
      <article><span className="eyebrow">旅行与街头</span><h3>让照片保留<br />当时的空气。</h3><ul><li>保留阴天、夜色或暖灯的气氛</li><li>让不同地点的照片自然连贯</li><li>尝试胶片、清透或低饱和方向</li></ul></article>
      <article><span className="eyebrow">一组照片</span><h3>不是一张好看，<br />是一组成立。</h3><ul><li>先挑一张做方向样片</li><li>比较几种色彩和对比关系</li><li>保留最适合这组照片的版本</li></ul></article>
    </section>
  );
}

function InstallPrompt({ onCopy }: { onCopy: () => void }) {
  return (
    <section className="prompt-section experience-prompt" aria-labelledby="install-prompt-title">
      <div className="prompt-heading"><div><span>交给 Agent / 全部复制</span><h2 id="install-prompt-title">完整安装提示词</h2></div><button onClick={onCopy}><Icon name="copy" />复制全部</button></div>
      <pre><code>{INSTALL_PROMPT}</code></pre>
      <p>把这段文字交给 Agent，它会完成 ToneRelay 与 Lightroom 的安装准备。</p>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="document-section faq-section experience-faq" aria-labelledby="faq-title">
      <div className="section-index"><span>开始之前</span><strong id="faq-title">使用前的小问题</strong></div>
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
  return <footer className="document-footer"><span>ToneRelay · 先看照片，再做选择</span><a href="#gallery">回到画廊 <Icon name="arrow" /></a></footer>;
}

export function Documents({ onCopyPrompt }: DocumentsProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <main className="document-main experience-main">
      <AgentStrip onExplain={() => setHelpOpen(true)} />
      <ActionBand onCopy={onCopyPrompt} />
      <FeatureSection />
      <CompareSection />
      <UseCasesSection />
      <InstallPrompt onCopy={onCopyPrompt} />
      <FaqSection />
      <DocumentFooter />
      {helpOpen && <AgentHelpDialog onClose={() => setHelpOpen(false)} />}
    </main>
  );
}
