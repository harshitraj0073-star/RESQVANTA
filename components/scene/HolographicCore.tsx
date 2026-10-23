"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SeverityLevel } from "@/types/triage";

interface HolographicCoreProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
}

export function HolographicCore({ status }: HolographicCoreProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);
  const beaconRef = useRef<THREE.Mesh>(null!);

  // Map state to colors
  const themeColor = useMemo(() => {
    switch (status) {
      case "SCANNING":
        return "#6366f1"; // Electric Indigo
      case "CRITICAL":
        return "#ef4444"; // Alert Crimson
      case "HIGH":
      case "MODERATE":
        return "#f59e0b"; // Hazard Amber
      case "LOW":
      case "NON_EMERGENCY":
        return "#10b981"; // Signal Emerald
      case "IDLE":
      default:
        return "#06b6d4"; // Cyber Cyan
    }
  }, [status]);

  // Procedural Fibonacci Sphere Geometry (1,200 points, zero file download lag)
  const particlePositions = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radius * 1.8;
      const z = Math.sin(theta) * radius * 1.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y * 1.8;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    const speedMultiplier = status === "SCANNING" ? 3.5 : status === "CRITICAL" ? 2.5 : 1;

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.2 * speedMultiplier;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.3 * speedMultiplier;
      ring1Ref.current.rotation.y += delta * 0.15 * speedMultiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.25 * speedMultiplier;
      ring2Ref.current.rotation.z += delta * 0.2 * speedMultiplier;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * 0.4 * speedMultiplier;
    }
    if (beaconRef.current && (status === "CRITICAL" || status === "HIGH")) {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.25;
      beaconRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* 1. Fibonacci Particle Sphere */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={themeColor}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Inner Icosahedron Tactical Wireframe */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshBasicMaterial
          color={themeColor}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 3. Outer Gimbal Telemetry Ring A */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.3, 0.02, 16, 64]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 4. Outer Gimbal Telemetry Ring B */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.5, 0.015, 16, 64]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* 5. Incident Target Beacon (Pulsing upon Critical / High Triage) */}
      {(status === "CRITICAL" || status === "HIGH") && (
        <mesh ref={beaconRef}>
          <octahedronGeometry args={[0.45]} />
          <meshBasicMaterial
            color="#ef4444"
            wireframe
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}
