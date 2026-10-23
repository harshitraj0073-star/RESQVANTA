"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HolographicCore } from "./HolographicCore";
import { SeverityLevel } from "@/types/triage";

interface SceneCanvasProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
}

export default function SceneCanvas({ status }: SceneCanvasProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <HolographicCore status={status} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={status === "IDLE"}
            autoRotateSpeed={0.5}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
