"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
  SIDEBAR_WIDTH_VAR,
  clampSidebarWidth,
} from "./sidebar-width";

const KEYBOARD_STEP = 10;

const listeners = new Set<() => void>();
let currentWidth = SIDEBAR_DEFAULT_WIDTH;

function applyWidth(width: number) {
  currentWidth = clampSidebarWidth(width);
  document.documentElement.style.setProperty(SIDEBAR_WIDTH_VAR, `${currentWidth}px`);
  listeners.forEach((listener) => listener());
}

function saveWidth() {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(currentWidth));
  } catch {}
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export default function SidebarResizer() {
  const width = useSyncExternalStore(subscribe, () => currentWidth, () => SIDEBAR_DEFAULT_WIDTH);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY) ?? "", 10);
      if (!Number.isNaN(saved)) applyWidth(saved);
    } catch {}
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: currentWidth };
    document.documentElement.dataset.sidebarResizing = "";
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    applyWidth(drag.current.startWidth + event.clientX - drag.current.startX);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    delete document.documentElement.dataset.sidebarResizing;
    saveWidth();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next: Record<string, number> = {
      ArrowLeft: width - KEYBOARD_STEP,
      ArrowRight: width + KEYBOARD_STEP,
      Home: SIDEBAR_MIN_WIDTH,
      End: SIDEBAR_MAX_WIDTH,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    applyWidth(next[event.key]);
    saveWidth();
  }

  function handleReset() {
    applyWidth(SIDEBAR_DEFAULT_WIDTH);
    saveWidth();
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuemin={SIDEBAR_MIN_WIDTH}
      aria-valuemax={SIDEBAR_MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={handleReset}
      onKeyDown={handleKeyDown}
      className="group absolute inset-y-0 -right-1 z-10 w-2 cursor-col-resize touch-none outline-none select-none"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-[background-color] duration-150 ease-power3-out group-hover:bg-line-strong group-focus-visible:bg-subtle group-active:bg-subtle"
      />
    </div>
  );
}
