// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { categories, visiblePresets, type Category, type Preset } from "./catalog";
import { categoryLabel, localizePreset } from "./catalog.en";
import { LanguageSwitch, useLanguage } from "./i18n";
import { Icon } from "./Icon";
import { findSpatialTarget, type Direction, type SpatialRect } from "./navigation";
import { Trackball } from "./Trackball";
import { Documents, ARTICLE_URL, getInstallPrompt, getUninstallPrompt, type PortalPage } from "./Documents";

import { copyText } from "./clipboard";
import { ManualCopyDialog } from "./ManualCopyDialog";
import { InstallAction, PrivacyAction } from "./HeaderPanels";
import { IntroSignature } from "./IntroSignature";

declare global {
  interface Window {
    /**
     * Dismisses the inline boot screen defined in index.html (fade-out +
     * node removal). Idempotent — safe under StrictMode double effects — and
     * self-healing via a 5s fallback inside index.html if React never mounts.
     */
    __bootDone?: () => void;
  }
}

type DockMode = "collapsed" | "normal" | "expanded";

function pageFromHash(): PortalPage {
  const value = window.location.hash.slice(1);
  return value === "experience" || value === "about" || value === "help"
    ? "experience"
    : "gallery";
}

function markdownWithExternalLinks(markdown: string) {
  return markdown.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).map((part, index) => {
    const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(part);
    return link
      ? <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>
      : part;
  });
}

function PackageMarkdown({ title, fileName, loader, packageUrl, onCopy }: {
  title: string;
  fileName: string;
  loader: () => Promise<string>;
  packageUrl?: string;
  onCopy: (value: string, message: string) => Promise<boolean>;
}) {
  const { t, language } = useLanguage();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const loading = useRef(false);

  const load = () => {
    if (markdown !== null || loading.current) return;
    loading.current = true;
    void loader().then(setMarkdown).catch(() => setFailed(true)).finally(() => {
      loading.current = false;
    });
  };

  return <details className="style-markdown" onToggle={(event) => { if (event.currentTarget.open) load(); }}>
    <summary><span>{title}</span><span>{fileName}</span></summary>
    <div className="style-markdown-content">
      {language === "en" && <p className="package-language-note">Original package document (Chinese). Downloads preserve the original package contents.</p>}
      {markdown !== null ? <>
        <button onClick={() => void onCopy(markdown, t(`已复制 ${fileName}`, `Copied ${fileName}`))}>{t("复制 Markdown", "Copy Markdown")}</button>
        <pre>{markdownWithExternalLinks(markdown)}</pre>
      </> : failed ? <p>{t("无法加载。", "Unable to load. ")}{packageUrl && <a href={`${packageUrl.replace("/tree/", "/blob/")}/${fileName}`} target="_blank" rel="noreferrer">{t(`在 GitHub 查看 ${fileName}`, `View ${fileName} on GitHub`)}</a>}</p> : <p>{t("载入中…", "Loading…")}</p>}
    </div>
  </details>;
}

export default function App() {
  const { language, t } = useLanguage();
  const presets = useMemo(() => visiblePresets.map((preset) => localizePreset(preset, language)), [language]);
  const presetBadgeLabel = (preset: Preset) => preset.photoCredit
    ? t("第三方图片", "Third-party photo")
    : preset.release === "候选" ? t("候选", "Candidate") : preset.release === "正式版" ? t("正式版", "Released") : preset.release;
  const initialPage = pageFromHash();
  const initialPreset = new URLSearchParams(window.location.search).get("preset");
  const validInitial = presets.some((preset) => preset.id === initialPreset)
    ? initialPreset
    : null;
  // The detail panel only exists on the gallery page, so a `?preset=` deep link
  // arriving on the experience page must not leave `detailOpen` stuck on.
  const initialDetailOpen = Boolean(validInitial) && initialPage === "gallery";
  const [dockMode, setDockMode] = useState<DockMode>(validInitial && initialPage === "gallery" ? "normal" : "collapsed");
  const [selectedId, setSelectedId] = useState<string | null>(initialDetailOpen ? validInitial : null);
  const [detailOpen, setDetailOpen] = useState(initialDetailOpen);
  const [detailBackdropActive, setDetailBackdropActive] = useState(initialDetailOpen);
  const [category, setCategory] = useState<Category>("全部");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const [page, setPage] = useState<PortalPage>(initialPage);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const detailPanelRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const title = t("ToneRelay｜Lightroom Classic MCP 与风格画廊", "ToneRelay — Lightroom MCP Style and Effects Gallery");
    document.title = title;
    const description = t("ToneRelay 是连接 Agent 与 Lightroom Classic 的本地 MCP 工具。了解对话修图与实际渲染回读，浏览可下载的胶片风格包和效果提示词。", "ToneRelay connects agents with Lightroom Classic through local MCP tools. Explore conversational editing, actual rendered previews, film-style packs, and effect prompts.");
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
  }, [t]);

  // Boot screen hand-off: once React has committed, wait for two animation
  // frames so the app's first frame is painted, then start the index.html
  // #boot fade-out. Fading before the first paint would expose a blank shell.
  useEffect(() => {
    const dismiss = () => window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => window.__bootDone?.()));
    dismiss();
  }, []);

  const filteredPresets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return presets.filter((preset) => {
      const inCategory = category === "全部" || preset.category === category;
      const searchable = [
        preset.name,
        preset.en,
        preset.category,
        categoryLabel(preset.category, language),
        preset.release,
        presetBadgeLabel(preset),
        preset.description,
        ...preset.tags,
      ]
        .join(" ")
        .toLowerCase();
      return inCategory && (!needle || searchable.includes(needle));
    });
  }, [category, query, presets, t, language]);

  const selectedPreset =
    presets.find((preset) => preset.id === selectedId) ?? filteredPresets[0] ?? null;

  const activeIndex = selectedPreset
    ? filteredPresets.findIndex((preset) => preset.id === selectedPreset.id)
    : -1;

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const selectAndReveal = useCallback((id: string, focus = true) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      const card = cardRefs.current.get(id);
      card?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
        inline: "nearest",
      });
      if (focus) card?.focus({ preventScroll: true });
    });
  }, []);

  const nearestToViewportCenter = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return filteredPresets
      .map((preset) => {
        const rect = cardRefs.current.get(preset.id)?.getBoundingClientRect();
        if (!rect) return null;
        const dx = rect.left + rect.width / 2 - centerX;
        const dy = rect.top + rect.height / 2 - centerY;
        return { id: preset.id, distance: Math.hypot(dx, dy) };
      })
      .filter((entry): entry is { id: string; distance: number } => Boolean(entry))
      .sort((a, b) => a.distance - b.distance)[0]?.id;
  }, [filteredPresets]);

  const openController = useCallback(() => {
    setDockMode("normal");
    const target =
      selectedId && filteredPresets.some((preset) => preset.id === selectedId)
        ? selectedId
        : nearestToViewportCenter() ?? filteredPresets[0]?.id;
    if (target) selectAndReveal(target, false);
  }, [filteredPresets, nearestToViewportCenter, selectAndReveal, selectedId]);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setDockMode("normal");
    const url = new URL(window.location.href);
    url.searchParams.delete("preset");
    window.history.replaceState({}, "", url);
  }, []);

  const openDetail = useCallback((preset: Preset) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : null;
    setSelectedId(preset.id);
    setDockMode("normal");
    setDetailBackdropActive(true);
    setDetailOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set("preset", preset.id);
    window.history.pushState({}, "", url);
  }, []);

  useEffect(() => {
    if (!detailOpen) return;
    const frame = window.requestAnimationFrame(() => detailPanelRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [detailOpen]);

  useEffect(() => {
    if (!detailBackdropActive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [detailBackdropActive]);

  useEffect(() => {
    if (dockMode !== "expanded" || detailOpen || page !== "gallery") return;
    // The collapsed dock exits before the expanded dock mounts.
    const timer = window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), reducedMotion ? 0 : 210);
    return () => window.clearTimeout(timer);
  }, [detailOpen, dockMode, page, reducedMotion]);

  const trapDetailFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || manualCopy !== null) return;
    const panel = detailPanelRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    )).filter((item) => item.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const copyValue = useCallback(async (value: string, message: string) => {
    try {
      await copyText(value);
      showToast(message);
      return true;
    } catch {
      setManualCopy(value);
      showToast(t("复制失败，请在弹窗中手动复制", "Copy failed. Please copy manually in the dialog."));
      return false;
    }
  }, [showToast, t]);

  const copyLink = useCallback(async () => {
    if (!selectedPreset) return;
    if (selectedPreset.downloadUrl) {
      const packageKind = selectedPreset.kind === "effect" ? t("效果包", "effect pack") : t("风格包", "style pack");
      const backup = selectedPreset.downloadUrlBackup;
      const lines = [
        t(`「${selectedPreset.name}」${packageKind}下载${backup ? "（两个地址内容一致，任选其一）" : ""}：`, `${selectedPreset.name} ${packageKind} download${backup ? " (identical content at either address)" : ""}:`),
        t(`主源：${selectedPreset.downloadUrl}`, `Primary: ${selectedPreset.downloadUrl}`),
        ...(backup ? [t(`国内备用：${backup}`, `China mirror: ${backup}`)] : []),
      ];
      if (await copyValue(lines.join("\n"), t(backup ? `已复制「${selectedPreset.name}」下载地址（主源 + 国内备用）` : `已复制「${selectedPreset.name}」下载地址`, `Copied ${selectedPreset.name} download link${backup ? "s (primary + China mirror)" : ""}`))) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
      return;
    }
    const linkBackup = selectedPreset.linkBackup;
    const lines = [
      t(`「${selectedPreset.name}」页面链接${linkBackup ? "（主源 + 国内备用）" : ""}：`, `${selectedPreset.name} page link${linkBackup ? " (primary + China mirror)" : ""}:`),
      t(`主源：${selectedPreset.link}`, `Primary: ${selectedPreset.link}`),
      ...(linkBackup ? [t(`国内备用：${linkBackup}`, `China mirror: ${linkBackup}`)] : []),
    ];
    if (await copyValue(lines.join("\n"), t(linkBackup ? `已复制「${selectedPreset.name}」页面链接（主源 + 国内备用）` : `已复制「${selectedPreset.name}」页面链接`, `Copied ${selectedPreset.name} page link${linkBackup ? "s (primary + China mirror)" : ""}`))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }, [selectedPreset, copyValue, t]);

  const copyInstallPrompt = useCallback(() => copyValue(getInstallPrompt(language), t("已复制安装提示词和 FAQ，发给 Agent 开始安装", "Copied installation prompt and FAQ. Send them to your agent.")), [copyValue, language, t]);
  const copyUninstallPrompt = useCallback(() => copyValue(getUninstallPrompt(language), t("已复制卸载提示词，发给 Agent 核对并卸载", "Copied uninstallation prompt. Send it to your agent to verify and uninstall.")), [copyValue, language, t]);

  const switchDetail = useCallback(
    (delta: number) => {
      if (!filteredPresets.length) return;
      const index = activeIndex < 0 ? 0 : activeIndex;
      const next = filteredPresets[(index + delta + filteredPresets.length) % filteredPresets.length];
      setSelectedId(next.id);
      detailPanelRef.current?.scrollTo({ top: 0, behavior: "auto" });
      const url = new URL(window.location.href);
      url.searchParams.set("preset", next.id);
      window.history.replaceState({}, "", url);
    },
    [activeIndex, filteredPresets],
  );

  const moveSelection = useCallback(
    (direction: Direction) => {
      if (detailOpen) {
        if (direction === "left" || direction === "right") {
          switchDetail(direction === "left" ? -1 : 1);
        } else {
          detailPanelRef.current?.scrollBy({
            top: direction === "up" ? -260 : 260,
            behavior: reducedMotion ? "auto" : "smooth",
          });
        }
        return;
      }
      if (!selectedPreset) return;
      const rects: SpatialRect[] = filteredPresets.flatMap((preset) => {
        const rect = cardRefs.current.get(preset.id)?.getBoundingClientRect();
        return rect
          ? [{ id: preset.id, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }]
          : [];
      });
      const target = findSpatialTarget(selectedPreset.id, direction, rects);
      if (target) selectAndReveal(target);
    },
    [detailOpen, filteredPresets, reducedMotion, selectAndReveal, selectedPreset, switchDetail],
  );

  useEffect(() => {
    if (dockMode === "collapsed" || detailOpen) return;
    if (!selectedId || !filteredPresets.some((preset) => preset.id === selectedId)) {
      const next = filteredPresets[0]?.id ?? null;
      setSelectedId(next);
      if (next) window.requestAnimationFrame(() => cardRefs.current.get(next)?.scrollIntoView({ block: "center" }));
    }
  }, [detailOpen, dockMode, filteredPresets, selectedId]);

  useEffect(() => {
    const onPopState = () => {
      const id = new URLSearchParams(window.location.search).get("preset");
      const preset = presets.find((entry) => entry.id === id);
      if (preset && pageFromHash() === "gallery") {
        setSelectedId(preset.id);
        setDockMode("normal");
        setDetailBackdropActive(true);
        setDetailOpen(true);
      } else {
        setDetailOpen(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [presets]);

  useEffect(() => {
    const onHashChange = () => {
      const nextPage = pageFromHash();
      setPage(nextPage);
      setDetailOpen(false);
      setDockMode("collapsed");
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (page !== "gallery" || manualCopy !== null || event.defaultPrevented || event.isComposing) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const editing = target?.closest('input, textarea, select, [contenteditable="true"]');
      if (editing) {
        if (event.key === "Escape" && !detailOpen) {
          (editing as HTMLElement).blur();
          setDockMode("normal");
        }
        return;
      }
      if (event.key === "Escape") {
        if (detailOpen) closeDetail();
        else if (dockMode === "expanded") setDockMode("normal");
        else if (dockMode === "normal") setDockMode("collapsed");
        return;
      }
      const cardHasFocus = Boolean(target?.closest(".preset-card"));
      if (target?.closest("a, button, summary, [role='button'], [role='link']") && !cardHasFocus) return;
      if (detailOpen && target !== detailPanelRef.current) return;
      if (event.shiftKey) return;
      if (event.key.toLowerCase() === "m" && dockMode === "collapsed") {
        event.preventDefault();
        openController();
        return;
      }
      if (dockMode === "collapsed") return;
      const directions: Partial<Record<string, Direction>> = {
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
      };
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        moveSelection(direction);
      } else if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        void copyLink();
      } else if (event.key === "Enter" && selectedPreset && !detailOpen && !cardHasFocus) {
        event.preventDefault();
        openDetail(selectedPreset);
      } else if (event.key === "/" && !detailOpen) {
        event.preventDefault();
        setDockMode("expanded");
        window.requestAnimationFrame(() => searchRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDetail, copyLink, detailOpen, dockMode, manualCopy, moveSelection, openController, openDetail, page, selectedPreset]);

  return (
    <div className={`app-shell page-${page} dock-${dockMode} ${detailBackdropActive ? "has-detail" : ""}`}>
      <header className="site-header" inert={detailBackdropActive} aria-hidden={detailBackdropActive || undefined}>
        <a className="brand" href="#gallery" aria-label={t("ToneRelay 画廊", "ToneRelay gallery")}>
          <img className="brand-mark" src={`${import.meta.env.BASE_URL}brand/tonerelay-icon.svg`} width="36" height="36" alt="" aria-hidden="true" />
          <span>
            <strong>TONERELAY</strong>
          </span>
        </a>
        <nav className="site-nav" aria-label={t("主要导航", "Main navigation")}>
          <a href="#gallery" aria-current={page === "gallery" ? "page" : undefined}>{t("画廊", "Gallery")}</a>
          <a href="#experience" aria-current={page === "experience" ? "page" : undefined}>{t("立即体验", "Explore")}</a>
        </nav>
        {page === "gallery" && <IntroSignature />}
        {page === "experience" && <div className="site-header-actions">
          <PrivacyAction />
          <InstallAction onCopy={copyInstallPrompt} />
          <div className="header-star-group">
            <a className="header-action header-star-link header-star-glow" href="https://github.com/ReefRuan/tonerelay-lightroom-mcp" target="_blank" rel="noreferrer" title={t("在 GitHub 给 Lightroom MCP 点 Star", "Star Lightroom MCP on GitHub")}><Icon name="star" />Star MCP</a>
            <a className="header-action header-star-link" href="https://github.com/ReefRuan/tonerelay-portal" target="_blank" rel="noreferrer" title={t("查看本页面源码", "View this page's source code")}><Icon name="external" />{t("本页面源码", "Page source")}</a>
          </div>
        </div>}
        <LanguageSwitch className="header-language" />
      </header>

      {page === "gallery" ? <main className="catalog-main" inert={detailBackdropActive} aria-hidden={detailBackdropActive || undefined}>
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">
            {t("Reef 的 Lightroom MCP", "Reef’s Lightroom MCP")}<br />
            <em>{t("风格与效果画廊。", "Style & effects gallery.")}</em>
          </h1>
          <p>
            {t("ToneRelay 让 Agent 直接操作 Lightroom Classic——说出目标，它执行并回读结果。", "ToneRelay lets your agent operate Lightroom Classic: describe the goal, then review the actual result. ")}
            {t("这里是由 Reef 整理的风格模板与效果包：点击卡片查看适用场景，再挑适合当前照片的内容。", "Explore styles and effects curated by Reef. Open a card, see where it works, and choose a direction for your photo.")}
          </p>
          <div className="intro-links">
            <a className="intro-cta" href="#experience">
              <Icon name="arrow" />{t("去体验 · 看 Agent 怎么操作 Lightroom", "Explore how agents edit in Lightroom")}
            </a>
            {ARTICLE_URL ? (
              <a className="intro-cta is-quiet" href={ARTICLE_URL} target="_blank" rel="noreferrer">
                {t("阅读介绍文章", "Read the introduction")}<Icon name="external" />
              </a>
            ) : null}
          </div>
        </section>

        <section className="catalog-browse" aria-label={t("风格与效果画廊", "Style and effects gallery")}>
          <div className="catalog-heading">
            <div>
              <h2>{t("互联网蒸馏预设", "Styles distilled from visual references")}</h2>
            </div>
            <div className="catalog-rule"><i /></div>
            <div className="catalog-tools">
              <p>{filteredPresets.length}{t(" 项内容", " items")}</p>
              <button type="button" onClick={() => setDockMode((mode) => mode === "expanded" ? "normal" : "expanded")} aria-label={t("筛选内容", "Filter items")} aria-expanded={dockMode === "expanded"} aria-controls="preset-filter-panel">
                <Icon name="filter" /><span>{t("筛选", "Filter")}</span>
              </button>
            </div>
          </div>

          {filteredPresets.length ? (
            <section className="preset-grid" aria-label={t("风格与效果列表", "Styles and effects")}>
              {filteredPresets.map((preset, index) => {
                const selected = dockMode !== "collapsed" && preset.id === selectedPreset?.id;
                return (
                  <motion.button
                    layout
                    transition={{ layout: { duration: reducedMotion ? 0 : 0.18 } }}
                    key={preset.id}
                    ref={(node) => {
                      if (node) cardRefs.current.set(preset.id, node);
                      else cardRefs.current.delete(preset.id);
                    }}
                    className={`preset-card ${selected ? "is-selected" : ""}`}
                    style={
                      {
                        "--card-ratio": preset.ratio,
                      } as CSSProperties
                    }
                    aria-label={t(`查看${preset.kind === "effect" ? "效果包" : "风格模板"}详情：${preset.name}`, `View ${preset.kind === "effect" ? "effect pack" : "style"} details: ${preset.name}`)}
                    onClick={() => openDetail(preset)}
                  >
                    <span className="photo-frame">
                      <img
                        src={preset.image}
                        alt=""
                        loading={index < 5 ? "eager" : "lazy"}
                        draggable={false}
                      />
                      <span className="photo-shade" />
                      <span className={`release-badge ${preset.photoCredit ? "is-third-party" : "is-beta"}`}>
                        {presetBadgeLabel(preset)}
                      </span>
                      <span className="card-number">{preset.number}</span>
                      <span className="selection-mark"><Icon name="check" /></span>
                    </span>
                    <span className="card-caption">
                      <span>
                        <strong>{preset.name}</strong>
                        <small>{preset.en}</small>
                      </span>
                      <span className="card-stamps">
                        <span className={`card-kind ${preset.kind === "effect" ? "is-effect" : ""}`}>
                          {preset.kind === "effect" ? t("效果", "Effect") : t("风格", "Style")}
                        </span>
                        <span className="card-version">{preset.version}</span>
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </section>
          ) : (
            <section className="empty-state">
              <span>{t("没有匹配结果", "No matches")}</span>
              <h2>{t("没有找到这种内容。", "Nothing found for this search.")}</h2>
              <button onClick={() => { setQuery(""); setCategory("全部"); }}>{t("清除筛选", "Clear filters")}</button>
            </section>
          )}
        </section>

        <footer className="site-footer">
          <span>© 2026 Reef Ruan · ToneRelay</span>
          <div className="site-footer-meta">
            <a href={`${import.meta.env.BASE_URL}${language === "en" ? "?lang=en" : ""}#experience`}>{t("安装与使用", "Install & use")}</a>
            <span aria-hidden="true">·</span>
            <a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE" target="_blank" rel="noreferrer">AGPL-3.0-only</a>
            <span aria-hidden="true">·</span>
            <a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE-SCOPE.md" target="_blank" rel="noreferrer">{t("授权范围与照片许可", "License scope and photo rights")}</a>
          </div>
        </footer>
      </main> : <Documents onCopyUninstall={copyUninstallPrompt} onCopyInstall={copyInstallPrompt} onCopyPrompt={copyValue} />}

      <AnimatePresence onExitComplete={() => {
        if (detailOpen) return;
        setDetailBackdropActive(false);
        const previous = returnFocusRef.current;
        const fallback = selectedId ? cardRefs.current.get(selectedId) : null;
        window.requestAnimationFrame(() => (previous?.isConnected ? previous : fallback)?.focus({ preventScroll: true }));
      }}>
        {page === "gallery" && detailOpen && selectedPreset && (
          <motion.div
            className="detail-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
          >
            <button className="detail-backdrop" aria-label={t("放回预设", "Close details")} onClick={closeDetail} />
            <motion.article
              ref={detailPanelRef}
              tabIndex={-1}
              className="detail-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-title"
              onKeyDown={trapDetailFocus}
              initial={reducedMotion ? false : { y: 80, scale: 0.88, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { y: 70, scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 370, damping: 32 }}
            >
              <div className="detail-topline">
                <span>{selectedPreset.kind === "effect" ? t("效果", "Effect") : t("风格包", "Style pack")} / {selectedPreset.number}</span>
                <div className="detail-topline-actions">
                  <button onClick={() => switchDetail(-1)} aria-label={t("上一个预设", "Previous item")}><Icon name="back" /></button>
                  <button onClick={() => switchDetail(1)} aria-label={t("下一个预设", "Next item")}><Icon name="arrow" /></button>
                  <button onClick={closeDetail} aria-label={t("放回预设", "Close details")}><Icon name="close" /></button>
                </div>
              </div>
              <div className="detail-body">
                <header className="detail-title-row">
                  <div>
                    <h2 id="detail-title">{selectedPreset.name}</h2>
                    <p>{selectedPreset.en}</p>
                  </div>
                  {selectedPreset.references.length > 0 ? <span>{selectedPreset.references.length}{t(" 张参考图", " reference images")}</span>
                    : selectedPreset.photoLinks?.length ? <span>{selectedPreset.photoLinks.length}{t(" 张原站照片链接", " original-site photo links")}</span> : null}
                </header>
                <section className={`reference-gallery ${selectedPreset.id === "skin-tone-adaptive-fidelity" ? "is-chart" : ""}`} aria-label={t(`${selectedPreset.name} 参考图`, `${selectedPreset.name} references`)}>
                  {selectedPreset.references.length ? <div className="reference-list">
                    {selectedPreset.references.map((reference, index) => (
                      <a
                        key={reference}
                        href={selectedPreset.referenceCredits?.[index]?.source ?? reference}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t(`查看参考图 ${index + 1} 的来源`, `View source for reference ${index + 1}`)}
                        title={selectedPreset.referenceCredits?.[index] ? `${selectedPreset.referenceCredits[index].author} · ${selectedPreset.referenceCredits[index].license}` : undefined}
                      >
                        <img src={reference} alt={t(`${selectedPreset.name} 参考图 ${index + 1}`, `${selectedPreset.name} reference ${index + 1}`)} loading="lazy" />
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {selectedPreset.referenceCredits?.[index] && <small>{selectedPreset.referenceCredits[index].author} · {selectedPreset.referenceCredits[index].license}</small>}
                      </a>
                    ))}
                  </div> : <div className="reference-pending">
                    <img src={selectedPreset.image} alt={t(`${selectedPreset.name} 封面`, `${selectedPreset.name} cover`)} />
                    <span>{selectedPreset.photoLinks?.length ? t("照片由原站提供；下方有逐张直链和教程原页。本包不含照片文件。", "Photos are provided by their original sites. Individual links and tutorials are below; this pack contains no photo files.") : selectedPreset.sourceLinks?.length ? t("包内参考图尚未获公开发布许可；可在下方教程原页查看真实照片。", "Reference images are not cleared for redistribution. View the real photos on the tutorial sites below.") : t("参考图尚未发布", "Reference images are not yet published")}</span>
                  </div>}
                </section>
                {selectedPreset.kind === "effect" && <section className="effect-overview" aria-label={t("效果包说明", "Effect pack description")}>
                  <p>{selectedPreset.description}</p>
                  <p className="effect-status">{selectedPreset.note}</p>
                  {selectedPreset.downloadUrl && <div className="effect-package-access">
                    <div>
                      <strong>{selectedPreset.name} · {selectedPreset.version}</strong>
                      <p>{selectedPreset.packageContents}</p>
                    </div>
                    <a href={selectedPreset.downloadUrl}>{selectedPreset.downloadLabel ?? t("下载效果包 ZIP", "Download effect pack ZIP")}</a>
                  </div>}
                  {selectedPreset.adjustmentHints && <div className="effect-adjustments">
                    <h3>{t("可以对 Agent 这样说", "Try saying this to your agent")}</h3>
                    <ul>{selectedPreset.adjustmentHints.map((hint) => <li key={hint}>“{hint}”</li>)}</ul>
                  </div>}
                  {selectedPreset.photoLinks && <div className="effect-sources effect-photo-links">
                    <h3>{t("逐张查看原站照片", "View photos on their original sites")}</h3>
                    <ul>{selectedPreset.photoLinks.map((photo) => <li key={photo.url}>
                      <a href={photo.url} target="_blank" rel="noreferrer">{photo.label}</a>
                      <small>{photo.credit}</small>
                    </li>)}</ul>
                  </div>}
                  {selectedPreset.sourceLinks && <div className="effect-sources">
                    <h3>{t("在教程原页查看参考照片", "View reference photos in the original tutorials")}</h3>
                    <ul>{selectedPreset.sourceLinks.map((source) => <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                    </li>)}</ul>
                  </div>}
                </section>}
                {selectedPreset.loadStyleMarkdown && <PackageMarkdown
                  key={`${selectedPreset.id}-prompt`}
                  title={selectedPreset.kind === "effect" ? t("效果提示词", "Effect prompt") : t("风格说明", "Style notes")}
                  fileName={selectedPreset.kind === "effect" ? "effect.md" : "style.md"}
                  loader={selectedPreset.loadStyleMarkdown}
                  packageUrl={selectedPreset.packageUrl}
                  onCopy={copyValue}
                />}
                {selectedPreset.loadSourcesMarkdown && <PackageMarkdown
                  key={`${selectedPreset.id}-sources`}
                  title={t("来源与照片署名", "Sources and photo credits")}
                  fileName="sources.md"
                  loader={selectedPreset.loadSourcesMarkdown}
                  packageUrl={selectedPreset.packageUrl}
                  onCopy={copyValue}
                />}
                <div className="detail-actions">
                  {selectedPreset.packageUrl && <a href={selectedPreset.packageUrl} target="_blank" rel="noreferrer">{selectedPreset.kind === "effect" ? t("查看效果包", "View effect pack") : t("查看风格包", "View style pack")}</a>}
                  <button onClick={() => void copyLink()}><Icon name="copy" />{selectedPreset.downloadUrl ? t("复制下载链接", "Copy download link") : t("复制页面链接", "Copy page link")}</button>
                  {selectedPreset.kind !== "effect" && selectedPreset.downloadUrl && <a href={selectedPreset.downloadUrl}>{t("下载风格包", "Download style pack")}</a>}
                  {selectedPreset.downloadUrlBackup && <a href={selectedPreset.downloadUrlBackup} title={t("国内镜像下载（Gitee，内容一致）", "China mirror download (Gitee, identical content)")}>{t("国内下载", "China mirror")}</a>}
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      {page === "gallery" && <aside className="controller" aria-label={t("预设操控条", "Gallery controls")} inert={detailBackdropActive} aria-hidden={detailBackdropActive || undefined}>
        <AnimatePresence mode="wait" initial={false}>
        {dockMode === "collapsed" ? (
          <motion.button
            key="controller-wake"
            className="controller-wake"
            onClick={openController}
            aria-label={t("开启预设操控", "Open gallery controls")}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          >
            <span className="wake-symbol"><i /><i /><i /></span>
            <strong>{t("操控", "Browse")}</strong>
            <small>{t("控制", "Controls")}</small>
          </motion.button>
        ) : (
          <motion.div
            key="controller-active"
            className={`controller-active ${dockMode === "expanded" ? "is-expanded" : ""}`}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          >
            <AnimatePresence>
              {dockMode === "expanded" && !detailOpen && (
                <motion.section
                  className="controller-panel"
                  id="preset-filter-panel"
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.98 }}
                  transition={{ duration: reducedMotion ? 0 : 0.15 }}
                >
                  <div className="panel-heading">
                    <div><strong>{t("筛选内容", "Filter items")}</strong></div>
                    <span>{filteredPresets.length}{t(" 个结果", " results")}</span>
                  </div>
                  <label className="search-box">
                    <Icon name="search" />
                    <input
                      ref={searchRef}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t("搜索名称、色调或标签…", "Search names, tones, or tags…")}
                    />
                    <kbd>/</kbd>
                  </label>
                  <div className="category-list" aria-label={t("预设分类", "Categories")}>
                    {categories.map((item) => (
                      <button
                        key={item}
                        className={`${category === item ? "is-active" : ""} ${item === "效果" ? "is-effect" : ""}`}
                        onClick={() => setCategory(item)}
                      >
                        {categoryLabel(item, language)}
                      </button>
                    ))}
                  </div>
                  <div className="panel-help">
                    <span><kbd>↑↓←→</kbd> {t("移动", "Move")}</span>
                    <span><kbd>Enter</kbd> {t("详情", "Details")}</span>
                    <span><kbd>C</kbd> {t("复制", "Copy")}</span>
                    <span><kbd>Esc</kbd> {t("收起", "Close")}</span>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <div className="controller-caption" aria-live="polite">
              {detailOpen ? t("预设已拿起，世界暂时退后。", "One style in focus. Everything else can wait.") : t("像挑选相册照片一样，选中一个预设。", "Pick a style as you would a photo in an album.")}
            </div>
            <div className="controller-row">
              <div className="controller-bar">
                <div className="controller-persistent">
                  <button
                    className="control-icon"
                    onClick={() => {
                      if (detailOpen) closeDetail();
                      else setDockMode("collapsed");
                    }}
                    aria-label={detailOpen ? t("放回预设", "Close details") : t("收缩操控条", "Collapse controls")}
                  >
                    <Icon name={detailOpen ? "back" : "collapse"} />
                  </button>
                  {!detailOpen && (
                    <button
                      className={`control-icon ${dockMode === "expanded" ? "is-active" : ""}`}
                      onClick={() => setDockMode((mode) => mode === "expanded" ? "normal" : "expanded")}
                      aria-label={dockMode === "expanded" ? t("收起筛选面板", "Close filters") : t("展开筛选面板", "Open filters")}
                      aria-expanded={dockMode === "expanded"}
                    >
                      <Icon name="filter" />
                    </button>
                  )}
                </div>

                {selectedPreset ? (
                  <div className="controller-context">
                    <img src={selectedPreset.image} alt="" />
                    <span>
                      <strong>{detailOpen ? t("正在查看 · ", "Viewing · ") : t("已选择 · ", "Selected · ")}{selectedPreset.name}</strong>
                      <small>{selectedPreset.en} · {presetBadgeLabel(selectedPreset)} · {selectedPreset.version}</small>
                    </span>
                  </div>
                ) : (
                  <div className="controller-context"><span><strong>{t("没有匹配预设", "No matching styles")}</strong><small>{t("调整筛选条件", "Adjust your filters")}</small></span></div>
                )}

                <div className="controller-actions">
                  {detailOpen ? (
                    <>
                      <button className="control-icon mobile-hide" onClick={() => switchDetail(-1)} aria-label={t("上一个预设", "Previous item")}><Icon name="back" /></button>
                      <button className="control-icon mobile-hide" onClick={() => switchDetail(1)} aria-label={t("下一个预设", "Next item")}><Icon name="arrow" /></button>
                      <button className="control-action" onClick={() => void copyLink()}><Icon name={copied ? "check" : "copy"} /><span>{copied ? t("已复制", "Copied") : t("复制", "Copy")}</span></button>
                      <button className="control-action is-primary" onClick={closeDetail}><Icon name="back" /><span>{t("放回", "Close")}</span></button>
                    </>
                  ) : (
                    <>
                      <button className="control-action" disabled={!selectedPreset} onClick={() => void copyLink()}><Icon name={copied ? "check" : "copy"} /><span>{copied ? t("已复制", "Copied") : t("复制", "Copy")}</span></button>
                      <button className="control-action is-primary" disabled={!selectedPreset} onClick={() => selectedPreset && openDetail(selectedPreset)}><Icon name="details" /><span>{t("详情", "Details")}</span></button>
                    </>
                  )}
                </div>
              </div>
              <Trackball onNavigate={moveSelection} detailOpen={detailOpen} />
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </aside>}

      <AnimatePresence>
        {manualCopy !== null && <ManualCopyDialog value={manualCopy} onClose={() => setManualCopy(null)} />}
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Icon name={toast.startsWith("复制失败") || toast.startsWith("Copy failed") ? "close" : "check"} />{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
