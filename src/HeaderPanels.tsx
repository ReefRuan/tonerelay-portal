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
import { INSTALL_PROMPT_WITH_FAQ } from "./Documents";

/** Final, reviewed copy for the open-source / privacy declaration. */
export const PRIVACY_STATEMENT = {
  title: "开源 · 本地运行",
  items: [
    "本机执行：ToneRelay 的运行时与 Lightroom 插件在你的电脑上运行——没有云端服务，无需注册账号。",
    "照片不上传：ToneRelay 组件不会把你的照片发送到任何服务器；源照片不被覆盖。",
    "开源可审查：Portal 与风格包内容开源（AGPL-3.0；第三方素材按各自许可），代码可在 GitHub 查看。",
  ],
  note: "说明：与 AI 助手的对话内容由你所使用的 Agent 服务按其条款处理。",
} as const;

export const INSTALL_PANEL_LEAD = "复制下面全部内容，发给你的 Agent 即可开始安装";

/** Shared outside-click + Escape dismissal for header popovers. */
function usePopoverDismiss(open: boolean, rootRef: Ref<HTMLDivElement>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const root = rootRef && typeof rootRef === "object" ? rootRef.current : null;
    const handlePointerDown = (event: MouseEvent) => {
      if (!root || !root.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
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
 * The header "一键安装" control: a split button whose main half keeps the
 * original copy behaviour and whose caret half opens an inline popover with the
 * full install prompt.
 */
export function InstallAction({ onCopy }: {
  onCopy: () => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  usePopoverDismiss(open, rootRef, close);

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }, [open]);

  return (
    <div className="header-action-group" ref={rootRef}>
      <div className="install-split">
        <button
          type="button"
          className="header-action header-install install-main"
          title="复制安装提示词和 FAQ，发给 Agent 开始安装"
          onClick={() => void onCopy()}
        >
          <Icon name="copy" />一键安装
        </button>
        <button
          ref={caretRef}
          type="button"
          className="header-action header-install install-caret"
          aria-label="展开安装提示词"
          aria-expanded={open}
          title="展开安装提示词"
          onClick={() => setOpen((current) => !current)}
        >
          <Icon name="chevron-down" />
        </button>
      </div>
      <HeaderPopover open={open} panelRef={panelRef} label="安装提示词" className="install-panel">
        <p className="header-panel-lead hand-text">{INSTALL_PANEL_LEAD}</p>
        <pre className="header-panel-code">{INSTALL_PROMPT_WITH_FAQ}</pre>
        <div className="header-panel-actions">
          <button type="button" className="header-panel-button is-primary" onClick={() => void onCopy()}>
            <Icon name="copy" />复制
          </button>
          <button type="button" className="header-panel-button" onClick={() => { close(); caretRef.current?.focus({ preventScroll: true }); }}>
            关闭
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  usePopoverDismiss(open, rootRef, close);

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }, [open]);

  return (
    <div className="header-action-group" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="header-quiet"
        title="开源与本地运行"
        aria-label="开源与本地运行"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="shield" />
      </button>
      <HeaderPopover open={open} panelRef={panelRef} label="开源与本地运行" className="privacy-panel">
        <h3 className="hand-text">{PRIVACY_STATEMENT.title}</h3>
        {PRIVACY_STATEMENT.items.map((item) => {
          const separator = item.indexOf("：");
          const label = separator >= 0 ? item.slice(0, separator + 1) : "";
          const body = separator >= 0 ? item.slice(separator + 1) : item;
          return (
            <p key={item} className="hand-text">
              <strong>{label}</strong>{body}
            </p>
          );
        })}
        <p className="privacy-note hand-text">{PRIVACY_STATEMENT.note}</p>
        <div className="header-panel-actions">
          <button type="button" className="header-panel-button" onClick={() => { close(); triggerRef.current?.focus({ preventScroll: true }); }}>
            关闭
          </button>
        </div>
      </HeaderPopover>
    </div>
  );
}
