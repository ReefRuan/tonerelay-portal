import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { categories, presets, type Category, type Preset } from "./catalog";
import { Icon } from "./Icon";
import { findSpatialTarget, type Direction, type SpatialRect } from "./navigation";
import { Trackball } from "./Trackball";

type DockMode = "collapsed" | "normal" | "expanded";

const tiltFor = (index: number) => ["-1.1deg", "0.7deg", "-0.4deg", "1deg", "-0.7deg"][index % 5];

function copyFallback(value: string) {
  const input = document.createElement("textarea");
  input.value = value;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export default function App() {
  const initialPreset = new URLSearchParams(window.location.search).get("preset");
  const validInitial = presets.some((preset) => preset.id === initialPreset)
    ? initialPreset
    : null;
  const [dockMode, setDockMode] = useState<DockMode>(validInitial ? "normal" : "collapsed");
  const [selectedId, setSelectedId] = useState<string | null>(validInitial);
  const [detailOpen, setDetailOpen] = useState(Boolean(validInitial));
  const [category, setCategory] = useState<Category>("全部");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const detailPanelRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const reducedMotion = useReducedMotion();

  const filteredPresets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return presets.filter((preset) => {
      const inCategory = category === "全部" || preset.category === category;
      const searchable = [
        preset.name,
        preset.en,
        preset.category,
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

  const copyLink = useCallback(async () => {
    if (!selectedPreset) return;
    try {
      await navigator.clipboard.writeText(selectedPreset.link);
    } catch {
      copyFallback(selectedPreset.link);
    }
    setCopied(true);
    showToast(`已复制「${selectedPreset.name}」链接`);
    window.setTimeout(() => setCopied(false), 1600);
  }, [selectedPreset, showToast]);

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
    const onKeyDown = (event: KeyboardEvent) => {
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
  }, [closeDetail, copyLink, detailOpen, dockMode, moveSelection, openController, openDetail, selectedPreset]);

  return (
    <div className={`app-shell dock-${dockMode} ${detailOpen ? "has-detail" : ""}`}>
      <header className="site-header">
        <a className="brand" href="/" aria-label="ToneRelay 首页">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>
            <strong>TONERELAY</strong>
            <small>PRESET FIELD</small>
          </span>
        </a>
        <div className="header-meta">
          <span><i /> CATALOG ONLINE</span>
          <span>{String(presets.length).padStart(2, "0")} PACKS</span>
          <span>EST. 2026</span>
        </div>
      </header>

      <main className="catalog-main" aria-hidden={detailOpen || undefined}>
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-kicker">A FIELD GUIDE TO COLOR / 001</div>
          <h1 id="page-title">
            找到一种光。<br />
            <em>把它带回照片里。</em>
          </h1>
          <p>
            浏览 ToneRelay 风格预设。点击照片，或开启操控条，<br className="desktop-only" />
            用方向键与轨迹球慢慢挑选。
          </p>
          <div className="intro-foot">
            <span>SCROLL TO BROWSE</span>
            <span>PRESS M TO CONTROL</span>
          </div>
        </section>

        <div className="catalog-heading">
          <div>
            <span>THE COLLECTION</span>
            <h2>全部预设</h2>
          </div>
          <div className="catalog-rule"><i /></div>
          <p>{filteredPresets.length} / {presets.length}<br />STATIC CATALOG</p>
        </div>

        {filteredPresets.length ? (
          <section className="preset-grid" aria-label="效果包瀑布流">
            {filteredPresets.map((preset, index) => {
              const selected = dockMode !== "collapsed" && preset.id === selectedPreset?.id;
              return (
                <motion.button
                  layout
                  key={preset.id}
                  ref={(node) => {
                    if (node) cardRefs.current.set(preset.id, node);
                    else cardRefs.current.delete(preset.id);
                  }}
                  className={`preset-card ${selected ? "is-selected" : ""}`}
                  style={
                    {
                      "--card-ratio": preset.ratio,
                      "--tilt": tiltFor(index),
                    } as CSSProperties
                  }
                  aria-label={`选择预设：${preset.name}`}
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
                  <span className="card-meta">
                    <span>{preset.category}</span>
                    <span>{preset.tags[0]}</span>
                  </span>
                </motion.button>
              );
            })}
          </section>
        ) : (
          <section className="empty-state">
            <span>NO MATCH / 00</span>
            <h2>没有找到这种光。</h2>
            <button onClick={() => { setQuery(""); setCategory("全部"); }}>清除筛选</button>
          </section>
        )}

        <footer className="site-footer">
          <span>TONE RELAY / COLOR AS A PLACE</span>
          <span>浏览 · 选择 · 带走链接</span>
        </footer>
      </main>

      <AnimatePresence>
        {detailOpen && selectedPreset && (
          <motion.div
            className="detail-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.24 }}
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
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="detail-topline">
                <span>A CLOSER LOOK / {selectedPreset.number}</span>
                <button onClick={closeDetail} aria-label="放回预设"><Icon name="close" /></button>
              </div>
              <div className="detail-visual">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedPreset.id}
                    src={selectedPreset.image}
                    alt={`${selectedPreset.name} 效果包封面`}
                    initial={{ opacity: 0, scale: 1.025 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.28 }}
                  />
                </AnimatePresence>
                <span>{selectedPreset.en}</span>
              </div>
              <div className="detail-body">
                <div className="detail-title-row">
                  <div>
                    <span>{selectedPreset.category} / {selectedPreset.version}</span>
                    <h2 id="detail-title">{selectedPreset.name}</h2>
                    <p>{selectedPreset.description}</p>
                  </div>
                  <strong>{String(activeIndex + 1).padStart(2, "0")} / {String(filteredPresets.length).padStart(2, "0")}</strong>
                </div>
                <div className="detail-notes">
                  <p>{selectedPreset.note}</p>
                  <div className="palette" aria-label="色彩倾向">
                    {selectedPreset.palette.map((color) => <i key={color} style={{ background: color }} title={color} />)}
                  </div>
                </div>
                <div className="detail-tags">
                  {selectedPreset.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="detail-actions">
                  <button onClick={() => void copyLink()}><Icon name="copy" />复制链接</button>
                  <a href={selectedPreset.link} target="_blank" rel="noreferrer"><Icon name="external" />打开模板库</a>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="controller" aria-label="预设操控条">
        {dockMode === "collapsed" ? (
          <motion.button
            className="controller-wake"
            onClick={openController}
            aria-label="开启预设操控"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <span className="wake-symbol"><i /><i /><i /></span>
            <strong>操控</strong>
            <small>CONTROL</small>
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
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                >
                  <div className="panel-heading">
                    <div><span>FIND A PRESET</span><strong>筛选这片色彩</strong></div>
                    <span>{filteredPresets.length} MATCHES</span>
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
                      <small>{selectedPreset.en} · {selectedPreset.version}</small>
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
      </aside>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Icon name="check" />{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
