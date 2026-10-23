import * as THREE from "three";

/**
 * Convert geographic latitude & longitude (in degrees) to 3D Cartesian coordinates on a sphere
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Calculate the Euler rotation [rotX, rotY, rotZ] to center a given (lat, lon)
 * on the 3D globe facing directly towards the camera (+Z)
 */
export function latLonToTargetRotation(
  lat: number,
  lon: number
): [number, number, number] {
  // Latitude tilts around the X-axis
  const rotX = (lat * Math.PI) / 180;
  // Longitude rotates around the Y-axis (offset by -90 deg for prime meridian orientation)
  const rotY = -(lon * Math.PI) / 180 - Math.PI / 2;
  return [rotX, rotY, 0];
}

/**
 * Key global emergency intelligence & dispatch hubs (with Indian hubs highlighted)
 */
export interface GlobalHub {
  name: string;
  lat: number;
  lon: number;
  isPrimary?: boolean;
}

export const GLOBAL_EMERGENCY_HUBS: GlobalHub[] = [
  { name: "New Delhi 112 HQ", lat: 28.6139, lon: 77.209, isPrimary: true },
  { name: "Mumbai Emergency Control", lat: 19.076, lon: 72.8777, isPrimary: true },
  { name: "Pune Command Hub", lat: 18.5204, lon: 73.8567, isPrimary: true },
  { name: "Bengaluru Crisis Grid", lat: 12.9716, lon: 77.5946, isPrimary: true },
  { name: "Kolkata Disaster Node", lat: 22.5726, lon: 88.3639 },
  { name: "London Resilience Hub", lat: 51.5072, lon: -0.1276 },
  { name: "Tokyo Disaster Prevention", lat: 35.6762, lon: 139.6503 },
  { name: "Singapore Civil Defence", lat: 1.3521, lon: 103.8198 },
  { name: "Dubai Emergency Response", lat: 25.2048, lon: 55.2708 },
  { name: "Frankfurt EU Relay", lat: 50.1109, lon: 8.6821 },
  { name: "New York Crisis Center", lat: 40.7128, lon: -74.006 },
  { name: "San Francisco AI Core", lat: 37.7749, lon: -122.4194 },
  { name: "Sydney Pacific Node", lat: -33.8688, lon: 151.2093 },
  { name: "São Paulo South Hub", lat: -23.5505, lon: -46.6333 },
  { name: "Nairobi East Africa", lat: -1.2921, lon: 36.8219 },
];

/**
 * Pairs of hub indices forming 3D curved emergency signal arcs
 */
export const EMERGENCY_ARC_PAIRS: [number, number][] = [
  [0, 1], // Delhi <-> Mumbai
  [1, 2], // Mumbai <-> Pune
  [2, 3], // Pune <-> Bengaluru
  [0, 4], // Delhi <-> Kolkata
  [1, 8], // Mumbai <-> Dubai
  [8, 5], // Dubai <-> London
  [5, 9], // London <-> Frankfurt
  [3, 7], // Bengaluru <-> Singapore
  [7, 6], // Singapore <-> Tokyo
  [7, 12], // Singapore <-> Sydney
  [5, 10], // London <-> New York
  [10, 11], // New York <-> San Francisco
  [10, 13], // New York <-> São Paulo
  [8, 14], // Dubai <-> Nairobi
];

/**
 * Stylized [lon, lat] continent outlines for clean procedural rendering
 */
export const CONTINENT_POLYGONS: [number, number][][] = [
  // Africa
  [
    [-17, 15], [-13, 28], [-6, 36], [10, 37], [11, 33], [25, 32], [33, 31],
    [35, 22], [43, 12], [51, 12], [49, 5], [41, -2], [40, -11], [35, -18],
    [35, -25], [28, -33], [18, -35], [15, -22], [12, -6], [9, 4], [2, 6],
    [-8, 4], [-17, 15],
  ],
  // Eurasia (Europe + Asia + India Peninsula + SE Asia)
  [
    [-9, 38], [-9, 43], [-2, 44], [-4, 48], [2, 51], [8, 54], [10, 58],
    [5, 61], [15, 69], [28, 71], [40, 68], [60, 70], [85, 73], [115, 73],
    [145, 70], [175, 66], [170, 60], [158, 52], [142, 54], [135, 44],
    [129, 35], [122, 40], [118, 38], [122, 31], [120, 23], [109, 20],
    [108, 12], [103, 2], [100, 13], [96, 16], [91, 22], [87, 21],
    [80, 13], [77, 8], [73, 15], [72, 21], [67, 24], [61, 25], [56, 27],
    [50, 29], [48, 30], [56, 22], [59, 20], [44, 12], [41, 18], [35, 28],
    [36, 36], [27, 37], [26, 41], [23, 37], [20, 40], [16, 40], [12, 44],
    [15, 38], [8, 44], [3, 42], [-5, 36], [-9, 38],
  ],
  // North America
  [
    [-165, 65], [-140, 70], [-110, 73], [-80, 72], [-65, 62], [-55, 50],
    [-66, 44], [-75, 35], [-81, 25], [-83, 30], [-90, 29], [-97, 26],
    [-96, 19], [-88, 21], [-83, 10], [-78, 8], [-85, 11], [-94, 16],
    [-105, 20], [-112, 31], [-117, 32], [-124, 40], [-125, 48], [-135, 57],
    [-150, 60], [-162, 55], [-165, 65],
  ],
  // South America
  [
    [-77, 10], [-71, 12], [-61, 10], [-50, 1], [-35, -6], [-38, -14],
    [-40, -22], [-48, -26], [-53, -34], [-62, -39], [-66, -48], [-68, -55],
    [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -13], [-81, -5],
    [-78, 3], [-77, 10],
  ],
  // Australia
  [
    [114, -22], [122, -16], [131, -12], [136, -12], [136, -16], [142, -11],
    [146, -18], [153, -26], [150, -37], [140, -38], [135, -34], [129, -32],
    [122, -34], [115, -34], [114, -22],
  ],
  // Greenland
  [
    [-52, 60], [-42, 65], [-22, 71], [-18, 80], [-45, 83], [-68, 76],
    [-56, 68], [-52, 60],
  ],
  // United Kingdom
  [
    [-6, 50], [2, 51], [-2, 58], [-6, 57], [-6, 50],
  ],
  // Japan
  [
    [130, 32], [136, 34], [141, 39], [145, 43], [140, 42], [135, 36],
    [130, 32],
  ],
  // Indonesia / Borneo / Sumatra
  [
    [96, 5], [105, -6], [114, -8], [118, -2], [116, 6], [108, 3], [96, 5],
  ],
  // Madagascar
  [
    [44, -25], [47, -25], [50, -15], [48, -13], [44, -20], [44, -25],
  ],
  // New Zealand
  [
    [167, -46], [173, -41], [178, -37], [174, -36], [167, -46],
  ],
];

/**
 * Generates a high-contrast, stylized 3D Earth canvas texture with visible continents,
 * delicate coastlines, subtle dot-matrix landmasses, and latitude/longitude graticules.
 */
export function createStylizedEarthTexture(
  isLight: boolean,
  accentHex: string
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Ocean Base Fill
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
  if (isLight) {
    oceanGradient.addColorStop(0, "#e6eef8");
    oceanGradient.addColorStop(0.5, "#eef4fb");
    oceanGradient.addColorStop(1, "#e2ebf5");
  } else {
    oceanGradient.addColorStop(0, "#030711");
    oceanGradient.addColorStop(0.5, "#061022");
    oceanGradient.addColorStop(1, "#030711");
  }
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Latitude & Longitude Graticule Lines
  ctx.strokeStyle = isLight
    ? "rgba(14, 116, 144, 0.11)"
    : "rgba(34, 211, 238, 0.08)";
  ctx.lineWidth = 1.2;

  // Longitude lines every 20 degrees
  for (let lon = -180; lon <= 180; lon += 20) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Latitude lines every 15 degrees
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Equator highlight line
  ctx.strokeStyle = isLight
    ? "rgba(8, 145, 178, 0.24)"
    : "rgba(34, 211, 238, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Helper to convert [lon, lat] to canvas [x, y]
  const toXY = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // 3. Draw Stylized Continents
  ctx.save();
  for (const poly of CONTINENT_POLYGONS) {
    if (poly.length < 3) continue;
    ctx.beginPath();
    const [startX, startY] = toXY(poly[0][0], poly[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = toXY(poly[i][0], poly[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Continent interior fill
    ctx.fillStyle = isLight
      ? "rgba(100, 116, 139, 0.28)"
      : "rgba(14, 165, 233, 0.22)";
    ctx.fill();

    // Coastline rim glow
    ctx.strokeStyle = isLight ? "#0891b2" : accentHex;
    ctx.lineWidth = isLight ? 2.4 : 2.8;
    ctx.shadowColor = isLight ? "rgba(8, 145, 178, 0.35)" : accentHex;
    ctx.shadowBlur = isLight ? 4 : 10;
    ctx.stroke();
  }
  ctx.restore();

  // 4. Draw High-Tech Dot-Matrix Pattern Inside Continents
  // Create an offscreen mask to test land pixels or clip to continent paths
  ctx.save();
  ctx.beginPath();
  for (const poly of CONTINENT_POLYGONS) {
    if (poly.length < 3) continue;
    const [startX, startY] = toXY(poly[0][0], poly[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = toXY(poly[i][0], poly[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  ctx.clip();

  ctx.fillStyle = isLight
    ? "rgba(8, 145, 178, 0.52)"
    : "rgba(103, 232, 249, 0.65)";

  const step = 12;
  for (let x = step / 2; x < width; x += step) {
    for (let y = step / 2; y < height; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 5. Highlight Major Emergency Hub Rings on the Texture
  for (const hub of GLOBAL_EMERGENCY_HUBS) {
    const [hx, hy] = toXY(hub.lon, hub.lat);
    ctx.beginPath();
    ctx.arc(hx, hy, hub.isPrimary ? 7 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = hub.isPrimary
      ? isLight
        ? "#d97706"
        : "#fbbf24"
      : isLight
      ? "#0891b2"
      : "#22d3ee";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(hx, hy, hub.isPrimary ? 15 : 10, 0, Math.PI * 2);
    ctx.strokeStyle = hub.isPrimary
      ? isLight
        ? "rgba(217, 119, 6, 0.55)"
        : "rgba(251, 191, 36, 0.65)"
      : isLight
      ? "rgba(8, 145, 178, 0.45)"
      : "rgba(34, 211, 238, 0.5)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
