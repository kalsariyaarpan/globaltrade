import { useRef } from 'react';
import { useScene, seg, lerp, clamp, setT } from '../lib/scroll';
import { DotMap } from './MapStage';
import { Eyebrow } from './ui';

const CAPS = [
  {
    key: 'GLOBAL REACH',
    title: 'A network that already reaches your market',
    body: '25+ countries, 38 partner ports and vetted agents on both ends of every lane. Wherever your buyer is, we already move cargo there.',
    metric: '25+ markets',
  },
  {
    key: 'RELIABLE LOGISTICS',
    title: 'Routing built around your deadline',
    body: 'Multi-carrier booking, contingency routing and milestone tracking. If a lane slips, the alternative is already priced and ready.',
    metric: '4 carrier alliances',
  },
  {
    key: 'QUALITY CONTROL',
    title: 'Inspected before it is ever sealed',
    body: 'Pre-shipment inspection, container condition reports and photographic evidence uploaded before the seal number is issued.',
    metric: '11-point check',
  },
  {
    key: 'DOCUMENTATION',
    title: 'Paperwork that clears the first time',
    body: 'Bill of lading, certificates of origin, packing lists, LC compliance — prepared, cross-checked and lodged ahead of arrival.',
    metric: '100% accuracy',
  },
  {
    key: 'ON-TIME DELIVERY',
    title: 'Time is the only currency in freight',
    body: 'Live ETA monitoring against contractual windows, with escalation the moment a milestone drifts by more than six hours.',
    metric: '98.4% on time',
  },
];

const N = CAPS.length;

export default function Capabilities() {
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const visuals = useRef<(HTMLDivElement | null)[]>([]);
  const clockNum = useRef<HTMLSpanElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const bridge = useRef<HTMLDivElement>(null);

  const sectionRef = useScene<HTMLElement>('pin', (p) => {
    if (bridge.current) {
      const b = 1 - seg(p, 0, 0.05);
      bridge.current.style.opacity = String(b);
      bridge.current.style.display = b < 0.01 ? 'none' : 'block';
    }
    const intro = seg(p, 0, 0.08);
    setT(head.current, `translate3d(0,${lerp(24, 0, intro)}px,0)`, intro);
    setT(frame.current, `translate3d(0,${lerp(40, 0, intro)}px,0) scale(${lerp(0.96, 1, intro)})`, intro);

    const span = 1 / N;
    const idx = clamp(Math.floor(p / span), 0, N - 1);
    for (let i = 0; i < N; i++) {
      const s = i * span;
      const local = clamp((p - s) / span);
      const active = i === idx;
      const li = items.current[i];
      if (li) {
        li.style.setProperty('--on', active ? '1' : '0');
        li.style.setProperty('--k', String(active ? local : i < idx ? 1 : 0));
      }
      const v = visuals.current[i];
      if (v) {
        const a = active ? clamp(local * 6) * clamp((1 - local) * 6) : 0;
        v.style.opacity = String(Math.max(a, active ? 0.15 : 0));
        v.style.transform = `scale(${lerp(0.94, 1, a)}) translateY(${(1 - a) * 22}px)`;
        v.style.setProperty('--k', String(active ? local : i < idx ? 1 : 0));
        v.style.pointerEvents = active ? 'auto' : 'none';
      }
    }
    if (clockNum.current) {
      const local = idx === N - 1 ? clamp((p - (N - 1) * span) / span) : 0;
      const val = `${(96 + local * 2.4).toFixed(1)}%`;
      if (clockNum.current.textContent !== val) clockNum.current.textContent = val;
    }
  });

  return (
    <section
      ref={sectionRef as never}
      id="capabilities"
      data-nav-theme="light"
      data-scene-name="Capability"
      className="relative h-[340vh] bg-[#f6f7fb] text-[#070c1c] lg:h-[560vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* dissolve out of the dark ocean scenes into daylight */}
        <div ref={bridge} className="pointer-events-none absolute inset-0 z-30 bg-[#04060f]" />
        <div className="u-grid-dark absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_20%,rgba(37,73,245,0.07),transparent_60%)]" />

        <div className="relative mx-auto grid h-full max-w-[1480px] grid-cols-1 items-center gap-8 px-5 pt-[11vh] pb-8 md:px-9 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:pt-0">
          {/* ---------- list ---------- */}
          <div>
            <div ref={head} style={{ opacity: 0 }}>
              <Eyebrow index="06" tone="dark">
                Why teams choose Meridian
              </Eyebrow>
              <h2 className="mt-5 max-w-[520px] font-display text-[clamp(1.9rem,4vw,3.2rem)] font-light leading-[1.03] tracking-[-0.03em]">
                Five capabilities, <span className="text-[#2549f5]">engineered</span> into every shipment.
              </h2>
            </div>

            <div className="mt-8 flex flex-col">
              {CAPS.map((c, i) => (
                <div
                  key={c.key}
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  className="relative border-t border-[#0b1430]/10 py-4"
                  style={{ ['--on' as string]: 0, ['--k' as string]: 0 }}
                >
                  <span
                    className="absolute left-0 top-0 h-px bg-[#2549f5]"
                    style={{ width: 'calc(var(--k, 0) * 100%)' }}
                  />
                  <div className="flex items-baseline gap-4">
                    <span className="u-label w-8 shrink-0 text-[#0b1430]/35">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-display text-[clamp(1.05rem,1.9vw,1.5rem)] font-normal tracking-[-0.01em] text-[#070c1c] transition-opacity duration-500"
                        style={{ opacity: 'calc(0.32 + var(--on) * 0.68)' as unknown as number }}
                      >
                        {c.key}
                      </h3>
                      <div
                        className="overflow-hidden transition-[max-height,opacity] duration-[800ms] ease-[cubic-bezier(.22,.8,.3,1)]"
                        style={{
                          maxHeight: 'calc(var(--on) * 220px)',
                          opacity: 'var(--on)' as unknown as number,
                        }}
                      >
                        <div>
                          <p className="pt-2 max-w-[440px] text-[13.5px] leading-relaxed text-[#0b1430]/60">
                            {c.body}
                          </p>
                          <span className="mt-3 inline-block rounded-full bg-[#0b1430]/[0.06] px-3 py-1 font-mono text-[10.5px] tracking-wider text-[#2549f5]">
                            {c.metric}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-[#0b1430]/10" />
            </div>
          </div>

          {/* ---------- visual stage ---------- */}
          <div
            ref={frame}
            className="relative order-first aspect-[16/10] w-full overflow-hidden rounded-[4px] border border-[#0b1430]/10 bg-white shadow-[0_40px_90px_-50px_rgba(7,12,28,0.5)] lg:order-none lg:aspect-[4/3.1]"
            style={{ opacity: 0 }}
          >
            <div className="u-grid-dark absolute inset-0 opacity-60" />
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2549f5]" />
              <span className="u-label text-[#0b1430]/40">Meridian control layer</span>
            </div>

            {CAPS.map((c, i) => (
              <div
                key={c.key}
                ref={(el) => {
                  visuals.current[i] = el;
                }}
                className="absolute inset-0 will-change-transform"
                style={{ opacity: 0, ['--k' as string]: 0 }}
              >
                {i === 0 && <VisualReach />}
                {i === 1 && <VisualLogistics />}
                {i === 2 && <VisualQuality />}
                {i === 3 && <VisualDocs />}
                {i === 4 && <VisualTime numRef={clockNum} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- visuals (all driven by the --k custom property) ---------------- */

function VisualReach() {
  const markers = [
    [22, 42], [34, 30], [48, 36], [58, 26], [67, 44], [76, 33], [40, 58], [83, 60], [16, 55],
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div
        className="relative h-full w-full"
        style={{ transform: 'scale(calc(0.86 + var(--k) * 0.18))', transition: 'none' }}
      >
        <DotMap className="absolute inset-0 h-full w-full" color="#9aa9d4" accent="#2549f5" dotSize={1.05} opacity={0.75} />
        {markers.map(([x, y], i) => (
          <span
            key={i}
            className="absolute block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2549f5]"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              opacity: `calc((var(--k) - ${i * 0.07}) * 6)`,
              transform: `translate(-50%,-50%) scale(calc((var(--k) - ${i * 0.07}) * 6))`,
              boxShadow: '0 0 0 4px rgba(37,73,245,0.14)',
            }}
          />
        ))}
        <div
          className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2549f5]/30"
          style={{ transform: 'translate(-50%,-50%) scale(calc(0.3 + var(--k) * 1.5))', opacity: 'calc(1 - var(--k))' }}
        />
      </div>
    </div>
  );
}

function VisualLogistics() {
  return (
    <div className="absolute inset-0 p-8">
      <svg viewBox="0 0 400 300" className="h-full w-full" fill="none">
        <path
          d="M30 240 C 110 240, 120 120, 200 120 S 300 60, 370 60"
          stroke="#e3e7f5"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M30 240 C 110 240, 120 120, 200 120 S 300 60, 370 60"
          stroke="#2549f5"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: 'calc(1 - var(--k))' }}
        />
        {[
          [30, 240, 'PICKUP'],
          [130, 176, 'TERMINAL'],
          [200, 120, 'VESSEL'],
          [290, 84, 'CLEARANCE'],
          [370, 60, 'DELIVERY'],
        ].map(([x, y, l], i) => (
          <g key={l as string} style={{ opacity: `calc((var(--k) - ${i * 0.19}) * 8)` }}>
            <circle cx={x as number} cy={y as number} r="13" fill="#2549f5" opacity="0.10" />
            <circle cx={x as number} cy={y as number} r="4.5" fill="#fff" stroke="#2549f5" strokeWidth="2" />
            <text
              x={(x as number) + 10}
              y={(y as number) - 12}
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="1.4"
              fill="#0b1430"
              opacity="0.55"
            >
              {l as string}
            </text>
          </g>
        ))}
        <g style={{ transform: 'translateX(calc(var(--k) * 340px))' }}>
          <rect x="16" y="228" width="26" height="12" rx="2" fill="#7b5cff" />
        </g>
      </svg>
      <div className="absolute bottom-6 left-8 font-mono text-[11px] text-[#0b1430]/45">
        ROUTE LOCKED · CONTINGENCY READY
      </div>
    </div>
  );
}

function VisualQuality() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-10">
      <div className="relative w-full">
        <svg viewBox="0 0 320 150" className="w-full" fill="none">
          <rect x="8" y="20" width="304" height="110" rx="4" fill="#eef1fa" stroke="#c9d2ec" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={24 + i * 23} y="30" width="9" height="90" rx="2" fill="#d7ddf0" />
          ))}
          <rect x="8" y="20" width="304" height="110" rx="4" stroke="#2549f5" strokeOpacity="0.25" />
        </svg>
        {/* scanning beam */}
        <div
          className="pointer-events-none absolute left-0 h-[2px] w-full bg-[#2549f5]"
          style={{
            top: 'calc(14% + var(--k) * 72%)',
            boxShadow: '0 0 20px 4px rgba(37,73,245,0.35)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-[14%] bg-[#2549f5]/[0.07]"
          style={{ height: 'calc(var(--k) * 72%)' }}
        />
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
          {['Seal integrity', 'Moisture barrier', 'Load stability', 'Photo evidence'].map((t, i) => (
            <div
              key={t}
              className="flex items-center gap-2 text-[12px] text-[#0b1430]/70"
              style={{ opacity: `calc((var(--k) - ${0.12 + i * 0.18}) * 8)` }}
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="#2549f5" strokeWidth="2">
                <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualDocs() {
  const docs = [
    { t: 'BILL OF LADING', n: 'MTW-BL-4471' },
    { t: 'CERTIFICATE OF ORIGIN', n: 'COO-IN-8823' },
    { t: 'COMMERCIAL INVOICE', n: 'INV-2291' },
    { t: 'PACKING LIST', n: 'PL-4471-A' },
    { t: 'INSURANCE COVER', n: 'ICC-A 110%' },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative h-[78%] w-[62%]">
        {docs.map((d, i) => (
          <div
            key={d.t}
            className="absolute inset-0 rounded-[3px] border border-[#0b1430]/12 bg-white p-4 shadow-[0_20px_40px_-28px_rgba(7,12,28,0.6)]"
            style={{
              transform: `translate(calc(var(--k) * ${i * 13}px), calc(var(--k) * ${i * -16}px)) rotate(calc(var(--k) * ${(i - 2) * 2.4}deg))`,
              zIndex: docs.length - i,
              opacity: `calc(0.25 + (var(--k) - ${i * 0.06}) * 4)`,
            }}
          >
            <div className="flex items-start justify-between">
              <span className="u-label text-[#2549f5]">{d.t}</span>
              <span className="font-mono text-[9px] text-[#0b1430]/40">{d.n}</span>
            </div>
            <div className="mt-4 space-y-2">
              {[92, 76, 84, 58].map((w, j) => (
                <span key={j} className="block h-[5px] rounded bg-[#0b1430]/[0.07]" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3fd6e8]" />
              <span className="font-mono text-[9px] text-[#0b1430]/45">VERIFIED</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualTime({ numRef }: { numRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-10">
      <div className="relative h-[190px] w-[190px]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(#2549f5 calc(var(--k) * 352deg), rgba(11,20,48,0.08) calc(var(--k) * 352deg))',
          }}
        />
        <div className="absolute inset-[14px] rounded-full bg-white" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span ref={numRef} className="font-display text-3xl font-light text-[#070c1c]">
            96.0%
          </span>
          <span className="u-label mt-1 text-[#0b1430]/40">On time</span>
        </div>
        {/* sweeping hand */}
        <div
          className="absolute left-1/2 top-1/2 h-[74px] w-[2px] origin-bottom bg-[#7b5cff]"
          style={{ transform: 'translate(-50%,-100%) rotate(calc(var(--k) * 352deg))' }}
        />
      </div>
      <div className="w-full max-w-[340px] space-y-2.5">
        {[
          ['Booking', 'T-21d'],
          ['Gate in', 'T-9d'],
          ['Sailed', 'T-0'],
          ['Arrived', 'T+17d'],
          ['Delivered', 'T+19d'],
        ].map(([l, t], i) => (
          <div key={l} className="flex items-center gap-3">
            <span className="w-20 shrink-0 font-mono text-[10px] text-[#0b1430]/45">{l}</span>
            <span className="relative h-[3px] flex-1 rounded bg-[#0b1430]/[0.07]">
              <span
                className="absolute inset-y-0 left-0 rounded bg-[#2549f5]"
                style={{ width: `calc(clamp(0%, (var(--k) - ${i * 0.16}) * 400%, 100%))` }}
              />
            </span>
            <span className="w-12 text-right font-mono text-[10px] text-[#0b1430]/45">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
