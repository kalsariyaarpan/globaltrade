import { useEffect, useRef } from 'react';

type Mode = 'default' | 'button' | 'map' | 'cargo' | 'drag' | 'toggle';

const CONFIG: Record<Mode, { size: number; label: string; fill: string; border: string; dot: number }> = {
  default: { size: 14, label: '', fill: 'rgba(255,255,255,0.0)', border: 'rgba(255,255,255,0.55)', dot: 5 },
  button: { size: 62, label: '', fill: 'rgba(37,73,245,0.16)', border: 'rgba(120,150,255,0.8)', dot: 0 },
  map: { size: 54, label: 'PORT', fill: 'rgba(63,214,232,0.10)', border: 'rgba(63,214,232,0.8)', dot: 3 },
  cargo: { size: 74, label: 'CARGO', fill: 'rgba(123,92,255,0.14)', border: 'rgba(160,140,255,0.8)', dot: 0 },
  drag: { size: 80, label: 'DRAG', fill: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.7)', dot: 0 },
  toggle: { size: 66, label: 'SWITCH', fill: 'rgba(37,73,245,0.18)', border: 'rgba(120,150,255,0.85)', dot: 0 },
};

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return;
    document.body.classList.add('custom-cursor');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let size = 14;
    let targetSize = 14;
    let down = 0;
    let mode: Mode = 'default';

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const el = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
      const next = ((el?.dataset.cursor as Mode) || 'default') as Mode;
      if (next !== mode) {
        mode = next;
        const c = CONFIG[mode] || CONFIG.default;
        targetSize = c.size;
        if (ring.current) {
          ring.current.style.background = c.fill;
          ring.current.style.borderColor = c.border;
        }
        if (label.current) {
          label.current.textContent = c.label;
          label.current.style.opacity = c.label ? '1' : '0';
        }
        if (dot.current) dot.current.style.opacity = c.dot ? '1' : '0';
      }
    };
    const onDown = () => (down = 1);
    const onUp = () => (down = 0);
    const onLeave = () => {
      if (ring.current) ring.current.style.opacity = '0';
      if (dot.current) dot.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (ring.current) ring.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      const ts = targetSize * (down ? 0.82 : 1);
      size += (ts - size) * 0.2;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx - size / 2}px, ${ry - size / 2}px, 0)`;
        ring.current.style.width = `${size}px`;
        ring.current.style.height = `${size}px`;
      }
      if (dot.current) dot.current.style.transform = `translate3d(${mx - 2.5}px, ${my - 2.5}px, 0)`;
      if (label.current) label.current.style.transform = `translate3d(${rx + size / 2 + 6}px, ${ry - 6}px, 0)`;
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <div id="cursor-root" aria-hidden>
      <div
        ref={ring}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 14,
          height: 14,
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.55)',
          backdropFilter: 'invert(6%) blur(0.5px)',
          transition: 'background 260ms ease, border-color 260ms ease, opacity 200ms ease',
        }}
      />
      <div
        ref={dot}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 5,
          height: 5,
          borderRadius: '999px',
          background: '#ffffff',
        }}
      />
      <div
        ref={label}
        className="u-label"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          color: '#fff',
          opacity: 0,
          transition: 'opacity 200ms ease',
          textShadow: '0 1px 8px rgba(0,0,0,0.6)',
        }}
      />
    </div>
  );
}
