import introduction from "../docs/experience-introduction.md?raw";

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
  shots: { sliders: ShotCopy; refine: ShotCopy; loupe: ShotCopy; rating: ShotCopy; color: ShotCopy; mask: ShotCopy };
  first: Comparison & { followups: string[] };
  batch: Comparison;
  computer: Comparison;
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
const shotSliders = `${import.meta.env.BASE_URL}experience/lr-develop-sliders.webp`;
const shotRefine = `${import.meta.env.BASE_URL}experience/conversation-refine.webp`;
const shotLoupe = `${import.meta.env.BASE_URL}experience/lr-loupe.webp`;
const shotRating = `${import.meta.env.BASE_URL}experience/conversation-rating.webp`;
const shotColor = `${import.meta.env.BASE_URL}experience/conversation-color-match.webp`;
const shotMask = `${import.meta.env.BASE_URL}experience/conversation-mask.webp`;

function Shot({ src, alt, caption, width, height }: { src: string; alt: string; caption: string; width: number; height: number }) {
  return <figure className="workflow-shot">
    <img src={src} alt={alt} loading="lazy" width={width} height={height} />
    <figcaption><span className="window-dots" aria-hidden="true"><i /><i /><i /></span>{caption}</figcaption>
  </figure>;
}

// Typical-usage examples: three things you can say to an Agent, with the exact
// prompt strings. Rendered right below the workflow introduction.
function SceneEntries() {
  return <div className="workflow-scene-entries">
    <span className="eyebrow scene-entries-label">典型用法 · 可以这样对 Agent 说</span>
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

function ComparisonFigure({ item, children, variant = "", solo = false }: { item: Comparison; children?: React.ReactNode[]; variant?: string; solo?: boolean }) {
  return <figure className={`workflow-figure ${variant ? `workflow-figure-${variant}` : ""}${solo ? " workflow-figure-solo" : ""}`} aria-labelledby={`workflow-${item.number}`}>
    <figcaption className="workflow-caption"><div className="workflow-index"><span>{item.number}</span>{item.label}</div><h3 id={`workflow-${item.number}`}>{item.title}</h3><p>{item.description}</p></figcaption>
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

export function WorkflowComparisons() {
  return <section className="workflow-section" aria-labelledby="workflow-title">
    <header className="experience-section-heading"><h2 id="workflow-title">{workflowHeading}</h2>{workflowParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</header>
    <SceneEntries />
    <ComparisonFigure item={copy.first}>{[
      <Shot key="sliders" src={shotSliders} alt={copy.shots.sliders.alt} caption={copy.shots.sliders.caption} width={1800} height={1149} />,
      <div className="workflow-shot-stack" key="refine">
        <Shot src={shotRefine} alt={copy.shots.refine.alt} caption={copy.shots.refine.caption} width={1400} height={1405} />
        <div className="workflow-next"><span>接着说</span><ul>{copy.first.followups.map((followup) => <li key={followup}>{followup}</li>)}</ul></div>
      </div>,
    ]}</ComparisonFigure>
    <ComparisonFigure item={copy.batch} variant="batch">{[
      <Shot key="loupe" src={shotLoupe} alt={copy.shots.loupe.alt} caption={copy.shots.loupe.caption} width={1500} height={1285} />,
      <Shot key="rating" src={shotRating} alt={copy.shots.rating.alt} caption={copy.shots.rating.caption} width={1500} height={1020} />,
    ]}</ComparisonFigure>
    <ComparisonFigure item={copy.computer} variant="computer">{[
      <Shot key="mask" src={shotMask} alt={copy.shots.mask.alt} caption={copy.shots.mask.caption} width={1346} height={1307} />,
      <Shot key="color" src={shotColor} alt={copy.shots.color.alt} caption={copy.shots.color.caption} width={989} height={1194} />,
    ]}</ComparisonFigure>
    <div className="workflow-source"><span>{copy.note}</span></div>
  </section>;
}
