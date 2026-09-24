import { useRef } from 'react';
import { useScene, seg, lerp, track, clamp, setT, setOp, fmt } from '../lib/scroll';
import { ShipSide, Crane, WaveLayer, CityArt, WarehouseArt } from './art';

const STAGES = [
  {
    key: 'SOURCE',
    title: 'Sourcing at origin',
    body: 'Vetted manufacturers, audited factories and negotiated terms. Every shipment starts with the right partner on the ground.',
    meta: ['Gujarat · India', '214 audited suppliers'],
  },
  {
    key: 'PRODUCT',
    title: 'Product & quality control',
    body: 'Pre-shipment inspection, sampling and specification match. Nothing moves before it passes.',
    meta: ['AQL 2.5 inspection', 'Lab-certified batches'],
  },
  {
    key: 'PACKAGING',
    title: 'Export packaging',
    body: 'Protective packing, palletisation, labelling and HS-coded marking built for long-haul ocean freight.',
    meta: ['ISPM-15 pallets', 'Barcode + HS marking'],
  },
  {
    key: 'LOGISTICS',
    title: 'Inland logistics',
    body: 'Container stuffing, customs documentation and bonded haulage to the terminal gate.',
    meta: ['FCL / LCL', 'Door-to-port haulage'],
  },
  {
    key: 'SHIPPING',
    title: 'Ocean freight',
    body: 'Booked space on trusted carriers, loaded under supervision, tracked hour by hour across the water.',
    meta: ['18,400 TEU vessel', 'Live vessel telemetry'],
  },
  {
    key: 'DESTINATION',
    title: 'Destination port',
    body: 'Arrival handling, customs clearance, duty settlement and terminal release — before the ship even docks.',
    meta: ['Pre-cleared entry', 'Rotterdam · NL'],
  },
  {
    key: 'DELIVERY',
    title: 'Final delivery',
    body: 'Warehousing, distribution and last-mile into your buyer’s hands. Proof of delivery closes the loop.',
    meta: ['POD in 24h', '98.4% on time'],
  },
];

const N = STAGES.length;

export default function Journey() {
  const far = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);
  const skyA = useRef<HTMLDivElement>(null);
  const skyB = useRef<HTMLDivElement>(null);
  const skyC = useRef<HTMLDivElement>(null);
  const skyD = useRef<HTMLDivElement>(null);

  const cargo = useRef<HTMLDivElement>(null);
  const crate = useRef<HTMLDivElement>(null);
  const scan = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const door = useRef<HTMLDivElement>(null);
  const cable = useRef<HTMLDivElement>(null);
  const ship = useRef<HTMLDivElement>(null);
  const truck = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const wavesRef = useRef<(HTMLDivElement | null)[]>([]);

  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const ticks = useRef<(HTMLDivElement | null)[]>([]);
  const counter = useRef<HTMLSpanElement>(null);
  const stageName = useRef<HTMLSpanElement>(null);

  const sectionRef = useScene<HTMLElement>('pin', (p, f) => {
    const vw = f.vw;
    const vh = f.vh;

    /* ---------- camera pan across the world strip ---------- */
    const camera = p * (N - 1) * vw;
    /* strips run at different speeds; their panel pitch + offset keeps each
       stage's scenery centred while still parallaxing against the foreground */
    setT(far.current, `translate3d(${-camera * 0.4 + vw * 0.3}px,0,0)`);
    setT(mid.current, `translate3d(${-camera * 0.72 + vw * 0.14}px,0,0)`);
    setT(near.current, `translate3d(${-camera}px,0,0)`);

    /* ---------- sky / environment morph ---------- */
    setOp(skyA.current, 1 - seg(p, 0.1, 0.3));
    setOp(skyB.current, seg(p, 0.14, 0.34) * (1 - seg(p, 0.45, 0.62)));
    setOp(skyC.current, seg(p, 0.48, 0.64) * (1 - seg(p, 0.76, 0.88)));
    setOp(skyD.current, seg(p, 0.78, 0.92));

    /* ---------- hero cargo choreography ---------- */
    const gx = track(p, [
      [0, 0],
      [0.2, 0],
      [0.42, -vw * 0.06],
      [0.56, 0],
      [0.72, vw * 0.02],
      [0.88, -vw * 0.02],
      [1, 0],
    ]);
    const gy = track(p, [
      [0, vh * 0.06],
      [0.08, 0],
      [0.55, 0],
      [0.6, -vh * 0.16],
      [0.68, -vh * 0.05],
      [0.86, -vh * 0.12],
      [0.92, 0],
      [1, 0],
    ]);
    const gs = track(p, [
      [0, 0.6],
      [0.08, 1],
      [0.2, 1.18],
      [0.34, 1],
      [0.56, 1],
      [0.72, 0.86],
      [0.9, 0.9],
      [1, 0.9],
    ]);
    const bob = Math.sin(f.t * 1.2) * (p > 0.66 && p < 0.84 ? 6 : 0);
    setT(cargo.current, `translate3d(${gx}px, ${gy + bob}px, 0) scale(${gs})`);

    /* crate: exists until it is stuffed into the container */
    const crateIn = seg(p, 0.01, 0.07);
    const crateGone = seg(p, 0.46, 0.53);
    setT(
      crate.current,
      `translate3d(${track(p, [
        [0, -vw * 0.06],
        [0.1, 0],
        [0.42, 0],
        [0.5, vw * 0.04],
      ])}px, ${(1 - crateIn) * 60}px, 0) scale(${lerp(1, 0.42, crateGone)}) rotate(${track(p, [
        [0.14, 0],
        [0.22, -6],
        [0.3, 0],
      ])}deg)`,
      crateIn * (1 - crateGone)
    );

    /* QC scan */
    const sc = seg(p, 0.15, 0.2) * (1 - seg(p, 0.26, 0.3));
    setOp(scan.current, sc);
    if (scan.current) scan.current.style.setProperty('--sy', `${((p - 0.15) / 0.12) % 1}`);

    /* packaging bands */
    const wr = seg(p, 0.3, 0.38);
    setOp(wrap.current, wr * (1 - seg(p, 0.46, 0.52)));
    if (wrap.current) wrap.current.style.setProperty('--wr', String(wr));

    /* container */
    const cIn = seg(p, 0.4, 0.48);
    setT(
      container.current,
      `translate3d(${lerp(vw * 0.3, 0, cIn)}px, 0, 0) scale(${lerp(0.9, 1, cIn)})`,
      cIn * (1 - seg(p, 0.96, 1) * 0.0)
    );
    const doors = seg(p, 0.44, 0.5) * (1 - seg(p, 0.52, 0.58));
    setT(door.current, `perspective(600px) rotateY(${-doors * 108}deg)`);

    /* crane cable lift */
    const lift = seg(p, 0.56, 0.62) * (1 - seg(p, 0.68, 0.72));
    setOp(cable.current, lift);
    if (cable.current) cable.current.style.height = `${lerp(0, vh * 0.3, seg(p, 0.55, 0.62))}px`;

    /* ship slides beneath the container */
    const shipIn = seg(p, 0.6, 0.68);
    const shipOut = seg(p, 0.82, 0.9);
    setT(
      ship.current,
      `translate3d(${lerp(vw * 0.55, 0, shipIn) - shipOut * vw * 0.5}px, ${Math.sin(f.t * 1.2) * 5}px, 0)`,
      shipIn * (1 - shipOut)
    );

    /* truck arrives for the last mile */
    const truckIn = seg(p, 0.86, 0.93);
    setT(truck.current, `translate3d(${lerp(vw * 0.5, 0, truckIn)}px, 0, 0)`, truckIn);
    setT(stamp.current, `rotate(-9deg) scale(${lerp(1.5, 1, seg(p, 0.95, 0.99))})`, seg(p, 0.95, 0.99));

    /* ocean waves only while at sea */
    const sea = seg(p, 0.56, 0.66) * (1 - seg(p, 0.86, 0.94));
    if (near.current) near.current.style.opacity = String(1 - sea * 0.9);
    wavesRef.current.forEach((w, i) => {
      if (!w) return;
      w.style.opacity = String(sea * (0.7 - i * 0.16));
      w.style.transform = `translate3d(${((f.t * (30 + i * 22)) % 1440) * -1}px, ${i * 10}px, 0)`;
    });

    /* ---------- copy & rail ---------- */
    const idx = clamp(Math.floor(p * N), 0, N - 1);
    texts.current.forEach((el, i) => {
      if (!el) return;
      const s = i / N;
      const e = (i + 1) / N;
      const a = seg(p, s - 0.035, s + 0.022) * (1 - seg(p, e - 0.045, e + 0.005));
      el.style.opacity = String(a);
      el.style.transform = `translate3d(0, ${(1 - a) * 44}px, 0)`;
      el.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
    });
    ticks.current.forEach((el, i) => {
      if (!el) return;
      const active = i === idx;
      const local = clamp((p - i / N) * N);
      el.style.setProperty('--fill', String(active ? local : i < idx ? 1 : 0));
      el.style.opacity = String(active ? 1 : 0.42);
      el.style.transform = `translateX(${active ? 0 : -6}px)`;
    });
    if (counter.current) {
      const v = `${fmt(Math.round(p * 100)).padStart(2, '0')}%`;
      if (counter.current.textContent !== v) counter.current.textContent = v;
    }
    if (stageName.current && stageName.current.textContent !== STAGES[idx].key)
      stageName.current.textContent = STAGES[idx].key;

    /* dynamic nav theme inside the scene */
    const el = sectionRef.current as HTMLElement | null;
    if (el) {
      const theme = p < 0.28 ? 'dark' : p < 0.56 ? 'glass' : p < 0.86 ? 'dark' : 'glass';
      if (el.dataset.navTheme !== theme) el.dataset.navTheme = theme;
      const name = STAGES[idx].key.charAt(0) + STAGES[idx].key.slice(1).toLowerCase();
      if (el.dataset.sceneName !== name) el.dataset.sceneName = name;
    }
  });

  return (
    <section
      ref={sectionRef as never}
      id="journey"
      data-nav-theme="dark"
      data-scene-name="Source"
      className="relative h-[460vh] bg-[#04060f] md:h-[720vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ---------------- sky layers ---------------- */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a2452_0%,#0a1330_55%,#05070f_100%)]" />
        <div
          ref={skyA}
          className="absolute inset-0 bg-[linear-gradient(180deg,#3a2f5f_0%,#5b3f63_28%,#2a2748_62%,#0a1024_100%)]"
        />
        <div
          ref={skyB}
          className="absolute inset-0 bg-[linear-gradient(180deg,#101a3c_0%,#16265c_48%,#070d22_100%)]"
          style={{ opacity: 0 }}
        />
        <div
          ref={skyC}
          className="absolute inset-0 bg-[linear-gradient(180deg,#071230_0%,#0d2150_45%,#04091c_100%)]"
          style={{ opacity: 0 }}
        />
        <div
          ref={skyD}
          className="absolute inset-0 bg-[linear-gradient(180deg,#0b1636_0%,#20265e_40%,#070b1e_100%)]"
          style={{ opacity: 0 }}
        />
        <div className="u-grid-lines absolute inset-0 opacity-30" />

        {/* ---------------- FAR strip ---------------- */}
        <div ref={far} className="absolute inset-y-0 left-0 flex h-full w-[560vw] will-change-transform">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="relative h-full w-[40vw]">
              <Hills flip={i % 2 === 1} />
              <div className="absolute bottom-[24vh] left-0 h-px w-full bg-white/[0.07]" />
            </div>
          ))}
        </div>

        {/* ---------------- MID strip ---------------- */}
        <div ref={mid} className="absolute inset-y-0 left-0 flex h-full w-[504vw] will-change-transform">
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} className="relative h-full w-[72vw]">
              {i === 0 && <Factory />}
              {i === 1 && <SpecGrid />}
              {i === 2 && (
                <>
                  <ShelfRacks />
                  <div className="absolute bottom-[42vh] left-[6vw] h-[16vh] w-[54vw] opacity-40">
                    <WarehouseArt className="h-full w-full" lights={0.8} />
                  </div>
                </>
              )}
              {i === 3 && <Highway />}
              {i === 4 && <PortCranes />}
              {i === 5 && <Horizon />}
              {i === 6 && (
                <>
                  <div className="absolute bottom-[26vh] left-[2vw] h-[24vh] w-[66vw] opacity-80">
                    <CityArt className="h-full w-full" />
                  </div>
                  <PortCranes mirrored />
                </>
              )}
            </div>
          ))}
        </div>

        {/* ---------------- ocean (only at sea) ---------------- */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34vh]">
          {['#0a1740', '#0c2050', '#143471'].map((c, i) => (
            <div
              key={c}
              ref={(el) => {
                wavesRef.current[i] = el;
              }}
              className="absolute bottom-0 left-0 h-[14vh] w-[300%] will-change-transform"
              style={{ bottom: `${i * 2.5}vh`, opacity: 0 }}
            >
              <WaveLayer className="h-full w-full" color={c} />
            </div>
          ))}
        </div>

        {/* ---------------- NEAR strip (ground) ---------------- */}
        <div ref={near} className="absolute inset-y-0 left-0 flex h-full w-[700vw] will-change-transform">
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} className="relative h-full w-[100vw]">
              <div className="absolute bottom-[20vh] left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="absolute bottom-[20vh] left-0 h-[20vh] w-full bg-gradient-to-b from-white/[0.04] to-transparent" />
              <div className="u-label absolute bottom-[14vh] left-[6vw] text-white/25">
                {String(i + 1).padStart(2, '0')} · {STAGES[i].key}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- ship & truck carriers ---------------- */}
        <div className="pointer-events-none absolute bottom-[12vh] left-1/2 w-[min(760px,78vw)] -translate-x-1/2">
          <div ref={ship} className="w-full will-change-transform" style={{ opacity: 0 }}>
            <ShipSide load={0.45} idPrefix="j" className="w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-[17vh] left-1/2 w-[min(520px,70vw)] -translate-x-1/2">
          <div ref={truck} className="w-full will-change-transform" style={{ opacity: 0 }}>
            <Truck />
          </div>
        </div>

        {/* ---------------- hero cargo ---------------- */}
        <div className="absolute bottom-[24vh] left-1/2 h-[24vh] w-[min(420px,64vw)] -translate-x-1/2">
        <div ref={cargo} data-cursor="cargo" className="relative h-full w-full will-change-transform">
          {/* crane cable */}
          <div
            ref={cable}
            className="absolute bottom-full left-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-[#8fa3d8] to-transparent"
            style={{ opacity: 0, height: 0 }}
          />
          {/* container */}
          <div ref={container} className="absolute inset-0 will-change-transform" style={{ opacity: 0 }}>
            <svg viewBox="0 0 320 150" className="h-full w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]" fill="none">
              <defs>
                <linearGradient id="jc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b5ffb" />
                  <stop offset="100%" stopColor="#1a2e8f" />
                </linearGradient>
              </defs>
              <rect x="6" y="26" width="308" height="104" rx="4" fill="url(#jc)" />
              {Array.from({ length: 13 }).map((_, i) => (
                <rect key={i} x={20 + i * 22} y="34" width="9" height="88" rx="2" fill="#000" opacity="0.14" />
              ))}
              <rect x="6" y="26" width="308" height="10" fill="#fff" opacity="0.14" />
              <text x="20" y="122" fontSize="9" fontFamily="monospace" fill="#fff" opacity="0.7" letterSpacing="2">
                MTWU 447192 · 40HC
              </text>
            </svg>
            <div
              ref={door}
              className="absolute right-[1.5%] top-[17%] h-[70%] w-[22%] origin-right will-change-transform"
            >
              <div className="h-full w-full rounded-[3px] bg-gradient-to-b from-[#3b5ffb] to-[#16267a] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]">
                <div className="mx-auto mt-[12%] h-[76%] w-[8%] rounded bg-black/25" />
              </div>
            </div>
          </div>

          {/* crate / product */}
          <div className="absolute bottom-[8%] left-1/2 h-[64%] w-[38%] -translate-x-1/2">
          <div ref={crate} className="relative h-full w-full will-change-transform" style={{ opacity: 0 }}>
            <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)]" fill="none">
              <path d="M10 34 L60 10 L110 34 V96 L60 118 L10 96 Z" fill="#d8b88a" />
              <path d="M60 46 L110 34 V96 L60 118 Z" fill="#b8925f" />
              <path d="M10 34 L60 46 L60 118 L10 96 Z" fill="#c9a674" />
              <path d="M10 34 L60 10 L110 34 L60 46 Z" fill="#e8cfa6" />
              <path d="M18 56 L58 66 M18 74 L58 84" stroke="#8a6a3c" strokeOpacity="0.5" />
              <path d="M102 44 L64 55 M102 62 L64 73" stroke="#7a5c33" strokeOpacity="0.5" />
              <rect x="66" y="70" width="34" height="18" rx="2" fill="#0b1430" opacity="0.85" />
              <text x="70" y="82" fontSize="7" fontFamily="monospace" fill="#3fd6e8">
                HS 6109
              </text>
            </svg>
            {/* packaging bands */}
            <div ref={wrap} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
              <div
                className="absolute left-[6%] right-[6%] top-[42%] h-[6px] rounded bg-[#3fd6e8]/70"
                style={{ transform: 'scaleX(var(--wr,0))', transformOrigin: 'left' }}
              />
              <div
                className="absolute left-[30%] top-[10%] h-[80%] w-[6px] rounded bg-[#7b5cff]/70"
                style={{ transform: 'scaleY(var(--wr,0))', transformOrigin: 'top' }}
              />
            </div>
            {/* QC scan */}
            <div ref={scan} className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: 0 }}>
              <div
                className="absolute left-0 h-[2px] w-full bg-[#3fd6e8] shadow-[0_0_18px_4px_rgba(63,214,232,0.5)]"
                style={{ top: 'calc(var(--sy,0) * 100%)' }}
              />
              <div className="absolute inset-0 border border-[#3fd6e8]/40" />
              <div className="u-label absolute -right-2 top-0 translate-x-full text-[#3fd6e8]">QC PASS</div>
            </div>
          </div>
          </div>

          {/* delivered stamp */}
          <div className="pointer-events-none absolute -top-[18%] left-1/2 -translate-x-1/2">
            <div
              ref={stamp}
              className="rounded-[2px] border-2 border-[#3fd6e8] px-4 py-1.5"
              style={{ opacity: 0 }}
            >
              <span className="u-label text-[#3fd6e8]">Delivered</span>
            </div>
          </div>
        </div>
        </div>

        {/* ---------------- copy ---------------- */}
        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto h-full max-w-[1480px] px-5 md:px-9">
            <div className="absolute left-5 top-[12vh] md:left-9">
              <div className="u-label text-white/40">How global trade moves</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span ref={counter} className="font-mono text-[13px] text-[#3fd6e8]">
                  00%
                </span>
                <span ref={stageName} className="font-display text-[13px] tracking-[0.3em] text-white/70">
                  SOURCE
                </span>
              </div>
            </div>

            {STAGES.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => {
                  texts.current[i] = el;
                }}
                className="absolute bottom-[8vh] left-5 max-w-[420px] will-change-transform md:left-9"
                style={{ opacity: 0 }}
              >
                <div className="u-label mb-3 text-[#3fd6e8]">
                  {String(i + 1).padStart(2, '0')} / {N} · {s.key}
                </div>
                <h3 className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-light leading-[1.05] tracking-[-0.02em] text-white">
                  {s.title}
                </h3>
                <p className="mt-3 hidden text-[14px] leading-relaxed text-white/60 sm:block">{s.body}</p>
                <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                  {s.meta.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10.5px] text-white/60"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- stage rail ---------------- */}
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-4 md:flex">
          {STAGES.map((s, i) => (
            <div
              key={s.key}
              ref={(el) => {
                ticks.current[i] = el;
              }}
              className="flex items-center justify-end gap-3 transition-opacity"
              style={{ opacity: 0.4 }}
            >
              <span className="u-label text-white/70">{s.key}</span>
              <span className="relative block h-[2px] w-10 bg-white/20">
                <span
                  className="absolute inset-y-0 left-0 block bg-[#3fd6e8]"
                  style={{ width: 'calc(var(--fill,0) * 100%)' }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- scenery pieces ---------------- */
function Hills({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 300"
      preserveAspectRatio="none"
      className="absolute bottom-[22vh] left-0 h-[26vh] w-full opacity-45"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      fill="none"
    >
      <path d="M0 300 V240 L180 130 L330 230 L520 90 L720 240 L900 140 L1080 250 L1200 240 V300 Z" fill="#0d1636" />
      <path d="M0 300 V272 L220 200 L420 270 L640 190 L860 280 L1080 210 L1200 272 V300 Z" fill="#0a1128" />
    </svg>
  );
}

function Factory() {
  return (
    <div className="absolute bottom-[20vh] left-[12vw] h-[30vh] w-[52vw]">
      <svg viewBox="0 0 600 260" preserveAspectRatio="none" className="h-full w-full" fill="none">
        <path d="M20 260 V120 H140 V80 L200 120 V260 Z" fill="#0d1734" stroke="#27386e" />
        <path d="M200 260 V150 H340 V110 L420 150 V260 Z" fill="#0a1229" stroke="#22315f" />
        <rect x="430" y="60" width="26" height="200" fill="#0d1734" stroke="#27386e" />
        <rect x="476" y="96" width="20" height="164" fill="#0a1229" stroke="#22315f" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + i * 36} y={170} width={22} height={26} fill="#ffd79a" opacity="0.5" />
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={220 + i * 40} y={190} width={24} height={22} fill="#9fc0ff" opacity="0.35" />
        ))}
      </svg>
    </div>
  );
}

function SpecGrid() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-[46vh] w-[46vw] rounded-[2px] border border-white/10 u-grid-lines opacity-60" />
    </div>
  );
}

function ShelfRacks() {
  return (
    <div className="absolute bottom-[20vh] left-[8vw] h-[34vh] w-[76vw] opacity-70">
      <svg viewBox="0 0 900 300" preserveAspectRatio="none" className="h-full w-full" fill="none">
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={40 + r * 220} y={40} width={170} height={260} fill="none" stroke="#2b3d75" />
            {[0, 1, 2].map((s) => (
              <g key={s}>
                <rect x={40 + r * 220} y={40 + s * 86} width={170} height={6} fill="#2b3d75" />
                {[0, 1, 2].map((b) => (
                  <rect
                    key={b}
                    x={50 + r * 220 + b * 52}
                    y={52 + s * 86}
                    width={44}
                    height={30}
                    rx={2}
                    fill={['#1d2f6e', '#24398a', '#16255a'][(r + s + b) % 3]}
                  />
                ))}
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

function Highway() {
  return (
    <div className="absolute bottom-[20vh] left-[-64vw] h-[18vh] w-[200vw]">
      <div className="absolute bottom-[6vh] left-0 h-px w-full bg-white/10" />
      <div className="absolute bottom-[3vh] left-0 h-[3px] w-full overflow-hidden opacity-60">
        <div
          className="h-full w-[200%] dash-drift"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg,#3fd6e8 0 40px,transparent 40px 110px)',
            opacity: 0.45,
          }}
        />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="absolute" style={{ bottom: `${8 + i * 5}vh`, left: `${18 + i * 44}%` }}>
          <svg viewBox="0 0 120 40" className="h-[5vh] w-[16vw] opacity-40" fill="none">
            <rect x="2" y="12" width="70" height="20" rx="2" fill="#1b2b63" />
            <rect x="74" y="16" width="26" height="16" rx="2" fill="#24398a" />
            <circle cx="22" cy="34" r="5" fill="#0b1430" />
            <circle cx="86" cy="34" r="5" fill="#0b1430" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function PortCranes({ mirrored }: { mirrored?: boolean }) {
  return (
    <div
      className="absolute bottom-[20vh] left-0 h-[36vh] w-full"
      style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
    >
      {[6, 34, 62].map((l, i) => (
        <div
          key={l}
          className="absolute bottom-0 h-full"
          style={{ left: `${l}vw`, width: '26vw', opacity: 0.55 - i * 0.1, ['--h' as string]: 0.35 + i * 0.12 }}
        >
          <Crane className="h-full w-full" trolley={0.3 + i * 0.22} color="#6d84c2" cargoColor="#7b5cff" />
        </div>
      ))}
      <div className="absolute bottom-0 left-0 flex h-[6vh] w-full items-end gap-1 px-[4vw] opacity-60">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="block h-[2.4vh] flex-1 rounded-[1px]"
            style={{ background: ['#1d2f6e', '#24398a', '#2549f5', '#16255a'][i % 4], opacity: 0.8 }}
          />
        ))}
      </div>
    </div>
  );
}

function Horizon() {
  return (
    <div className="absolute inset-0">
      <div className="absolute bottom-[32vh] left-0 h-px w-full bg-gradient-to-r from-transparent via-[#3fd6e8]/40 to-transparent" />
      <div className="absolute bottom-[34vh] left-1/2 h-[16vh] w-[16vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(123,92,255,0.35),transparent_70%)]" />
    </div>
  );
}

function Truck() {
  return (
    <svg viewBox="0 0 420 150" className="h-auto w-full drop-shadow-[0_24px_36px_rgba(0,0,0,0.55)]" fill="none">
      <rect x="10" y="30" width="250" height="78" rx="4" fill="#132257" stroke="#2a3f86" />
      <rect x="18" y="38" width="234" height="20" fill="#fff" opacity="0.08" />
      <path d="M264 108 V52 H320 L356 84 V108 Z" fill="#1b2c67" stroke="#2a3f86" />
      <rect x="286" y="60" width="34" height="22" rx="2" fill="#9fc0ff" opacity="0.4" />
      <circle cx="80" cy="116" r="15" fill="#070d20" stroke="#31448a" />
      <circle cx="130" cy="116" r="15" fill="#070d20" stroke="#31448a" />
      <circle cx="320" cy="116" r="15" fill="#070d20" stroke="#31448a" />
      <text x="34" y="86" fontSize="11" fontFamily="monospace" fill="#3fd6e8" opacity="0.8" letterSpacing="3">
        MERIDIAN LAST MILE
      </text>
    </svg>
  );
}
