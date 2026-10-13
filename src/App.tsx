// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { categories, visiblePresets as presets, type Category, type Preset } from "./catalog";
import { Icon } from "./Icon";
import { findSpatialTarget, type Direction, type SpatialRect } from "./navigation";
import { Trackball } from "./Trackball";
import { Documents, INSTALL_PROMPT_WITH_FAQ, UNINSTALL_PROMPT, type PortalPage } from "./Documents";

import { copyText } from "./clipboard";
import { ManualCopyDialog } from "./ManualCopyDialog";
import { HeaderHint, useOnboardingHints } from "./HeaderHints";
import { InstallAction, PrivacyAction } from "./HeaderPanels";

type DockMode = "collapsed" | "normal" | "expanded";

const presetBadgeLabel = (preset: Preset) =>
  preset.photoCredit ? "第三方图片" : preset.release;

function pageFromHash(): PortalPage {
  const value = window.location.hash.slice(1);
  return value === "experience" || value === "about" || value === "help"
    ? "experience"
    : "gallery";
}

function StyleMarkdown({ preset, onCopy }: {
  preset: Preset;
  onCopy: (value: string, message: string) => Promise<boolean>;
}) {
  const fileName = preset.kind === "effect" ? "effect.md" : "style.md";
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const loading = useRef(false);

  const load = () => {
    if (!preset.loadStyleMarkdown || markdown !== null || loading.current) return;
    loading.current = true;
    void preset.loadStyleMarkdown().then(setMarkdown).catch(() => setFailed(true)).finally(() => {
      loading.current = false;
    });
  };

  return <details className="style-markdown" onToggle={(event) => { if (event.currentTarget.open) load(); }}>
    <summary><span>{preset.kind === "effect" ? "效果提示词" : "风格说明"}</span><span>{fileName}</span></summary>
    <div className="style-markdown-content">
      {markdown !== null ? <>
        <button onClick={() => void onCopy(markdown, `已复制 ${fileName}`)}>复制 Markdown</button>
        <pre>{markdown}</pre>
      </> : failed ? <p>无法加载。{preset.packageUrl && <a href={`${preset.packageUrl.replace("/tree/", "/blob/")}/${fileName}`} target="_blank" rel="noreferrer">在 GitHub 查看 {fileName}</a>}</p> : <p>载入中…</p>}
    </div>
  </details>;
}

export default function App() {
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
  const [category, setCategory] = useState<Category>("全部");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const [page, setPage] = useState<PortalPage>(initialPage);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const detailPanelRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const installAnchorRef = useRef<HTMLDivElement | null>(null);
  const starAnchorRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  const hints = useOnboardingHints(page === "experience", detailOpen);
  const hintAnchor = hints.active === "install"
    ? installAnchorRef.current
    : hints.active === "star"
      ? starAnchorRef.current
      : null;

  const filteredPresets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return presets.filter((preset) => {
      const inCategory = category === "全部" || preset.category === category;
      const searchable = [
        preset.name,
        preset.en,
        preset.category,
        preset.release,
        presetBadgeLabel(preset),
        preset.description,
        ...preset.tags,
      ]
        .join(" ")
        .toLowerCase();
      return inCategory && (!needle || searchable.includes(needle));
    });
  }, [category, query]);

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
    window.requestAnimationFrame(() => {
      if (selectedId) cardRefs.current.get(selectedId)?.focus({ preventScroll: true });
    });
  }, [selectedId]);

  const openDetail = useCallback((preset: Preset) => {
    setSelectedId(preset.id);
    setDockMode("normal");
    setDetailOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set("preset", preset.id);
    window.history.pushState({}, "", url);
    window.requestAnimationFrame(() => detailPanelRef.current?.focus());
  }, []);

  const copyValue = useCallback(async (value: string, message: string) => {
    try {
      await copyText(value);
      showToast(message);
      return true;
    } catch {
      setManualCopy(value);
      showToast("复制失败，请在弹窗中手动复制");
      return false;
    }
  }, [showToast]);

  const copyLink = useCallback(async () => {
    if (!selectedPreset) return;
    if (selectedPreset.downloadUrl) {
      const packageKind = selectedPreset.kind === "effect" ? "效果包" : "风格包";
      const backup = selectedPreset.downloadUrlBackup;
      const lines = [
        `「${selectedPreset.name}」${packageKind}下载${backup ? "（两个地址内容一致，任选其一）" : ""}：`,
        `主源：${selectedPreset.downloadUrl}`,
        ...(backup ? [`国内备用：${backup}`] : []),
      ];
      if (await copyValue(lines.join("\n"), backup ? `已复制「${selectedPreset.name}」下载地址（主源 + 国内备用）` : `已复制「${selectedPreset.name}」下载地址`)) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
      return;
    }
    const linkBackup = selectedPreset.linkBackup;
    const lines = [
      `「${selectedPreset.name}」页面链接${linkBackup ? "（主源 + 国内备用）" : ""}：`,
      `主源：${selectedPreset.link}`,
      ...(linkBackup ? [`国内备用：${linkBackup}`] : []),
    ];
    if (await copyValue(lines.join("\n"), linkBackup ? `已复制「${selectedPreset.name}」页面链接（主源 + 国内备用）` : `已复制「${selectedPreset.name}」页面链接`)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }, [selectedPreset, copyValue]);

  const copyInstallPrompt = useCallback(() => copyValue(INSTALL_PROMPT_WITH_FAQ, "已复制安装提示词和 FAQ，发给 Agent 开始安装"), [copyValue]);
  const copyUninstallPrompt = useCallback(() => copyValue(UNINSTALL_PROMPT, "已复制卸载提示词，发给 Agent 核对并卸载"), [copyValue]);

  const resolveInstallHint = useCallback(() => hints.resolve("install", "done"), [hints]);
  const resolveStarHint = useCallback(() => hints.resolve("star", "done"), [hints]);
  const dismissActiveHint = useCallback(() => {
    if (hints.active) hints.dismiss(hints.active);
  }, [hints]);

  const switchDetail = useCallback(
    (delta: number) => {
      if (!filteredPresets.length) return;
      const index = activeIndex < 0 ? 0 : activeIndex;
      const next = filteredPresets[(index + delta + filteredPresets.length) % filteredPresets.length];
      setSelectedId(next.id);
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
      if (preset) {
        setSelectedId(preset.id);
        setDockMode("normal");
        setDetailOpen(true);
      } else {
        setDetailOpen(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
      if (page !== "gallery") return;
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, select") || target.isContentEditable) {
        if (event.key === "Escape") {
          target.blur();
          setDockMode("normal");
        }
        return;
      }
      if (event.key.toLowerCase() === "m" && dockMode === "collapsed") {
        event.preventDefault();
        openController();
        return;
      }
      if (event.key === "Escape") {
        if (detailOpen) closeDetail();
        else if (dockMode === "expanded") setDockMode("normal");
        else if (dockMode === "normal") setDockMode("collapsed");
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
      } else if (event.key === "Enter" && selectedPreset && !detailOpen) {
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
  }, [closeDetail, copyLink, detailOpen, dockMode, moveSelection, openController, openDetail, page, selectedPreset]);

  return (
    <div className={`app-shell page-${page} dock-${dockMode} ${detailOpen ? "has-detail" : ""}`}>
      <header className="site-header">
        <a className="brand" href="#gallery" aria-label="ToneRelay 画廊">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>
            <strong>TONERELAY</strong>
          </span>
        </a>
        <nav className="site-nav" aria-label="主要导航">
          <a href="#gallery" aria-current={page === "gallery" ? "page" : undefined}>画廊</a>
          <a href="#experience" aria-current={page === "experience" ? "page" : undefined}>立即体验</a>
        </nav>
        {page === "experience" && <div className="site-header-actions">
          <PrivacyAction />
          <InstallAction
            anchorRef={installAnchorRef}
            onCopy={copyInstallPrompt}
            onComplete={resolveInstallHint}
          />
          <div className="header-star-group" ref={starAnchorRef}>
            <a className="header-action header-star-link" href="https://github.com/ReefRuan/tonerelay-portal" target="_blank" rel="noreferrer" title="打开 Portal / 风格包仓库，在 GitHub 点 Star" onClick={resolveStarHint}><Icon name="star" />Star Portal</a>
            <a className="header-action header-star-link" href="https://github.com/ReefRuan/tonerelay-lightroom-mcp" target="_blank" rel="noreferrer" title="MCP 仓库目前私有；公开后访客才能在 GitHub 点 Star" aria-label="ToneRelay MCP 仓库，当前私有，公开后可 Star" onClick={resolveStarHint}><Icon name="star" />Star MCP <small>私有</small></a>
          </div>
        </div>}
      </header>

      {/* Rendered without AnimatePresence so a resolved hint unmounts
          deterministically — exit animations stall when a target="_blank"
          link (e.g. a Star link) backgrounds the tab. */}
      {hints.active && (
        <HeaderHint
          key={hints.active}
          id={hints.active}
          anchor={hintAnchor}
          onDismiss={dismissActiveHint}
        />
      )}

      {page === "gallery" ? <main className="catalog-main" aria-hidden={detailOpen || undefined}>
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">
            Reef 的 Lightroom MCP<br />
            <em>风格与效果画廊。</em>
          </h1>
          <p>
            浏览由 Reef 整理的 Lightroom 风格模板与效果包。点击卡片查看适用场景，
            再选择适合当前照片的内容。
          </p>
        </section>

        <div className="catalog-heading">
          <div>
            <h2>互联网蒸馏预设</h2>
          </div>
          <div className="catalog-rule"><i /></div>
          <p>{filteredPresets.length} 项内容</p>
        </div>

        {filteredPresets.length ? (
          <section className="preset-grid" aria-label="效果包瀑布流">
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
                  aria-label={`选择${preset.kind === "effect" ? "效果包" : "风格模板"}：${preset.name}`}
                  aria-pressed={selected}
                  onClick={() => {
                    setSelectedId(preset.id);
                    if (dockMode === "collapsed") setDockMode("normal");
                  }}
                  onDoubleClick={() => openDetail(preset)}
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
                    <span className="card-version">{preset.version}</span>
                  </span>
                </motion.button>
              );
            })}
          </section>
        ) : (
          <section className="empty-state">
            <span>没有匹配结果</span>
            <h2>没有找到这种内容。</h2>
            <button onClick={() => { setQuery(""); setCategory("全部"); }}>清除筛选</button>
          </section>
        )}

        <footer className="site-footer">
          <span>© 2026 Reef Ruan · ToneRelay</span>
          <span><a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE" target="_blank" rel="noreferrer">AGPL-3.0-only</a> · <a href="https://github.com/ReefRuan/tonerelay-portal/blob/main/LICENSE-SCOPE.md" target="_blank" rel="noreferrer">授权范围与照片许可</a></span>
        </footer>
      </main> : <Documents onCopyUninstall={copyUninstallPrompt} />}

      <AnimatePresence>
        {page === "gallery" && detailOpen && selectedPreset && (
          <motion.div
            className="detail-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
          >
            <button className="detail-backdrop" aria-label="放回预设" onClick={closeDetail} />
            <motion.article
              ref={detailPanelRef}
              tabIndex={-1}
              className="detail-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-title"
              initial={reducedMotion ? false : { y: 80, scale: 0.88, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { y: 70, scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 370, damping: 32 }}
            >
              <div className="detail-topline">
                <span>{selectedPreset.kind === "effect" ? "效果" : "风格包"} / {selectedPreset.number}</span>
                <button onClick={closeDetail} aria-label="放回预设"><Icon name="close" /></button>
              </div>
              <div className="detail-body">
                <header className="detail-title-row">
                  <div>
                    <h2 id="detail-title">{selectedPreset.name}</h2>
                    <p>{selectedPreset.en}</p>
                  </div>
                  {selectedPreset.references.length > 0 ? <span>{selectedPreset.references.length} 张参考图</span>
                    : selectedPreset.photoLinks?.length ? <span>{selectedPreset.photoLinks.length} 张原站照片链接</span> : null}
                </header>
                <section className="reference-gallery" aria-label={`${selectedPreset.name} 参考图`}>
                  {selectedPreset.references.length ? <div className="reference-list">
                    {selectedPreset.references.map((reference, index) => (
                      <a
                        key={reference}
                        href={selectedPreset.referenceCredits?.[index]?.source ?? reference}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`查看参考图 ${index + 1} 的来源`}
                        title={selectedPreset.referenceCredits?.[index] ? `${selectedPreset.referenceCredits[index].author} · ${selectedPreset.referenceCredits[index].license}` : undefined}
                      >
                        <img src={reference} alt={`${selectedPreset.name} 参考图 ${index + 1}`} loading="lazy" />
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {selectedPreset.referenceCredits?.[index] && <small>{selectedPreset.referenceCredits[index].author} · {selectedPreset.referenceCredits[index].license}</small>}
                      </a>
                    ))}
                  </div> : <div className="reference-pending">
                    <img src={selectedPreset.image} alt={`${selectedPreset.name} 封面`} />
                    <span>{selectedPreset.photoLinks?.length ? "照片由原站提供；下方有逐张直链和教程原页。本包不含照片文件。" : selectedPreset.sourceLinks?.length ? "包内参考图尚未获公开发布许可；可在下方教程原页查看真实照片。" : "参考图尚未发布"}</span>
                  </div>}
                </section>
                {selectedPreset.kind === "effect" && <section className="effect-overview" aria-label="效果包说明">
                  <p>{selectedPreset.description}</p>
                  <p className="effect-status">{selectedPreset.note}</p>
                  {selectedPreset.adjustmentHints && <div className="effect-adjustments">
                    <h3>可以对 Agent 这样说</h3>
                    <ul>{selectedPreset.adjustmentHints.map((hint) => <li key={hint}>“{hint}”</li>)}</ul>
                  </div>}
                  {selectedPreset.photoLinks && <div className="effect-sources effect-photo-links">
                    <h3>逐张查看原站照片</h3>
                    <ul>{selectedPreset.photoLinks.map((photo) => <li key={photo.url}>
                      <a href={photo.url} target="_blank" rel="noreferrer">{photo.label}</a>
                      <small>{photo.credit}</small>
                    </li>)}</ul>
                  </div>}
                  {selectedPreset.sourceLinks && <div className="effect-sources">
                    <h3>在教程原页查看参考照片</h3>
                    <ul>{selectedPreset.sourceLinks.map((source) => <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                    </li>)}</ul>
                  </div>}
                </section>}
                {selectedPreset.loadStyleMarkdown && <StyleMarkdown key={selectedPreset.id} preset={selectedPreset} onCopy={copyValue} />}
                <div className="detail-actions">
                  {selectedPreset.packageUrl && <a href={selectedPreset.packageUrl} target="_blank" rel="noreferrer">查看{selectedPreset.kind === "effect" ? "效果包" : "风格包"}</a>}
                  <button onClick={() => void copyLink()}><Icon name="copy" />{selectedPreset.downloadUrl ? "复制下载链接" : "复制页面链接"}</button>
                  {selectedPreset.downloadUrl && <a href={selectedPreset.downloadUrl}>下载{selectedPreset.kind === "effect" ? "效果包" : "风格包"}</a>}
                  {selectedPreset.downloadUrlBackup && <a href={selectedPreset.downloadUrlBackup} title="国内镜像下载（Gitee，内容一致）">国内下载</a>}
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      {page === "gallery" && <aside className="controller" aria-label="预设操控条">
        {dockMode === "collapsed" ? (
          <motion.button
            className="controller-wake"
            onClick={openController}
            aria-label="开启预设操控"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          >
            <span className="wake-symbol"><i /><i /><i /></span>
            <strong>操控</strong>
            <small>控制</small>
          </motion.button>
        ) : (
          <div className={`controller-active ${dockMode === "expanded" ? "is-expanded" : ""}`}>
            <AnimatePresence>
              {dockMode === "expanded" && !detailOpen && (
                <motion.section
                  className="controller-panel"
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.98 }}
                  transition={{ duration: reducedMotion ? 0 : 0.15 }}
                >
                  <div className="panel-heading">
                    <div><strong>筛选内容</strong></div>
                    <span>{filteredPresets.length} 个结果</span>
                  </div>
                  <label className="search-box">
                    <Icon name="search" />
                    <input
                      ref={searchRef}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="搜索名称、色调或标签…"
                    />
                    <kbd>/</kbd>
                  </label>
                  <div className="category-list" aria-label="预设分类">
                    {categories.map((item) => (
                      <button
                        key={item}
                        className={category === item ? "is-active" : ""}
                        onClick={() => setCategory(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="panel-help">
                    <span><kbd>↑↓←→</kbd> 移动</span>
                    <span><kbd>Enter</kbd> 详情</span>
                    <span><kbd>C</kbd> 复制</span>
                    <span><kbd>Esc</kbd> 收起</span>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <div className="controller-caption" aria-live="polite">
              {detailOpen ? "预设已拿起，世界暂时退后。" : "像挑选相册照片一样，选中一个预设。"}
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
                    aria-label={detailOpen ? "放回预设" : "收缩操控条"}
                  >
                    <Icon name={detailOpen ? "back" : "collapse"} />
                  </button>
                  {!detailOpen && (
                    <button
                      className={`control-icon ${dockMode === "expanded" ? "is-active" : ""}`}
                      onClick={() => setDockMode((mode) => mode === "expanded" ? "normal" : "expanded")}
                      aria-label={dockMode === "expanded" ? "收起筛选面板" : "展开筛选面板"}
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
                      <strong>{detailOpen ? "正在查看 · " : "已选择 · "}{selectedPreset.name}</strong>
                      <small>{selectedPreset.en} · {presetBadgeLabel(selectedPreset)} · {selectedPreset.version}</small>
                    </span>
                  </div>
                ) : (
                  <div className="controller-context"><span><strong>没有匹配预设</strong><small>调整筛选条件</small></span></div>
                )}

                <div className="controller-actions">
                  {detailOpen ? (
                    <>
                      <button className="control-icon mobile-hide" onClick={() => switchDetail(-1)} aria-label="上一个预设"><Icon name="back" /></button>
                      <button className="control-icon mobile-hide" onClick={() => switchDetail(1)} aria-label="下一个预设"><Icon name="arrow" /></button>
                      <button className="control-action" onClick={() => void copyLink()}><Icon name={copied ? "check" : "copy"} /><span>{copied ? "已复制" : "复制"}</span></button>
                      <button className="control-action is-primary" onClick={closeDetail}><Icon name="back" /><span>放回</span></button>
                    </>
                  ) : (
                    <>
                      <button className="control-action" disabled={!selectedPreset} onClick={() => void copyLink()}><Icon name={copied ? "check" : "copy"} /><span>{copied ? "已复制" : "复制"}</span></button>
                      <button className="control-action is-primary" disabled={!selectedPreset} onClick={() => selectedPreset && openDetail(selectedPreset)}><Icon name="details" /><span>详情</span></button>
                    </>
                  )}
                </div>
              </div>
              <Trackball onNavigate={moveSelection} detailOpen={detailOpen} />
            </div>
          </div>
        )}
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
            <Icon name={toast.startsWith("复制失败") ? "close" : "check"} />{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
