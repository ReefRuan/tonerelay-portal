// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "./Icon";
import { getInstallPrompt } from "./Documents";
import { useLanguage } from "./i18n";

/** Open-source / privacy declaration for local ToneRelay components. */
export const PRIVACY_STATEMENT = {
  title: "开源 · 本地运行",
  items: [
    "本地运行：ToneRelay 的运行组件在本机；使用的 Agent 是否需要账号，取决于客户端。",
    "照片处理：ToneRelay 在本机操作 Lightroom，不主动把原片上传到自有服务器。与 Agent 分享预览图时，数据如何处理取决于所用客户端。显影调整在虚拟副本上进行；星级、旗标等整理操作仍会写入 Catalog。",
    "开源可查：Portal 代码和公开风格包可在 GitHub 查看；照片按各自许可使用。",
  ],
  note: "说明：与 AI 助手的对话内容由你所使用的 Agent 服务按其条款处理。",
} as const;

export const PRIVACY_STATEMENT_EN = {
  title: "Open source · Runs locally",
  items: [
    "Local operation: ToneRelay's runtime components run on your computer; whether an Agent account is required depends on the client.",
    "Photo handling: ToneRelay operates Lightroom locally and does not proactively upload original photos to its own servers. How previews shared with an Agent are handled depends on your client. Develop adjustments use virtual copies; organizational actions such as ratings and flags still write to the Catalog.",
    "Open for inspection: Portal code and public style packs are available on GitHub; photos are used under their respective licenses.",
  ],
  note: "Note: Your conversations with the AI assistant are handled by your chosen Agent service under its terms.",
} as const;

export const INSTALL_PANEL_LEAD = "复制提示词，发给 Agent。它会先核对版本与安装条件。";

export const HEADER_PANEL_STATE_EVENT = "tonerelay:header-panel-state";
const HEADER_POPOVER_OPEN_EVENT = "tonerelay:header-popover-open";

/** Only one header popover can remain open at a time. */
function useExclusiveHeaderPopover(id: string, open: boolean, setOpen: (open: boolean) => void) {
  useEffect(() => {
    const closeForOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) setOpen(false);
    };
    document.addEventListener(HEADER_POPOVER_OPEN_EVENT, closeForOther);
    return () => document.removeEventListener(HEADER_POPOVER_OPEN_EVENT, closeForOther);
  }, [id, setOpen]);

  useEffect(() => {
    if (open) document.dispatchEvent(new CustomEvent(HEADER_POPOVER_OPEN_EVENT, { detail: id }));
    document.dispatchEvent(new Event(HEADER_PANEL_STATE_EVENT));
  }, [id, open]);
}

/** Shared outside-click + Escape dismissal for header popovers. */
function usePopoverDismiss(open: boolean, rootRef: Ref<HTMLDivElement>, onClose: (reason: "outside" | "escape") => void) {
  useEffect(() => {
    if (!open) return;
    const root = rootRef && typeof rootRef === "object" ? rootRef.current : null;
    const handlePointerDown = (event: MouseEvent) => {
      if (!root || !root.contains(event.target as Node)) onClose("outside");
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose("escape");
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, rootRef, onClose]);
}

/**
 * Popover shell anchored to the bottom-right of its group.
 *
 * Rendered with a plain conditional (no `AnimatePresence`) so closing is
 * deterministic: an interrupted/mislayed exit animation must never strand a
 * panel in the DOM where it would keep intercepting pointer events.
 */
function HeaderPopover({ open, panelRef, label, className, children }: {
  open: boolean;
  panelRef: Ref<HTMLDivElement>;
  label: string;
  className: string;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  if (!open) return null;
  return (
    <motion.div
      ref={panelRef}
      className={`header-panel ${className}`}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      initial={reducedMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.16 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The header install-prompt control: a split button whose main half keeps the
 * original copy behaviour and whose caret half opens an inline popover with the
 * full install prompt.
 */
export function InstallAction({ onCopy }: {
  onCopy: () => Promise<boolean>;
}) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((reason?: "outside" | "escape") => {
    setOpen(false);
    if (reason === "escape") window.requestAnimationFrame(() => caretRef.current?.focus({ preventScroll: true }));
  }, []);

  usePopoverDismiss(open, rootRef, close);
  useExclusiveHeaderPopover("install", open, setOpen);

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }, [open]);

  return (
    <div className="header-action-group" ref={rootRef}>
      <div className="install-split">
        <button
          type="button"
          className="header-action header-install install-main"
          title={t("复制安装提示词和 FAQ，发给 Agent 核对安装条件", "Copy the installation prompt and FAQ for your Agent to verify installation requirements")}
          onClick={() => void onCopy()}
        >
          <Icon name="copy" />{t("复制安装提示词", "Copy install prompt")}
        </button>
        <button
          ref={caretRef}
          type="button"
          className="header-action header-install install-caret"
          aria-label={t("展开安装提示词", "Expand installation prompt")}
          aria-expanded={open}
          title={t("展开安装提示词", "Expand installation prompt")}
          onClick={() => setOpen((current) => !current)}
        >
          <Icon name="chevron-down" />
        </button>
      </div>
      <HeaderPopover open={open} panelRef={panelRef} label={t("安装提示词", "Installation prompt")} className="install-panel">
        <p className="header-panel-lead hand-text">{t(INSTALL_PANEL_LEAD, "Copy the prompt and send it to your Agent. It will first verify the version and installation requirements.")}</p>
        <pre className="header-panel-code">{getInstallPrompt(language)}</pre>
        <div className="header-panel-actions">
          <button type="button" className="header-panel-button is-primary" onClick={() => void onCopy()}>
            <Icon name="copy" />{t("复制", "Copy")}
          </button>
          <button type="button" className="header-panel-button" onClick={() => { close(); caretRef.current?.focus({ preventScroll: true }); }}>
            {t("关闭", "Close")}
          </button>
        </div>
      </HeaderPopover>
    </div>
  );
}

/**
 * A quiet, icon-only header entry that opens the open-source / privacy
 * declaration popover.
 */
export function PrivacyAction() {
  const { language, t } = useLanguage();
  const statement = language === "en" ? PRIVACY_STATEMENT_EN : PRIVACY_STATEMENT;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((reason?: "outside" | "escape") => {
    setOpen(false);
    if (reason === "escape") window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, []);

  usePopoverDismiss(open, rootRef, close);
  useExclusiveHeaderPopover("privacy", open, setOpen);

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }, [open]);

  return (
    <div className="header-action-group" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="header-quiet"
        title={t("开源与本地运行", "Open source and local operation")}
        aria-label={t("开源与本地运行", "Open source and local operation")}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="shield" />
      </button>
      <HeaderPopover open={open} panelRef={panelRef} label={t("开源与本地运行", "Open source and local operation")} className="privacy-panel">
        <h3 className="hand-text">{statement.title}</h3>
        {statement.items.map((item) => {
          const separator = item.indexOf(language === "en" ? ":" : "：");
          const label = separator >= 0 ? item.slice(0, separator + 1) : "";
          const body = separator >= 0 ? item.slice(separator + 1) : item;
          return (
            <p key={item} className="hand-text">
              <strong>{label}</strong>{body}
            </p>
          );
        })}
        <p className="privacy-note hand-text">{statement.note}</p>
        <div className="header-panel-actions">
          <button type="button" className="header-panel-button" onClick={() => { close(); triggerRef.current?.focus({ preventScroll: true }); }}>
            {t("关闭", "Close")}
          </button>
        </div>
      </HeaderPopover>
    </div>
  );
}
