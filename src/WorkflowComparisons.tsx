import introduction from "../docs/experience-introduction.md?raw";

type Comparison = {
  number: string; label: string; title: string; description: string;
  beforeLabel: string; beforeTitle: string; beforeFooter: string;
  afterLabel: string; afterTitle: string; afterFooter: string;
  takeaway: string; benefits: string[];
};
type Content = {
  eyebrow: string; title: string; intro: string; goal: string; photoAlt: string; note: string;
  first: Comparison & { reply: string; followup: string };
  second: Comparison & { steps: string[]; request: string; versions: string[]; status: string };
  previewLabel: string; catalogLabel: string; imageCredit: string; imageCreditUrl: string;
};
const block = introduction.match(/<!-- comparison-content:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- comparison-content:end -->/);
if (!block) throw new Error("Missing comparison content in experience-introduction.md");
const copy: Content = JSON.parse(block[1]);
const photo = `${import.meta.env.BASE_URL}official-previews/fuji-film-pro-160ns.jpg`;

function Photo({ small = false }: { small?: boolean }) {
  return <img className={small ? "workflow-photo workflow-photo-small" : "workflow-photo"} src={photo} alt={copy.photoAlt} loading="lazy" width="600" height="600" />;
}

function WindowBar({ name }: { name: string }) {
  return <div className="workflow-window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>{name}</span><span className="window-mode">示意</span></div>;
}

function Lightroom({ compact = false }: { compact?: boolean }) {
  return <div className={`lr-study ${compact ? "lr-study-compact" : ""}`}>
    <WindowBar name="Lightroom Classic" />
    <div className="lr-study-body"><Photo /><div className="lr-study-controls">
      <strong>基本调整</strong>
      {["曝光", "高光", "阴影", "色温", "饱和度"].map((label, index) => <div className="study-slider" key={label}><span>{label}</span><div><i style={{ left: `${[62, 28, 72, 57, 38][index]}%` }} /></div></div>)}
    </div></div>
    <div className="lr-filmstrip" aria-hidden="true">{[0, 1, 2, 3, 4].map(n => <img src={photo} alt="" key={n} loading="lazy" />)}</div>
  </div>;
}

function Conversation() {
  return <div className="relay-study">
    <WindowBar name="ToneRelay / 对话修图" />
    <div className="relay-study-body">
      <div className="study-message study-message-user">{copy.goal}</div>
      <div className="study-result"><div className="study-result-photo"><Photo /><span>{copy.previewLabel}</span></div><p><i className="status-dot" aria-hidden="true" />{copy.first.reply}</p></div>
      <div className="study-message study-message-user study-followup">{copy.first.followup}<span aria-hidden="true">↗</span></div>
    </div>
  </div>;
}

function ScreenLoop() {
  return <div className="screen-loop"><Lightroom compact /><ol className="screen-loop-steps">{copy.second.steps.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span>{step}<b aria-hidden="true">{i === 3 ? "↺" : "↓"}</b></li>)}</ol></div>;
}

function Candidates() {
  return <div className="relay-study candidate-study"><WindowBar name="ToneRelay / 多方案比较" /><div className="relay-study-body">
    <div className="study-message study-message-user">{copy.second.request}</div>
    <div className="candidate-status"><i className="status-dot" aria-hidden="true" />{copy.second.status}</div>
    <div className="candidate-photos">{copy.second.versions.map((version, i) => <div className="candidate-photo" key={version}><Photo small /><div><span>{version}</span><small>V{String(i + 1).padStart(2, "0")}</small></div></div>)}</div>
    <p className="candidate-note">{copy.catalogLabel}</p>
  </div></div>;
}

function ComparisonFigure({ item, children, second = false }: { item: Comparison; children: [React.ReactNode, React.ReactNode]; second?: boolean }) {
  return <figure className={`workflow-figure ${second ? "workflow-figure-second" : ""}`} aria-labelledby={`workflow-${item.number}`}>
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
    <header className="experience-section-heading"><span className="eyebrow">{copy.eyebrow}</span><h2 id="workflow-title">{copy.title}</h2><p>{copy.intro}</p></header>
    <ComparisonFigure item={copy.first}>{[<Lightroom key="lr" />, <Conversation key="conversation" />]}</ComparisonFigure>
    <ComparisonFigure item={copy.second} second>{[<ScreenLoop key="screen" />, <Candidates key="candidates" />]}</ComparisonFigure>
    <div className="workflow-source"><span>{copy.note}</span><a href={copy.imageCreditUrl} target="_blank" rel="noreferrer">{copy.imageCredit} ↗</a></div>
  </section>;
}
