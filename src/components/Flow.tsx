import { useEffect, useRef, useState } from 'react';
import { useScene, seg, lerp, setT, subscribeFrame, fmt, clamp } from '../lib/scroll';
import { Eyebrow } from './ui';

type Mode = 'import' | 'export';

const NODES = {
  market: { label: 'Global Market', sub: 'Suppliers & buyers abroad' },
  ship: { label: 'Ocean Freight', sub: 'Carrier space & transit' },
  port: { label: 'Port & Customs', sub: 'Clearance, duty, release' },
  warehouse: { label: 'Warehouse', sub: 'Storage & distribution' },
  business: { label: 'Your Business', sub: 'Factory, retail, project site' },
} as const;

type NodeKey = keyof typeof NODES;

const ORDER: Record<Mode, NodeKey[]> = {
  import: ['market', 'ship', 'port', 'warehouse', 'business'],
  export: ['business', 'warehouse', 'port', 'ship', 'market'],
};

const COPY: Record<Mode, { title: string; body: string; stats: [string, number, string][] }> = {
  import: {
    title: 'Bring the world to your door.',
    body: 'We source, verify, clear and deliver — landing international goods into your warehouse with duty, documentation and timing handled end to end.',
    stats: [
      ['Import shipments / yr', 2140, ''],
      ['Avg. customs clearance', 9, ' hrs'],
      ['Landed-cost accuracy', 99, '%'],
    ],
  },
  export: {
    title: 'Take your product global.',
    body: 'We package, certify, book and ship your goods outward — matching buyers, meeting destination compliance and protecting your margin at every leg.',
    stats: [
      ['Export shipments / yr', 1890, ''],
      ['Destination markets', 25, '+'],
      ['Documentation accuracy', 100, '%'],
    ],
  },
};

const ICONS: Record<NodeKey, React.ReactNode> = {
  market: (
    <>
      <circle cx="18" cy="18" r="12" />
      <path d="M6 18h24M18 6c4 4 4 20 0 24M18 6c-4 4-4 20 0 24" />
    </>
  ),
  ship: (
    <>
      <path d="M5 24h26l-3 6H8z" />
      <path d="M10 24V14h10l6 10" />
      <path d="M14 14V9h5v5" />
    </>
  ),
  port: (
    <>
      <path d="M7 30V10M7 10h20l-4 8" />
      <path d="M7 30h22" />
      <rect x="18" y="20" width="10" height="7" />
    </>
  ),
  warehouse: (
    <>
      <path d="M5 30V15l13-7 13 7v15z" />
      <path d="M13 30v-9h10v9" />
    </>
  ),
  business: (
    <>
      <rect x="7" y="8" width="13" height="22" />
      <rect x="20" y="15" width="9" height="15" />
      <path d="M11 13h5M11 18h5M11 23h5M23 20h3M23 25h3" />
    </>
  ),
};

export default function Flow() {
  const [mode, setMode] = useState<Mode>('import');
  const stage = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const particles = useRef<(HTMLDivElement | null)[]>([]);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const railFill = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const assembled = useRef(0);

  /* direction easing + travelling cargo */
  useEffect(() => {
    const target = mode === 'import' ? 1 : -1;
    return subscribeFrame((f) => {
      dir.current += (target - dir.current) * 0.05;
      const d = dir.current;
      particles.current.forEach((el, i) => {
        if (!el) return;
        const base = (f.t * 0.11 + i * 0.16) % 1;
        const t = d >= 0 ? base : 1 - base;
        const x = t * 100;
        const fade = Math.sin(Math.min(1, Math.max(0, base)) * Math.PI);
        el.style.transform = `translate3d(${x}%, ${Math.sin(f.t * 2 + i) * 3}px, 0)`;
        el.style.opacity = String(0.25 + fade * 0.75 * assembled.current);
      });
      if (glowRef.current) {
        const g = (f.t * 0.16) % 1;
        glowRef.current.style.transform = `translate3d(${(d >= 0 ? g : 1 - g) * 100}%,0,0)`;
      }
    });
  }, [mode]);

  /* number tween on mode switch */
  useEffect(() => {
    const targets = COPY[mode].stats;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      targets.forEach(([, v, suffix], i) => {
        const el = statRefs.current[i];
        if (el) el.textContent = fmt(Math.round(v * e)) + suffix;
      });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const sectionRef = useScene<HTMLElement>('pin', (p, f) => {
    const a = seg(p, 0.05, 0.4);
    assembled.current = a;
    setT(stage.current, `translate3d(0, ${lerp(50, 0, a)}px, 0)`, a);
    if (railFill.current) railFill.current.style.transform = `scaleX(${a})`;
    ORDER[mode].forEach((k, i) => {
      const el = nodeRefs.current[k];
      if (!el) return;
      const local = clamp((a - i * 0.08) * 3);
      el.style.setProperty('--rise', String(local));
    });
    // gentle parallax on the whole rig
    const par = (p - 0.5) * f.vh * 0.08;
    if (stage.current) stage.current.style.setProperty('--par', `${par}px`);
  }, [mode]);

  const order = ORDER[mode];
  const accent = mode === 'import' ? '#3fd6e8' : '#7b5cff';

  return (
    <section
      ref={sectionRef as never}
      id="flow"
      data-nav-theme="dark"
      data-scene-name={mode === 'import' ? 'Import' : 'Export'}
      className="relative h-[220vh] md:h-[280vh]"
      style={{ background: '#05070f' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* mode-reactive atmosphere */}
        <div
          className="absolute inset-0 transition-all duration-[1200ms]"
          style={{
            background:
              mode === 'import'
                ? 'radial-gradient(110% 80% at 15% 20%, #0c2c46 0%, #060d1e 45%, #04060f 100%)'
                : 'radial-gradient(110% 80% at 85% 20%, #251a52 0%, #0a0f28 45%, #04060f 100%)',
          }}
        />
        <div className="u-grid-lines absolute inset-0 opacity-25" />

        <div className="relative mx-auto flex h-full max-w-[1480px] flex-col justify-center px-5 md:px-9">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[560px]">
              <Eyebrow index="05">Two directions, one system</Eyebrow>
              <div className="relative mt-5 h-[clamp(64px,9vw,120px)]">
                {(['import', 'export'] as Mode[]).map((m) => (
                  <h2
                    key={m}
                    className="absolute inset-0 font-display text-[clamp(1.9rem,4.4vw,3.4rem)] font-light leading-[1.05] tracking-[-0.03em] text-white transition-all duration-700"
                    style={{
                      opacity: mode === m ? 1 : 0,
                      transform: mode === m ? 'translateY(0)' : `translateY(${m === 'import' ? -26 : 26}px)`,
                      filter: mode === m ? 'blur(0)' : 'blur(6px)',
                    }}
                  >
                    {COPY[m].title}
                  </h2>
                ))}
              </div>
              <div className="relative mt-4 h-[96px] md:h-[76px]">
                {(['import', 'export'] as Mode[]).map((m) => (
                  <p
                    key={m}
                    className="absolute inset-0 max-w-[480px] text-[14.5px] leading-relaxed text-white/55 transition-all duration-700"
                    style={{
                      opacity: mode === m ? 1 : 0,
                      transform: mode === m ? 'translateY(0)' : 'translateY(14px)',
                    }}
                  >
                    {COPY[m].body}
                  </p>
                ))}
              </div>
            </div>

            {/* toggle */}
            <div
              data-cursor="toggle"
              className="relative flex rounded-full border border-white/12 bg-white/[0.04] p-1 u-glass"
            >
              <span
                className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-all duration-[750ms]"
                style={{
                  left: mode === 'import' ? '4px' : 'calc(50%)',
                  background: mode === 'import' ? 'rgba(63,214,232,0.16)' : 'rgba(123,92,255,0.2)',
                  boxShadow: `inset 0 0 0 1px ${accent}55, 0 8px 30px ${accent}22`,
                } as React.CSSProperties}
              />
              {(['import', 'export'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  data-cursor="toggle"
                  className="relative z-10 px-7 py-3 font-display text-[12.5px] tracking-[0.22em] uppercase transition-colors duration-500"
                  style={{ color: mode === m ? '#fff' : 'rgba(255,255,255,0.45)' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- the chain ---------------- */}
          <div ref={stage} className="relative mt-[6vh] will-change-transform" style={{ opacity: 0 }}>
            {/* rail */}
            <div className="relative h-[2px] w-full bg-white/10">
              <div
                ref={railFill}
                className="absolute inset-0 origin-left"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                  transform: 'scaleX(0)',
                  transition: 'background 900ms ease',
                }}
              />
              <div className="absolute inset-0 overflow-hidden">
                <div ref={glowRef} className="absolute inset-x-0 top-1/2 will-change-transform">
                  <div
                    className="h-[3px] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)`, opacity: 0.8 }}
                  />
                </div>
              </div>
              {/* travelling containers — wrappers span the rail so % = rail width */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  ref={(el) => {
                    particles.current[i] = el;
                  }}
                  className="pointer-events-none absolute inset-x-0 top-1/2 will-change-transform"
                >
                  <svg viewBox="0 0 32 16" className="h-4 w-8 -translate-x-1/2 -translate-y-1/2">
                    <rect
                      x="0.5"
                      y="2"
                      width="31"
                      height="12"
                      rx="1.5"
                      fill={i % 2 ? '#2549f5' : accent}
                      opacity="0.92"
                    />
                    <rect x="0.5" y="2" width="31" height="3" fill="#fff" opacity="0.2" />
                  </svg>
                </div>
              ))}
            </div>

            {/* nodes — keys stay mounted; only their slot index changes, so the
                whole chain physically re-orders when the direction flips */}
            <div className="relative mt-6 h-[188px] md:h-[196px]">
              {/* direction arrows */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={`arrow-${i}`}
                  className="absolute top-1/2 hidden md:block"
                  style={{
                    left: `${(i + 1) * 20}%`,
                    transform: `translate(-50%,-50%) rotate(${mode === 'import' ? 0 : 180}deg)`,
                    transition: 'transform 900ms cubic-bezier(.65,0,.35,1)',
                  }}
                >
                  <svg viewBox="0 0 16 10" className="h-2.5 w-4" fill="none" stroke={accent} strokeWidth="1.4">
                    <path d="M1 5h12M9 1.5 13.5 5 9 8.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ))}
              {(Object.keys(NODES) as NodeKey[]).map((k) => {
                const i = order.indexOf(k);
                return (
                  <div
                    key={k}
                    className="absolute left-0 top-0 h-full w-1/5 px-1 md:px-2"
                    style={{
                      transform: `translateX(${i * 100}%)`,
                      transition: 'transform 1000ms cubic-bezier(.65,0,.35,1)',
                    }}
                  >
                  <div
                    ref={(el) => {
                      nodeRefs.current[k] = el;
                    }}
                    data-cursor="cargo"
                    className="group relative flex h-full flex-col items-center justify-center gap-3 rounded-[3px] border border-white/10 bg-[#070c1e]/60 px-2 py-5 text-center u-glass md:px-4"
                    style={{
                      transform: 'translateY(calc((1 - var(--rise,0)) * 34px))',
                      opacity: 'var(--rise,0)' as unknown as number,
                      transition: 'border-color 600ms ease, background 600ms ease',
                    }}
                  >
                    <span
                      className="absolute -top-[9px] left-1/2 -translate-x-1/2 rounded-full px-2 py-[3px] font-mono text-[9px] tracking-widest"
                      style={{ background: accent, color: '#04060f' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <svg
                      viewBox="0 0 36 36"
                      className="h-7 w-7 transition-transform duration-700 group-hover:scale-110 md:h-10 md:w-10"
                      fill="none"
                      stroke={accent}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {ICONS[k]}
                    </svg>
                    <span className="text-[10.5px] font-medium leading-tight text-white md:text-[13.5px]">
                      {NODES[k].label}
                    </span>
                    <span className="hidden text-[11px] leading-snug text-white/40 md:block">{NODES[k].sub}</span>
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{ background: accent }}
                    />
                  </div>
                  </div>
                );
              })}
            </div>

            {/* stats */}
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[3px] border border-white/10 bg-white/5 sm:grid-cols-3">
              {COPY[mode].stats.map(([label], i) => (
                <div key={label} className="flex flex-col gap-2 bg-[#060b1a]/80 px-5 py-6">
                  <span
                    ref={(el) => {
                      statRefs.current[i] = el;
                    }}
                    className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light"
                    style={{ color: accent }}
                  >
                    0
                  </span>
                  <span className="u-label text-white/40">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="u-label text-white/30">
                {mode === 'import' ? 'Flow direction · inbound' : 'Flow direction · outbound'}
              </span>
              <span
                className="h-px flex-1"
                style={{ background: `linear-gradient(90deg, ${accent}55, transparent)` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
