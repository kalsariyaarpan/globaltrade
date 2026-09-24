import { useEffect, useRef, useState } from 'react';
import { subscribeFrame, getRect } from '../lib/scroll';
import { scrollToId } from '../lib/smooth';

type Theme = 'transparent' | 'dark' | 'light' | 'glass';

const THEMES: Record<Theme, { fg: string; bg: string; border: string; sub: string; btnBg: string; btnFg: string }> = {
  transparent: {
    fg: '#ffffff',
    bg: 'rgba(4,6,15,0)',
    border: 'rgba(255,255,255,0)',
    sub: 'rgba(255,255,255,0.58)',
    btnBg: 'rgba(255,255,255,0.10)',
    btnFg: '#ffffff',
  },
  dark: {
    fg: '#ffffff',
    bg: 'rgba(5,9,22,0.72)',
    border: 'rgba(255,255,255,0.10)',
    sub: 'rgba(255,255,255,0.55)',
    btnBg: 'rgba(37,73,245,0.9)',
    btnFg: '#ffffff',
  },
  glass: {
    fg: '#eaf0ff',
    bg: 'rgba(10,18,45,0.42)',
    border: 'rgba(140,170,255,0.20)',
    sub: 'rgba(200,215,255,0.6)',
    btnBg: 'rgba(63,214,232,0.18)',
    btnFg: '#dffaff',
  },
  light: {
    fg: '#070c1c',
    bg: 'rgba(246,247,251,0.82)',
    border: 'rgba(9,16,40,0.10)',
    sub: 'rgba(9,16,40,0.52)',
    btnBg: '#0b1430',
    btnFg: '#ffffff',
  },
};

const LINKS = [
  { id: 'journey', label: 'Journey' },
  { id: 'network', label: 'Network' },
  { id: 'flow', label: 'Import / Export' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'cargo', label: 'Cargo' },
];

export default function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const sceneLabel = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('transparent');

  useEffect(() => {
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>('[data-nav-theme]'));
    let cache = sections();
    let count = 0;
    return subscribeFrame((f) => {
      if (count++ % 30 === 0) cache = sections();
      const probe = f.y + 56;
      let active: HTMLElement | null = null;
      for (const s of cache) {
        const r = getRect(s);
        if (probe >= r.top && probe < r.top + r.height) active = s;
      }
      const t = ((active?.dataset.navTheme as Theme) || 'transparent') as Theme;
      setTheme((old) => (old !== t ? t : old));
      const name = active?.dataset.sceneName || 'Origin';
      if (sceneLabel.current && sceneLabel.current.textContent !== name) sceneLabel.current.textContent = name;
      const doc = document.documentElement.scrollHeight - f.vh;
      if (progress.current) progress.current.style.transform = `scaleX(${Math.min(1, f.y / (doc || 1))})`;
      if (bar.current) bar.current.style.setProperty('--shift', String(Math.min(1, f.y / 400)));
    });
  }, []);

  const t = THEMES[theme];

  return (
    <>
      <div
        ref={bar}
        className="fixed top-0 left-0 right-0 z-[200] u-glass"
        style={{
          background: t.bg,
          borderBottom: `1px solid ${t.border}`,
          color: t.fg,
          transition: 'background 600ms cubic-bezier(.22,.8,.3,1), color 600ms ease, border-color 600ms ease',
        }}
      >
        <div className="mx-auto flex h-[64px] max-w-[1480px] items-center justify-between px-5 md:px-9">
          {/* logo */}
          <button
            data-cursor="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-3"
            aria-label="Meridian Tradeworks — top"
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <svg viewBox="0 0 32 32" className="h-8 w-8">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeOpacity="0.3" />
                <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" />
                <path d="M2 16 H30" stroke="currentColor" strokeOpacity="0.25" />
                <path
                  d="M6 20 Q16 4 26 12"
                  fill="none"
                  stroke="#2549f5"
                  strokeWidth="1.8"
                  className="origin-center transition-transform duration-700 group-hover:rotate-[14deg]"
                />
                <circle cx="26" cy="12" r="2.4" fill="#3fd6e8" />
              </svg>
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-[15px] font-semibold tracking-[0.16em]">MERIDIAN</span>
              <span className="u-label mt-1" style={{ color: t.sub }}>
                Tradeworks
              </span>
            </span>
          </button>

          {/* links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <button
                key={l.id}
                data-cursor="button"
                onClick={() => scrollToId(l.id)}
                className="group relative px-4 py-2 text-[13px] font-medium tracking-wide"
              >
                <span className="relative z-10 opacity-80 transition-opacity group-hover:opacity-100">{l.label}</span>
                <span
                  className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: 'currentColor', opacity: 0.6 }}
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="u-label hidden xl:block" style={{ color: t.sub }}>
              SCENE / <span ref={sceneLabel}>Origin</span>
            </span>
            <button
              data-cursor="button"
              onClick={() => scrollToId('contact')}
              className="hidden items-center gap-2 rounded-full px-5 py-2.5 text-[12.5px] font-medium tracking-wide transition-transform duration-300 hover:scale-[1.03] md:flex"
              style={{ background: t.btnBg, color: t.btnFg, transition: 'background 600ms ease, color 600ms ease' }}
            >
              Start a Conversation
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center lg:hidden"
              aria-label="Menu"
            >
              <span className="relative block h-3 w-5">
                <span
                  className="absolute left-0 block h-px w-5 transition-transform duration-300"
                  style={{ background: 'currentColor', top: open ? 6 : 0, transform: open ? 'rotate(45deg)' : 'none' }}
                />
                <span
                  className="absolute left-0 block h-px w-5 transition-transform duration-300"
                  style={{ background: 'currentColor', top: open ? 6 : 12, transform: open ? 'rotate(-45deg)' : 'none' }}
                />
              </span>
            </button>
          </div>
        </div>
        <div className="h-px w-full overflow-hidden" style={{ background: 'transparent' }}>
          <div
            ref={progress}
            className="h-px w-full origin-left"
            style={{ background: 'linear-gradient(90deg,#2549f5,#7b5cff,#3fd6e8)', transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      {/* mobile sheet */}
      <div
        className="fixed inset-0 z-[199] lg:hidden"
        style={{
          pointerEvents: open ? 'auto' : 'none',
          background: 'rgba(4,6,15,0.92)',
          backdropFilter: 'blur(20px)',
          opacity: open ? 1 : 0,
          transition: 'opacity 420ms ease',
        }}
      >
        <div className="flex h-full flex-col justify-center gap-2 px-8">
          {[...LINKS, { id: 'contact', label: 'Contact' }].map((l, i) => (
            <button
              key={l.id}
              onClick={() => {
                setOpen(false);
                setTimeout(() => scrollToId(l.id), 260);
              }}
              className="border-b border-white/10 py-5 text-left font-display text-3xl font-light text-white"
              style={{
                transform: open ? 'translateY(0)' : 'translateY(24px)',
                opacity: open ? 1 : 0,
                transition: `all 520ms cubic-bezier(.22,.8,.3,1) ${i * 60}ms`,
              }}
            >
              <span className="u-label mr-4 text-white/35">0{i + 1}</span>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
