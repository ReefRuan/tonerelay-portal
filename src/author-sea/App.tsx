import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ScreenDitherFilter } from "./dither/ScreenDitherFilter";
import { createSeaRenderer } from "./dither/seaRenderer";

type Origin = { left: number; top: number; width: number; height: number };
type OpenCard = { origin: Origin };

const transformTo = (origin: Origin, target: DOMRect) =>
  `translate(${origin.left - target.left}px, ${origin.top - target.top}px) scale(${origin.width / target.width}, ${origin.height / target.height})`;

const email = "leningruan1@gmail.com";
const qq = "1843727310";

function ContactDetails() {
  return (
    <dl className="contact-details">
      <div><dt>EMAIL</dt><dd><a href={`mailto:${email}`}>{email}</a></dd></div>
      <div><dt>QQ</dt><dd>{qq}</dd></div>
    </dl>
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function App() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const readerMotionRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const cardOpenButtonRef = useRef<HTMLButtonElement>(null);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1, pulse: 0 });
  const pointerRef = useRef({ id: -1, x: 0, y: 0 });
  const openingRef = useRef<Animation | null>(null);
  const closingRef = useRef<Animation | null>(null);
  const restoreFocusRef = useRef(false);
  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState<OpenCard | null>(null);
  const [dragging, setDragging] = useState(false);
  const [webglReady, setWebglReady] = useState(true);

  expandedRef.current = expanded !== null;

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
    camera.targetX = px - worldX * nextZoom;
    camera.targetY = py - worldY * nextZoom;
    camera.targetZoom = nextZoom;
    camera.pulse = 1;
  }, []);

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
    const startRenderer = () => {
      try {
        renderer = createSeaRenderer(canvas);
        setWebglReady(!!renderer);
        renderer?.resize(scene.clientWidth, scene.clientHeight);
      } catch (error) {
        console.warn("Sea shader unavailable; using static background.", error);
        renderer = null;
        setWebglReady(false);
      }
    };
    startRenderer();

    const resize = () => renderer?.resize(scene.clientWidth, scene.clientHeight);
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
    const tick = (now: number) => {
      const dt = Math.min(48, now - (lastTick || now));
      lastTick = now;
      if (!expandedRef.current) {
        const camera = cameraRef.current;
        const ease = reduced ? 1 : 1 - Math.exp(-dt * 0.012);
        camera.x += (camera.targetX - camera.x) * ease;
        camera.y += (camera.targetY - camera.y) * ease;
        camera.zoom += (camera.targetZoom - camera.zoom) * ease;
        camera.pulse *= reduced ? 0 : Math.exp(-dt * 0.0045);
        if (!reduced && !document.hidden) seaTime += dt / 1000;

        world.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`;
        const cameraMoving =
          Math.abs(camera.x - camera.targetX) > 0.02 ||
          Math.abs(camera.y - camera.targetY) > 0.02 ||
          Math.abs(camera.zoom - camera.targetZoom) > 0.001 ||
          camera.pulse > 0.003;
        if (renderer && !document.hidden && now - lastDraw >= 33 &&
            (!reduced || cameraMoving || lastDraw === 0)) {
          renderer.render({ x: camera.x, y: camera.y, zoom: camera.zoom, pulse: camera.pulse, time: seaTime });
          lastDraw = now;
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);

    const onWheel = (event: WheelEvent) => {
      if (expandedRef.current) return;
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scene.clientHeight : 1);
      zoomBy(Math.exp(-clamp(pixels, -90, 90) * 0.00115), event.clientX, event.clientY);
    };
    scene.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(animationFrame);
      scene.removeEventListener("wheel", onWheel);
      observer.disconnect();
      reducedQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      renderer?.dispose();
    };
  }, [zoomBy]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (expandedRef.current || (event.target as HTMLElement).closest("button, a, .sea-card")) return;
    if (event.button !== 0 && event.pointerType !== "touch") return;
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (expandedRef.current) return;
    const pointer = pointerRef.current;
    if (pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    const camera = cameraRef.current;
    camera.x += dx;
    camera.y += dy;
    camera.targetX += dx;
    camera.targetY += dy;
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
    closingRef.current?.cancel();
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
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
      if (event.key === "Escape") closePage();
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
        aria-label="可拖动和缩放的抖动海面"
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
              onClick={(event) => {
                if (!(event.target as HTMLElement).closest("a") && !window.getSelection()?.toString()) openCard();
              }}
            >
              <div className="sea-card-top"><span>CONTACT / 名片</span><span>REEF</span></div>
              <strong>REEF.</strong>
              <ContactDetails />
              <button ref={cardOpenButtonRef} className="sea-card-action" type="button">
                展开名片<span aria-hidden="true">↗</span>
              </button>
            </article>
          </div>
        </div>
      </div>

      <button className="brand" type="button" aria-label="ReeF，归位海面" onClick={() => { if (expanded) closePage(); resetView(); }}>ReeF</button>

      {expanded && (
        <div className="reader-layer">
          <div ref={backdropRef} className="reader-backdrop" onClick={closePage} aria-hidden="true" />
          <div ref={readerMotionRef} className="reader-motion">
            <section ref={readerRef} className="reader-panel" tabIndex={-1} aria-label="联系方式">
              <div className="reader-topline">
                <span>CONTACT / 名片</span>
                <button type="button" onClick={closePage} aria-label="放回海面">× <span>放回</span></button>
              </div>
              <article className="reading-article contact-article">
                <span className="reading-kicker">REEF / CONTACT</span>
                <h1>REEF.</h1>
                <ContactDetails />
              </article>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
