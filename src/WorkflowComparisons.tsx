import introduction from "../docs/experience-introduction.md?raw";

type Comparison = {
  number: string; label: string; title: string; description: string;
  beforeLabel: string; beforeTitle: string; beforeFooter: string;
  afterLabel: string; afterTitle: string; afterFooter: string;
  takeaway: string; benefits: string[];
};
type ShotCopy = { alt: string; caption: string };
type Content = {
  note: string; pendingNote: string;
  shots: { compare: ShotCopy; retouch: ShotCopy; loupe: ShotCopy; rating: ShotCopy };
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
const shotCompare = `${import.meta.env.BASE_URL}experience/lr-compare.webp`;
const shotRetouch = `${import.meta.env.BASE_URL}experience/conversation-retouch.webp`;
const shotLoupe = `${import.meta.env.BASE_URL}experience/lr-loupe.webp`;
const shotRating = `${import.meta.env.BASE_URL}experience/conversation-rating.webp`;

function Shot({ src, alt, caption, width, height }: { src: string; alt: string; caption: string; width: number; height: number }) {
  return <figure className="workflow-shot">
    <img src={src} alt={alt} loading="lazy" width={width} height={height} />
    <figcaption><span className="window-dots" aria-hidden="true"><i /><i /><i /></span>{caption}</figcaption>
  </figure>;
}

function ComparisonFigure({ item, children, variant = "", pending = false }: { item: Comparison; children?: [React.ReactNode, React.ReactNode]; variant?: string; pending?: boolean }) {
  return <figure className={`workflow-figure ${variant ? `workflow-figure-${variant}` : ""}`} aria-labelledby={`workflow-${item.number}`}>
    <figcaption className="workflow-caption"><div className="workflow-index"><span>{item.number}</span>{item.label}</div><h3 id={`workflow-${item.number}`}>{item.title}</h3><p>{item.description}</p></figcaption>
    {pending
      ? <p className="workflow-pending">{copy.pendingNote}</p>
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
    <ComparisonFigure item={copy.first}>{[
      <Shot key="compare" src={shotCompare} alt={copy.shots.compare.alt} caption={copy.shots.compare.caption} width={1800} height={823} />,
      <div className="workflow-shot-stack" key="retouch">
        <Shot src={shotRetouch} alt={copy.shots.retouch.alt} caption={copy.shots.retouch.caption} width={1500} height={1154} />
        <div className="workflow-next"><span>接着说</span><ul>{copy.first.followups.map((followup) => <li key={followup}>{followup}</li>)}</ul></div>
      </div>,
    ]}</ComparisonFigure>
    <ComparisonFigure item={copy.batch} variant="batch">{[
      <Shot key="loupe" src={shotLoupe} alt={copy.shots.loupe.alt} caption={copy.shots.loupe.caption} width={1500} height={1285} />,
      <Shot key="rating" src={shotRating} alt={copy.shots.rating.alt} caption={copy.shots.rating.caption} width={1500} height={1175} />,
    ]}</ComparisonFigure>
    <ComparisonFigure item={copy.computer} variant="computer" pending />
    <div className="workflow-source"><span>{copy.note}</span></div>
  </section>;
}
