"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, ContactShadows, Line } from "@react-three/drei";
import * as THREE from "three";
import { SeverityLevel } from "@/types/triage";
import { UIStrings } from "@/lib/translations";
import {
  createStylizedEarthTexture,
  latLonToVector3,
  latLonToTargetRotation,
  GLOBAL_EMERGENCY_HUBS,
  EMERGENCY_ARC_PAIRS,
} from "@/lib/earthContinents";

export interface HotspotData {
  id: string;
  label: string;
  titleKey: "multimodalTitle" | "evidenceTitle" | "bridgeTitle";
  descKey: "multimodalDesc" | "evidenceDesc" | "bridgeDesc";
  position: [number, number, number];
  cameraTarget: [number, number, number];
}

export const CORE_HOTSPOTS: HotspotData[] = [
  {
    id: "multimodal",
    label: "01",
    titleKey: "multimodalTitle",
    descKey: "multimodalDesc",
    position: [-1.95, 0.95, 0.85],
    cameraTarget: [-1.15, 0.65, 4.35],
  },
  {
    id: "evidence",
    label: "02",
    titleKey: "evidenceTitle",
    descKey: "evidenceDesc",
    position: [1.95, 0.7, 0.75],
    cameraTarget: [1.2, 0.5, 4.35],
  },
  {
    id: "bridge",
    label: "03",
    titleKey: "bridgeTitle",
    descKey: "bridgeDesc",
    position: [0, -1.65, 1.25],
    cameraTarget: [0, -0.75, 4.45],
  },
];

interface HolographicCoreProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
  theme: "light" | "dark";
  activeHotspot: string | null;
  onSelectHotspot: (id: string | null) => void;
  t: UIStrings;
  gpsCoords?: string | null;
}

const EARTH_RADIUS = 1.52;

export function HolographicCore({
  status,
  viewMode,
  theme,
  activeHotspot,
  onSelectHotspot,
  t,
  gpsCoords,
}: HolographicCoreProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const earthRotationGroupRef = useRef<THREE.Group>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const orbitalGroupRef = useRef<THREE.Group>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const signalPulsesRef = useRef<THREE.Group>(null!);
  const radarRippleGroupRef = useRef<THREE.Group>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Inertial pointer state ref (zero React re-renders on cursor movement)
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const baseAmbientRotY = useRef(-2.05);
  const currentTiltX = useRef(0.14);
  const currentTiltY = useRef(0);

  const { camera } = useThree();
  const isLight = theme === "light";

  // Passive pointer tracking across entire browser window
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

  // Theme-aware and status-aware accent color
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
        return isLight ? "#0891b2" : "#22d3ee";
    }
  }, [status, isLight]);

  // View-mode aware opacity
  const sceneOpacityMultiplier =
    viewMode === "hero" ? 1.0 : viewMode === "workspace" ? 0.28 : 0.88;

  // Stylized procedural Earth texture with continents, coastlines, graticules & dot matrix
  const earthTexture = useMemo(() => {
    return createStylizedEarthTexture(isLight, themeColor);
  }, [isLight, themeColor]);

  // Compute 3D coordinates for global emergency hubs & elevated Bezier signal arcs
  const { hubVectors, arcCurves } = useMemo(() => {
    const vectors = GLOBAL_EMERGENCY_HUBS.map((hub) => ({
      ...hub,
      pos: latLonToVector3(hub.lat, hub.lon, EARTH_RADIUS + 0.015),
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
        .multiplyScalar(EARTH_RADIUS + 0.18 + distance * 0.22);

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

  // Parse target GPS coordinates for Radar zoom & orientation
  const parsedCoords = useMemo(() => {
    if (!gpsCoords) {
      return { lat: 18.5204, lon: 73.8567, isDefault: true };
    }
    const parts = gpsCoords.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lon: parts[1], isDefault: false };
    }
    return { lat: 18.5204, lon: 73.8567, isDefault: true };
  }, [gpsCoords]);

  // Target Euler rotation to bring target coordinates directly facing the camera
  const targetRadarRot = useMemo(() => {
    return latLonToTargetRotation(parsedCoords.lat, parsedCoords.lon);
  }, [parsedCoords]);

  // 3D vector and surface orientation on the sphere surface for the epicenter beacon
  const { epicenterVector, epicenterQuaternion } = useMemo(() => {
    const pos = latLonToVector3(
      parsedCoords.lat,
      parsedCoords.lon,
      EARTH_RADIUS + 0.018
    );
    const normal = pos.clone().normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return { epicenterVector: pos, epicenterQuaternion: q };
  }, [parsedCoords]);

  // Subtle orbital atmosphere dust particles
  const orbitalParticles = useMemo(() => {
    const count = 380;
    const positions = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const r = EARTH_RADIUS + 0.32 + (i % 7) * 0.04;

      positions[i * 3] = Math.cos(theta) * radius * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = Math.sin(theta) * radius * r;
    }
    return positions;
  }, []);

  // Camera choreography across views (Cinematic close-up framing in Radar mode)
  const targetCameraPos = useMemo(() => {
    if (viewMode === "hero" && activeHotspot) {
      const found = CORE_HOTSPOTS.find((h) => h.id === activeHotspot);
      if (found) return new THREE.Vector3(...found.cameraTarget);
    }
    if (viewMode === "hero") return new THREE.Vector3(0, 0.18, 5.05);
    if (viewMode === "radar") return new THREE.Vector3(0, 0, 3.05); // Clean tactical planetary zoom!
    return new THREE.Vector3(1.85, 0.1, 6.3);
  }, [viewMode, activeHotspot]);

  useFrame((state, delta) => {
    const deltaFactor = Math.min(delta, 0.1);
    const speedMultiplier =
      status === "SCANNING" ? 2.1 : status === "CRITICAL" ? 1.35 : 0.55;

    // 1. Inertial Damped Mouse Interpolation
    pointerRef.current.x = THREE.MathUtils.damp(
      pointerRef.current.x,
      pointerRef.current.targetX,
      4.5,
      deltaFactor
    );
    pointerRef.current.y = THREE.MathUtils.damp(
      pointerRef.current.y,
      pointerRef.current.targetY,
      4.5,
      deltaFactor
    );

    // 2. Tactical Group Centering in Radar Mode (Frames Earth inside left Radar Viewport on desktop)
    if (groupRef.current) {
      const isDesktop =
        typeof window !== "undefined" && window.innerWidth >= 1024;
      const targetGroupPosX = viewMode === "radar" && isDesktop ? -1.1 : 0;
      groupRef.current.position.x = THREE.MathUtils.damp(
        groupRef.current.position.x,
        targetGroupPosX,
        3.5,
        deltaFactor
      );
    }

    // 3. Camera Dolly Zoom
    const cameraLerpSpeed = viewMode === "radar" ? 2.8 : 2.2;
    camera.position.lerp(targetCameraPos, deltaFactor * cameraLerpSpeed);
    camera.lookAt(0, 0, 0);

    // Respect reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const parallaxWeight = prefersReducedMotion
      ? 0
      : viewMode === "hero"
      ? 1.0
      : viewMode === "workspace"
      ? 0.35
      : 0.12;

    // 4. Earth Rotation & Orientation Transition
    if (earthRotationGroupRef.current) {
      if (viewMode === "radar") {
        // Smoothly orient Earth towards target GPS coordinates
        earthRotationGroupRef.current.rotation.x = THREE.MathUtils.damp(
          earthRotationGroupRef.current.rotation.x,
          targetRadarRot[0],
          3.5,
          deltaFactor
        );
        earthRotationGroupRef.current.rotation.y = THREE.MathUtils.damp(
          earthRotationGroupRef.current.rotation.y,
          targetRadarRot[1],
          3.5,
          deltaFactor
        );
        earthRotationGroupRef.current.rotation.z = THREE.MathUtils.damp(
          earthRotationGroupRef.current.rotation.z,
          0,
          3.5,
          deltaFactor
        );
      } else {
        // Hero & Workspace: Ambient slow spin + smooth mouse parallax tilt
        baseAmbientRotY.current += deltaFactor * 0.11 * speedMultiplier;

        const targetTiltX = -pointerRef.current.y * 0.14 * parallaxWeight;
        const targetTiltY = pointerRef.current.x * 0.2 * parallaxWeight;

        currentTiltX.current = THREE.MathUtils.damp(
          currentTiltX.current,
          targetTiltX + 0.14,
          4.0,
          deltaFactor
        );
        currentTiltY.current = THREE.MathUtils.damp(
          currentTiltY.current,
          targetTiltY,
          4.0,
          deltaFactor
        );

        earthRotationGroupRef.current.rotation.x = currentTiltX.current;
        earthRotationGroupRef.current.rotation.y =
          baseAmbientRotY.current + currentTiltY.current;
        earthRotationGroupRef.current.rotation.z = -0.06;
      }
    }

    // 5. Multi-Layer Parallax: Atmosphere Specular Shift & Pulse
    if (atmosphereRef.current) {
      atmosphereRef.current.position.x =
        -pointerRef.current.x * 0.05 * parallaxWeight;
      atmosphereRef.current.position.y =
        -pointerRef.current.y * 0.05 * parallaxWeight;
      const pulse =
        status === "SCANNING"
          ? 1 + Math.sin(state.clock.elapsedTime * 5) * 0.03
          : 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.012;
      atmosphereRef.current.scale.set(pulse, pulse, pulse);
    }

    // 6. Multi-Layer Parallax: Orbital Telemetry Rings
    if (orbitalGroupRef.current) {
      orbitalGroupRef.current.position.x =
        pointerRef.current.x * 0.08 * parallaxWeight;
      orbitalGroupRef.current.position.y =
        pointerRef.current.y * 0.06 * parallaxWeight;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += deltaFactor * 0.08 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= deltaFactor * 0.06 * speedMultiplier;
    }

    // 7. Orbital Dust Drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y += deltaFactor * 0.02;
      particlesRef.current.position.x =
        -pointerRef.current.x * 0.03 * parallaxWeight;
    }

    // 8. Animate Traveling Emergency Signal Pulses along Arcs
    if (signalPulsesRef.current) {
      const tNow = state.clock.elapsedTime;
      signalPulsesRef.current.children.forEach((child, idx) => {
        const arcData = arcCurves[idx];
        if (!arcData) return;
        const progress = (tNow * arcData.speed + arcData.offset) % 1;
        const pos = arcData.curve.getPoint(progress);
        child.position.copy(pos);
      });
    }

    // 9. Animate Concentric Expanding Radar Waves at Epicenter (Radar View)
    if (radarRippleGroupRef.current) {
      const tNow = state.clock.elapsedTime;
      radarRippleGroupRef.current.children.forEach((child, idx) => {
        const progress = (tNow * 0.8 + idx * 0.33) % 1;
        const scale = 0.08 + progress * 0.45;
        child.scale.set(scale, scale, 1);
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          (mesh.material as THREE.MeshBasicMaterial).opacity =
            (1 - progress) * 0.85;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Theme-Aware Studio & Planetary Lighting */}
      <ambientLight intensity={isLight ? 1.55 : 0.85} />
      <directionalLight
        position={[5, 6, 6]}
        intensity={isLight ? 1.9 : 1.85}
        color={isLight ? "#ffffff" : "#f8fafc"}
      />
      <pointLight
        position={[-4, -2, 4]}
        intensity={isLight ? 0.85 : 1.3}
        color={themeColor}
      />
      <pointLight
        position={[4, 3, -4]}
        intensity={isLight ? 0.5 : 0.9}
        color={isLight ? "#0284c7" : "#f59e0b"}
      />

      {/* Controlled Contact Shadow */}
      <ContactShadows
        position={[0, -2.45, 0]}
        opacity={(isLight ? 0.18 : 0.42) * sceneOpacityMultiplier}
        scale={13}
        blur={2.6}
        far={4.5}
        color={isLight ? "#0f172a" : themeColor}
      />

      {/* ==================== 1. PERSISTENT 3D ROTATING EARTH GLOBE ==================== */}
      <group ref={earthRotationGroupRef} rotation={[0.14, -2.05, -0.06]}>
        {/* Stylized Earth Sphere with Continents, Graticules & Coastlines */}
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshPhysicalMaterial
            map={earthTexture || undefined}
            color={isLight ? "#ffffff" : "#e2f1ff"}
            emissive={isLight ? "#0891b2" : themeColor}
            emissiveMap={earthTexture || undefined}
            emissiveIntensity={
              (isLight ? 0.12 : status === "SCANNING" ? 0.55 : 0.32) *
              sceneOpacityMultiplier
            }
            metalness={isLight ? 0.18 : 0.45}
            roughness={isLight ? 0.55 : 0.38}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
            transparent
            opacity={
              viewMode === "hero"
                ? isLight
                  ? 0.95
                  : 0.94
                : viewMode === "radar"
                ? isLight
                  ? 0.92
                  : 0.95
                : isLight
                ? 0.34
                : 0.3
            }
          />
        </mesh>

        {/* Latitude/Longitude Geodesic Overlay Shell */}
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS + 0.006, 24, 18]} />
          <meshBasicMaterial
            color={themeColor}
            wireframe
            transparent
            opacity={(isLight ? 0.07 : 0.09) * sceneOpacityMultiplier}
          />
        </mesh>

        {/* Global Emergency Hub Beacons on Continents */}
        {hubVectors.map((hub) => (
          <mesh key={hub.name} position={hub.pos}>
            <sphereGeometry args={[hub.isPrimary ? 0.032 : 0.02, 12, 12]} />
            <meshBasicMaterial
              color={
                hub.isPrimary
                  ? isLight
                    ? "#d97706"
                    : "#fbbf24"
                  : themeColor
              }
              transparent
              opacity={0.9 * sceneOpacityMultiplier}
            />
          </mesh>
        ))}

        {/* Elegant 3D Emergency Signal Arcs Connecting Continents */}
        {arcCurves.map((arc) => (
          <Line
            key={arc.id}
            points={arc.points}
            color={
              arc.isPrimary
                ? isLight
                  ? "#0891b2"
                  : "#fbbf24"
                : themeColor
            }
            lineWidth={arc.isPrimary ? 1.6 : 1.1}
            transparent
            opacity={(arc.isPrimary ? 0.62 : 0.36) * sceneOpacityMultiplier}
          />
        ))}

        {/* Animated Signal Pulses Traveling Along Emergency Arcs */}
        <group ref={signalPulsesRef}>
          {arcCurves.map((arc) => (
            <mesh key={`pulse-${arc.id}`}>
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshBasicMaterial
                color={isLight ? "#0284c7" : "#fde047"}
                transparent
                opacity={0.95 * sceneOpacityMultiplier}
              />
            </mesh>
          ))}
        </group>

        {/* ==================== 3D TACTICAL EPICENTER & RADAR RIPPLES ==================== */}
        {viewMode === "radar" && (
          <group position={epicenterVector} quaternion={epicenterQuaternion}>
            {/* Glowing Tactical Epicenter Marker */}
            <mesh position={[0, 0, 0.025]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial
                color={isLight ? "#dc2626" : "#f59e0b"}
                transparent
                opacity={0.95}
              />
            </mesh>

            <mesh position={[0, 0, 0.07]}>
              <cylinderGeometry args={[0.005, 0.005, 0.12, 8]} />
              <meshBasicMaterial
                color={isLight ? "#0891b2" : "#22d3ee"}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Concentric Expanding Radar Pulse Waves on the Globe Surface */}
            <group ref={radarRippleGroupRef}>
              {[0, 1, 2].map((ringIdx) => (
                <mesh key={`radar-ripple-${ringIdx}`} position={[0, 0, 0.008]}>
                  <ringGeometry args={[0.88, 1.0, 32]} />
                  <meshBasicMaterial
                    color={isLight ? "#0891b2" : "#38bdf8"}
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              ))}
            </group>
          </group>
        )}
      </group>

      {/* ==================== 2. ATMOSPHERIC RIM GLOW ==================== */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.11, 48, 48]} />
        <meshBasicMaterial
          color={themeColor}
          side={THREE.BackSide}
          transparent
          opacity={(isLight ? 0.09 : 0.16) * sceneOpacityMultiplier}
        />
      </mesh>

      {/* ==================== 3. MULTI-LAYER ORBITAL TELEMETRY RINGS ==================== */}
      <group ref={orbitalGroupRef}>
        <mesh ref={ring1Ref} rotation={[Math.PI / 2.3, 0.2, 0]}>
          <torusGeometry args={[EARTH_RADIUS + 0.52, 0.007, 16, 120]} />
          <meshBasicMaterial
            color={themeColor}
            transparent
            opacity={(isLight ? 0.28 : 0.32) * sceneOpacityMultiplier}
          />
        </mesh>

        <mesh ref={ring2Ref} rotation={[Math.PI / 3.1, -0.35, 0]}>
          <torusGeometry args={[EARTH_RADIUS + 0.82, 0.005, 16, 120]} />
          <meshBasicMaterial
            color={isLight ? "#64748b" : "#f59e0b"}
            transparent
            opacity={(isLight ? 0.18 : 0.22) * sceneOpacityMultiplier}
          />
        </mesh>
      </group>

      {/* ==================== 4. ORBITAL DUST PARTICLES ==================== */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[orbitalParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.022 : 0.02}
          color={themeColor}
          transparent
          opacity={(isLight ? 0.45 : 0.5) * sceneOpacityMultiplier}
        />
      </points>

      {/* ==================== 5. INTERACTIVE 3D HOTSPOTS (HERO MODE ONLY) ==================== */}
      {viewMode === "hero" && (
        <group>
          {CORE_HOTSPOTS.map((spot) => {
            const isSelected = activeHotspot === spot.id;
            const title = t.hotspots[spot.titleKey];
            return (
              <Html
                key={spot.id}
                position={spot.position}
                center
                distanceFactor={8}
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
