"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HolographicCore } from "./HolographicCore";
import { SeverityLevel } from "@/types/triage";
import { UIStrings } from "@/lib/translations";

interface SceneCanvasProps {
  status: "IDLE" | "SCANNING" | SeverityLevel;
  viewMode: "hero" | "workspace" | "radar";
  theme: "light" | "dark";
  activeHotspot: string | null;
  onSelectHotspot: (id: string | null) => void;
  t: UIStrings;
}

export default function SceneCanvas({
  status,
  viewMode,
  theme,
  activeHotspot,
  onSelectHotspot,
  t,
}: SceneCanvasProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.2, 5.2], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <HolographicCore
            status={status}
            viewMode={viewMode}
            theme={theme}
            activeHotspot={activeHotspot}
            onSelectHotspot={onSelectHotspot}
            t={t}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={status === "IDLE" && !activeHotspot}
            autoRotateSpeed={0.35}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
