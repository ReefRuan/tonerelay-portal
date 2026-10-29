// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useLanguage } from "./i18n";
import skill from "./generation-skills/kigurumi-simulation/SKILL.md?raw";
import examplePrompt from "./generation-skills/kigurumi-simulation/example-prompt.md?raw";
import "./generation-gallery.css";

export const kigurumiSkill = skill;
export const kigurumiExample = examplePrompt;
const cover = `${import.meta.env.BASE_URL}generation/kigurumi-simulation/cover.png`;

export function GenerationGallery({ onCopy }: {
  onCopy: (value: string, message: string) => Promise<boolean>;
}) {
  const { t } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const readerTitle = useRef<HTMLHeadingElement>(null);
  const readerButton = useRef<HTMLButtonElement>(null);
  const overviewScroll = useRef(0);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"overview" | "skill">("overview");
  const [exampleExpanded, setExampleExpanded] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "skill" | "example"; message: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    modal?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const modal = dialog.current;
    if (!modal?.open) return;
    modal.scrollTop = view === "skill" ? 0 : overviewScroll.current;
    (view === "skill" ? readerTitle.current : readerButton.current)?.focus({ preventScroll: true });
  }, [view]);

  function readSkill() {
    overviewScroll.current = dialog.current?.scrollTop ?? 0;
    setView("skill");
  }

  async function copy(kind: "skill" | "example") {
    const message = kind === "skill"
      ? t("已复制 kigurumi模拟完整 Skill", "Copied the complete kigurumi skill")
      : t("已复制蓝发示例提示词", "Copied the blue-haired example prompt");
    const copied = await onCopy(kind === "skill" ? skill : examplePrompt, message);
    if (copied) setFeedback({ kind, message });
    // The shared manual-copy dialog must remain reachable if clipboard access fails.
    else setOpen(false);
  }

  return <section className="catalog-browse generation-gallery" id="generation" aria-labelledby="generation-title">
    <div className="catalog-heading">
      <div><h2 id="generation-title">{t("生成类", "Image generation")}</h2></div>
      <div className="catalog-rule"><i /></div>
      <p>{t("1 项内容", "1 item")}</p>
    </div>
    <div className="preset-grid generation-grid">
      <article className="generation-card">
        <button type="button" className="preset-card generation-cover" aria-haspopup="dialog"
          aria-label={t("查看 kigurumi模拟 Skill", "View kigurumi simulation skill")}
          onClick={() => { setFeedback(null); setOpen(true); }}>
          <span className="photo-frame">
            <img src={cover} alt={t("青蓝发 kigurumi 实体头壳生成示例，玉米须假发", "Blue-haired kigurumi head preview with microcrimped wig fibers")} loading="lazy" width="1070" height="1470" />
            <span className="photo-shade" />
            <span className="release-badge">{t("生成示例", "AI-generated")}</span>
            <span className="card-number">G01</span>
          </span>
          <span className="card-caption">
            <span><strong>kigurumi模拟</strong><small>KIGURUMI SIMULATION</small></span>
            <span className="card-stamps"><span className="card-kind is-effect">{t("生成", "Generate")}</span><span className="card-version">SKILL</span></span>
          </span>
        </button>
        <button type="button" className="generation-copy" onClick={() => void copy("skill")}>
          <Icon name="copy" />{t("一键复制 Skill", "Copy complete skill")}
        </button>
      </article>
    </div>
    <dialog ref={dialog} className={`generation-dialog ${view === "skill" ? "is-reading" : ""}`} aria-labelledby={view === "skill" ? "generation-reader-title" : "generation-detail-title"}
      onClose={() => { setOpen(false); setView("overview"); setExampleExpanded(false); }} onKeyDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
      }}>
      <div className="generation-dialog-header">
        {view === "skill"
          ? <button type="button" className="generation-reader-back" onClick={() => setView("overview")}><Icon name="back" />{t("返回预览", "Back to preview")}</button>
          : <span>{t("生成类", "Image generation")} / G01</span>}
        <button type="button" autoFocus onClick={() => setOpen(false)} aria-label={t("关闭生成详情", "Close generation details")}><Icon name="close" /></button>
      </div>
      {view === "skill" ? <article className="generation-reader">
        <div className="generation-reader-heading">
          <div><span className="generation-eyebrow">KIGURUMI SIMULATION</span><h2 id="generation-reader-title" ref={readerTitle} tabIndex={-1}>{t("Skill 全文", "Complete skill")}</h2><p>SKILL.md</p></div>
          <button type="button" className="generation-copy is-primary" onClick={() => void copy("skill")}><Icon name="copy" />{t("复制完整 Skill", "Copy complete skill")}</button>
        </div>
        <p role="status" aria-live="polite" className="generation-feedback">{feedback?.kind === "skill" ? feedback.message : ""}</p>
        <pre>{skill}</pre>
      </article> : <div className="generation-detail">
        <div className="generation-description">
          <span className="generation-eyebrow">CHARACTER → KIGURUMI</span>
          <h2 id="generation-detail-title">kigurumi模拟</h2>
          <p>{t("把角色原型转成实体头壳预览图，保留角色的脸、瞳色、发型与配饰。", "Turn character references into physical kigurumi head previews while preserving identity, eyes, hairstyle and accessories.")}</p>
          <ul className="generation-requirements" aria-label={t("使用时需要", "What you need")}>
            <li>{t("角色原型", "Character reference")}</li><li>{t("喜欢店家的定妆照", "Preferred maker’s photo")}</li><li>{t("玉米须 / 亮面直发", "Wig finish")}</li>
          </ul>
          <p className="generation-reference-note">{t("首次先确认你喜欢店家的定妆照，再生成；满意后可沿用成图修改。需要代找参考时，会先让你选定实物照。", "First choose finished-head photos from a maker you like, then generate. Refine a result you like in later edits. If you need help finding references, you choose the photos before generation.")}</p>
          <div className="generation-primary-actions">
            <button type="button" className="generation-copy is-primary" onClick={() => void copy("skill")}><Icon name="copy" />{t("复制完整 Skill", "Copy complete skill")}</button>
            <button ref={readerButton} type="button" className="generation-copy is-secondary" onClick={readSkill}><Icon name="details" />{t("阅读全文", "Read full skill")}</button>
          </div>
          <p className="generation-use">{t("粘贴给支持图像生成的 Agent，按提示补充图片即可。", "Paste into an image-capable agent and provide the requested reference images.")}</p>
          <p role="status" aria-live="polite" className="generation-feedback">{feedback?.kind === "skill" ? feedback.message : ""}</p>
        </div>
        <div className="generation-visual">
          <a className="generation-preview" href={cover} target="_blank" rel="noreferrer">
            <img src={cover} alt={t("蓝发头壳玉米须效果完整预览", "Full blue-haired kigurumi preview")} width="1070" height="1470" />
            <span>{t("查看原图", "View full image")}<Icon name="external" /></span>
          </a>
          <section className="generation-example" aria-labelledby="generation-example-title">
            <div className="generation-example-heading"><div><span className="generation-eyebrow">PROMPT EXAMPLE</span><h3 id="generation-example-title">{t("蓝发示例提示词", "Blue-haired example prompt")}</h3></div><button type="button" className="generation-copy" onClick={() => void copy("example")}><Icon name="copy" />{t("复制示例", "Copy example")}</button></div>
            <div id="generation-example-content" className="generation-example-content">
              {(exampleExpanded ? examplePrompt.trim().split(/\n\s*\n/) : [examplePrompt.trim().split(/\n\s*\n/)[0]]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <button type="button" className="generation-example-toggle" aria-expanded={exampleExpanded} aria-controls="generation-example-content" onClick={() => setExampleExpanded((value) => !value)}>{exampleExpanded ? t("收起示例", "Show less") : t("展开完整示例", "Read the full example")}<Icon name="chevron-down" /></button>
            <p role="status" aria-live="polite" className="generation-feedback">{feedback?.kind === "example" ? feedback.message : ""}</p>
          </section>
        </div>
        <section className="generation-resources" aria-labelledby="generation-resources-title">
            <h3 id="generation-resources-title">{t("更多修图 Skill", "More photo-editing skills")}</h3>
            <p>{t("本页面会经常更新修图 Skill，欢迎回来看看最新内容。", "This page is regularly updated with photo-editing skills. Come back for the latest additions.")}</p>
            <div className="generation-resource-links">
              <a href="https://github.com/ReefRuan/tonerelay-lightroom-mcp" target="_blank" rel="noreferrer">
                <span><strong>{t("我的 Lightroom MCP", "My Lightroom MCP")}</strong><small>{t("让 Agent 直接操作 Lightroom Classic", "Let your agent work directly in Lightroom Classic")}</small></span><Icon name="external" />
              </a>
              <a href="https://github.com/ReefRuan/tonerelay-portal" target="_blank" rel="noreferrer">
                <span><strong>{t("给 Portal 点 Star", "Star Portal on GitHub")}</strong><small>{t("喜欢这里的 Skill，欢迎支持这个页面", "Enjoy the skills here? Support the portal")}</small></span><Icon name="star" />
              </a>
            </div>
        </section>
      </div>}
    </dialog>
  </section>;
}
