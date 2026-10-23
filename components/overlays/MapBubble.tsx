"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Maximize2, X, Globe, Compass, Radio, MapPin } from "lucide-react";
import { resolveTargetCity } from "@/lib/geospatial";
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

interface MapBubbleProps {
  gpsCoords: string | null;
  activeReport: TriageReport | null;
  theme: "light" | "dark";
  language: SupportedLanguage;
  t: UIStrings;
  flyoverStage: "space" | "country" | "city";
  onFlyoverStageChange: (stage: "space" | "country" | "city") => void;
  coreStatus: "IDLE" | "SCANNING" | SeverityLevel;
}

export function MapBubble({
  gpsCoords,
  activeReport,
  theme,
  language,
  t,
  flyoverStage,
  onFlyoverStageChange,
  coreStatus,
}: MapBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const resolved = resolveTargetCity(gpsCoords);
  const cityName = resolved.city.name;

  // ESC key to close modal
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
      {/* Floating Corner Orb / Pill (Safely positioned above mobile dock) */}
      <aside
        aria-label="Floating Geospatial Radar"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open 3D Geospatial Radar Flyover Modal"
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-md transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>

          <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Radar: {cityName}</span>
          </span>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500/30 transition flex items-center gap-1">
            <Maximize2 className="w-2.5 h-2.5" />
            <span>Expand 3D</span>
          </span>
        </button>
      </aside>

      {/* Expanded Fullscreen Geospatial Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="3D Geospatial Emergency Radar Flyover"
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200"
        >
          {/* Top Bar Header */}
          <div className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight">
                    3D Geospatial Radar Flyover
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    {cityName} HQ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Orbital WGS84 trajectory · Reference emergency facilities & flyover
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
                  className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer text-xs ${
                    flyoverStage === stage.id
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
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

            {/* Bottom HUD Overlay with Telemetry Sample and Camera Tip */}
            <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto max-w-md pointer-events-none space-y-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-xs text-slate-200 pointer-events-auto space-y-1.5 shadow-xl">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Sector Telemetry (Demo Reference)</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {resolved.city.lat.toFixed(4)}°N, {resolved.city.lon.toFixed(4)}°E
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {resolved.city.state}, {resolved.city.country} · Elev. {resolved.city.altitudeKm}km
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/10">
                  <span>Weather: {resolved.city.weather.tempC}°C ({resolved.city.weather.condition})</span>
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
