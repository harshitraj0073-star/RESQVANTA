"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PhotorealisticEarthScene } from "./PhotorealisticEarthScene";
import { SeverityLevel } from "@/types/triage";
import { UIStrings } from "@/lib/translations";

interface SceneCanvasProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
  theme: "light" | "dark";
  activeHotspot: string | null;
  onSelectHotspot: (id: string | null) => void;
  t: UIStrings;
  gpsCoords?: string | null;
  flyoverStage?: "space" | "country" | "city";
}

export default function SceneCanvas({
  status,
  viewMode,
  theme,
  activeHotspot,
  onSelectHotspot,
  t,
  gpsCoords,
  flyoverStage = "city",
}: SceneCanvasProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.18, 4.95], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          preserveDrawingBuffer: true,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <PhotorealisticEarthScene
            status={status}
            viewMode={viewMode}
            theme={theme}
            activeHotspot={activeHotspot}
            onSelectHotspot={onSelectHotspot}
            t={t}
            gpsCoords={gpsCoords}
            flyoverStage={flyoverStage}
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
