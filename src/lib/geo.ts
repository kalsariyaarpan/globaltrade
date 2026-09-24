/* Minimal hand-authored world geometry (equirectangular lon/lat).
   Used to rasterise a premium dot-matrix map onto a canvas. */

export type LL = [number, number]; // [lon, lat]

const LAND: LL[][] = [
  // North America
  [
    [-168, 66], [-162, 70], [-148, 70], [-133, 69], [-124, 70], [-112, 68], [-96, 69], [-88, 72],
    [-80, 73], [-74, 68], [-64, 60], [-56, 53], [-66, 48], [-70, 44], [-74, 40], [-78, 34],
    [-81, 26], [-83, 29], [-89, 30], [-94, 29], [-97, 26], [-101, 22], [-106, 23], [-110, 24],
    [-114, 30], [-121, 35], [-124, 42], [-125, 48], [-131, 54], [-138, 59], [-148, 60],
    [-153, 58], [-162, 59], [-166, 62],
  ],
  // Greenland
  [[-45, 60], [-32, 66], [-22, 70], [-20, 76], [-30, 82], [-45, 83], [-58, 82], [-56, 74], [-53, 66]],
  // Iceland
  [[-24, 65], [-18, 66], [-14, 65], [-17, 63], [-22, 63]],
  // South America
  [
    [-78, 8], [-72, 11], [-62, 10], [-52, 5], [-44, -2], [-35, -6], [-39, -13], [-48, -25],
    [-54, -34], [-62, -40], [-66, -47], [-69, -53], [-74, -51], [-73, -42], [-71, -32],
    [-70, -20], [-75, -14], [-79, -5], [-80, 0],
  ],
  // Africa
  [
    [-17, 15], [-12, 24], [-3, 31], [10, 37], [20, 33], [30, 31], [34, 27], [39, 16], [43, 11],
    [51, 12], [47, 2], [41, -6], [40, -15], [35, -21], [32, -26], [27, -34], [19, -35],
    [13, -23], [9, -5], [5, 5], [-4, 5], [-12, 8],
  ],
  // Madagascar
  [[44, -12], [50, -15], [48, -25], [44, -22]],
  // Europe
  [
    [-9, 43], [-9, 37], [-1, 37], [8, 39], [16, 39], [20, 40], [24, 36], [29, 41], [30, 46],
    [38, 47], [48, 47], [54, 52], [58, 58], [48, 66], [33, 67], [30, 70], [22, 70], [14, 65],
    [11, 59], [6, 53], [-2, 49], [-6, 45],
  ],
  // British Isles
  [[-5, 50], [1, 51], [0, 54], [-2, 58], [-6, 58], [-9, 55], [-6, 51]],
  // Asia (main)
  [
    [30, 46], [38, 47], [44, 40], [50, 38], [53, 30], [57, 24], [63, 25], [68, 24], [72, 20],
    [73, 16], [77, 8], [81, 12], [88, 21], [92, 21], [95, 16], [99, 8], [104, 2], [106, 11],
    [109, 15], [111, 21], [118, 23], [122, 31], [122, 39], [127, 41], [131, 44], [136, 49],
    [142, 54], [152, 59], [162, 61], [170, 66], [179, 68], [179, 72], [160, 72], [140, 74],
    [120, 76], [100, 77], [80, 75], [66, 72], [58, 69], [50, 67], [48, 66], [58, 58], [54, 52],
    [48, 47],
  ],
  // Japan
  [[130, 32], [136, 35], [141, 40], [145, 44], [142, 45], [138, 37], [133, 33]],
  // Philippines
  [[120, 18], [124, 14], [126, 8], [122, 7], [119, 12]],
  // Sumatra / Java
  [[95, 5], [101, 1], [106, -6], [115, -8], [108, -5], [99, 1]],
  // Borneo
  [[109, 2], [117, 5], [119, -3], [111, -3]],
  // Sulawesi
  [[119, 1], [125, 1], [124, -5], [120, -4]],
  // New Guinea
  [[131, -1], [141, -3], [150, -9], [141, -9], [133, -5]],
  // Australia
  [
    [114, -22], [114, -33], [120, -34], [129, -32], [138, -35], [145, -38], [150, -37],
    [153, -28], [146, -19], [142, -11], [136, -12], [130, -11], [126, -14], [121, -18],
  ],
  // Tasmania
  [[145, -41], [148, -41], [147, -43], [145, -43]],
  // New Zealand
  [[172, -41], [175, -37], [178, -38], [174, -42], [168, -46], [166, -45]],
  // Sri Lanka
  [[80, 9], [82, 8], [81, 6], [80, 7]],
];

/* view window of the map */
export const VIEW = { lon0: -170, lon1: 179, lat0: 79, lat1: -56 };

export function project(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lon - VIEW.lon0) / (VIEW.lon1 - VIEW.lon0)) * w;
  const y = ((VIEW.lat0 - lat) / (VIEW.lat0 - VIEW.lat1)) * h;
  return [x, y];
}

function inPoly(lon: number, lat: number, poly: LL[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function isLand(lon: number, lat: number) {
  for (let i = 0; i < LAND.length; i++) if (inPoly(lon, lat, LAND[i])) return true;
  return false;
}

/** Returns dot positions in 0..1 normalised space */
export function landDots(stepDeg = 2.1) {
  const pts: { x: number; y: number; lon: number; lat: number }[] = [];
  for (let lat = VIEW.lat0; lat > VIEW.lat1; lat -= stepDeg) {
    for (let lon = VIEW.lon0; lon < VIEW.lon1; lon += stepDeg) {
      if (isLand(lon, lat)) {
        const [x, y] = project(lon, lat, 1, 1);
        pts.push({ x, y, lon, lat });
      }
    }
  }
  return pts;
}

/* ---------------- ports & routes ---------------- */
export type Port = { id: string; name: string; country: string; ll: LL; kind?: 'origin' | 'hub' | 'dest' };

export const PORTS: Port[] = [
  { id: 'mundra', name: 'Mundra', country: 'India', ll: [69.7, 22.8], kind: 'origin' },
  { id: 'nhava', name: 'Nhava Sheva', country: 'India', ll: [72.9, 18.9], kind: 'origin' },
  { id: 'chennai', name: 'Chennai', country: 'India', ll: [80.3, 13.1], kind: 'origin' },
  { id: 'jebel', name: 'Jebel Ali', country: 'UAE', ll: [55.1, 25.0], kind: 'hub' },
  { id: 'singapore', name: 'Singapore', country: 'SG', ll: [103.8, 1.3], kind: 'hub' },
  { id: 'rotterdam', name: 'Rotterdam', country: 'Netherlands', ll: [4.4, 51.9], kind: 'dest' },
  { id: 'hamburg', name: 'Hamburg', country: 'Germany', ll: [10, 53.5], kind: 'dest' },
  { id: 'newyork', name: 'New York', country: 'USA', ll: [-74, 40.7], kind: 'dest' },
  { id: 'losangeles', name: 'Los Angeles', country: 'USA', ll: [-118.2, 33.7], kind: 'dest' },
  { id: 'santos', name: 'Santos', country: 'Brazil', ll: [-46.3, -24], kind: 'dest' },
  { id: 'durban', name: 'Durban', country: 'South Africa', ll: [31, -29.8], kind: 'dest' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', ll: [151.2, -33.8], kind: 'dest' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', ll: [121.5, 31.2], kind: 'hub' },
];

export const portById = (id: string) => PORTS.find((p) => p.id === id)!;

/** Curved arc path (quadratic) between two lon/lat points in projected space */
export function arcPath(a: LL, b: LL, w: number, h: number, bend = 0.18) {
  const [x1, y1] = project(a[0], a[1], w, h);
  const [x2, y2] = project(b[0], b[1], w, h);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  // perpendicular offset, always bending "north"
  const nx = -dy / (len || 1);
  const ny = dx / (len || 1);
  const dir = x2 >= x1 ? 1 : -1;
  const cx = mx + nx * len * bend * dir;
  const cy = my + ny * len * bend * dir;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function multiArc(points: LL[], w: number, h: number, bend = 0.16) {
  return points
    .slice(0, -1)
    .map((p, i) => arcPath(p, points[i + 1], w, h, bend))
    .join(' ');
}
