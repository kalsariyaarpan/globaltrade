import { useRef } from 'react';
import { useScene, seg, lerp, setT } from '../lib/scroll';
import { Eyebrow } from './ui';

const CARGO = [
  {
    key: 'Textiles & Apparel',
    code: 'HS 61–63',
    body: 'Cotton, knitwear and home textiles consolidated from Tiruppur, Surat and Ludhiana.',
    vol: '1,240 TEU / yr',
    tint: '#2549f5',
  },
  {
    key: 'Pharma & Life Science',
    code: 'HS 30',
    body: 'Temperature-controlled, GDP-compliant lanes with validated cold chain and serialisation.',
    vol: '410 TEU / yr',
    tint: '#7b5cff',
  },
  {
    key: 'Agri Commodities',
    code: 'HS 07–12',
    body: 'Rice, spices, pulses and oilseeds with fumigation, phytosanitary and lab certification.',
    vol: '2,050 TEU / yr',
    tint: '#3fd6e8',
  },
  {
    key: 'Auto Components',
    code: 'HS 87',
    body: 'Just-in-sequence parts programmes for OEM and aftermarket buyers in the EU and US.',
    vol: '860 TEU / yr',
    tint: '#4f6dff',
  },
  {
    key: 'Industrial Machinery',
    code: 'HS 84',
    body: 'Break-bulk, flat-rack and out-of-gauge handling with lift plans and marine survey.',
    vol: '320 units / yr',
    tint: '#2549f5',
  },
  {
    key: 'Specialty Chemicals',
    code: 'HS 28–29',
    body: 'IMDG-classified dangerous goods with full packing, placarding and DG declarations.',
    vol: '690 TEU / yr',
    tint: '#7b5cff',
  },
];

export default function Cargo() {
  const track = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const runner = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const metrics = useRef<{ vw: number; travel: number; cards: number[] }>({ vw: 0, travel: 0, cards: [] });

  const sectionRef = useScene<HTMLElement>('pin', (p, f) => {
    const intro = seg(p, 0, 0.08);
    setT(head.current, `translate3d(0,${lerp(24, 0, intro)}px,0)`, intro);

    const el = track.current;
    if (el) {
      /* geometry is only re-read when the viewport changes (no per-frame layout) */
      if (metrics.current.vw !== f.vw) {
        metrics.current = {
          vw: f.vw,
          travel: Math.max(0, el.scrollWidth - f.vw + (f.vw > 768 ? 72 : 40)),
          cards: cards.current.map((c) => (c ? c.offsetLeft + c.offsetWidth / 2 : 0)),
        };
      }
      const m = metrics.current;
      const x = -seg(p, 0.06, 0.98) * m.travel;
      el.style.transform = `translate3d(${x}px,0,0)`;
      cards.current.forEach((c, i) => {
        if (!c) return;
        const center = m.cards[i] + x;
        const d = (center - f.vw / 2) / f.vw;
        c.style.setProperty('--d', String(d));
        c.style.transform = `translate3d(0, ${Math.abs(d) * 26}px, 0) scale(${1 - Math.abs(d) * 0.05})`;
        c.style.opacity = String(Math.max(0.25, 1 - Math.abs(d) * 0.9));
        const art = c.querySelector<HTMLElement>('[data-art]');
        if (art) art.style.transform = `translate3d(${-d * 34}px,0,0) scale(1.08)`;
        void i;
      });
    }
    if (rail.current) rail.current.style.transform = `scaleX(${seg(p, 0.06, 0.98)})`;
    if (runner.current)
      runner.current.style.transform = `translate3d(calc(${seg(p, 0.06, 0.98) * 100}vw - ${seg(p, 0.06, 0.98) * 120}px), 0, 0) scaleX(1)`;
  });

  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget.querySelector<HTMLElement>('[data-tilt]');
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateZ(18px)`;
  };
  const offTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget.querySelector<HTMLElement>('[data-tilt]');
    if (el) el.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateZ(0)';
  };

  return (
    <section
      ref={sectionRef as never}
      id="cargo"
      data-nav-theme="dark"
      data-scene-name="Cargo"
      className="relative h-[330vh] bg-[#05070f] md:h-[420vh]"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_10%_10%,#141f4d_0%,#05070f_55%)]" />
        <div className="u-grid-lines absolute inset-0 opacity-25" />

        <div ref={head} className="relative mx-auto w-full max-w-[1480px] px-5 md:px-9" style={{ opacity: 0 }}>
          <Eyebrow index="08">What we move</Eyebrow>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-[620px] font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-light leading-[1.03] tracking-[-0.03em] text-white">
              We don’t just move products.
              <span className="text-white/45"> We move businesses.</span>
            </h2>
            <span className="u-label text-white/35">Scroll → cargo advances</span>
          </div>
        </div>

        {/* horizontal cargo track */}
        <div className="relative mt-10 w-full">
          <div
            ref={track}
            className="flex w-max gap-5 px-5 will-change-transform md:gap-7 md:px-9"
            style={{ transform: 'translate3d(0,0,0)' }}
          >
            {CARGO.map((c, i) => (
              <div
                key={c.key}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                data-cursor="cargo"
                onMouseMove={onTilt}
                onMouseLeave={offTilt}
                className="group relative h-[min(56vh,470px)] w-[78vw] shrink-0 will-change-transform sm:w-[58vw] lg:w-[30vw]"
              >
                <div
                  data-tilt
                  className="relative h-full w-full overflow-hidden rounded-[4px] border border-white/10 bg-[#070c1e]/70 u-glass transition-transform duration-500 will-change-transform"
                >
                  <div data-art className="absolute inset-0 opacity-70 transition-transform duration-500">
                    <CargoArt index={i} tint={c.tint} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-[#04060f]/60 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-center justify-between">
                      <span className="u-label text-white/45">{String(i + 1).padStart(2, '0')}</span>
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-[10px]"
                        style={{ background: `${c.tint}22`, color: c.tint }}
                      >
                        {c.code}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-[clamp(1.2rem,2.2vw,1.7rem)] font-light leading-tight text-white">
                        {c.key}
                      </h3>
                      <p className="mt-2 max-w-[340px] text-[13px] leading-relaxed text-white/55">{c.body}</p>
                      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                        <span className="font-mono text-[11px] text-white/70">{c.vol}</span>
                        <span className="h-px flex-1 bg-white/10" />
                        <span
                          className="u-label transition-colors duration-300 group-hover:text-white"
                          style={{ color: c.tint }}
                        >
                          In transit
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                    style={{ background: c.tint }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* conveyor rail */}
          <div className="relative mx-5 mt-8 md:mx-9">
            <div className="h-px w-full bg-white/10" />
            <div
              ref={rail}
              className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-[#2549f5] via-[#7b5cff] to-[#3fd6e8]"
              style={{ transform: 'scaleX(0)' }}
            />
            <div ref={runner} className="absolute -top-[9px] left-0 will-change-transform">
              <svg viewBox="0 0 120 20" className="h-5 w-[120px]">
                <rect x="0" y="4" width="118" height="13" rx="2" fill="#2549f5" />
                <rect x="0" y="4" width="118" height="3" fill="#fff" opacity="0.22" />
                <text x="8" y="14" fontSize="6" fontFamily="monospace" fill="#fff" opacity="0.8" letterSpacing="1.5">
                  MTWU 447192
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CargoArt({ index, tint }: { index: number; tint: string }) {
  const common = 'h-full w-full';
  if (index === 0)
    return (
      <svg viewBox="0 0 400 500" className={common} preserveAspectRatio="xMidYMid slice" fill="none">
        {Array.from({ length: 22 }).map((_, i) => (
          <path
            key={i}
            d={`M${-40 + i * 22} 0 C ${20 + i * 22} 160, ${-20 + i * 22} 320, ${40 + i * 22} 500`}
            stroke={tint}
            strokeOpacity={0.18 + (i % 3) * 0.08}
            strokeWidth="1.2"
          />
        ))}
      </svg>
    );
  if (index === 1)
    return (
      <svg viewBox="0 0 400 500" className={common} preserveAspectRatio="xMidYMid slice" fill="none">
        {Array.from({ length: 7 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => (
            <g key={`${r}-${c}`} opacity={0.25 + ((r + c) % 3) * 0.12}>
              <rect x={24 + c * 62} y={20 + r * 68} width="34" height="34" rx="17" stroke={tint} />
              <path d={`M${30 + c * 62} ${37 + r * 68} h22`} stroke={tint} strokeOpacity="0.6" />
            </g>
          ))
        )}
      </svg>
    );
  if (index === 2)
    return (
      <svg viewBox="0 0 400 500" className={common} preserveAspectRatio="xMidYMid slice" fill="none">
        {Array.from({ length: 160 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 97) % 400}
            cy={(i * 53) % 500}
            r={1.4 + ((i * 7) % 4)}
            fill={tint}
            opacity={0.12 + ((i % 5) * 0.1)}
          />
        ))}
      </svg>
    );
  if (index === 3)
    return (
      <svg viewBox="0 0 400 500" className={common} preserveAspectRatio="xMidYMid slice" fill="none">
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i} opacity={0.3 - i * 0.04}>
            <circle cx="200" cy="250" r={40 + i * 46} stroke={tint} />
            <circle cx="200" cy="250" r={40 + i * 46} stroke={tint} strokeDasharray="4 22" strokeOpacity="0.8" />
          </g>
        ))}
        <circle cx="200" cy="250" r="18" fill={tint} opacity="0.35" />
      </svg>
    );
  if (index === 4)
    return (
      <svg viewBox="0 0 400 500" className={common} preserveAspectRatio="xMidYMid slice" fill="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <rect
            key={i}
            x={20 + (i % 3) * 126}
            y={30 + Math.floor(i / 3) * 152}
            width="108"
            height="120"
            stroke={tint}
            strokeOpacity={0.2 + (i % 4) * 0.08}
            rx="2"
          />
        ))}
        <path d="M0 250 H400 M200 0 V500" stroke={tint} strokeOpacity="0.15" />
      </svg>
    );
  return (
    <svg viewBox="0 0 400 500" className={common} preserveAspectRatio="xMidYMid slice" fill="none">
      {Array.from({ length: 12 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${20 + i * 42} Q 100 ${-20 + i * 42}, 200 ${20 + i * 42} T 400 ${20 + i * 42}`}
          stroke={tint}
          strokeOpacity={0.16 + (i % 4) * 0.07}
          strokeWidth="1.4"
        />
      ))}
    </svg>
  );
}
