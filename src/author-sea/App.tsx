import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ScreenDitherFilter } from "./dither/ScreenDitherFilter";
import { createSeaRenderer } from "./dither/seaRenderer";
import { LanguageSwitch, useLanguage } from "../i18n";

type Origin = { left: number; top: number; width: number; height: number };
type OpenCard = { origin: Origin };
type ScenePointer = {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  touch: boolean;
  mode: "pending" | "zoom" | "pan";
};

const transformTo = (origin: Origin, target: DOMRect) =>
  `translate(${origin.left - target.left}px, ${origin.top - target.top}px) scale(${origin.width / target.width}, ${origin.height / target.height})`;

const email = "leningruan1@gmail.com";
const qq = "1843727310";

function ContactDetails() {
  const { t } = useLanguage();
  return (
    <dl className="contact-details">
      <div>
        <dt>BILIBILI</dt>
        <dd><a href="https://space.bilibili.com/2869626" target="_blank" rel="noreferrer">{t("Bilibili 主页", "Bilibili profile")}</a></dd>
      </div>
      <div>
        <dt>EMAIL</dt>
        <dd>
          <a href={`mailto:${email}`}>{email}</a>
          <small>{t("可能看得慢，回复不稳定", "Checked infrequently; replies may be delayed")}</small>
        </dd>
      </div>
      <div>
        <dt>QQ</dt>
        <dd>{qq}<small>{t("消息秒回", "Quick replies")}</small></dd>
      </div>
    </dl>
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function App() {
  const { language, t } = useLanguage();
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const readerMotionRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const cardOpenButtonRef = useRef<HTMLButtonElement>(null);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1, pulse: 0 });
  const pointerRef = useRef<ScenePointer>({ id: -1, x: 0, y: 0, startX: 0, startY: 0, touch: false, mode: "pending" });
  const suppressCardClickRef = useRef(false);
  const openingRef = useRef<Animation | null>(null);
  const closingRef = useRef<Animation | null>(null);
  const restoreFocusRef = useRef(false);
  const expandedRef = useRef(false);
  const resumeSceneRef = useRef<(() => void) | null>(null);
  const weatherTargetRef = useRef(1);
  const [expanded, setExpanded] = useState<OpenCard | null>(null);
  const [dragging, setDragging] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const title = language === "en" ? "Contact Reef · Sea Card" : "联系 Reef · 海面名片";
    const description = language === "en" ? "Contact ToneRelay creator Reef Ruan and find project links and contact details." : "联系 ToneRelay 作者 Reef Ruan，查看项目 GitHub 与联系方式。";
    document.title = title;
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  }, [language]);

  expandedRef.current = expanded !== null;

  const clampCameraPosition = useCallback((x: number, y: number, zoom: number) => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return { x, y };
    const maxX = Math.max(0, (scene.clientWidth - card.offsetWidth * zoom) / 2 - 16);
    const maxY = Math.max(0, (scene.clientHeight - card.offsetHeight * zoom) / 2 - 16);
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  }, []);

  const zoomBy = useCallback((factor: number, clientX?: number, clientY?: number) => {
    const scene = sceneRef.current;
    if (!scene || expandedRef.current) return;
    const rect = scene.getBoundingClientRect();
    const px = (clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
    const py = (clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
    const camera = cameraRef.current;
    const nextZoom = clamp(camera.targetZoom * factor, 0.6, 2.35);
    const worldX = (px - camera.targetX) / camera.targetZoom;
    const worldY = (py - camera.targetY) / camera.targetZoom;
    const position = clampCameraPosition(px - worldX * nextZoom, py - worldY * nextZoom, nextZoom);
    camera.targetX = position.x;
    camera.targetY = position.y;
    camera.targetZoom = nextZoom;
    camera.pulse = 1;
  }, [clampCameraPosition]);

  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 1;
    camera.pulse = 0.65;
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    const world = worldRef.current;
    if (!scene || !canvas || !world) return;

    let renderer: ReturnType<typeof createSeaRenderer> = null;
    let firstFramePending = true;
    const startRenderer = () => {
      try {
        renderer = createSeaRenderer(canvas);
        firstFramePending = true;
        setWebglReady(false);
        renderer?.resize(scene.clientWidth, scene.clientHeight);
        if (!renderer) setSceneReady(true);
      } catch (error) {
        console.warn("Sea shader unavailable; using static background.", error);
        renderer = null;
        setWebglReady(false);
        setSceneReady(true);
      }
    };
    startRenderer();

    let sizeDirty = false;
    const resize = () => {
      renderer?.resize(scene.clientWidth, scene.clientHeight);
      const camera = cameraRef.current;
      const current = clampCameraPosition(camera.x, camera.y, camera.zoom);
      const target = clampCameraPosition(camera.targetX, camera.targetY, camera.targetZoom);
      camera.x = current.x;
      camera.y = current.y;
      camera.targetX = target.x;
      camera.targetY = target.y;
      sizeDirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    const onContextLost = (event: Event) => {
      event.preventDefault();
      renderer = null;
      setWebglReady(false);
    };
    const onContextRestored = () => startRenderer();
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedQuery.matches;
    const onMotionChange = () => { reduced = reducedQuery.matches; };
    reducedQuery.addEventListener("change", onMotionChange);
    let animationFrame = 0;
    let lastTick = 0;
    let lastDraw = 0;
    let seaTime = 0;
    let weatherMix = 1;
    let lastDrawnX = NaN;
    let lastDrawnY = NaN;
    let lastDrawnZoom = NaN;
    let lastDrawnPulse = NaN;
    let lastDrawnWeather = NaN;
    let lastWorldX = NaN;
    let lastWorldY = NaN;
    let lastWorldZoom = NaN;
    const tick = (now: number) => {
      animationFrame = 0;
      if (expandedRef.current || document.hidden) return;
      const dt = Math.min(48, now - (lastTick || now));
      lastTick = now;
      const camera = cameraRef.current;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * 0.012);
      camera.x += (camera.targetX - camera.x) * ease;
      camera.y += (camera.targetY - camera.y) * ease;
      camera.zoom += (camera.targetZoom - camera.zoom) * ease;
      const weatherChanging = Math.abs(weatherMix - weatherTargetRef.current) > 0.001;
      weatherMix += (weatherTargetRef.current - weatherMix)
        * (reduced ? 1 : 1 - Math.exp(-dt * 0.005));
      camera.pulse *= reduced ? 0 : Math.exp(-dt * 0.0045);
      if (!reduced) seaTime += dt / 1000;

      if (camera.x !== lastWorldX || camera.y !== lastWorldY || camera.zoom !== lastWorldZoom) {
        world.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`;
        lastWorldX = camera.x;
        lastWorldY = camera.y;
        lastWorldZoom = camera.zoom;
      }
      const cameraMoving =
        Math.abs(camera.x - camera.targetX) > 0.02 ||
        Math.abs(camera.y - camera.targetY) > 0.02 ||
        Math.abs(camera.zoom - camera.targetZoom) > 0.001 ||
        camera.pulse > 0.003 || weatherChanging;
      const frameChanged = sizeDirty ||
        camera.x !== lastDrawnX || camera.y !== lastDrawnY ||
        camera.zoom !== lastDrawnZoom || camera.pulse !== lastDrawnPulse ||
        weatherMix !== lastDrawnWeather;
      if (renderer && now - lastDraw >= 33 &&
          (!reduced || cameraMoving || frameChanged || firstFramePending)) {
        renderer.render({
          x: camera.x, y: camera.y, zoom: camera.zoom,
          pulse: camera.pulse, time: seaTime, clearWeather: weatherMix,
        });
        lastDraw = now;
        lastDrawnX = camera.x;
        lastDrawnY = camera.y;
        lastDrawnZoom = camera.zoom;
        lastDrawnPulse = camera.pulse;
        lastDrawnWeather = weatherMix;
        sizeDirty = false;
        if (firstFramePending) {
          firstFramePending = false;
          setWebglReady(true);
          setSceneReady(true);
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (animationFrame || document.hidden || expandedRef.current) return;
      if (lastTick) lastTick = performance.now();
      animationFrame = requestAnimationFrame(tick);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        resume();
      }
    };
    resumeSceneRef.current = resume;
    document.addEventListener("visibilitychange", onVisibilityChange);
    resume();

    const onWheel = (event: WheelEvent) => {
      if (expandedRef.current) return;
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scene.clientHeight : 1);
      zoomBy(Math.exp(-clamp(pixels, -90, 90) * 0.00115), event.clientX, event.clientY);
    };
    scene.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(animationFrame);
      resumeSceneRef.current = null;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      scene.removeEventListener("wheel", onWheel);
      observer.disconnect();
      reducedQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      renderer?.dispose();
    };
  }, [zoomBy, clampCameraPosition]);

  useEffect(() => {
    if (!expanded) resumeSceneRef.current?.();
  }, [expanded]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (expandedRef.current) return;
    if (event.pointerType === "touch" && !event.isPrimary) {
      pointerRef.current.id = -1;
      suppressCardClickRef.current = true;
      setDragging(false);
      return;
    }
    suppressCardClickRef.current = false;
    const target = event.target as HTMLElement;
    if (target.closest("a") || (event.pointerType !== "touch" && target.closest("button"))) return;
    if (event.button !== 0 && event.pointerType !== "touch") return;
    if (pointerRef.current.id !== -1) return;
    const touch = event.pointerType === "touch";
    if (!touch && target.closest(".sea-card")) return;
    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      touch,
      mode: touch ? "pending" : "pan",
    };
    if (!touch) {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (expandedRef.current) return;
    const pointer = pointerRef.current;
    if (pointer.id !== event.pointerId) return;
    if (pointer.touch && pointer.mode === "pending") {
      const totalX = event.clientX - pointer.startX;
      const totalY = event.clientY - pointer.startY;
      if (Math.hypot(totalX, totalY) < 8) return;
      pointer.mode = Math.abs(totalY) >= Math.abs(totalX) ? "zoom" : "pan";
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      suppressCardClickRef.current = true;
      if (pointer.mode === "pan") setDragging(true);
      return;
    }
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (pointer.touch && pointer.mode === "zoom") {
      zoomBy(Math.exp(-clamp(dy, -60, 60) * 0.004), pointer.startX, pointer.startY);
    } else {
      const camera = cameraRef.current;
      const position = clampCameraPosition(camera.targetX + dx, camera.targetY + dy, camera.targetZoom);
      camera.x = camera.targetX = position.x;
      camera.y = camera.targetY = position.y;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };
  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== event.pointerId) return;
    pointerRef.current.id = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const openCard = () => {
    if (expandedRef.current) return;
    closingRef.current?.cancel();
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    // The sea freezes under the open card; the next weather arrives as the
    // card is put back. One complete visit advances the two-weather cycle.
    weatherTargetRef.current = 1 - weatherTargetRef.current;
    const camera = cameraRef.current;
    camera.targetX = camera.x;
    camera.targetY = camera.y;
    camera.targetZoom = camera.zoom;
    camera.pulse = 0;
    const pointerId = pointerRef.current.id;
    const scene = sceneRef.current;
    if (pointerId !== -1 && scene?.hasPointerCapture(pointerId)) scene.releasePointerCapture(pointerId);
    pointerRef.current.id = -1;
    setDragging(false);
    expandedRef.current = true;
    setExpanded({ origin: { left: rect.left, top: rect.top, width: rect.width, height: rect.height } });
  };

  useLayoutEffect(() => {
    const panel = readerRef.current;
    const motion = readerMotionRef.current;
    if (!panel || !motion || !expanded) return;
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = transformTo(expanded.origin, motion.getBoundingClientRect());
    openingRef.current = motion.animate(
      [{ transform: from, opacity: 0.85 }, { transform: "none", opacity: 1 }],
      { duration: 480, easing: "cubic-bezier(.22, 1, .36, 1)" },
    );
    return () => { openingRef.current?.cancel(); openingRef.current = null; };
  }, [expanded]);

  const closePage = useCallback(() => {
    if (!expanded || closingRef.current) return;
    const finish = () => {
      closingRef.current = null;
      restoreFocusRef.current = true;
      setExpanded(null);
    };
    const motion = readerMotionRef.current;
    if (!motion || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const currentStyle = getComputedStyle(motion);
    const currentTransform = currentStyle.transform;
    const currentOpacity = Number(currentStyle.opacity);
    openingRef.current?.cancel();
    openingRef.current = null;
    const to = transformTo(cardRef.current?.getBoundingClientRect() ?? expanded.origin, motion.getBoundingClientRect());
    const backdrop = backdropRef.current;
    backdrop?.animate(
      [{ opacity: getComputedStyle(backdrop).opacity }, { opacity: 0 }],
      { duration: 400, easing: "ease-out", fill: "forwards" },
    );
    const animation = motion.animate(
      [
        { transform: currentTransform, opacity: currentOpacity, offset: 0 },
        { transform: to, opacity: 1, offset: 0.78 },
        { transform: to, opacity: 0, offset: 1 },
      ],
      { duration: 400, easing: "cubic-bezier(.32, 0, .3, 1)", fill: "forwards" },
    );
    closingRef.current = animation;
    void animation.finished.then(() => { if (closingRef.current === animation) finish(); }, () => {
      if (closingRef.current === animation) closingRef.current = null;
    });
  }, [expanded]);

  useLayoutEffect(() => {
    if (expanded || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    cardOpenButtonRef.current?.focus({ preventScroll: true });
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePage();
      }
      if (event.key !== "Tab") return;
      const controls = readerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === readerRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !readerRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, closePage]);

  return (
    <div className={`app ${expanded ? "is-reading" : ""}`}>
      <ScreenDitherFilter />
      <div
        ref={sceneRef}
        className={`sea-scene ${dragging ? "is-dragging" : ""}`}
        role="main"
        aria-label={t("可拖动和缩放的抖动海面", "Draggable, zoomable dithered sea")}
        inert={!!expanded}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest("button, a, .sea-card")) resetView();
        }}
      >
        <div className="sea-fallback" aria-hidden="true" />
        <canvas ref={canvasRef} className={`sea-canvas ${webglReady ? "is-ready" : ""}`} aria-hidden="true" />
        <div className="card-filter-layer">
          <div ref={worldRef} className="card-world">
            <article
              ref={cardRef}
              className="sea-card sea-card-profile"
              onClickCapture={(event) => {
                if (!suppressCardClickRef.current) return;
                suppressCardClickRef.current = false;
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                if (!(event.target as HTMLElement).closest("a") && !window.getSelection()?.toString()) openCard();
              }}
            >
              <div className="sea-card-top"><span>{t("CONTACT / 名片", "CONTACT / CARD")}</span><span>REEF</span></div>
              <strong>REEF.</strong>
              <button ref={cardOpenButtonRef} className="sea-card-action" type="button" onClick={(event) => { event.stopPropagation(); openCard(); }}>
                {t("展开名片", "Open contact card")}<span aria-hidden="true">↗</span>
              </button>
            </article>
          </div>
        </div>
      </div>

      <div className="scene-ui" inert={!!expanded}>
        <span className="brand">ReeF</span>
        <LanguageSwitch className="contact-language-switch" />
        <a className="back-link" href={language === "en" ? "./?lang=en" : "./"}>← {t("返回画廊", "Back to gallery")}</a>
        <div className="sea-controls" role="group" aria-label={t("海面视角", "Sea view controls")}>
          <button type="button" onClick={() => zoomBy(1.2)} aria-label={t("放大海面", "Zoom in on the sea")} title={t("放大", "Zoom in")}>＋</button>
          <button type="button" onClick={() => zoomBy(1 / 1.2)} aria-label={t("缩小海面", "Zoom out of the sea")} title={t("缩小", "Zoom out")}>−</button>
        </div>
      </div>

      {expanded && (
        <div className="reader-layer">
          <div ref={backdropRef} className="reader-backdrop" onClick={closePage} aria-hidden="true" />
          <div ref={readerMotionRef} className="reader-motion">
            <section ref={readerRef} className="reader-panel" role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title" tabIndex={-1}>
              <div className="reader-topline">
                <span>{t("CONTACT / 名片", "CONTACT / CARD")}</span>
                <button type="button" onClick={closePage} aria-label={t("放回海面", "Return the card to the sea")}>× <span>{t("放回", "Put back")}</span></button>
              </div>
              <article className="reading-article contact-article">
                <span className="reading-kicker">REEF / CONTACT</span>
                <h1 id="contact-dialog-title">REEF.</h1>
                <ContactDetails />
              </article>
            </section>
          </div>
        </div>
      )}
      <div className={`scene-reveal ${sceneReady ? "is-ready" : ""}`} aria-hidden="true" />
    </div>
  );
}
