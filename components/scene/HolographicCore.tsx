"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SeverityLevel } from "@/types/triage";
import { UIStrings } from "@/lib/translations";

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
    position: [-1.85, 0.95, 0.8],
    cameraTarget: [-1.2, 0.7, 4.3],
  },
  {
    id: "evidence",
    label: "02",
    titleKey: "evidenceTitle",
    descKey: "evidenceDesc",
    position: [1.85, 0.7, 0.7],
    cameraTarget: [1.25, 0.55, 4.3],
  },
  {
    id: "bridge",
    label: "03",
    titleKey: "bridgeTitle",
    descKey: "bridgeDesc",
    position: [0, -1.55, 1.2],
    cameraTarget: [0, -0.75, 4.4],
  },
];

interface HolographicCoreProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
  theme: "light" | "dark";
  activeHotspot: string | null;
  onSelectHotspot: (id: string | null) => void;
  t: UIStrings;
}

export function HolographicCore({
  status,
  viewMode,
  theme,
  activeHotspot,
  onSelectHotspot,
  t,
}: HolographicCoreProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const outerShellRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);

  const { camera } = useThree();
  const isLight = theme === "light";

  // Theme-aware and status-aware palette (avoids competing orange in workspace)
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

  // Subtle intensity reduction in workspace & history so text stays hyper-legible
  const sceneOpacityMultiplier = viewMode === "hero" ? 1.0 : 0.42;

  // Fibonacci Data Nodes (750 points for clean, noise-free performance)
  const particlePositions = useMemo(() => {
    const count = 750;
    const positions = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      positions[i * 3] = Math.cos(theta) * radius * 1.9;
      positions[i * 3 + 1] = y * 1.9;
      positions[i * 3 + 2] = Math.sin(theta) * radius * 1.9;
    }
    return positions;
  }, []);

  // Camera Choreography Target Positions
  const targetCameraPos = useMemo(() => {
    if (viewMode === "hero" && activeHotspot) {
      const found = CORE_HOTSPOTS.find((h) => h.id === activeHotspot);
      if (found) return new THREE.Vector3(...found.cameraTarget);
    }
    if (viewMode === "hero") return new THREE.Vector3(0, 0.2, 5.2);
    if (viewMode === "radar") return new THREE.Vector3(0, 3.4, 4.8);
    return new THREE.Vector3(2.1, 0.1, 6.4); // Workspace shifted gently right
  }, [viewMode, activeHotspot]);

  useFrame((state, delta) => {
    const speedMultiplier =
      status === "SCANNING" ? 2.6 : status === "CRITICAL" ? 1.5 : 0.65;

    camera.position.lerp(targetCameraPos, delta * 2.2);
    camera.lookAt(0, 0, 0);

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.12 * speedMultiplier;
    }
    if (outerShellRef.current) {
      outerShellRef.current.rotation.y -= delta * 0.09 * speedMultiplier;
      outerShellRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.35) * 0.1;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.24 * speedMultiplier;
      ring1Ref.current.rotation.y += delta * 0.14 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.2 * speedMultiplier;
      ring2Ref.current.rotation.z += delta * 0.15 * speedMultiplier;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z -= delta * 0.1 * speedMultiplier;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += delta * 0.3 * speedMultiplier;
      const pulse =
        status === "SCANNING"
          ? 1 + Math.sin(state.clock.elapsedTime * 7) * 0.1
          : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.035;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Theme-Aware Studio Lighting */}
      <ambientLight intensity={isLight ? 1.25 : 0.65} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={isLight ? 2.2 : 1.7}
        color={isLight ? "#ffffff" : "#f8fafc"}
      />
      <pointLight
        position={[-4, -2, 3]}
        intensity={isLight ? 1.1 : 1.35}
        color={themeColor}
      />
      <pointLight
        position={[3, 3, -4]}
        intensity={0.75}
        color={isLight ? "#0284c7" : "#f59e0b"}
      />

      {/* Contact Shadows */}
      <ContactShadows
        position={[0, -2.55, 0]}
        opacity={(isLight ? 0.28 : 0.5) * sceneOpacityMultiplier}
        scale={14}
        blur={2.5}
        far={4.5}
        color={isLight ? "#0f172a" : themeColor}
      />

      {/* Minimal Horizon Grid */}
      <gridHelper
        args={[
          28,
          28,
          isLight ? "#cbd5e1" : "#1e293b",
          isLight ? "#e2e8f0" : "#090d16",
        ]}
        position={[0, -2.6, 0]}
      />

      {/* 1. Metallic Physical Core */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshPhysicalMaterial
          color={isLight ? "#e2e8f0" : "#090d16"}
          emissive={themeColor}
          emissiveIntensity={
            (status === "SCANNING" ? 0.55 : isLight ? 0.18 : 0.28) *
            sceneOpacityMultiplier
          }
          metalness={isLight ? 0.75 : 0.9}
          roughness={isLight ? 0.22 : 0.16}
          clearcoat={1}
          clearcoatRoughness={0.12}
          transparent
          opacity={viewMode === "hero" ? 0.96 : 0.55}
        />
      </mesh>

      {/* 2. Geodesic Wireframe Cage */}
      <mesh ref={outerShellRef}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial
          color={themeColor}
          wireframe
          transparent
          opacity={(isLight ? 0.42 : 0.34) * sceneOpacityMultiplier}
        />
      </mesh>

      {/* 3. Fibonacci Data Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.032 : 0.028}
          color={themeColor}
          transparent
          opacity={(isLight ? 0.72 : 0.68) * sceneOpacityMultiplier}
        />
      </points>

      {/* 4. Gimbal Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.2, 0.013, 16, 100]} />
        <meshStandardMaterial
          color={isLight ? "#475569" : "#94a3b8"}
          emissive={themeColor}
          emissiveIntensity={0.35 * sceneOpacityMultiplier}
          metalness={0.85}
          roughness={0.2}
          transparent
          opacity={sceneOpacityMultiplier}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.5, 0.01, 16, 100]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={0.26 * sceneOpacityMultiplier}
        />
      </mesh>

      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.85, 2.88, 80]} />
        <meshBasicMaterial
          color={isLight ? "#0891b2" : "#f59e0b"}
          side={THREE.DoubleSide}
          transparent
          opacity={0.2 * sceneOpacityMultiplier}
        />
      </mesh>

      {/* 5. Three Interactive 3D Hotspot Spatial Anchors (Always Mounted, CSS-hidden when not hero to prevent React unmount root error) */}
      <group visible={viewMode === "hero"}>
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
    </group>
  );
}
