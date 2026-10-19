import introduction from "../docs/experience-introduction.md?raw";
import { useRef } from "react";
import { cardPrompts, type CardPromptId } from "./cardPrompts";

type Comparison = {
  number: string; label: string; title: string; description: string;
  beforeLabel: string; beforeTitle: string; beforeFooter: string;
  afterLabel: string; afterTitle: string; afterFooter: string;
  takeaway: string; benefits: string[];
};
type SceneEntry = { no: string; name: string; desc: string; prompts: string[] };
type ShotCopy = { alt: string; caption: string };
type Content = {
  note: string;
  sceneEntries: SceneEntry[];
  shots: Record<"sliders" | "masks" | "landscape" | "refine" | "grid" | "compare" | "loupe" | "rating" | "color" | "mask", ShotCopy>;
  first: Comparison;
  batch: Comparison;
  computer: Comparison & { followups: string[] };
};
const workflowPrelude = introduction.split("<!-- comparison-content:start -->")[0];
const workflowHeadingMatch = Array.from(workflowPrelude.matchAll(/^## ([^\r\n]+)\r?$/gm)).at(-1);
if (!workflowHeadingMatch || workflowHeadingMatch.index === undefined) throw new Error("Missing workflow introduction in experience-introduction.md");
const workflowHeading = workflowHeadingMatch[1];
const workflowParagraphs = workflowPrelude
  .slice(workflowHeadingMatch.index + workflowHeadingMatch[0].length)
  .trim()
  .split(/\r?\n\r?\n/)
  .filter(Boolean);
if (workflowParagraphs.length < 2) throw new Error("Workflow introduction needs the conversation and gallery paragraphs");
const block = introduction.match(/<!-- comparison-content:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- comparison-content:end -->/);
if (!block) throw new Error("Missing comparison content in experience-introduction.md");
const copy: Content = JSON.parse(block[1]);
if (!copy.sceneEntries?.length) throw new Error("Missing typical-usage entries in experience-introduction.md");
const shotSliders = `${import.meta.env.BASE_URL}experience/lr-develop-mountain.webp`;
const shotMasks = `${import.meta.env.BASE_URL}experience/lr-develop-masks.webp`;
const shotLandscape = `${import.meta.env.BASE_URL}experience/lr-develop-landscape.webp`;
const shotRefine = `${import.meta.env.BASE_URL}experience/conversation-refine-tight.webp`;
const shotGrid = `${import.meta.env.BASE_URL}experience/lr-library-grid.webp`;
const shotCompare = `${import.meta.env.BASE_URL}experience/lr-library-compare.webp`;
const shotLoupe = `${import.meta.env.BASE_URL}experience/lr-library-loupe.webp`;
const shotRating = `${import.meta.env.BASE_URL}experience/conversation-rating-tight.webp`;
const shotColor = `${import.meta.env.BASE_URL}experience/conversation-color-match.webp`;
const shotMask = `${import.meta.env.BASE_URL}experience/conversation-mask.webp`;

function Shot({ src, alt, caption, width, height }: { src: string; alt: string; caption: string; width: number; height: number }) {
  return <figure className="workflow-shot">
    <a className="workflow-shot-link" href={src} target="_blank" rel="noreferrer" aria-label={`放大查看：${caption}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" width={width} height={height} />
      <span className="workflow-shot-zoom" aria-hidden="true">查看大图 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 4h6v6M20 4l-8 8M10 20H4v-6M4 20l8-8" /></svg></span>
    </a>
    <figcaption>{caption}</figcaption>
  </figure>;
}

// Typical-usage examples: three things you can say to an Agent, with the exact
// prompt strings. Shown after the first real example so proof leads the section.
function SceneEntries() {
  return <div className="workflow-scene-entries">
    <span className="eyebrow scene-entries-label">试着这样说</span>
    <ol className="scene-entries" aria-label="典型用法示例">
      {copy.sceneEntries.map((scene) => (
        <li className="scene-entry" key={scene.no}>
          <span className="scene-no" aria-hidden="true">{scene.no}</span>
          <div className="scene-body">
            <strong>{scene.name}</strong>
            <span className="scene-desc">{scene.desc}</span>
            {scene.prompts.map((prompt) => <code key={prompt}>{prompt}</code>)}
          </div>
        </li>
      ))}
    </ol>
  </div>;
}

type CopyPrompt = (value: string, message: string) => Promise<boolean>;
const promptLabels: Record<CardPromptId, string> = {
  "01": "对话修图",
  "02": "批量选片",
  "03-A": "主体蒙版细调",
  "03-B": "参考图调色",
};

function ComparisonFigure({ item, children, variant = "", solo = false, promptIds, onCopyPrompt }: {
  item: Comparison;
  children?: React.ReactNode[];
  variant?: string;
  solo?: boolean;
  promptIds: CardPromptId[];
  onCopyPrompt?: CopyPrompt;
}) {
  const promptMenuRef = useRef<HTMLDetailsElement>(null);
  const copyPrompt = (id: CardPromptId) => {
    if (!onCopyPrompt) return;
    void onCopyPrompt(cardPrompts[id], `已复制「${promptLabels[id]}」提问，发给 Agent 即可开始`);
    if (promptMenuRef.current) promptMenuRef.current.open = false;
  };

  return <figure className={`workflow-figure ${variant ? `workflow-figure-${variant}` : ""}${solo ? " workflow-figure-solo" : ""}`} aria-labelledby={`workflow-${item.number}`}>
    <figcaption className="workflow-caption">
      <div className="workflow-index"><span>{item.number}</span>{item.label}</div>
      <h3 id={`workflow-${item.number}`}>{item.title}</h3>
      <div className="workflow-description-row">
        <p>{item.description}</p>
        {onCopyPrompt && (promptIds.length === 1
          ? <button className="workflow-prompt-trigger" type="button" onClick={() => copyPrompt(promptIds[0])} aria-label={`复制${promptLabels[promptIds[0]]}提问`}>复制提问</button>
          : <details className="workflow-prompt-picker" ref={promptMenuRef}>
            <summary className="workflow-prompt-trigger">复制提问</summary>
            <div className="workflow-prompt-menu" aria-label="选择要复制的提问">
              {promptIds.map((id) => <button key={id} type="button" onClick={() => copyPrompt(id)} aria-label={`复制${promptLabels[id]}提问`}>{promptLabels[id]}</button>)}
            </div>
          </details>)}
      </div>
    </figcaption>
    {solo
      ? <div className="workflow-board workflow-board-solo">
        <div className="workflow-side workflow-after"><header><span><i className="status-dot" aria-hidden="true" />{item.afterLabel}</span><h4>{item.afterTitle}</h4></header>{children?.[0]}<p className="workflow-path">{item.afterFooter}</p></div>
        <div className="workflow-contrast"><span className="workflow-contrast-mark" aria-hidden="true">×</span><div className="workflow-contrast-body"><strong>{item.beforeLabel} · {item.beforeTitle}</strong><span>{item.beforeFooter}</span></div></div>
      </div>
      : <div className="workflow-board">
        <div className="workflow-side workflow-before"><header><span>{item.beforeLabel}</span><h4>{item.beforeTitle}</h4></header>{children?.[0]}<p className="workflow-path">{item.beforeFooter}</p></div>
        <div className="workflow-side workflow-after"><header><span><i className="status-dot" aria-hidden="true" />{item.afterLabel}</span><h4>{item.afterTitle}</h4></header>{children?.[1]}<p className="workflow-path">{item.afterFooter}</p></div>
      </div>}
    <div className="workflow-summary"><p>{item.takeaway}</p><ul>{item.benefits.map(benefit => <li key={benefit}><span aria-hidden="true">✓</span>{benefit}</li>)}</ul></div>
  </figure>;
}

export function WorkflowComparisons({ onCopyPrompt }: { onCopyPrompt?: CopyPrompt } = {}) {
  return <section className="workflow-section" aria-labelledby="workflow-title">
    <header className="experience-section-heading"><h2 id="workflow-title">{workflowHeading}</h2>{workflowParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</header>
    <ComparisonFigure item={copy.first} promptIds={["01"]} onCopyPrompt={onCopyPrompt}>{[
      <div className="workflow-shot-stack" key="lightroom-edit">
        <Shot src={shotSliders} alt={copy.shots.sliders.alt} caption={copy.shots.sliders.caption} width={2200} height={1201} />
        <Shot src={shotMasks} alt={copy.shots.masks.alt} caption={copy.shots.masks.caption} width={2200} height={1201} />
        <Shot src={shotLandscape} alt={copy.shots.landscape.alt} caption={copy.shots.landscape.caption} width={2200} height={1201} />
      </div>,
      <Shot key="refine" src={shotRefine} alt={copy.shots.refine.alt} caption={copy.shots.refine.caption} width={1312} height={1690} />,
    ]}</ComparisonFigure>
    <SceneEntries />
    <ComparisonFigure item={copy.batch} variant="batch" promptIds={["02"]} onCopyPrompt={onCopyPrompt}>{[
      <div className="workflow-shot-stack" key="lightroom-select">
        <Shot src={shotGrid} alt={copy.shots.grid.alt} caption={copy.shots.grid.caption} width={2200} height={1201} />
        <Shot src={shotCompare} alt={copy.shots.compare.alt} caption={copy.shots.compare.caption} width={2200} height={1201} />
        <Shot src={shotLoupe} alt={copy.shots.loupe.alt} caption={copy.shots.loupe.caption} width={2200} height={1238} />
      </div>,
      <Shot key="rating" src={shotRating} alt={copy.shots.rating.alt} caption={copy.shots.rating.caption} width={1570} height={1770} />,
    ]}</ComparisonFigure>
    <ComparisonFigure item={copy.computer} variant="computer" promptIds={["03-A", "03-B"]} onCopyPrompt={onCopyPrompt}>{[
      <div className="workflow-shot-stack" key="mask">
        <Shot src={shotMask} alt={copy.shots.mask.alt} caption={copy.shots.mask.caption} width={1346} height={1307} />
        <div className="workflow-next"><span>还可以接着说</span><ul>{copy.computer.followups.map((followup) => <li key={followup}>{followup}</li>)}</ul></div>
      </div>,
      <Shot key="color" src={shotColor} alt={copy.shots.color.alt} caption={copy.shots.color.caption} width={989} height={1194} />,
    ]}</ComparisonFigure>
    <div className="workflow-source"><span>{copy.note}</span></div>
  </section>;
}
