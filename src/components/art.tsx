import React from 'react';

export const CONTAINER_COLORS = ['#2549f5', '#7b5cff', '#3fd6e8', '#e8ecff', '#1c336b', '#4f6dff'];

/* ---------------- Side-view container ship ---------------- */
export function ShipSide({
  load = 1,
  className = '',
  idPrefix = 's',
}: {
  load?: number;
  className?: string;
  idPrefix?: string;
}) {
  const cols = 9;
  const rows = 3;
  const boxes: React.ReactElement[] = [];
  const total = cols * rows;
  let i = 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const idx = i++;
      // fill order: bottom rows first, from stern to bow
      const order = c * rows + r;
      const t = Math.min(1, Math.max(0, load * total - order));
      const x = 74 + c * 19;
      const y = 52 - r * 11;
      boxes.push(
        <g key={idx} data-box="" style={{ opacity: t, transform: `translateY(${(1 - t) * -14}px)` }}>
          <rect
            x={x}
            y={y}
            width={17}
            height={9.5}
            rx={1}
            fill={CONTAINER_COLORS[(c + r * 2) % CONTAINER_COLORS.length]}
            opacity={0.95}
          />
          <rect x={x} y={y} width={17} height={2} rx={1} fill="#fff" opacity={0.14} />
        </g>
      );
    }
  }
  return (
    <svg viewBox="0 0 270 110" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${idPrefix}-hull`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12204a" />
          <stop offset="60%" stopColor="#0a1330" />
          <stop offset="100%" stopColor="#060b1e" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-deck`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#233b8e" />
          <stop offset="100%" stopColor="#16255a" />
        </linearGradient>
      </defs>
      {/* containers */}
      <g>{boxes}</g>
      {/* bridge */}
      <g>
        <rect x="34" y="28" width="32" height="34" rx="2" fill="#dfe6ff" />
        <rect x="34" y="28" width="32" height="7" rx="2" fill="#2549f5" opacity="0.85" />
        <g fill="#0b1430" opacity="0.55">
          <rect x="38" y="40" width="5" height="3.4" rx="0.6" />
          <rect x="46" y="40" width="5" height="3.4" rx="0.6" />
          <rect x="54" y="40" width="5" height="3.4" rx="0.6" />
          <rect x="38" y="48" width="5" height="3.4" rx="0.6" />
          <rect x="46" y="48" width="5" height="3.4" rx="0.6" />
          <rect x="54" y="48" width="5" height="3.4" rx="0.6" />
        </g>
        <rect x="43" y="14" width="12" height="14" rx="2" fill="#0f1c44" />
        <rect x="43" y="14" width="12" height="4" rx="1.6" fill="#7b5cff" />
      </g>
      {/* hull */}
      <path
        d="M12 62 H250 L266 74 L244 96 C162 104 80 104 30 95 L14 74 Z"
        fill={`url(#${idPrefix}-hull)`}
      />
      <path d="M12 62 H250 L254 66 H14 Z" fill="#2549f5" opacity="0.5" />
      <path
        d="M16 84 H244"
        stroke="#3fd6e8"
        strokeOpacity="0.35"
        strokeWidth="1.4"
        strokeDasharray="3 6"
      />
      <text x="150" y="82" fontSize="9" fill="#ffffff" opacity="0.5" fontFamily="monospace" letterSpacing="2">
        MERIDIAN
      </text>
    </svg>
  );
}

/* ---------------- Top-down ship glyph for maps ---------------- */
export function ShipGlyph({ size = 14, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="-8 -8 16 16" aria-hidden>
      <path d="M7 0 L-5 -4.4 L-2.6 0 L-5 4.4 Z" fill={color} />
    </svg>
  );
}

/* ---------------- Single container ---------------- */
export function ContainerBox({
  w = 120,
  h = 56,
  color = '#2549f5',
  label = 'MTW 4471 92',
  open = 0,
  className = '',
}: {
  w?: number;
  h?: number;
  color?: string;
  label?: string;
  open?: number;
  className?: string;
}) {
  const ribs = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg viewBox="0 0 120 56" width={w} height={h} className={className} fill="none" aria-hidden>
      <rect x="1" y="4" width="118" height="48" rx="2" fill={color} />
      <rect x="1" y="4" width="118" height="48" rx="2" fill="url(#cbShade)" />
      <defs>
        <linearGradient id="cbShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      {ribs.map((i) => (
        <rect key={i} x={12 + i * 11} y="8" width="4.5" height="40" rx="1" fill="#000" opacity="0.13" />
      ))}
      <rect x="1" y="4" width="118" height="48" rx="2" stroke="#000" strokeOpacity="0.25" />
      <text x="8" y="49" fontSize="5" fill="#fff" opacity="0.8" fontFamily="monospace" letterSpacing="1">
        {label}
      </text>
      {/* right doors opening */}
      <g style={{ transform: `perspective(200px) rotateY(${-open * 62}deg)`, transformOrigin: '119px 28px' }}>
        <rect x="96" y="4" width="23" height="48" rx="2" fill={color} />
        <rect x="96" y="4" width="23" height="48" rx="2" fill="#000" opacity="0.12" />
        <rect x="104" y="12" width="2" height="32" rx="1" fill="#000" opacity="0.3" />
        <rect x="110" y="12" width="2" height="32" rx="1" fill="#000" opacity="0.3" />
      </g>
    </svg>
  );
}

/* ---------------- Port crane ---------------- */
export function Crane({
  className = '',
  trolley = 0.5,
  color = '#8fa3d8',
  cargoColor = '#2549f5',
}: {
  className?: string;
  trolley?: number;
  color?: string;
  cargoColor?: string;
}) {
  const tx = 18 + trolley * 78;
  return (
    <svg viewBox="0 0 130 140" className={className} fill="none" aria-hidden>
      <g stroke={color} strokeWidth="2.4" strokeLinecap="round">
        <path d="M30 140 V52" />
        <path d="M78 140 V52" />
        <path d="M30 140 H22 M78 140 H86" />
        <path d="M10 52 H122" />
        <path d="M46 52 V26 H84 V52" />
        <path d="M46 26 L14 52 M84 26 L118 52" strokeOpacity="0.5" />
        <path d="M30 96 H78" strokeOpacity="0.6" />
      </g>
      {/* hoist driven by the inherited --h custom property (0..1) */}
      <g>
        <rect x={tx - 7} y="46" width="14" height="9" rx="2" fill={color} />
        <rect
          x={tx - 0.6}
          y="55"
          width="1.2"
          height="62"
          fill={color}
          style={{ transform: 'scaleY(var(--h, 0))', transformOrigin: `${tx}px 55px` }}
        />
        <g style={{ transform: 'translateY(calc(var(--h, 0) * 62px))' }}>
          <rect x={tx - 13} y="55" width="26" height="4" rx="1" fill={color} />
          <rect x={tx - 11} y="59" width="22" height="10" rx="1.5" fill={cargoColor} />
        </g>
      </g>
    </svg>
  );
}

/* ---------------- Warehouse silhouette ---------------- */
export function WarehouseArt({ className = '', lights = 1 }: { className?: string; lights?: number }) {
  return (
    <svg viewBox="0 0 420 180" className={className} fill="none" aria-hidden>
      <path d="M10 180 V70 L120 28 L230 70 V180 Z" fill="#0c1533" stroke="#24356e" />
      <path d="M230 180 V92 L320 60 L410 92 V180 Z" fill="#0a1229" stroke="#24356e" />
      <g opacity={lights}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={34 + i * 46} y={96} width={30} height={22} rx={2} fill="#ffd79a" opacity="0.65" />
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={250 + i * 46} y={112} width={26} height={18} rx={2} fill="#9fc0ff" opacity="0.5" />
        ))}
      </g>
      <g stroke="#3a4f92" strokeWidth="1.5">
        <rect x="40" y="132" width="52" height="48" rx="2" fill="#070d20" />
        <rect x="120" y="132" width="52" height="48" rx="2" fill="#070d20" />
      </g>
    </svg>
  );
}

/* ---------------- City skyline ---------------- */
export function CityArt({ className = '', lit = 1 }: { className?: string; lit?: number }) {
  const towers = [
    [0, 120, 46], [50, 76, 34], [88, 150, 40], [132, 96, 30], [166, 186, 44], [214, 110, 36],
    [254, 160, 30], [288, 70, 40], [332, 128, 34], [370, 92, 46],
  ];
  return (
    <svg viewBox="0 0 420 200" className={className} fill="none" aria-hidden>
      {towers.map(([x, h, w], i) => (
        <g key={i}>
          <rect x={x} y={200 - h} width={w} height={h} fill="#0a1128" stroke="#1d2a58" />
          {Array.from({ length: Math.floor(h / 16) }, (_, r) => (
            <g key={r}>
              {Array.from({ length: Math.max(1, Math.floor(w / 14)) }, (_, c) => (
                <rect
                  key={c}
                  x={x + 5 + c * 14}
                  y={200 - h + 8 + r * 16}
                  width={6}
                  height={7}
                  fill={(i + r + c) % 3 === 0 ? '#7b5cff' : '#9fc0ff'}
                  opacity={((i * 7 + r * 3 + c) % 5) / 6 * lit}
                />
              ))}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ---------------- Ocean waves (parallax layers) ---------------- */
export function WaveLayer({
  className = '',
  color = '#0b1a44',
  opacity = 1,
}: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={className} style={{ opacity }} aria-hidden>
      <path
        d="M0 60 C 120 30, 240 90, 360 60 S 600 30, 720 60 S 960 90, 1080 60 S 1320 30, 1440 60 V120 H0 Z"
        fill={color}
      />
    </svg>
  );
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
