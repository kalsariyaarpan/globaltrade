import { useRef } from 'react';
import { useScene, seg, lerp, setT, fmt } from '../lib/scroll';
import { arcPath, LL } from '../lib/geo';
import { Eyebrow } from './ui';

const ARCS: [LL, LL][] = [
  [[69.7, 22.8], [4.4, 51.9]],
  [[121.5, 31.2], [-118.2, 33.7]],
  [[55.1, 25], [31, -29.8]],
  [[-46.3, -24], [10, 53.5]],
  [[103.8, 1.3], [151.2, -33.8]],
];

const STATS = [
  { v: 25, suffix: '+', label: 'Countries served', sub: 'Across 6 continents' },
  { v: 120, suffix: '+', label: 'Trade routes', sub: 'Ocean, air & multimodal' },
  { v: 500, suffix: '+', label: 'Shipments moved', sub: 'Every single quarter' },
  { v: 98, suffix: '%', label: 'On-time delivery', sub: 'Rolling 12-month average' },
];

export default function Stats() {
  const nums = useRef<(HTMLSpanElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const head = useRef<HTMLDivElement>(null);
  const bridge = useRef<HTMLDivElement>(null);

  const sectionRef = useScene<HTMLElement>('pin', (p) => {
    if (bridge.current) {
      const b = 1 - seg(p, 0, 0.06);
      bridge.current.style.opacity = String(b);
      bridge.current.style.display = b < 0.01 ? 'none' : 'block';
    }
    const intro = seg(p, 0, 0.12);
    setT(head.current, `translate3d(0,${lerp(30, 0, intro)}px,0)`, intro);
    STATS.forEach((s, i) => {
      const start = 0.1 + i * 0.13;
      const local = seg(p, start, start + 0.35);
      const el = panels.current[i];
      if (el) {
        el.style.setProperty('--k', String(local));
        el.style.opacity = String(0.12 + local * 0.88);
        el.style.transform = `translate3d(0, ${(1 - local) * 46}px, 0)`;
      }
      const n = nums.current[i];
      if (n) {
        const val = fmt(Math.round(s.v * local)) + (local > 0.05 ? s.suffix : '');
        if (n.textContent !== val) n.textContent = val;
      }
    });
  });

  return (
    <section
      ref={sectionRef as never}
      data-nav-theme="dark"
      data-scene-name="Scale"
      className="relative h-[210vh] bg-[#04060f] md:h-[280vh]"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* dissolve back from daylight into the night network */}
        <div ref={bridge} className="pointer-events-none absolute inset-0 z-30 bg-[#f6f7fb]" />
        <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_120%,#101d47_0%,#04060f_60%)]" />
        <div className="u-grid-lines absolute inset-0 opacity-30" />

        <div className="relative mx-auto w-full max-w-[1480px] px-5 md:px-9">
          <div ref={head} style={{ opacity: 0 }}>
            <Eyebrow index="07">Scale, in numbers</Eyebrow>
            <h2 className="mt-5 max-w-[640px] font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-light leading-[1.03] tracking-[-0.03em] text-white">
              Every figure below is a <span className="text-[#3fd6e8]">promise kept</span> somewhere on the water.
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-white/10 bg-white/[0.07] lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                ref={(el) => {
                  panels.current[i] = el;
                }}
                data-cursor="cargo"
                className="group relative flex h-[min(27vh,230px)] flex-col justify-between overflow-hidden bg-[#05080f] p-4 will-change-transform sm:p-6 lg:h-[min(38vh,320px)]"
                style={{ ['--k' as string]: 0, opacity: 0 }}
              >
                <div className="relative z-10">
                  <span
                    ref={(el) => {
                      nums.current[i] = el;
                    }}
                    className="font-display text-[clamp(2.4rem,4.6vw,3.6rem)] font-light leading-none text-white"
                  >
                    0
                  </span>
                  <div className="mt-3 text-[13px] font-medium text-white/85">{s.label}</div>
                  <div className="u-label mt-1 text-white/35">{s.sub}</div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%]">
                  {i === 0 && <VizCountries />}
                  {i === 1 && <VizRoutes />}
                  {i === 2 && <VizShipments />}
                  {i === 3 && <VizOnTime />}
                </div>
                <span
                  className="absolute left-0 top-0 h-px bg-gradient-to-r from-[#3fd6e8] to-transparent"
                  style={{ width: 'calc(var(--k) * 100%)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VizCountries() {
  const pts = [
    [18, 46], [30, 32], [42, 52], [52, 28], [62, 44], [72, 60], [82, 36], [26, 66], [90, 54],
    [36, 20], [58, 70], [70, 22],
  ];
  return (
    <div className="relative h-full w-full">
      {pts.map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#3fd6e8]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            opacity: `calc((var(--k) - ${i * 0.055}) * 8)`,
            transform: `scale(calc((var(--k) - ${i * 0.055}) * 8))`,
            boxShadow: '0 0 0 3px rgba(63,214,232,0.12)',
          }}
        />
      ))}
    </div>
  );
}

function VizRoutes() {
  return (
    <svg viewBox="0 0 1000 387" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none">
      {ARCS.map(([a, b], i) => (
        <path
          key={i}
          d={arcPath(a, b, 1000, 387, 0.2)}
          stroke={['#3fd6e8', '#4f6dff', '#7b5cff'][i % 3]}
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: `calc(1 - clamp(0, (var(--k) - ${i * 0.12}) * 2.2, 1))`, opacity: 0.85 }}
        />
      ))}
    </svg>
  );
}

function VizShipments() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {[0, 1, 2].map((r) => (
        <div
          key={r}
          className="absolute left-0 flex gap-1.5"
          style={{
            bottom: `${8 + r * 22}%`,
            transform: `translateX(calc(${r % 2 ? '' : '-'}1 * (1 - var(--k)) * 60%))`,
            opacity: `calc((var(--k) - ${r * 0.14}) * 4)`,
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="block h-3 w-8 rounded-[1px]"
              style={{ background: ['#2549f5', '#7b5cff', '#3fd6e8', '#1c336b'][(i + r) % 4], opacity: 0.9 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function VizOnTime() {
  return (
    <div className="flex h-full w-full items-end justify-start gap-1.5 pb-2">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="block w-full max-w-[14px] flex-1 rounded-t-[1px] bg-gradient-to-t from-[#2549f5] to-[#3fd6e8]"
          style={{
            height: `calc(clamp(0%, (var(--k) - ${i * 0.03}) * ${60 + ((i * 37) % 40)}%, ${55 + ((i * 29) % 45)}%))`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}
