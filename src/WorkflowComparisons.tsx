import introduction from "../docs/experience-introduction.md?raw";

type Comparison = {
  number: string; label: string; title: string; description: string;
  beforeLabel: string; beforeTitle: string; beforeFooter: string;
  afterLabel: string; afterTitle: string; afterFooter: string;
  takeaway: string; benefits: string[];
};
type ShotCopy = { alt: string; caption: string };
type Content = {
  note: string;
  shots: { compare: ShotCopy; retouch: ShotCopy; loupe: ShotCopy; rating: ShotCopy };
  first: Comparison & { followups: string[] };
  batch: Comparison;
  computer: Comparison & {
    steps: string[];
    request: string;
    referenceLabel: string;
    sourceLabel: string;
    rounds: { label: string; observation: string }[];
  };
  photoAlt: string; imageCredit: string; imageCreditUrl: string;
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
const photo = `${import.meta.env.BASE_URL}official-previews/fuji-film-pro-160ns.jpg`;
const referencePhoto = `${import.meta.env.BASE_URL}previews/fuji-film-pro-160ns/02.webp`;
const batchPhotos = [
  "previews/fuji-film-pro-160ns/01.webp",
  "previews/fuji-film-c200/02.webp",
  "previews/fuji-film-provia-100f/03.webp",
  "previews/fuji-film-superia-xtra-400/05.webp",
].map(path => `${import.meta.env.BASE_URL}${path}`);
const shotCompare = `${import.meta.env.BASE_URL}experience/lr-compare.webp`;
const shotRetouch = `${import.meta.env.BASE_URL}experience/conversation-retouch.webp`;
const shotLoupe = `${import.meta.env.BASE_URL}experience/lr-loupe.webp`;
const shotRating = `${import.meta.env.BASE_URL}experience/conversation-rating.webp`;

function Photo({ alt = copy.photoAlt, src = photo }: { alt?: string; src?: string }) {
  return <img className="workflow-photo" src={src} alt={alt} loading="lazy" width="600" height="600" />;
}

function WindowBar({ name }: { name: string }) {
  return <div className="workflow-window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>{name}</span><span className="window-mode">示意</span></div>;
}

function Shot({ src, alt, caption, width, height }: { src: string; alt: string; caption: string; width: number; height: number }) {
  return <figure className="workflow-shot">
    <img src={src} alt={alt} loading="lazy" width={width} height={height} />
    <figcaption><span className="window-dots" aria-hidden="true"><i /><i /><i /></span>{caption}</figcaption>
  </figure>;
}

function Lightroom({ compact = false }: { compact?: boolean }) {
  return <div className={`lr-study ${compact ? "lr-study-compact" : ""}`}>
    <WindowBar name="Lightroom Classic" />
    <div className="lr-study-body"><Photo /><div className="lr-study-controls">
      <strong>基本调整</strong>
      {["曝光", "高光", "阴影", "色温", "饱和度"].map((label, index) => <div className="study-slider" key={label}><span>{label}</span><div><i style={{ left: `${[62, 28, 72, 57, 38][index]}%` }} /></div></div>)}
    </div></div>
    <div className="lr-filmstrip" aria-hidden="true">{[photo, ...batchPhotos].map(src => <img src={src} alt="" key={src} loading="lazy" />)}</div>
  </div>;
}

function ScreenLoop() {
  return <div className="screen-loop"><Lightroom compact /><ol className="screen-loop-steps">{copy.computer.steps.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span>{step}<b aria-hidden="true">{i === 3 ? "↺" : "↓"}</b></li>)}</ol></div>;
}

function ToolFlow() {
  return <div className="relay-study tool-flow"><WindowBar name="ToneRelay / 参考图仿色" /><div className="relay-study-body">
    <div className="study-message study-message-user">{copy.computer.request}</div>
    <div className="match-inputs">
      <div className="match-input match-reference"><Photo src={referencePhoto} alt="参考图，色调示意" /><span>{copy.computer.referenceLabel}</span></div>
      <div className="match-input"><Photo alt="等待调整的照片，示意" /><span>{copy.computer.sourceLabel}</span></div>
    </div>
    {copy.computer.rounds.map((round, i) => <div className={`study-message study-message-agent match-round match-round-${i + 1}`} key={round.label}>
      <div className="match-round-image"><Photo alt={`${round.label}的渲染占位图`} /><span>{round.label} · 渲染示意</span></div>
      <p>{round.observation}</p>
    </div>)}
  </div></div>;
}

function ComparisonFigure({ item, children, variant = "" }: { item: Comparison; children: [React.ReactNode, React.ReactNode]; variant?: "batch" | "computer" | "" }) {
  return <figure className={`workflow-figure ${variant ? `workflow-figure-${variant}` : ""}`} aria-labelledby={`workflow-${item.number}`}>
    <figcaption className="workflow-caption"><div className="workflow-index"><span>{item.number}</span>{item.label}</div><h3 id={`workflow-${item.number}`}>{item.title}</h3><p>{item.description}</p></figcaption>
    <div className="workflow-board">
      <div className="workflow-side workflow-before"><header><span>{item.beforeLabel}</span><h4>{item.beforeTitle}</h4></header>{children[0]}<p className="workflow-path">{item.beforeFooter}</p></div>
      <div className="workflow-side workflow-after"><header><span><i className="status-dot" aria-hidden="true" />{item.afterLabel}</span><h4>{item.afterTitle}</h4></header>{children[1]}<p className="workflow-path">{item.afterFooter}</p></div>
    </div>
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
    <ComparisonFigure item={copy.computer} variant="computer">{[<ScreenLoop key="screen" />, <ToolFlow key="tool" />]}</ComparisonFigure>
    <div className="workflow-source"><span>{copy.note}</span><a href={copy.imageCreditUrl} target="_blank" rel="noreferrer">{copy.imageCredit} ↗</a></div>
  </section>;
}
