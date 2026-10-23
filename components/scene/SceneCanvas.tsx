"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HolographicCore } from "./HolographicCore";
import { SeverityLevel } from "@/types/triage";

interface SceneCanvasProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
}

export default function SceneCanvas({ status, viewMode }: SceneCanvasProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.3, 5.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <HolographicCore status={status} viewMode={viewMode} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={status === "IDLE"}
            autoRotateSpeed={0.45}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
