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
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

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

  async function copy(kind: "skill" | "example") {
    const message = kind === "skill"
      ? t("已复制 kigurumi模拟完整 Skill", "Copied the complete kigurumi skill")
      : t("已复制蓝发示例提示词", "Copied the blue-haired example prompt");
    const copied = await onCopy(kind === "skill" ? skill : examplePrompt, message);
    if (copied) setFeedback(message);
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
          onClick={() => { setFeedback(""); setOpen(true); }}>
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
          <span className="generation-credit">深海鱼肉包 × Reef</span>
        </button>
        <button type="button" className="generation-copy" onClick={() => void copy("skill")}>
          <Icon name="copy" />{t("一键复制 Skill", "Copy complete skill")}
        </button>
      </article>
    </div>
    <dialog ref={dialog} className="generation-dialog" aria-labelledby="generation-detail-title"
      onClose={() => setOpen(false)} onKeyDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
      }}>
      <div className="generation-dialog-header">
        <span>{t("生成类", "Image generation")} / G01</span>
        <button type="button" autoFocus onClick={() => setOpen(false)} aria-label={t("关闭生成详情", "Close generation details")}><Icon name="close" /></button>
      </div>
      <div className="generation-detail">
        <a className="generation-preview" href={cover} target="_blank" rel="noreferrer">
          <img src={cover} alt={t("蓝发头壳玉米须效果完整预览", "Full blue-haired kigurumi preview")} width="1070" height="1470" />
          <span>{t("查看原图", "View full image")}</span>
        </a>
        <div className="generation-description">
          <span className="generation-eyebrow">CHARACTER → KIGURUMI</span>
          <h2 id="generation-detail-title">kigurumi模拟</h2>
          <p className="generation-byline">深海鱼肉包 × Reef</p>
          <p>{t("把角色原型转成实体头壳预览图，保留角色的脸、瞳色、发型与配饰。", "Turn character references into physical kigurumi head previews while preserving identity, eyes, hairstyle and accessories.")}</p>
          <p>{t("使用时会询问角色原型、真实头壳定妆照，以及玉米须 / 亮面直发。没有定妆照时，从 KiguDB 查找。", "The skill asks for character references, a real finished-head photo, and a microcrimped or glossy straight wig finish. If no product photo is available, it searches KiguDB.")}</p>
          <button type="button" className="generation-copy is-primary" onClick={() => void copy("skill")}><Icon name="copy" />{t("复制完整 Skill", "Copy complete skill")}</button>
          <p className="generation-use">{t("粘贴给支持图像生成的 Agent，按提示补充图片即可。", "Paste into an image-capable agent and provide the requested reference images.")}</p>
          <section className="generation-example" aria-labelledby="generation-example-title">
            <div><h3 id="generation-example-title">{t("蓝发示例提示词", "Blue-haired example prompt")}</h3><button type="button" onClick={() => void copy("example")}><Icon name="copy" />{t("复制示例", "Copy example")}</button></div>
            <pre>{examplePrompt}</pre>
          </section>
          <details className="generation-skill-source"><summary>{t("查看完整 SKILL.md", "Read the complete SKILL.md")}</summary><pre>{skill}</pre></details>
          <p role="status" aria-live="polite" className="generation-feedback">{feedback}</p>
        </div>
      </div>
    </dialog>
  </section>;
}
