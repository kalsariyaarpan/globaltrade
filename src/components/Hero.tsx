import { useRef } from 'react';
import { useScene, seg, lerp, clamp, easeOut, fmt, setT, setOp } from '../lib/scroll';
import { MapStage } from './MapStage';
import { project, arcPath, LL } from '../lib/geo';
import { ShipSide, Crane, WaveLayer } from './art';
import { Cta, Chip } from './ui';
import { scrollToId } from '../lib/smooth';

const ROUTE: LL[] = [
  [69.7, 22.8], // Mundra, India
  [55.1, 25.0], // Jebel Ali
  [43, 12.5], // Bab-el-Mandeb
  [32.5, 29.9], // Suez
  [14, 37.5], // Sicily
  [-5.5, 36], // Gibraltar
  [-2, 47], // Biscay
  [4.4, 51.9], // Rotterdam
];

const MARKERS: { ll: LL; label: string; at: number }[] = [
  { ll: [69.7, 22.8], label: 'MUNDRA · IN', at: 0.04 },
  { ll: [55.1, 25.0], label: 'JEBEL ALI · AE', at: 0.24 },
  { ll: [32.5, 29.9], label: 'SUEZ', at: 0.38 },
  { ll: [-5.5, 36], label: 'GIBRALTAR', at: 0.5 },
  { ll: [4.4, 51.9], label: 'ROTTERDAM · NL', at: 0.58 },
];

const routeD = ROUTE.slice(0, -1)
  .map((p, i) => arcPath(p, ROUTE[i + 1], 1000, 387, 0.14))
  .join(' ');

export default function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const sky2 = useRef<HTMLDivElement>(null);
  const sky3 = useRef<HTMLDivElement>(null);
  const mapWrap = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const glow = useRef<SVGPathElement>(null);
  const glyph = useRef<SVGGElement>(null);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);
  const ship = useRef<HTMLDivElement>(null);
  const shipInner = useRef<HTMLDivElement>(null);
  const load = useRef<HTMLDivElement>(null);
  const port = useRef<HTMLDivElement>(null);
  const craneA = useRef<HTMLDivElement>(null);
  const craneB = useRef<HTMLDivElement>(null);
  const waves = useRef<(HTMLDivElement | null)[]>([]);
  const headline = useRef<HTMLDivElement>(null);
  const arrival = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const hudVals = useRef<(HTMLSpanElement | null)[]>([]);
  const cue = useRef<HTMLDivElement>(null);
  const len = useRef(0);
  const loadState = useRef(-1);

  const sectionRef = useScene<HTMLElement>('pin', (p, f) => {
    const vw = f.vw;
    const vh = f.vh;

    /* ---- atmosphere ---- */
    setOp(sky2.current, seg(p, 0.1, 0.5));
    setOp(sky3.current, seg(p, 0.55, 0.85));

    /* ---- world map parallax ---- */
    const mapP = seg(p, 0, 0.75);
    setT(
      mapWrap.current,
      `translate3d(${lerp(2, -12, mapP)}%, ${lerp(4, -6, mapP) - p * 4}%, 0) scale(${lerp(1.04, 1.16, mapP)})`,
      lerp(0.25, 0.85, seg(p, 0, 0.22)) * (1 - seg(p, 0.86, 1))
    );

    /* ---- route drawing ---- */
    const rp = seg(p, 0.1, 0.62);
    if (path.current) {
      if (!len.current) len.current = path.current.getTotalLength();
      const L = len.current;
      path.current.style.strokeDasharray = `${L}`;
      path.current.style.strokeDashoffset = `${L * (1 - rp)}`;
      if (glow.current) {
        glow.current.style.strokeDasharray = `${L}`;
        glow.current.style.strokeDashoffset = `${L * (1 - rp)}`;
      }
      if (glyph.current && L) {
        const pt = path.current.getPointAtLength(L * Math.max(0.0001, rp));
        const pt2 = path.current.getPointAtLength(Math.min(L, L * rp + 2));
        const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
        glyph.current.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang})`);
        glyph.current.style.opacity = String(seg(p, 0.08, 0.16) * (1 - seg(p, 0.66, 0.78)));
      }
    }
    MARKERS.forEach((m, i) => {
      const el = markerRefs.current[i];
      if (!el) return;
      const a = seg(p, m.at, m.at + 0.06);
      el.style.opacity = String(a);
      el.style.transform = `scale(${lerp(0.55, 1, a)})`;
    });

    /* ---- hero ship ---- */
    const sp = easeOut(seg(p, 0.02, 0.62));
    const bob = Math.sin(f.t * 1.1) * (vh * 0.006);
    const roll = Math.sin(f.t * 0.9 + 0.4) * 0.9;
    const dock = seg(p, 0.62, 0.78);
    const outro = seg(p, 0.9, 1);
    const x = lerp(-0.2 * vw, 0.16 * vw, sp);
    const scale = lerp(0.86, 1.02, sp) * lerp(1, 0.94, outro);
    setT(
      ship.current,
      `translate3d(${x}px, ${bob + lerp(0, vh * 0.02, dock) + outro * vh * 0.12}px, 0) scale(${scale}) rotate(${roll * (1 - dock)}deg)`,
      1 - outro
    );
    setT(shipInner.current, `translateY(${Math.sin(f.t * 1.7) * 2}px)`);

    /* container load / unload */
    const loadV = seg(p, 0.03, 0.22) * (1 - seg(p, 0.76, 0.94));
    const q = Math.round(loadV * 27) / 27;
    if (q !== loadState.current) {
      loadState.current = q;
      if (load.current) load.current.dataset.load = String(q);
      const boxes = load.current?.querySelectorAll<SVGGElement>('g[data-box]');
      boxes?.forEach((b, i) => {
        const t = clamp(q * 27 - i);
        b.style.opacity = String(t);
        b.style.transform = `translateY(${(1 - t) * -12}px)`;
      });
    }

    /* ---- destination port arriving ---- */
    const pin = seg(p, 0.5, 0.78);
    setT(port.current, `translate3d(${lerp(60, 0, pin)}%, ${outro * -8}vh, 0)`, pin * (1 - outro));
    const unload = seg(p, 0.74, 0.96);
    if (craneA.current) craneA.current.style.setProperty('--h', String(unload));
    if (craneB.current) craneB.current.style.setProperty('--h', String(unload));

    /* ---- waves ---- */
    waves.current.forEach((w, i) => {
      if (!w) return;
      const speed = [26, 42, 64][i];
      const drift = ((f.t * speed) % 1440) * -1;
      const par = lerp(0, vh * [0.1, 0.16, 0.24][i], seg(p, 0, 1));
      w.style.transform = `translate3d(${drift}px, ${par + Math.sin(f.t * (0.8 + i * 0.3)) * (3 + i * 2)}px, 0)`;
    });

    /* ---- copy ---- */
    const out = seg(p, 0.03, 0.18);
    setT(
      headline.current,
      `translate3d(0, ${-out * vh * 0.35}px, 0) scale(${lerp(1, 0.94, out)})`,
      1 - out
    );
    if (headline.current) headline.current.style.filter = `blur(${out * 9}px)`;
    setOp(cue.current, 1 - seg(p, 0, 0.06));

    const arr = seg(p, 0.78, 0.92) * (1 - seg(p, 0.95, 1));
    setT(arrival.current, `translate3d(0, ${lerp(30, 0, seg(p, 0.78, 0.92))}px, 0)`, arr);

    /* ---- HUD numbers ---- */
    setOp(hud.current, seg(p, 0.14, 0.24) * (1 - seg(p, 0.9, 1)));
    const nm = 6150 * rp;
    const eta = Math.max(0, 18 - 18 * rp);
    const kn = 18.4 + Math.sin(f.t * 0.7) * 1.6;
    const vals = [
      `${fmt(nm)} NM`,
      `${eta.toFixed(1)} DAYS`,
      `${kn.toFixed(1)} KN`,
      `${fmt(Math.round(loadV * 18400))} TEU`,
    ];
    vals.forEach((v, i) => {
      const el = hudVals.current[i];
      if (el && el.textContent !== v) el.textContent = v;
    });

    /* ---- hand-off to next scene ---- */
    if (stage.current) {
      stage.current.style.transform = `scale(${lerp(1, 0.93, outro)}) translateY(${-outro * 4}vh)`;
      stage.current.style.opacity = String(1 - outro * 0.9);
      stage.current.style.filter = `blur(${outro * 7}px)`;
    }
  });

  return (
    <section
      ref={sectionRef as never}
      id="hero"
      data-nav-theme="transparent"
      data-scene-name="Departure"
      className="relative h-[300vh] md:h-[460vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#04060f]">
        <div ref={stage} className="absolute inset-0 origin-top will-change-transform">
          {/* ---------- atmosphere ---------- */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#13235c_0%,#070d22_45%,#04060f_100%)]" />
          <div
            ref={sky2}
            className="absolute inset-0 bg-[radial-gradient(110%_80%_at_20%_0%,#1b2e7a_0%,#0a1330_50%,#04060f_100%)]"
            style={{ opacity: 0 }}
          />
          <div
            ref={sky3}
            className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_10%,#3a2b6b_0%,#101a3e_45%,#04060f_100%)]"
            style={{ opacity: 0 }}
          />
          <div className="u-grid-lines absolute inset-0 opacity-40" />

          {/* ---------- world map + route ---------- */}
          <div className="absolute left-1/2 top-[46%] w-[150vw] -translate-x-1/2 -translate-y-1/2 md:w-[118vw]">
          <div ref={mapWrap} className="w-full will-change-transform">
            <MapStage dotProps={{ color: '#6f8ad8', accent: '#3fd6e8', dotSize: 1.15, opacity: 0.55 }}>
              <path ref={glow} d={routeD} stroke="#3fd6e8" strokeWidth="6" strokeOpacity="0.16" strokeLinecap="round" />
              <path
                ref={path}
                d={routeD}
                stroke="url(#heroRoute)"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="heroRoute" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="#3fd6e8" />
                  <stop offset="55%" stopColor="#4f6dff" />
                  <stop offset="100%" stopColor="#7b5cff" />
                </linearGradient>
              </defs>

              {MARKERS.map((m, i) => {
                const [x, y] = project(m.ll[0], m.ll[1], 1000, 387);
                return (
                  <g
                    key={m.label}
                    ref={(el) => {
                      markerRefs.current[i] = el;
                    }}
                    style={{ opacity: 0, transformOrigin: `${x}px ${y}px` }}
                  >
                    <circle cx={x} cy={y} r="9" fill="#3fd6e8" opacity="0.10" className="pulse-ring" style={{ transformOrigin: `${x}px ${y}px` }} />
                    <circle cx={x} cy={y} r="3" fill="#0b1430" stroke="#3fd6e8" strokeWidth="1.4" />
                    <path d={`M${x} ${y - 5} V${y - 14} H${x + 44}`} stroke="#8fb6ff" strokeWidth="0.7" strokeOpacity="0.6" />
                    <text
                      x={x + 4}
                      y={y - 17}
                      fill="#cfe0ff"
                      fontSize="8.5"
                      fontFamily="monospace"
                      letterSpacing="1.4"
                      opacity="0.9"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}

              <g ref={glyph} style={{ opacity: 0 }}>
                <circle r="11" fill="#3fd6e8" opacity="0.14" />
                <circle r="5" fill="#3fd6e8" opacity="0.28" />
                <path d="M6 0 L-5 -4 L-2.6 0 L-5 4 Z" fill="#ffffff" />
              </g>
            </MapStage>
          </div>
          </div>

          {/* ---------- destination port silhouette ---------- */}
          <div
            ref={port}
            className="pointer-events-none absolute bottom-[16vh] right-0 h-[46vh] w-[62vw] will-change-transform md:w-[42vw]"
            style={{ opacity: 0 }}
          >
            <div
              ref={craneA}
              className="absolute bottom-0 right-[4%] h-full w-[46%]"
              style={{ ['--h' as string]: 0 }}
            >
              <Crane className="h-full w-full" trolley={0.62} color="#7f96cf" />
            </div>
            <div
              ref={craneB}
              className="absolute bottom-0 right-[42%] h-[86%] w-[42%] opacity-70"
              style={{ ['--h' as string]: 0 }}
            >
              <Crane className="h-full w-full" trolley={0.34} color="#6379b4" cargoColor="#7b5cff" />
            </div>
            <div className="absolute bottom-0 left-0 h-[10%] w-full bg-gradient-to-t from-[#060b1c] to-[#0c1738]" />
            <div className="absolute bottom-[10%] right-[6%] flex gap-1">
              {['#2549f5', '#7b5cff', '#3fd6e8', '#e8ecff'].map((c, i) => (
                <span key={i} className="block h-3 w-8 rounded-[2px]" style={{ background: c, opacity: 0.85 }} />
              ))}
            </div>
          </div>

          {/* ---------- ocean ---------- */}
          <div className="absolute inset-x-0 bottom-0 h-[42vh]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-[#061029]/95 to-transparent" />
            {['#0a1740', '#0b2050', '#123067'].map((c, i) => (
              <div
                key={c}
                ref={(el) => {
                  waves.current[i] = el;
                }}
                className="absolute bottom-0 left-0 h-[16vh] w-[300%] will-change-transform"
                style={{ bottom: `${i * 3}vh` }}
              >
                <WaveLayer className="h-full w-full" color={c} opacity={0.55 - i * 0.12} />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-t from-[#04060f] to-transparent" />
          </div>

          {/* ---------- hero ship ---------- */}
          <div
            ref={ship}
            className="pointer-events-none absolute bottom-[22vh] left-0 w-[min(620px,58vw)] will-change-transform"
            data-cursor="cargo"
          >
            <div ref={shipInner}>
              <div ref={load}>
                <ShipSide load={0} className="w-full drop-shadow-[0_28px_40px_rgba(0,0,0,0.55)]" />
              </div>
              <div className="mx-auto mt-[-6px] h-[10px] w-[80%] rounded-[50%] bg-[#3fd6e8] opacity-[0.10] blur-md" />
            </div>
          </div>

          {/* ---------- copy ---------- */}
          <div className="pointer-events-none absolute inset-0">
            <div className="mx-auto flex h-full max-w-[1480px] flex-col justify-center px-5 md:px-9">
              <div ref={headline} className="pointer-events-auto max-w-[760px] will-change-transform">
                <div className="mb-6 flex items-center gap-3 text-white/45">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 rounded-full bg-[#3fd6e8] opacity-70 pulse-ring" />
                    <span className="relative h-2 w-2 rounded-full bg-[#3fd6e8]" />
                  </span>
                  <span className="u-label">Import · Export · Global Freight</span>
                </div>
                <h1 className="font-display text-[clamp(2.6rem,7.4vw,6.2rem)] font-light leading-[0.95] tracking-[-0.03em] text-white">
                  Connecting Markets.
                  <br />
                  <span className="bg-gradient-to-r from-[#7b5cff] via-[#4f6dff] to-[#3fd6e8] bg-clip-text text-transparent">
                    Moving Possibilities.
                  </span>
                </h1>
                <p className="mt-7 max-w-[470px] text-[15px] leading-relaxed text-white/60">
                  We connect businesses across borders through reliable import and export solutions —
                  sourcing, compliance, freight and last-mile, orchestrated end to end.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Cta onClick={() => scrollToId('journey')}>Explore Our Trade</Cta>
                  <Cta variant="ghost" onClick={() => scrollToId('contact')}>
                    Start a Conversation
                  </Cta>
                </div>
              </div>
            </div>

            {/* arrival card */}
            <div
              ref={arrival}
              className="absolute left-1/2 top-[30%] w-[min(420px,86vw)] -translate-x-1/2 rounded-[3px] border border-white/12 bg-[#060c1e]/70 p-6 u-glass"
              style={{ opacity: 0 }}
            >
              <div className="u-label text-[#3fd6e8]">Vessel arrived</div>
              <div className="mt-3 font-display text-3xl font-light text-white">Port of Rotterdam</div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                <Chip k="Transit" v="17.4 d" />
                <Chip k="Cargo" v="18,400 TEU" />
                <Chip k="Status" v="CLEARED" />
              </div>
            </div>
          </div>

          {/* ---------- voyage HUD ---------- */}
          <div
            ref={hud}
            className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#04060f]/40 u-glass"
            style={{ opacity: 0 }}
          >
            <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-5 py-4 md:px-9">
              <div className="u-label hidden text-white/40 md:block">Voyage MTW–4471 · Live telemetry</div>
              <div className="grid flex-1 grid-cols-4 gap-2 md:max-w-[620px]">
                {['Distance', 'ETA', 'Speed', 'Load'].map((k, i) => (
                  <div key={k} className="flex flex-col gap-1 border-l border-white/12 pl-3">
                    <span className="u-label text-white/40">{k}</span>
                    <span
                      ref={(el) => {
                        hudVals.current[i] = el;
                      }}
                      className="font-mono text-[12.5px] text-white"
                    >
                      —
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* scroll cue */}
          <div ref={cue} className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center">
            <div className="u-label mb-3 text-white/40">Scroll to sail</div>
            <div className="mx-auto h-10 w-px overflow-hidden bg-white/15">
              <div className="h-4 w-px animate-[dashDrift_1.8s_linear_infinite] bg-[#3fd6e8]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


