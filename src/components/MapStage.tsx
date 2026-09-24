import { useEffect, useRef } from 'react';
import { landDots } from '../lib/geo';

export const MW = 1000;
export const MH = 387;

let cachedDots: { x: number; y: number }[] | null = null;
function dots() {
  if (!cachedDots) cachedDots = landDots(2.0).map((d) => ({ x: d.x, y: d.y }));
  return cachedDots;
}

/** Canvas dot-matrix world map. Draws once per resize — zero per-frame cost. */
export function DotMap({
  className = '',
  color = '#8ba3e8',
  accent = '#2549f5',
  dotSize = 1.25,
  opacity = 0.5,
}: {
  className?: string;
  color?: string;
  accent?: string;
  dotSize?: number;
  opacity?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const draw = () => {
      const parent = cv.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pts = dots();
      const r = dotSize * Math.max(0.75, Math.min(1.7, w / 1000));
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const x = p.x * w;
        const y = p.y * h;
        // subtle latitude-based fade + occasional accent dot
        const isAccent = (i * 37) % 53 === 0;
        ctx.fillStyle = isAccent ? accent : color;
        ctx.globalAlpha = isAccent ? 0.9 : 0.42 + 0.5 * (1 - Math.abs(p.y - 0.45) * 1.4);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();
    const ro = new ResizeObserver(() => draw());
    if (cv.parentElement) ro.observe(cv.parentElement);
    return () => ro.disconnect();
  }, [color, accent, dotSize]);

  return <canvas ref={ref} className={className} style={{ opacity }} aria-hidden />;
}

/** Wrapper keeping the exact equirectangular aspect so SVG overlays line up with the dots. */
export function MapStage({
  className = '',
  style,
  children,
  dotProps,
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  dotProps?: React.ComponentProps<typeof DotMap>;
}) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${MW} / ${MH}`, ...style }}>
      <DotMap className="absolute inset-0 h-full w-full" {...dotProps} />
      <svg
        viewBox={`0 0 ${MW} ${MH}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
        aria-hidden
      >
        {children}
      </svg>
    </div>
  );
}
