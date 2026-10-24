"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, ContactShadows, Line } from "@react-three/drei";
import * as THREE from "three";
import { SeverityLevel } from "@/types/triage";
import { UIStrings } from "@/lib/translations";
import {
  HIGH_FIDELITY_CONTINENTS,
  GLOBAL_EMERGENCY_HUBS,
  EMERGENCY_ARC_PAIRS,
} from "@/lib/earthContinents";
import {
  GROUNDED_CITIES,
  resolveTargetCity,
  getSurfaceOrientation,
  latLonToSphereVector3,
  latLonToCameraEuler,
} from "@/lib/geospatial";
import { CORE_HOTSPOTS } from "./HolographicCore";

interface PhotorealisticEarthSceneProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
  theme: "light" | "dark";
  activeHotspot: string | null;
  onSelectHotspot: (id: string | null) => void;
  t: UIStrings;
  gpsCoords?: string | null;
  flyoverStage?: "space" | "country" | "city";
}

const EARTH_RADIUS = 1.38;

// Fast deterministic 2D fractal noise for realistic satellite terrain, clouds & coastlines
function hash2D(ix: number, iy: number): number {
  let n = ix * 374761393 + iy * 668265263;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function valueNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise2D(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return val;
}

/**
 * Generates an authentic NASA Blue Marble satellite texture with organic fractal terrain,
 * realistic bathymetry, snow-capped Himalayas, Thar/Sahara desert sands, lush rainforests,
 * and dynamic atmospheric cloud wisps — with zero artificial cartoon outlines.
 */
function createPhotorealisticBlueMarbleTextures(isLight: boolean): {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture;
} {
  if (typeof document === "undefined") {
    const dummy = new THREE.CanvasTexture({} as HTMLCanvasElement);
    return {
      colorMap: dummy,
      roughnessMap: dummy,
      bumpMap: dummy,
      cloudsMap: dummy,
    };
  }

  const width = 512;
  const height = 256;

  // 1. Rasterize Base Continent Mask on offscreen canvas with organic edge feathering
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mCtx = maskCanvas.getContext("2d")!;
  mCtx.fillStyle = "#000000";
  mCtx.fillRect(0, 0, width, height);

  const toXY = (lon: number, lat: number): [number, number] => [
    ((lon + 180) / 360) * width,
    ((90 - lat) / 180) * height,
  ];

  mCtx.save();
  mCtx.fillStyle = "#ffffff";
  for (const poly of HIGH_FIDELITY_CONTINENTS) {
    if (poly.length < 3) continue;
    mCtx.beginPath();
    const [sx, sy] = toXY(poly[0][0], poly[0][1]);
    mCtx.moveTo(sx, sy);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = toXY(poly[i][0], poly[i][1]);
      mCtx.lineTo(px, py);
    }
    mCtx.closePath();
    mCtx.fill();
  }
  mCtx.restore();

  const maskData = mCtx.getImageData(0, 0, width, height).data;

  // Prepare output canvases
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext("2d")!;
  const colorImg = ctx.createImageData(width, height);
  const cData = colorImg.data;

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext("2d")!;
  const roughImg = rCtx.createImageData(width, height);
  const rData = roughImg.data;

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext("2d")!;
  const bumpImg = bCtx.createImageData(width, height);
  const bData = bumpImg.data;

  const cloudsCanvas = document.createElement("canvas");
  cloudsCanvas.width = width;
  cloudsCanvas.height = height;
  const clCtx = cloudsCanvas.getContext("2d")!;
  const cloudsImg = clCtx.createImageData(width, height);
  const clData = cloudsImg.data;

  // Pixel-level satellite shader synthesis
  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180; // +90 (North) to -90 (South)
    const absLat = Math.abs(lat);
    const ny = y / height;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180; // -180 to +180
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Multi-scale fractal terrain noise
      const n1 = fbm(nx * 14, ny * 7, 5);
      const n2 = fbm(nx * 36 + 5.2, ny * 18 + 1.7, 4);
      const coastNoise = (n1 - 0.5) * 0.34 + (n2 - 0.5) * 0.14;

      const baseMask = maskData[idx] / 255;
      const landFactor = baseMask + coastNoise * (baseMask > 0.05 && baseMask < 0.95 ? 1.15 : 0.15);

      if (landFactor > 0.46) {
        // ==================== TERRESTRIAL SATELLITE BIOMES ====================
        const elevation = Math.min(1, Math.max(0, (landFactor - 0.46) * 1.8 + (n2 - 0.45) * 0.6));

        // Base vegetation green (Rich satellite forest / plains)
        let r = 42;
        let g = 86;
        let b = 45;

        // Arid Desert Belts (Sahara, Arabian, Thar, Australian Outback, Gobi)
        const isDesertBelt =
          (lat > 12 && lat < 33 && lon > -18 && lon < 76) || // Sahara + Arabia + Thar
          (lat > 34 && lat < 46 && lon > 55 && lon < 108) || // Central Asia / Gobi
          (lat < -18 && lat > -32 && lon > 114 && lon < 142); // Australia Outback

        if (isDesertBelt && n1 > 0.38) {
          const desertMix = Math.min(1, (n1 - 0.35) * 2.1);
          const sandR = 186 + (n2 - 0.5) * 35;
          const sandG = 154 + (n2 - 0.5) * 28;
          const sandB = 104 + (n2 - 0.5) * 20;
          r = r * (1 - desertMix) + sandR * desertMix;
          g = g * (1 - desertMix) + sandG * desertMix;
          b = b * (1 - desertMix) + sandB * desertMix;
        }

        // Lush Tropical & Indo-Gangetic / Western Ghats Canopy
        if (absLat < 24 && !isDesertBelt) {
          r = 32 + n2 * 22;
          g = 78 + n1 * 28;
          b = 34 + n2 * 16;
        }

        // High Mountain Chains (Himalayas / Tibetan Plateau / Andes / Rockies)
        const isHimalayas =
          lat > 26 && lat < 38 && lon > 72 && lon < 102 && n1 > 0.42;
        if (isHimalayas || elevation > 0.78) {
          const snowMix = isHimalayas
            ? Math.min(1, (n1 - 0.4) * 2.2)
            : Math.min(1, (elevation - 0.75) * 3.0);
          r = r * (1 - snowMix) + 238 * snowMix;
          g = g * (1 - snowMix) + 243 * snowMix;
          b = b * (1 - snowMix) + 248 * snowMix;
        }

        // Polar Ice Caps (Arctic & Antarctica)
        if (absLat > 66 + (n1 - 0.5) * 8) {
          const iceMix = Math.min(1, (absLat - 64) / 10);
          r = r * (1 - iceMix) + 242 * iceMix;
          g = g * (1 - iceMix) + 247 * iceMix;
          b = b * (1 - iceMix) + 252 * iceMix;
        }

        cData[idx] = Math.min(255, Math.max(0, r));
        cData[idx + 1] = Math.min(255, Math.max(0, g));
        cData[idx + 2] = Math.min(255, Math.max(0, b));
        cData[idx + 3] = 255;

        // Land is matte (high roughness ~215)
        rData[idx] = 215;
        rData[idx + 1] = 215;
        rData[idx + 2] = 215;
        rData[idx + 3] = 255;

        // Topographic Bump height
        const bumpVal = Math.min(255, Math.floor(128 + elevation * 120));
        bData[idx] = bumpVal;
        bData[idx + 1] = bumpVal;
        bData[idx + 2] = bumpVal;
        bData[idx + 3] = 255;
      } else {
        // ==================== BATHYMETRIC SATELLITE OCEANS ====================
        const coastalShelf = Math.max(0, (landFactor - 0.22) / 0.24);
        const depthNoise = (n1 - 0.5) * 14;

        const baseOceanR = isLight ? 10 : 7;
        const baseOceanG = isLight ? 38 : 28;
        const baseOceanB = isLight ? 78 : 62;

        // Shallow turquoise continental shelf (Maldives, Konkan, Caribbean, etc.)
        const r = baseOceanR + coastalShelf * 18 + depthNoise * 0.4;
        const g = baseOceanG + coastalShelf * 62 + depthNoise * 0.8;
        const b = baseOceanB + coastalShelf * 75 + depthNoise * 1.1;

        cData[idx] = Math.min(255, Math.max(0, r));
        cData[idx + 1] = Math.min(255, Math.max(0, g));
        cData[idx + 2] = Math.min(255, Math.max(0, b));
        cData[idx + 3] = 255;

        // Ocean has glossy specular reflection (low roughness ~42)
        rData[idx] = 42;
        rData[idx + 1] = 42;
        rData[idx + 2] = 42;
        rData[idx + 3] = 255;

        // Flat sea level bump
        bData[idx] = 110;
        bData[idx + 1] = 110;
        bData[idx + 2] = 110;
        bData[idx + 3] = 255;
      }

      // ==================== DYNAMIC WEATHER CLOUD LAYER ====================
      const cNoise = fbm(nx * 9 + Math.sin(ny * 6) * 0.35, ny * 6, 5);
      const cloudDensity = Math.max(0, (cNoise - 0.52) * 2.6);
      clData[idx] = 255;
      clData[idx + 1] = 255;
      clData[idx + 2] = 255;
      clData[idx + 3] = Math.min(210, Math.floor(cloudDensity * 225));
    }
  }

  ctx.putImageData(colorImg, 0, 0);
  rCtx.putImageData(roughImg, 0, 0);
  bCtx.putImageData(bumpImg, 0, 0);
  clCtx.putImageData(cloudsImg, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.anisotropy = 8;
  colorMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
  roughnessMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.needsUpdate = true;

  const cloudsMap = new THREE.CanvasTexture(cloudsCanvas);
  cloudsMap.wrapS = THREE.RepeatWrapping;
  cloudsMap.wrapT = THREE.ClampToEdgeWrapping;
  cloudsMap.needsUpdate = true;

  return { colorMap, roughnessMap, bumpMap, cloudsMap };
}

export function PhotorealisticEarthScene({
  status,
  viewMode,
  theme,
  activeHotspot,
  onSelectHotspot,
  t,
  gpsCoords,
  flyoverStage = "city",
}: PhotorealisticEarthSceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const earthRotationGroupRef = useRef<THREE.Group>(null!);
  const cloudsMeshRef = useRef<THREE.Mesh>(null!);
  const signalPulsesRef = useRef<THREE.Group>(null!);

  // Inertial mouse pointer state (zero React re-renders on cursor movement)
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  // Orient initial globe longitude so India (78°E) and Indian Ocean face the viewer directly
  const baseAmbientRotY = useRef(-2.92);
  const currentTiltX = useRef(0.28);
  const currentTiltY = useRef(-2.92);

  const isLight = theme === "light";

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.targetX = x;
      pointerRef.current.targetY = y;
    };
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  // Theme & severity status color for telemetry arcs
  const themeColor = useMemo(() => {
    switch (status) {
      case "SCANNING":
        return isLight ? "#d97706" : "#f59e0b";
      case "CRITICAL":
        return isLight ? "#dc2626" : "#ef4444";
      case "HIGH":
        return isLight ? "#d97706" : "#f59e0b";
      case "MODERATE":
      case "UNCERTAIN":
        return isLight ? "#ca8a04" : "#eab308";
      case "LOW":
      case "NON_EMERGENCY":
        return isLight ? "#059669" : "#10b981";
      case "IDLE":
      default:
        return isLight ? "#0284c7" : "#38bdf8";
    }
  }, [status, isLight]);

  const sceneOpacityMultiplier =
    viewMode === "hero" ? 1.0 : viewMode === "workspace" ? 0.34 : 0.95;

  // Photorealistic Blue Marble surface, ocean roughness, topographic bump & cloud maps
  const { colorMap, roughnessMap, bumpMap, cloudsMap } = useMemo(
    () => createPhotorealisticBlueMarbleTextures(isLight),
    [isLight]
  );

  // Compute 3D coordinates for global emergency hubs & elevated Bezier signal arcs
  const { hubVectors, arcCurves } = useMemo(() => {
    const vectors = GLOBAL_EMERGENCY_HUBS.map((hub) => ({
      ...hub,
      pos: latLonToSphereVector3(hub.lat, hub.lon, EARTH_RADIUS + 0.01),
    }));

    const curves = EMERGENCY_ARC_PAIRS.map(([idxA, idxB], i) => {
      const start = vectors[idxA].pos;
      const end = vectors[idxB].pos;
      const distance = start.distanceTo(end);
      const mid = start
        .clone()
        .add(end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(EARTH_RADIUS + 0.14 + distance * 0.18);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(36);
      return {
        id: `arc-${idxA}-${idxB}`,
        curve,
        points,
        speed: 0.22 + (i % 5) * 0.06,
        offset: (i * 0.17) % 1,
        isPrimary: vectors[idxA].isPrimary || vectors[idxB].isPrimary,
      };
    });

    return { hubVectors: vectors, arcCurves: curves };
  }, []);

  // Grounded Indian Cities surface markers
  const targetResolution = useMemo(() => {
    return resolveTargetCity(gpsCoords);
  }, [gpsCoords]);

  const indianCityMarkers = useMemo(() => {
    return GROUNDED_CITIES.map((city) => {
      const { position, quaternion } = getSurfaceOrientation(
        city.lat,
        city.lon,
        EARTH_RADIUS + 0.008
      );
      return {
        ...city,
        position,
        quaternion,
        isSelected: targetResolution.city.id === city.id,
      };
    });
  }, [targetResolution.city.id]);

  const targetRadarRot = useMemo(() => {
    if (flyoverStage === "country") {
      return latLonToCameraEuler(22.0, 79.0);
    }
    return latLonToCameraEuler(
      targetResolution.coords.lat,
      targetResolution.coords.lon
    );
  }, [flyoverStage, targetResolution.coords]);

  // Subtle globe tilt offset when user selects a hotspot on Hero screen
  const hotspotTiltOffset = useMemo(() => {
    if (viewMode === "hero" && activeHotspot) {
      if (activeHotspot === "multimodal") return { x: 0.06, y: 0.18 };
      if (activeHotspot === "evidence") return { x: 0.04, y: -0.18 };
      if (activeHotspot === "bridge") return { x: -0.08, y: 0 };
    }
    return { x: 0, y: 0 };
  }, [viewMode, activeHotspot]);

  useFrame((state, delta) => {
    const tClock = state.clock.getElapsedTime();

    // Smooth pointer dampening
    pointerRef.current.x = THREE.MathUtils.damp(
      pointerRef.current.x,
      pointerRef.current.targetX,
      4.5,
      delta
    );
    pointerRef.current.y = THREE.MathUtils.damp(
      pointerRef.current.y,
      pointerRef.current.targetY,
      4.5,
      delta
    );

    const rotSpeedMultiplier = status === "SCANNING" ? 2.0 : 0.35;

    // Gentle vertical float
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(tClock * 0.65) * 0.03 + (viewMode === "hero" ? 0.08 : 0.04);
    }

    // Rotate Earth & respond to mouse parallax
    if (earthRotationGroupRef.current) {
      baseAmbientRotY.current += delta * 0.06 * rotSpeedMultiplier;

      if (viewMode === "radar") {
        currentTiltX.current = THREE.MathUtils.damp(
          currentTiltX.current,
          targetRadarRot[0] + pointerRef.current.y * 0.12,
          3.8,
          delta
        );
        currentTiltY.current = THREE.MathUtils.damp(
          currentTiltY.current,
          targetRadarRot[1] + pointerRef.current.x * 0.16,
          3.8,
          delta
        );
      } else {
        currentTiltX.current = THREE.MathUtils.damp(
          currentTiltX.current,
          0.28 + hotspotTiltOffset.x - pointerRef.current.y * 0.22,
          4.0,
          delta
        );
        currentTiltY.current = THREE.MathUtils.damp(
          currentTiltY.current,
          baseAmbientRotY.current + hotspotTiltOffset.y + pointerRef.current.x * 0.35,
          4.0,
          delta
        );
      }

      earthRotationGroupRef.current.rotation.x = currentTiltX.current;
      earthRotationGroupRef.current.rotation.y = currentTiltY.current;
    }

    // Subtle independent cloud drift
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y += delta * 0.016;
    }

    // Animate emergency telemetry photons along 3D Bezier arcs
    if (signalPulsesRef.current) {
      signalPulsesRef.current.children.forEach((child, idx) => {
        const arc = arcCurves[idx];
        if (!arc) return;
        const progress =
          (tClock * arc.speed * rotSpeedMultiplier + arc.offset) % 1;
        const pos = arc.curve.getPointAt(progress);
        child.position.copy(pos);
      });
    }
  });

  // Calibrated 3D hotspot coordinates around the 1.38-radius globe
  const calibratedHotspots = useMemo(
    () => [
      { ...CORE_HOTSPOTS[0], position: [-1.15, 0.82, 0.55] as [number, number, number] },
      { ...CORE_HOTSPOTS[1], position: [1.15, 0.68, 0.55] as [number, number, number] },
      { ...CORE_HOTSPOTS[2], position: [0, -1.18, 0.65] as [number, number, number] },
    ],
    []
  );

  return (
    <group ref={groupRef}>
      {/* Studio Key, Fill & Rim Lighting for Authentic 3D Planetary Depth */}
      <ambientLight intensity={isLight ? 1.25 : 0.75} />
      <directionalLight
        position={[5.5, 3.5, 5.0]}
        intensity={isLight ? 2.2 : 2.5}
        color="#ffffff"
      />
      <directionalLight
        position={[-5.0, -2.0, -3.5]}
        intensity={isLight ? 0.5 : 0.6}
        color="#38bdf8"
      />

      {/* Realistic Grounded Soft Floating Contact Shadow */}
      <ContactShadows
        position={[0, -1.72, 0]}
        opacity={(isLight ? 0.34 : 0.68) * sceneOpacityMultiplier}
        scale={6.8}
        blur={2.5}
        far={4.0}
        resolution={512}
        color="#000000"
      />

      {/* ==================== 1. PHOTOREALISTIC 3D EARTH SPHERE ==================== */}
      <group ref={earthRotationGroupRef} rotation={[0.28, -2.92, 0]}>
        {/* Main Blue Marble Planetary Sphere */}
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
          <meshStandardMaterial
            map={colorMap}
            roughnessMap={roughnessMap}
            bumpMap={bumpMap}
            bumpScale={0.018}
            roughness={0.72}
            metalness={0.1}
            transparent
            opacity={
              viewMode === "workspace"
                ? isLight
                  ? 0.36
                  : 0.32
                : 0.99
            }
          />
        </mesh>

        {/* Translucent Swirling Atmospheric Cloud Layer */}
        <mesh ref={cloudsMeshRef}>
          <sphereGeometry args={[EARTH_RADIUS * 1.008, 64, 64]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent
            opacity={0.82 * sceneOpacityMultiplier}
            depthWrite={false}
          />
        </mesh>

        {/* Global & Indian Emergency Hub Beacons */}
        {hubVectors.map((hub) => (
          <mesh key={hub.name} position={hub.pos}>
            <sphereGeometry args={[hub.isPrimary ? 0.022 : 0.014, 12, 12]} />
            <meshBasicMaterial
              color={
                hub.isPrimary
                  ? isLight
                    ? "#ea580c"
                    : "#fbbf24"
                  : themeColor
              }
              transparent
              opacity={0.9 * sceneOpacityMultiplier}
            />
          </mesh>
        ))}

        {/* 3D Emergency Signal Arcs Connecting Indian & Global Hubs */}
        {arcCurves.map((arc) => (
          <Line
            key={arc.id}
            points={arc.points}
            color={
              arc.isPrimary
                ? isLight
                  ? "#0284c7"
                  : "#fbbf24"
                : themeColor
            }
            lineWidth={arc.isPrimary ? 1.5 : 1.0}
            transparent
            opacity={(arc.isPrimary ? 0.65 : 0.34) * sceneOpacityMultiplier}
          />
        ))}

        {/* Animated Signal Photons Traveling Along Emergency Arcs */}
        <group ref={signalPulsesRef}>
          {arcCurves.map((arc) => (
            <mesh key={`pulse-${arc.id}`}>
              <sphereGeometry args={[0.02, 10, 10]} />
              <meshBasicMaterial
                color={isLight ? "#0284c7" : "#fde047"}
                transparent
                opacity={0.95 * sceneOpacityMultiplier}
              />
            </mesh>
          ))}
        </group>

        {/* Grounded Indian City Surface Rings */}
        {indianCityMarkers.map((city) => (
          <group
            key={city.id}
            position={city.position}
            quaternion={city.quaternion}
          >
            <mesh position={[0, 0, 0.003]}>
              <ringGeometry
                args={[
                  city.isSelected ? 0.024 : 0.015,
                  city.isSelected ? 0.032 : 0.021,
                  24,
                ]}
              />
              <meshBasicMaterial
                color={city.isSelected ? "#ef4444" : "#38bdf8"}
                side={THREE.DoubleSide}
                transparent
                opacity={0.85 * sceneOpacityMultiplier}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==================== 2. ATMOSPHERIC RAYLEIGH RIM HALO ==================== */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.024, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={(isLight ? 0.075 : 0.12) * sceneOpacityMultiplier}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ==================== 3. INTERACTIVE 3D HOTSPOTS (HERO MODE) ==================== */}
      {viewMode === "hero" && (
        <group>
          {calibratedHotspots.map((spot) => {
            const isSelected = activeHotspot === spot.id;
            const title = t.hotspots[spot.titleKey];
            return (
              <Html
                key={spot.id}
                position={spot.position}
                center
                zIndexRange={[20, 0]}
                style={{
                  display: viewMode === "hero" ? "block" : "none",
                  pointerEvents: viewMode === "hero" ? "auto" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHotspot(isSelected ? null : spot.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectHotspot(isSelected ? null : spot.id);
                    }
                  }}
                  aria-expanded={isSelected}
                  aria-label={title}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer whitespace-nowrap shadow-sm ${
                    isSelected
                      ? "bg-cyan-600 text-white font-semibold scale-105"
                      : isLight
                      ? "bg-white/85 text-slate-900 hover:bg-white shadow-slate-300/60"
                      : "bg-slate-900/80 text-slate-100 hover:bg-slate-900"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                      isSelected
                        ? "bg-white text-cyan-700"
                        : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300"
                    }`}
                  >
                    {spot.label}
                  </span>
                  <span className="text-xs tracking-tight">{title}</span>
                </button>
              </Html>
            );
          })}
        </group>
      )}
    </group>
  );
}
