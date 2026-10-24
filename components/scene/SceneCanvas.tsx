"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EarthTimelineCore } from "./EarthTimelineCore";
import { SeverityLevel } from "@/types/triage";
import { UIStrings } from "@/lib/translations";

interface SceneCanvasProps {
  status?: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
  theme: "light" | "dark";
  activeHotspot?: string | null;
  onSelectHotspot?: (id: string | null) => void;
  t?: UIStrings;
  gpsCoords?: string | null;
  flyoverStage?: "space" | "country" | "city";
  timelineProgress?: number;
}

export default function SceneCanvas({
  viewMode,
  theme,
  timelineProgress = 1.0,
}: SceneCanvasProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.25, 5.0], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <EarthTimelineCore
            progress={timelineProgress}
            theme={theme}
            viewMode={viewMode}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            enableRotate={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
