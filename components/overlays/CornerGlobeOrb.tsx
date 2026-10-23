"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { Maximize2, X, Compass, Radio, MapPin, Layers, Sparkles } from "lucide-react";
import { resolveTargetCity, GROUNDED_CITIES } from "@/lib/geospatial";
import { UIStrings, SupportedLanguage } from "@/lib/translations";
import { SeverityLevel, TriageReport } from "@/types/triage";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-cyan-400 font-mono text-xs">
      Initialising 3D Geospatial Engine...
    </div>
  ),
});

interface CornerGlobeOrbProps {
  gpsCoords: string | null;
  activeReport: TriageReport | null;
  theme: "light" | "dark";
  language: SupportedLanguage;
  t: UIStrings;
  flyoverStage: "space" | "country" | "city";
  onFlyoverStageChange: (stage: "space" | "country" | "city") => void;
  coreStatus: "IDLE" | "SCANNING" | SeverityLevel;
}

export function CornerGlobeOrb({
  gpsCoords,
  activeReport,
  theme,
  language,
  t,
  flyoverStage,
  onFlyoverStageChange,
  coreStatus,
}: CornerGlobeOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resolved = resolveTargetCity(gpsCoords);
  const cityName = resolved.city.name;
  const isLight = theme === "light";

  // Real 3D WebGL Rotating Mini Globe in the corner
  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(72, 72);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 2.8;

    // Ambient & Directional Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x67e8f9, 2.2);
    dirLight.position.set(2, 2, 3);
    scene.add(dirLight);

    // Inner Core Sphere
    const sphereGeo = new THREE.SphereGeometry(0.9, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x0284c7 : 0x0f2b48,
      roughness: 0.4,
      metalness: 0.6,
      wireframe: false,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(globe);

    // Wireframe Grid Overlay for high-tech holographic orbital look
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.91, 16, 16), wireMat);
    scene.add(wireGlobe);

    // Atmospheric Glow Ring
    const ringGeo = new THREE.RingGeometry(1.02, 1.08, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    scene.add(ring);

    // Target City Beacon Dot (India sector)
    const beaconGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0.25, 0.35, 0.82);
    globe.add(beacon);

    let animationId: number;
    const animate = () => {
      globe.rotation.y += 0.012;
      wireGlobe.rotation.y += 0.012;
      ring.rotation.z -= 0.006;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
    };
  }, [isLight]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* 3D Floating Corner Globe Widget */}
      <aside
        aria-label="Interactive 3D Geospatial Radar"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open 3D Geospatial Radar Flyover Modal"
          className="group relative flex items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white border-2 border-cyan-500/40 hover:border-cyan-400 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {/* Real 3D Rotating Earth Sphere Canvas */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border border-cyan-400/30">
            <canvas ref={miniCanvasRef} className="w-full h-full" />
            {/* Radar Wave Ping Ping */}
            <span className="absolute -inset-1 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
          </div>

          {/* Holographic Text Label */}
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-extrabold tracking-wide text-white">
                Radar: {cityName}
              </span>
            </div>
            <div className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
              <span>Orbit Active</span>
              <span className="opacity-60">·</span>
              <span className="group-hover:underline flex items-center gap-0.5">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Expand 3D</span>
              </span>
            </div>
          </div>
        </button>
      </aside>

      {/* Expanded Fullscreen Geospatial Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="3D Geospatial Emergency Radar Flyover"
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-200"
        >
          {/* Top Bar Header */}
          <div className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/10 bg-slate-900/90 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30 shadow-inner">
                <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight">
                    3D Geospatial Orbital Flyover
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {cityName} Sector HQ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  WGS84 Geodesic Mesh · Regional Emergency Facilities & Climate Telemetry
                </p>
              </div>
            </div>

            {/* Stage Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-full border border-white/10 text-xs">
              {(
                [
                  { id: "space", label: "Space 🌍" },
                  { id: "country", label: "India 🇮🇳" },
                  { id: "city", label: `Sector (${cityName}) 📍` },
                ] as const
              ).map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => onFlyoverStageChange(stage.id)}
                  className={`px-3.5 py-1 rounded-full font-bold transition cursor-pointer text-xs ${
                    flyoverStage === stage.id
                      ? "bg-cyan-500 text-slate-950 shadow-[0_2px_8px_rgba(6,182,212,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close 3D Radar Flyover"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer border border-white/10"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close (ESC)</span>
            </button>
          </div>

          {/* Interactive 3D Canvas Body */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            <SceneCanvas
              status={coreStatus}
              viewMode="radar"
              theme="dark"
              activeHotspot="multimodal"
              onSelectHotspot={() => {}}
              t={t}
              gpsCoords={gpsCoords}
              flyoverStage={flyoverStage}
            />

            {/* Bottom HUD Overlay with Sector Facilities & Climate Telemetry */}
            <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto max-w-md pointer-events-none space-y-2">
              <div className="p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/20 text-xs text-slate-200 pointer-events-auto space-y-2 shadow-2xl">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Sector Telemetry (Demo Reference)</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {resolved.city.lat.toFixed(4)}°N, {resolved.city.lon.toFixed(4)}°E
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {resolved.city.state}, {resolved.city.country} · Ground Elevation {resolved.city.altitudeKm}km
                </p>
                <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/10">
                  <span>Temperature: {resolved.city.weather.tempC}°C ({resolved.city.weather.condition})</span>
                  <span>Wind: {resolved.city.weather.windKmh}km/h {resolved.city.weather.windDirection}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 px-1 font-mono">
                Tip: Drag mouse to rotate orbital view · Scroll to zoom · Press ESC to exit
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
