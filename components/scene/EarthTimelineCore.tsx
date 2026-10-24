"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  createMagmaTexture,
  createSteamOceanTexture,
  createIceEarthTexture,
  createModernEarthTexture,
  resolveEra,
  GeologicalEra,
} from "@/lib/earthEras";

interface EarthTimelineCoreProps {
  progress: number; // 0.0 to 1.0 (Timeline scrub position)
  theme: "light" | "dark";
  viewMode: "hero" | "workspace" | "radar";
}

const SPHERE_RADIUS = 1.62;

export function EarthTimelineCore({
  progress,
  theme,
  viewMode,
}: EarthTimelineCoreProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const earthMeshRef = useRef<THREE.Mesh>(null!);
  const blendMeshRef = useRef<THREE.Mesh>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);

  // Inertial mouse pointer tracking
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const currentTiltX = useRef(0.12);
  const currentTiltY = useRef(0);
  const baseRotationY = useRef(0);

  const { camera } = useThree();
  const isLight = theme === "light";

  // Window passive mouse listener
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

  // Pre-generate era textures
  const textures = useMemo(() => {
    return {
      primordial: createMagmaTexture(),
      oceans: createSteamOceanTexture(),
      snowball: createIceEarthTexture(),
      today: createModernEarthTexture(),
    };
  }, []);

  // Resolve active era & blend factor
  const { currentEra, nextEra, blendFactor } = useMemo(() => {
    return resolveEra(progress);
  }, [progress]);

  const currentTexture = textures[currentEra.id as keyof typeof textures] || textures.today;
  const nextTexture = textures[nextEra.id as keyof typeof textures] || textures.today;

  // View-mode aware positioning and scale
  const targetScale = viewMode === "hero" ? 0.92 : viewMode === "workspace" ? 0.72 : 0.85;
  const targetPosY = viewMode === "hero" ? 0.52 : 0.45;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth inertial dampening
    pointerRef.current.x = THREE.MathUtils.damp(
      pointerRef.current.x,
      pointerRef.current.targetX,
      5.0,
      delta
    );
    pointerRef.current.y = THREE.MathUtils.damp(
      pointerRef.current.y,
      pointerRef.current.targetY,
      5.0,
      delta
    );

    // Continuous gentle planetary axial rotation
    baseRotationY.current += delta * 0.12;

    currentTiltX.current = THREE.MathUtils.damp(
      currentTiltX.current,
      0.12 + pointerRef.current.y * 0.18,
      4.0,
      delta
    );
    currentTiltY.current = THREE.MathUtils.damp(
      currentTiltY.current,
      baseRotationY.current + pointerRef.current.x * 0.28,
      4.0,
      delta
    );

    groupRef.current.rotation.x = currentTiltX.current;
    groupRef.current.rotation.y = currentTiltY.current;

    // Smooth transition scale
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.08
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetPosY,
      0.08
    );

    // Animate blend mesh opacity for texture morphing
    if (blendMeshRef.current) {
      const mat = blendMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, blendFactor, 0.15);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Floating Morphing Globe */}
      <group ref={groupRef} position={[0, targetPosY, 0]}>
        {/* Base Layer: Current Era Texture */}
        <mesh ref={earthMeshRef}>
          <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
          <meshStandardMaterial
            map={currentTexture}
            roughness={currentEra.id === "snowball" ? 0.25 : currentEra.id === "oceans" ? 0.4 : 0.65}
            metalness={currentEra.id === "primordial" ? 0.2 : 0.05}
            emissive={new THREE.Color(currentEra.accentColor)}
            emissiveIntensity={currentEra.id === "primordial" ? 0.45 : 0.02}
          />
        </mesh>

        {/* Blend Layer: Next Era Texture (Smoothly cross-fades via opacity) */}
        <mesh ref={blendMeshRef} scale={[1.001, 1.001, 1.001]}>
          <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
          <meshStandardMaterial
            map={nextTexture}
            transparent
            opacity={blendFactor}
            depthWrite={false}
            roughness={nextEra.id === "snowball" ? 0.25 : nextEra.id === "oceans" ? 0.4 : 0.65}
            metalness={nextEra.id === "primordial" ? 0.2 : 0.05}
            emissive={new THREE.Color(nextEra.accentColor)}
            emissiveIntensity={nextEra.id === "primordial" ? 0.45 : 0.02}
          />
        </mesh>

        {/* Atmosphere Outer Fresnel Glow */}
        <mesh ref={atmosphereRef} scale={[1.025, 1.025, 1.025]}>
          <sphereGeometry args={[SPHERE_RADIUS, 48, 48]} />
          <meshBasicMaterial
            color={currentEra.accentColor}
            transparent
            opacity={isLight ? 0.15 : 0.28}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 2. Soft Floating Studio Contact Shadow Underneath (Signature Quantapar Design) */}
      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={isLight ? 0.65 : 0.45}
        scale={6.5}
        blur={2.4}
        far={4.5}
        resolution={512}
        color={isLight ? "#1e293b" : "#000000"}
      />

      {/* 3. Studio Lighting Rig */}
      <ambientLight intensity={isLight ? 1.4 : 0.9} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={isLight ? 2.2 : 1.8}
        color="#ffffff"
      />
      <directionalLight
        position={[-6, -4, -3]}
        intensity={isLight ? 0.6 : 0.4}
        color="#38bdf8"
      />
    </group>
  );
}
