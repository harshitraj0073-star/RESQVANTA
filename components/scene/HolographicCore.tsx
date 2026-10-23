"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SeverityLevel } from "@/types/triage";

export interface HotspotData {
  id: string;
  label: string;
  shortTitle: string;
  description: string;
  position: [number, number, number];
  cameraTarget: [number, number, number];
}

export const CORE_HOTSPOTS: HotspotData[] = [
  {
    id: "multimodal",
    label: "01",
    shortTitle: "Multimodal Intelligence",
    description:
      "Ingests messy voice notes, multilingual Hinglish/Hindi/English text, and scene photos into a single context window.",
    position: [-2.1, 1.05, 0.8],
    cameraTarget: [-1.4, 0.8, 4.1]
  },
  {
    id: "evidence",
    label: "02",
    shortTitle: "Evidence & Uncertainty Engine",
    description:
      "Strictly separates user-reported facts from AI-inferred risks and highlights unanswered critical questions.",
    position: [2.15, 0.75, 0.7],
    cameraTarget: [1.5, 0.6, 4.1]
  },
  {
    id: "bridge",
    label: "03",
    shortTitle: "Emergency Action Bridge",
    description:
      "Generates plain-English safety steps, an editable 112 Emergency Brief, and instant SMS/WhatsApp/112 sharing.",
    position: [0, -1.75, 1.35],
    cameraTarget: [0, -0.9, 4.2]
  }
];

interface HolographicCoreProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
  activeHotspot: string | null;
  onSelectHotspot: (id: string | null) => void;
}

export function HolographicCore({
  status,
  viewMode,
  activeHotspot,
  onSelectHotspot
}: HolographicCoreProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const outerShellRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);

  const { camera } = useThree();

  // Controlled Cyan & Amber Showroom Palette
  const themeColor = useMemo(() => {
    switch (status) {
      case "SCANNING":
        return "#f59e0b"; // Controlled Amber Processing
      case "CRITICAL":
        return "#ef4444"; // Critical Alert Red
      case "HIGH":
        return "#f97316"; // High Amber-Orange
      case "MODERATE":
      case "UNCERTAIN":
        return "#eab308"; // Caution Gold
      case "LOW":
      case "NON_EMERGENCY":
        return "#10b981"; // Calm Emerald
      case "IDLE":
      default:
        return "#22d3ee"; // Showroom Cyan
    }
  }, [status]);

  // Refined Fibonacci Sphere (900 subtle points — no visual clutter)
  const particlePositions = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      positions[i * 3] = Math.cos(theta) * radius * 1.95;
      positions[i * 3 + 1] = y * 1.95;
      positions[i * 3 + 2] = Math.sin(theta) * radius * 1.95;
    }
    return positions;
  }, []);

  // Camera Choreography Target Positions (Mercedes Showroom Flyby + Hotspot Focus)
  const targetCameraPos = useMemo(() => {
    if (viewMode === "hero" && activeHotspot) {
      const found = CORE_HOTSPOTS.find((h) => h.id === activeHotspot);
      if (found) return new THREE.Vector3(...found.cameraTarget);
    }
    if (viewMode === "hero") return new THREE.Vector3(0, 0.25, 5.1);
    if (viewMode === "radar") return new THREE.Vector3(0, 3.6, 4.2);
    return new THREE.Vector3(1.8, 0.15, 6.2); // Workspace docked cleanly right
  }, [viewMode, activeHotspot]);

  useFrame((state, delta) => {
    const speedMultiplier =
      status === "SCANNING" ? 3.0 : status === "CRITICAL" ? 1.8 : 0.75;

    // Smooth camera swoop
    camera.position.lerp(targetCameraPos, delta * 2.4);
    camera.lookAt(0, 0, 0);

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.14 * speedMultiplier;
    }
    if (outerShellRef.current) {
      outerShellRef.current.rotation.y -= delta * 0.1 * speedMultiplier;
      outerShellRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.28 * speedMultiplier;
      ring1Ref.current.rotation.y += delta * 0.16 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.22 * speedMultiplier;
      ring2Ref.current.rotation.z += delta * 0.18 * speedMultiplier;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z -= delta * 0.12 * speedMultiplier;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += delta * 0.35 * speedMultiplier;
      const pulse =
        status === "SCANNING"
          ? 1 + Math.sin(state.clock.elapsedTime * 8) * 0.12
          : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Luxury Showroom Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#f8fafc" />
      <pointLight position={[-4, -2, 3]} intensity={1.4} color={themeColor} />
      <pointLight position={[0, 3, -4]} intensity={0.9} color="#f59e0b" />

      {/* Subtle Studio Floor Contact Shadows */}
      <ContactShadows
        position={[0, -2.55, 0]}
        opacity={0.55}
        scale={14}
        blur={2.4}
        far={4.5}
        color={themeColor}
      />

      {/* Minimal Horizon Reference Grid */}
      <gridHelper
        args={[28, 28, "#1e293b", "#090d16"]}
        position={[0, -2.6, 0]}
      />

      {/* 1. Metallic Physical Inner Core (Luxury Showroom Finish) */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.92, 2]} />
        <meshPhysicalMaterial
          color="#090d16"
          emissive={themeColor}
          emissiveIntensity={status === "SCANNING" ? 0.65 : 0.28}
          metalness={0.9}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          wireframe={false}
        />
      </mesh>

      {/* 2. Precision Geodesic Wireframe Cage */}
      <mesh ref={outerShellRef}>
        <icosahedronGeometry args={[1.28, 1]} />
        <meshBasicMaterial
          color={themeColor}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 3. Controlled Fibonacci Data Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color={themeColor}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 4. Brushed Metallic Gimbal Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.25, 0.014, 16, 100]} />
        <meshStandardMaterial
          color="#94a3b8"
          emissive={themeColor}
          emissiveIntensity={0.4}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.55, 0.01, 16, 100]} />
        <meshBasicMaterial color={themeColor} transparent opacity={0.28} />
      </mesh>

      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.95, 2.98, 80]} />
        <meshBasicMaterial
          color="#f59e0b"
          side={THREE.DoubleSide}
          transparent
          opacity={status === "SCANNING" ? 0.55 : 0.18}
        />
      </mesh>

      {/* 5. Three Interactive 3D Hotspots (Visible in Hero Mode) */}
      {viewMode === "hero" &&
        CORE_HOTSPOTS.map((spot) => {
          const isSelected = activeHotspot === spot.id;
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
                aria-label={`${spot.shortTitle}: ${spot.description}`}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border transition-all duration-300 cursor-pointer whitespace-nowrap shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 border-cyan-300 font-bold scale-105"
                    : "bg-slate-950/85 text-slate-200 border-slate-700/90 hover:border-cyan-400/70 hover:text-white"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                    isSelected
                      ? "bg-slate-950 text-cyan-300"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                  }`}
                >
                  {spot.label}
                </span>
                <span className="text-xs tracking-tight">{spot.shortTitle}</span>
              </button>
            </Html>
          );
        })}
    </group>
  );
}
