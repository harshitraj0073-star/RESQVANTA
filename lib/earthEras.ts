import * as THREE from "three";

export interface GeologicalEra {
  id: string;
  progress: number; // 0.0 to 1.0
  title: string;
  subtitle: string;
  highlight: string;
  tagline: string;
  accentColor: string;
}

export const GEOLOGICAL_ERAS: GeologicalEra[] = [
  {
    id: "primordial",
    progress: 0.0,
    title: "13.8 billion years ago",
    subtitle: "Big Bang. The universe begins.",
    highlight: "Molten Magma Crust",
    tagline: "Scorched basalt and incandescent fissures",
    accentColor: "#f97316", // vivid orange
  },
  {
    id: "oceans",
    progress: 0.33,
    title: "4.4 billion years ago",
    subtitle: "First oceans. Steam falls as rain.",
    highlight: "Ocean Genesis",
    tagline: "Dense condensation and primary oceanic basins",
    accentColor: "#38bdf8", // cyan ocean
  },
  {
    id: "snowball",
    progress: 0.67,
    title: "650 million years ago",
    subtitle: "Snowball Earth. Ice reaches the equator.",
    highlight: "Cryogenian Glaciation",
    tagline: "Crystalline continental ice sheets and frozen seas",
    accentColor: "#e0f2fe", // glacial white-cyan
  },
  {
    id: "today",
    progress: 1.0,
    title: "Today",
    subtitle: "Earth. 8 billion people.",
    highlight: "Anthropocene & ResQvanta Grid",
    tagline: "Living biomes, interconnected continents, emergency grid",
    accentColor: "#22d3ee", // modern cyan
  },
];

/**
 * Creates high-performance procedural textures for each geological era
 */

// 1. Primordial Magma Texture (Dark basalt + glowing lava cracks)
export function createMagmaTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark obsidian basalt base
  ctx.fillStyle = "#120e0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Basalt grain noise
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const alpha = Math.random() * 0.18;
    ctx.fillStyle = `rgba(45, 35, 30, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Glowing incandescent lava fissures
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "rgba(255, 90, 20, 0.85)";
  ctx.shadowColor = "#ff4500";
  ctx.shadowBlur = 12;

  for (let branch = 0; branch < 35; branch++) {
    let px = Math.random() * canvas.width;
    let py = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(px, py);
    const steps = 18 + Math.floor(Math.random() * 25);
    for (let s = 0; s < steps; s++) {
      px += (Math.random() - 0.5) * 45;
      py += (Math.random() - 0.5) * 25;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Hot magma hotspots
  for (let h = 0; h < 60; h++) {
    const hx = Math.random() * canvas.width;
    const hy = Math.random() * canvas.height;
    const grad = ctx.createRadialGradient(hx, hy, 1, hx, hy, 18);
    grad.addColorStop(0, "rgba(255, 230, 100, 0.95)");
    grad.addColorStop(0.4, "rgba(255, 80, 0, 0.75)");
    grad.addColorStop(1, "rgba(255, 40, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hx, hy, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// 2. First Oceans Texture (Deep midnight slate-blue + swirling vapor cloud bands)
export function createSteamOceanTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep primordial ocean base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, "#081326");
  oceanGrad.addColorStop(0.5, "#0b1b36");
  oceanGrad.addColorStop(1, "#060f20");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Swirling steam and condensation cloud bands
  ctx.fillStyle = "rgba(200, 225, 255, 0.12)";
  for (let band = 0; band < 14; band++) {
    const cy = 40 + band * 32;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    for (let x = 0; x <= canvas.width; x += 30) {
      const yOffset = Math.sin(x * 0.015 + band) * 18 + Math.cos(x * 0.03) * 8;
      ctx.lineTo(x, cy + yOffset);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  // Secondary cloud vortices
  for (let c = 0; c < 45; c++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const radius = 25 + Math.random() * 60;
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
    grad.addColorStop(0, "rgba(230, 240, 255, 0.22)");
    grad.addColorStop(0.7, "rgba(180, 210, 245, 0.08)");
    grad.addColorStop(1, "rgba(180, 210, 245, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// 3. Snowball Earth Texture (Frosted glacial white-cyan + polar ice crevasses)
export function createIceEarthTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Crystalline ice sheet base
  const iceGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  iceGrad.addColorStop(0, "#ffffff");
  iceGrad.addColorStop(0.35, "#e8f4fc");
  iceGrad.addColorStop(0.5, "#d4ebf9");
  iceGrad.addColorStop(0.65, "#e8f4fc");
  iceGrad.addColorStop(1, "#ffffff");
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pale equatorial melt-fissures (where ice cracked near equator)
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(70, 140, 185, 0.45)";
  for (let f = 0; f < 30; f++) {
    let fx = Math.random() * canvas.width;
    let fy = canvas.height * 0.42 + (Math.random() - 0.5) * 80;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    for (let s = 0; s < 20; s++) {
      fx += (Math.random() - 0.5) * 35;
      fy += (Math.random() - 0.5) * 15;
      ctx.lineTo(fx, fy);
    }
    ctx.stroke();
  }

  // Glacial frost specular noise
  for (let i = 0; i < 25000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// 4. Modern Blue Marble Earth Texture (Living biomes, continents, oceans & atmosphere)
export function createModernEarthTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep ocean blue base
  ctx.fillStyle = "#0c2548";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ocean depth gradient
  const deepGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  deepGrad.addColorStop(0, "rgba(5, 15, 35, 0.7)");
  deepGrad.addColorStop(0.5, "rgba(18, 48, 92, 0.2)");
  deepGrad.addColorStop(1, "rgba(5, 15, 35, 0.7)");
  ctx.fillStyle = deepGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Continent landmass shapes (Stylized Africa, Eurasia, Americas, India)
  ctx.fillStyle = "#4a6741"; // Rich vegetation green
  ctx.strokeStyle = "#385232";
  ctx.lineWidth = 1.5;

  const drawPolygon = (points: [number, number][], fillStyle?: string) => {
    if (fillStyle) ctx.fillStyle = fillStyle;
    ctx.beginPath();
    points.forEach(([x, y], idx) => {
      const px = (x / 360) * canvas.width;
      const py = ((90 - y) / 180) * canvas.height;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Africa & Sahara desert biomes
  drawPolygon(
    [
      [-17, 35],
      [10, 37],
      [32, 31],
      [51, 12],
      [42, -5],
      [34, -25],
      [20, -35],
      [12, -20],
      [0, 5],
      [-17, 15],
    ],
    "#546e47"
  );
  // Sahara Desert gold
  drawPolygon(
    [
      [-15, 32],
      [10, 34],
      [30, 28],
      [35, 18],
      [15, 16],
      [-15, 20],
    ],
    "#a38953"
  );

  // Eurasia (Europe + Asia + India Peninsula)
  drawPolygon(
    [
      [-9, 36],
      [3, 48],
      [28, 41],
      [40, 56],
      [75, 70],
      [135, 68],
      [142, 50],
      [120, 25],
      [105, 10],
      [80, 15],
      [73, 20], // India west
      [78, 8],  // Kanyakumari
      [82, 18], // India east
      [60, 25],
      [35, 32],
    ],
    "#43633e"
  );

  // Americas (North & South)
  drawPolygon(
    [
      [-165, 65],
      [-130, 55],
      [-95, 50],
      [-75, 45],
      [-80, 25],
      [-105, 20],
      [-120, 35],
    ],
    "#415e3c"
  );
  drawPolygon(
    [
      [-80, 10],
      [-50, -2],
      [-35, -7],
      [-40, -22],
      [-55, -45],
      [-70, -55],
      [-75, -20],
    ],
    "#385734"
  );

  // Australia
  drawPolygon(
    [
      [114, -22],
      [135, -12],
      [153, -28],
      [145, -38],
      [115, -35],
    ],
    "#826f49"
  );

  // Dynamic atmospheric cloud wisps
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  for (let i = 0; i < 35; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const w = 40 + Math.random() * 120;
    const h = 12 + Math.random() * 28;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w, h, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Resolves active geological era given normalized scrub progress t in [0, 1]
 */
export function resolveEra(progress: number): {
  currentEra: GeologicalEra;
  nextEra: GeologicalEra;
  blendFactor: number;
} {
  const clamped = Math.max(0, Math.min(1, progress));
  const count = GEOLOGICAL_ERAS.length;

  if (clamped >= 1.0) {
    return {
      currentEra: GEOLOGICAL_ERAS[count - 1],
      nextEra: GEOLOGICAL_ERAS[count - 1],
      blendFactor: 0,
    };
  }

  const segment = 1 / (count - 1);
  const index = Math.floor(clamped / segment);
  const localT = (clamped - index * segment) / segment;

  return {
    currentEra: GEOLOGICAL_ERAS[index],
    nextEra: GEOLOGICAL_ERAS[Math.min(count - 1, index + 1)],
    blendFactor: localT,
  };
}
