import { useRef, useState } from 'react';
import { useScene, seg, lerp, clamp, setT, fmt } from '../lib/scroll';
import { MapStage, MW, MH } from './MapStage';
import { project, arcPath, LL, PORTS } from '../lib/geo';
import { Eyebrow } from './ui';

type Lane = {
  id: string;
  label: string;
  pts: LL[];
  transit: string;
  volume: string;
  goods: string;
  color: string;
};

const LANES: Lane[] = [
  {
    id: 'in-eu',
    label: 'India → North Europe',
    pts: [[69.7, 22.8], [43, 12.5], [32.5, 29.9], [14, 37.5], [-5.5, 36], [4.4, 51.9]],
    transit: '17–21 days',
    volume: '3,120 TEU / mo',
    goods: 'Textiles · Pharma · Machinery',
    color: '#3fd6e8',
  },
  {
    id: 'in-us',
    label: 'India → US East Coast',
    pts: [[72.9, 18.9], [43, 12.5], [32.5, 29.9], [-5.5, 36], [-40, 39], [-74, 40.7]],
    transit: '24–28 days',
    volume: '2,480 TEU / mo',
    goods: 'Auto parts · Chemicals',
    color: '#4f6dff',
  },
  {
    id: 'cn-us',
    label: 'China → US West Coast',
    pts: [[121.5, 31.2], [150, 40], [-170, 44], [-140, 40], [-118.2, 33.7]],
    transit: '14–18 days',
    volume: '4,760 TEU / mo',
    goods: 'Electronics · Components',
    color: '#7b5cff',
  },
  {
    id: 'ae-af',
    label: 'UAE → East & South Africa',
    pts: [[55.1, 25], [52, 12], [45, -5], [38, -20], [31, -29.8]],
    transit: '12–15 days',
    volume: '1,140 TEU / mo',
    goods: 'FMCG · Building materials',
    color: '#3fd6e8',
  },
  {
    id: 'sg-au',
    label: 'Singapore → Australia',
    pts: [[103.8, 1.3], [118, -8], [135, -22], [151.2, -33.8]],
    transit: '11–14 days',
    volume: '980 TEU / mo',
    goods: 'Agri · Industrial goods',
    color: '#4f6dff',
  },
  {
    id: 'br-eu',
    label: 'Brazil → Rotterdam',
    pts: [[-46.3, -24], [-35, -8], [-25, 8], [-15, 28], [4.4, 51.9]],
    transit: '19–23 days',
    volume: '1,630 TEU / mo',
    goods: 'Commodities · Coffee',
    color: '#7b5cff',
  },
];

const laneD = (l: Lane) =>
  l.pts.slice(0, -1).map((p, i) => arcPath(p, l.pts[i + 1], MW, MH, 0.15)).join(' ');

export default function WorldMap() {
  const [focus, setFocus] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const paths = useRef<Record<string, SVGPathElement | null>>({});
  const glows = useRef<Record<string, SVGPathElement | null>>({});
  const ships = useRef<Record<string, SVGGElement | null>>({});
  const lens = useRef<Record<string, number>>({});
  const portRefs = useRef<(SVGGElement | null)[]>([]);
  const stats = useRef<(HTMLSpanElement | null)[]>([]);
  const head = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const sectionRef = useScene<HTMLElement>('pin', (p, f) => {
    /* map breathes in */
    const intro = seg(p, 0, 0.18);
    setT(
      inner.current,
      `translate3d(0, ${lerp(6, 0, intro)}vh, 0) scale(${lerp(0.88, 1, intro)})`,
      lerp(0.2, 1, intro)
    );
    setT(head.current, `translate3d(0, ${lerp(30, 0, intro)}px, 0)`, intro);
    setT(list.current, `translate3d(0, ${lerp(40, 0, seg(p, 0.2, 0.42))}px, 0)`, seg(p, 0.2, 0.42));

    LANES.forEach((l, i) => {
      const a = 0.14 + i * 0.085;
      const dp = seg(p, a, a + 0.26);
      const el = paths.current[l.id];
      if (!el) return;
      if (!lens.current[l.id]) lens.current[l.id] = el.getTotalLength();
      const L = lens.current[l.id];
      const dim = focus && focus !== l.id ? 0.12 : 1;
      el.style.strokeDasharray = `${L}`;
      el.style.strokeDashoffset = `${L * (1 - dp)}`;
      el.style.opacity = String(dim);
      el.style.strokeWidth = focus === l.id ? '2.4' : '1.3';
      const g = glows.current[l.id];
      if (g) {
        g.style.strokeDasharray = `${L}`;
        g.style.strokeDashoffset = `${L * (1 - dp)}`;
        g.style.opacity = String((focus === l.id ? 0.4 : 0.14) * dim);
      }
      const s = ships.current[l.id];
      if (s && dp > 0.02) {
        const speed = 0.045 + i * 0.008;
        const t = ((f.t * speed + i * 0.27) % 1) * dp;
        const pt = el.getPointAtLength(L * t);
        const pt2 = el.getPointAtLength(Math.min(L, L * t + 2));
        const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
        s.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang})`);
        s.style.opacity = String(dim * clamp(dp * 3));
      } else if (s) s.style.opacity = '0';
    });

    PORTS.forEach((_, i) => {
      const el = portRefs.current[i];
      if (!el) return;
      const a = seg(p, 0.1 + i * 0.022, 0.16 + i * 0.022);
      el.style.opacity = String(a);
      el.style.transform = `scale(${lerp(0.4, 1, a)})`;
    });

    const c = [
      `${Math.round(lerp(0, 25, seg(p, 0.15, 0.7)))}+`,
      `${Math.round(lerp(0, 120, seg(p, 0.2, 0.78)))}+`,
      `${fmt(Math.round(lerp(0, 38, seg(p, 0.25, 0.85))))}`,
    ];
    c.forEach((v, i) => {
      const el = stats.current[i];
      if (el && el.textContent !== v) el.textContent = v;
    });

    const el = sectionRef.current as HTMLElement | null;
    if (el) {
      const theme = p > 0.08 ? 'glass' : 'dark';
      if (el.dataset.navTheme !== theme) el.dataset.navTheme = theme;
    }
  }, [focus]);

  const focused = LANES.find((l) => l.id === focus);

  return (
    <section
      ref={sectionRef as never}
      id="network"
      data-nav-theme="glass"
      data-scene-name="Network"
      className="relative h-[300vh] bg-[#05080f] md:h-[420vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#0c1636_0%,#05080f_60%)]" />
        <div className="u-grid-lines absolute inset-0 opacity-25" />

        <div ref={wrap} className="absolute inset-0 flex items-center justify-center">
          <div
            ref={inner}
            data-cursor="map"
            className="relative w-[min(1500px,128vw)] will-change-transform"
            style={{
              transition: 'none',
            }}
          >
            <MapStage dotProps={{ color: '#5f79bf', accent: '#2549f5', dotSize: 1.15, opacity: 0.5 }}>
              {LANES.map((l) => (
                <g key={l.id}>
                  <path
                    ref={(el) => {
                      glows.current[l.id] = el;
                    }}
                    d={laneD(l)}
                    stroke={l.color}
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.14"
                    style={{ transition: 'opacity 500ms ease' }}
                  />
                  <path
                    ref={(el) => {
                      paths.current[l.id] = el;
                    }}
                    d={laneD(l)}
                    stroke={l.color}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-width 400ms ease, opacity 500ms ease' }}
                  />
                </g>
              ))}

              {LANES.map((l) => (
                <g
                  key={l.id + '-ship'}
                  ref={(el) => {
                    ships.current[l.id] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <circle r="9" fill={l.color} opacity="0.12" />
                  <circle r="4" fill={l.color} opacity="0.3" />
                  <path d="M5.5 0 L-4.5 -3.6 L-2.4 0 L-4.5 3.6 Z" fill="#fff" />
                </g>
              ))}

              {PORTS.map((pt, i) => {
                const [x, y] = project(pt.ll[0], pt.ll[1], MW, MH);
                const isHub = pt.kind === 'hub';
                return (
                  <g
                    key={pt.id}
                    ref={(el) => {
                      portRefs.current[i] = el;
                    }}
                    style={{ opacity: 0, transformOrigin: `${x}px ${y}px` }}
                    className="group"
                  >
                    <circle cx={x} cy={y} r="14" fill="transparent" />
                    <circle
                      cx={x}
                      cy={y}
                      r="7"
                      fill={isHub ? '#7b5cff' : '#3fd6e8'}
                      opacity="0.12"
                      className="pulse-ring"
                      style={{ transformOrigin: `${x}px ${y}px` }}
                    />
                    <circle cx={x} cy={y} r="2.6" fill="#050810" stroke={isHub ? '#7b5cff' : '#3fd6e8'} strokeWidth="1.3" />
                    <text
                      x={x + 6}
                      y={y - 6}
                      fontSize="7.4"
                      fontFamily="monospace"
                      letterSpacing="1.2"
                      fill="#c9d8ff"
                      opacity="0.45"
                      className="transition-opacity duration-300 group-hover:opacity-100"
                    >
                      {pt.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </MapStage>
          </div>
        </div>

        {/* heading */}
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <div ref={head} className="mx-auto flex max-w-[1480px] flex-col gap-4 px-5 pt-[13vh] md:px-9">
            <Eyebrow index="04">The network</Eyebrow>
            <h2 className="max-w-[620px] font-display text-[clamp(2rem,4.6vw,3.6rem)] font-light leading-[1.02] tracking-[-0.03em] text-white">
              One network,
              <span className="text-white/45"> six oceans,</span> twenty-five markets.
            </h2>
            <div className="mt-2 flex flex-wrap gap-8">
              {[
                ['Countries served', 0],
                ['Active trade lanes', 1],
                ['Partner ports', 2],
              ].map(([label, i]) => (
                <div key={label as string} className="flex flex-col gap-1">
                  <span
                    ref={(el) => {
                      stats.current[i as number] = el;
                    }}
                    className="font-display text-3xl font-light text-white"
                  >
                    0
                  </span>
                  <span className="u-label text-white/40">{label as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* lane selector */}
        <div ref={list} className="absolute inset-x-0 bottom-0" style={{ opacity: 0 }}>
          <div className="mx-auto max-w-[1480px] px-5 pb-8 md:px-9">
            <div className="mb-3 flex items-center justify-between">
              <span className="u-label text-white/40">Select a trade lane</span>
              <span className="u-label text-white/30 hidden md:block">
                {focused ? focused.goods : 'Hover to isolate a corridor'}
              </span>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {LANES.map((l) => {
                const on = focus === l.id;
                return (
                  <button
                    key={l.id}
                    data-cursor="map"
                    onMouseEnter={() => setFocus(l.id)}
                    onMouseLeave={() => setFocus(null)}
                    onClick={() => setFocus((x) => (x === l.id ? null : l.id))}
                    className="group relative flex min-w-[220px] flex-1 flex-col items-start gap-2 rounded-[3px] border px-4 py-3 text-left transition-all duration-500 u-glass"
                    style={{
                      borderColor: on ? l.color : 'rgba(255,255,255,0.10)',
                      background: on ? 'rgba(255,255,255,0.07)' : 'rgba(6,10,24,0.42)',
                      transform: on ? 'translateY(-6px)' : 'none',
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-white">{l.label}</span>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
                    </span>
                    <span className="flex w-full items-center justify-between font-mono text-[10.5px] text-white/45">
                      <span>{l.transit}</span>
                      <span>{l.volume}</span>
                    </span>
                    <span
                      className="absolute bottom-0 left-0 h-[2px] origin-left transition-transform duration-700"
                      style={{ background: l.color, width: '100%', transform: `scaleX(${on ? 1 : 0})` }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
