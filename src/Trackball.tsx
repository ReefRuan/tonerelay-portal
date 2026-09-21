import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Direction } from "./navigation";

type TrackballProps = {
  onNavigate: (direction: Direction) => void;
  detailOpen: boolean;
};

const directionFromOffset = (x: number, y: number): Direction => {
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? "right" : "left";
  return y > 0 ? "down" : "up";
};

export function Trackball({ onNavigate, detailOpen }: TrackballProps) {
  const [held, setHeld] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointer = useRef({ id: -1, x: 0, y: 0 });
  const repeating = useRef<number | null>(null);
  const lastDirection = useRef<Direction | null>(null);

  const stopRepeating = () => {
    if (repeating.current !== null) window.clearInterval(repeating.current);
    repeating.current = null;
    lastDirection.current = null;
  };

  useEffect(() => stopRepeating, []);

  const startRepeating = (direction: Direction) => {
    if (lastDirection.current === direction) return;
    stopRepeating();
    lastDirection.current = direction;
    onNavigate(direction);
    repeating.current = window.setInterval(() => onNavigate(direction), 430);
  };

  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointer.current.id !== event.pointerId) return;
    pointer.current.id = -1;
    stopRepeating();
    setHeld(false);
    setOffset({ x: 0, y: 0 });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className={`trackball ${held ? "is-held" : ""}`}>
      <span className="trackball-north">{detailOpen ? "VIEW" : "N"}</span>
      <button
        className="trackball-socket"
        aria-label={
          detailOpen
            ? "轨迹球：左右切换预设，上下滚动详情"
            : "轨迹球：向任意方向拨动以选择预设"
        }
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          setHeld(true);
        }}
        onPointerMove={(event) => {
          if (pointer.current.id !== event.pointerId) return;
          const dx = event.clientX - pointer.current.x;
          const dy = event.clientY - pointer.current.y;
          const length = Math.hypot(dx, dy);
          const scale = length > 20 ? 20 / length : 1;
          const next = { x: dx * scale, y: dy * scale };
          setOffset(next);
          if (length > 11) startRepeating(directionFromOffset(dx, dy));
          else stopRepeating();
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={finish}
        onKeyDown={(event) => {
          const keyMap: Partial<Record<string, Direction>> = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowUp: "up",
            ArrowDown: "down",
          };
          const direction = keyMap[event.key];
          if (!direction) return;
          event.preventDefault();
          event.stopPropagation();
          onNavigate(direction);
        }}
      >
        <span className="trackball-ring" />
        <span
          className="trackball-sphere"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        >
          <i />
          <i />
          <i />
          <b />
        </span>
      </button>
      <span className="trackball-caption">{held ? "SELECTING" : "TRACKBALL"}</span>
    </div>
  );
}
