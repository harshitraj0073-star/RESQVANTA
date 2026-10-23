"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SeverityLevel } from "@/types/triage";

interface HolographicCoreProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
}

export function HolographicCore({ status, viewMode }: HolographicCoreProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);
  const beaconRef = useRef<THREE.Mesh>(null!);
  const gridRef = useRef<THREE.GridHelper>(null!);

  const { camera } = useThree();

  // Dynamic color palette based on incident status
  const themeColor = useMemo(() => {
    switch (status) {
      case "SCANNING":
        return "#6366f1"; // Electric Indigo
      case "CRITICAL":
        return "#ef4444"; // Alert Crimson
      case "HIGH":
        return "#f97316"; // Safety Orange
      case "MODERATE":
        return "#eab308"; // Hazard Amber
      case "LOW":
      case "NON_EMERGENCY":
        return "#10b981"; // Signal Emerald
      case "IDLE":
      default:
        return "#06b6d4"; // Cyber Cyan
    }
  }, [status]);

  // Procedural Fibonacci Sphere Geometry (1,600 nodes)
  const particlePositions = useMemo(() => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      positions[i * 3] = Math.cos(theta) * radius * 2.1;
      positions[i * 3 + 1] = y * 2.1;
      positions[i * 3 + 2] = Math.sin(theta) * radius * 2.1;
    }
    return positions;
  }, []);

  // Camera Choreography Target Positions
  const targetCameraPos = useMemo(() => {
    if (viewMode === "hero") return new THREE.Vector3(0, 0.3, 5.2);
    if (viewMode === "radar") return new THREE.Vector3(0, 3.8, 4.2);
    return new THREE.Vector3(1.6, 0.2, 6.2); // Workspace shifted slightly right for visual balance
  }, [viewMode]);

  useFrame((state, delta) => {
    const speedMultiplier =
      status === "SCANNING" ? 4.2 : status === "CRITICAL" ? 2.8 : 1.0;

    // Smooth camera swoop transition (Mercedes / Apple style)
    camera.position.lerp(targetCameraPos, delta * 2.5);
    camera.lookAt(0, 0, 0);

    // Core & Rings Rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.18 * speedMultiplier;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.35 * speedMultiplier;
      ring1Ref.current.rotation.y += delta * 0.2 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.28 * speedMultiplier;
      ring2Ref.current.rotation.z += delta * 0.22 * speedMultiplier;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z -= delta * 0.15 * speedMultiplier;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * 0.45 * speedMultiplier;
      const pulse =
        status === "SCANNING"
          ? 1 + Math.sin(state.clock.elapsedTime * 10) * 0.18
          : 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.05;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }
    if (beaconRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
      beaconRef.current.scale.set(s, s, s);
      beaconRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Tactical Perspective Floor Grid */}
      <gridHelper
        ref={gridRef}
        args={[36, 36, themeColor, "#0f172a"]}
        position={[0, -2.5, 0]}
      />

      {/* 1. Fibonacci Particle Constellation Sphere */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.038}
          color={themeColor}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Inner Geodesic Tactical Core */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial
          color={themeColor}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 3. Orbital Gimbal Ring A */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.55, 0.018, 16, 80]} />
        <meshBasicMaterial color={themeColor} transparent opacity={0.45} />
      </mesh>

      {/* 4. Orbital Gimbal Ring B */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.85, 0.014, 16, 80]} />
        <meshBasicMaterial color={themeColor} transparent opacity={0.3} />
      </mesh>

      {/* 5. Outer Horizon Radar Ring C */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.24, 64]} />
        <meshBasicMaterial
          color={themeColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* 6. Active Threat Target Beacon */}
      {(status === "CRITICAL" || status === "HIGH" || status === "SCANNING") && (
        <mesh ref={beaconRef} position={[0, 0, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshBasicMaterial
            color={status === "SCANNING" ? "#818cf8" : "#ef4444"}
            wireframe
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
    </group>
  );
}
