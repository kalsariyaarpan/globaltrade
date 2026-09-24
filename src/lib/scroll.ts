import { useEffect, useRef, useState } from 'react';

/* ---------------- math utils ---------------- */
export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a || 1));
export const smoothstep = (t: number) => t * t * (3 - 2 * t);
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** progress of v inside a [a,b] window, smoothed */
export const seg = (v: number, a: number, b: number) => smoothstep(inv(a, b, v));

/** keyframe track: track(p, [[0,0],[0.4,120],[1,300]]) */
export function track(p: number, keys: [number, number][], smooth = true) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      const t = inv(t0, t1, p);
      return lerp(v0, v1, smooth ? smoothstep(t) : t);
    }
  }
  return keys[keys.length - 1][1];
}

/* ---------------- frame engine ---------------- */
export type Frame = { y: number; vh: number; vw: number; t: number; dt: number };
type Sub = (f: Frame) => void;

const subs = new Set<Sub>();
let running = false;
let last = 0;
export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

export function subscribeFrame(fn: Sub) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function startEngine(onRaf?: (t: number) => void) {
  if (running) return () => {};
  running = true;
  let raf = 0;
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    onRaf?.(t);
    const dt = Math.min(64, t - last || 16);
    last = t;
    const f: Frame = {
      y: window.scrollY || window.pageYOffset,
      vh: window.innerHeight,
      vw: window.innerWidth,
      t: reducedMotion ? 0 : t / 1000,
      dt: dt / 1000,
    };
    subs.forEach((s) => {
      try {
        s(f);
      } catch {
        /* keep the loop alive */
      }
    });
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    running = false;
  };
}

/* ---------------- measurement cache ---------------- */
type Rect = { top: number; height: number };
const measures = new Map<Element, Rect>();
let measureTick = 0;

function measure(el: Element): Rect {
  const r = el.getBoundingClientRect();
  const m = { top: r.top + window.scrollY, height: r.height };
  measures.set(el, m);
  return m;
}
export function getRect(el: Element): Rect {
  return measures.get(el) || measure(el);
}
export function remeasureAll() {
  measureTick++;
  measures.forEach((_, el) => measure(el));
}
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => remeasureAll());
  window.addEventListener('load', () => remeasureAll());
  setInterval(() => remeasureAll(), 1500);
}

/* ---------------- scene hooks ---------------- */
export type SceneMode = 'pin' | 'through' | 'enter';

/**
 * Subscribes an element to scroll progress.
 * pin     -> 0 when section top hits viewport top, 1 when its bottom - vh is reached
 * through -> 0 when section top enters bottom of viewport, 1 when bottom leaves top
 * enter   -> 0 when top enters bottom of viewport, 1 when top reaches 25% of viewport
 */
export function useScene<T extends HTMLElement>(
  mode: SceneMode,
  cb: (p: number, f: Frame) => void,
  deps: unknown[] = []
) {
  const ref = useRef<T | null>(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure(el);
    let lastTick = measureTick;
    return subscribeFrame((f) => {
      if (lastTick !== measureTick) {
        lastTick = measureTick;
      }
      const { top, height } = getRect(el);
      let p = 0;
      if (mode === 'pin') p = inv(top, top + Math.max(1, height - f.vh), f.y);
      else if (mode === 'through') p = inv(top - f.vh, top + height, f.y);
      else p = inv(top - f.vh * 0.92, top - f.vh * 0.25, f.y);
      cbRef.current(p, f);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** React-state version, throttled to integer steps to avoid re-render storms */
export function useSceneState<T extends HTMLElement>(mode: SceneMode, steps = 60) {
  const [p, setP] = useState(0);
  const ref = useScene<T>(mode, (v) => {
    const q = Math.round(v * steps) / steps;
    setP((old) => (old !== q ? q : old));
  });
  return [ref, p] as const;
}

/* ---------------- dom helpers (GPU friendly) ---------------- */
export const setT = (el: Element | null, transform: string, opacity?: number) => {
  if (!el) return;
  const s = (el as HTMLElement).style;
  s.transform = transform;
  if (opacity !== undefined) s.opacity = String(opacity);
};
export const setVar = (el: Element | null, name: string, value: string | number) => {
  if (!el) return;
  (el as HTMLElement).style.setProperty(name, String(value));
};
export const setOp = (el: Element | null, o: number) => {
  if (el) (el as HTMLElement).style.opacity = String(o);
};

/** number formatting for animated counters */
export function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ---------------- spring value (for cursor / magnetic) ---------------- */
export class Spring {
  v = 0;
  target = 0;
  constructor(public k = 0.12) {}
  step(dtScale = 1) {
    this.v += (this.target - this.v) * Math.min(1, this.k * dtScale);
    return this.v;
  }
}
