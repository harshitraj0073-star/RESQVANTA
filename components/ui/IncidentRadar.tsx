"use client";

import React, { useState, useMemo } from "react";
import { TriageReport } from "@/types/triage";
import { SupportedLanguage } from "@/lib/translations";
import {
  MapPin,
  Navigation,
  PhoneCall,
  Radar,
  ShieldAlert,
  Hospital,
  Flame,
  Radio,
  Crosshair,
  ExternalLink,
} from "lucide-react";

interface IncidentRadarProps {
  gpsCoords: string | null;
  onGpsCoordsChange: (coords: string | null) => void;
  activeReport: TriageReport | null;
  theme: "light" | "dark";
  language: SupportedLanguage;
}

interface EmergencyResponderNode {
  id: string;
  name: string;
  category: "MEDICAL" | "POLICE" | "FIRE" | "NDRF";
  phone: string;
  distanceKm: number;
  etaMin: number;
  dLat: number;
  dLon: number;
  angleDeg: number;
  radiusPct: number;
}

const RESPONDER_OFFSETS: EmergencyResponderNode[] = [
  {
    id: "police-112",
    name: "112 ERSS Police & PCR Tactical Unit",
    category: "POLICE",
    phone: "112",
    distanceKm: 0.8,
    etaMin: 2,
    dLat: 0.0055,
    dLon: 0.0042,
    angleDeg: 38,
    radiusPct: 28,
  },
  {
    id: "trauma-108",
    name: "Level-1 Trauma & Emergency Hospital",
    category: "MEDICAL",
    phone: "108",
    distanceKm: 1.4,
    etaMin: 4,
    dLat: -0.0085,
    dLon: 0.0095,
    angleDeg: 132,
    radiusPct: 48,
  },
  {
    id: "fire-101",
    name: "Municipal Fire & HazMat Rescue Station",
    category: "FIRE",
    phone: "101",
    distanceKm: 2.1,
    etaMin: 5,
    dLat: 0.012,
    dLon: -0.011,
    angleDeg: 315,
    radiusPct: 65,
  },
  {
    id: "ndrf-1070",
    name: "NDRF Rapid Disaster Response Hub",
    category: "NDRF",
    phone: "1070",
    distanceKm: 3.4,
    etaMin: 8,
    dLat: -0.018,
    dLon: -0.015,
    angleDeg: 225,
    radiusPct: 82,
  },
];

const QUICK_SECTORS = [
  { name: "Pune HQ", coords: "18.5204, 73.8567" },
  { name: "Mumbai Control", coords: "19.0760, 72.8777" },
  { name: "New Delhi 112", coords: "28.6139, 77.2090" },
  { name: "Bengaluru Grid", coords: "12.9716, 77.5946" },
  { name: "Kolkata Node", coords: "22.5726, 88.3639" },
];

export function IncidentRadar({
  gpsCoords,
  onGpsCoordsChange,
  activeReport,
  theme,
}: IncidentRadarProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("trauma-108");
  const [viewModeTab, setViewModeTab] = useState<"dual" | "globe" | "map">("dual");
  const isLight = theme === "light";

  // Parse coordinates or fallback to Pune/Mumbai Central Command (18.5204, 73.8567)
  const parsedCoords = useMemo(() => {
    if (gpsCoords) {
      const parts = gpsCoords.split(",").map((s) => parseFloat(s.trim()));
      if (
        parts.length === 2 &&
        !Number.isNaN(parts[0]) &&
        !Number.isNaN(parts[1])
      ) {
        return { lat: parts[0], lon: parts[1], isLive: true };
      }
    }
    return { lat: 18.5204, lon: 73.8567, isLive: false };
  }, [gpsCoords]);

  const handleLockGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const formatted = `${pos.coords.latitude.toFixed(
          5
        )}, ${pos.coords.longitude.toFixed(5)}`;
        onGpsCoordsChange(formatted);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Compute live responder coordinates around the user's epicenter
  const responderNodes = useMemo(() => {
    return RESPONDER_OFFSETS.map((node) => {
      const destLat = (parsedCoords.lat + node.dLat).toFixed(5);
      const destLon = (parsedCoords.lon + node.dLon).toFixed(5);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${parsedCoords.lat},${parsedCoords.lon}&destination=${destLat},${destLon}&travelmode=driving`;
      return {
        ...node,
        destLat,
        destLon,
        googleMapsUrl,
      };
    });
  }, [parsedCoords]);

  const selectedNode =
    responderNodes.find((n) => n.id === selectedNodeId) || responderNodes[0];

  // OpenStreetMap bounding box around the epicenter
  const osmEmbedUrl = useMemo(() => {
    const delta = 0.025;
    const minLon = (parsedCoords.lon - delta).toFixed(4);
    const minLat = (parsedCoords.lat - delta).toFixed(4);
    const maxLon = (parsedCoords.lon + delta).toFixed(4);
    const maxLat = (parsedCoords.lat + delta).toFixed(4);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${parsedCoords.lat}%2C${parsedCoords.lon}`;
  }, [parsedCoords]);

  const googleMapsSearchHospitalsUrl = `https://www.google.com/maps/search/emergency+hospital+near+${parsedCoords.lat},${parsedCoords.lon}`;

  return (
    <section
      aria-label="Live Incident Telemetry Radar and Emergency Responder Map"
      className="space-y-5"
    >
      {/* Top Telemetry Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <Radar className="w-4 h-4 animate-spin" />
            <span>GLOBAL & LOCAL EMERGENCY TELEMETRY RADAR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Responder Proximity & Ripple Map
          </h2>
          <p
            className={`text-xs ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            Real-time spatial triage, 1st–3rd order hazard perimeter, and
            one-click Google Maps emergency routing.
          </p>
        </div>

        {/* GPS Coordinate Lock Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`px-3.5 py-2 rounded-full text-xs font-mono flex items-center gap-2 backdrop-blur-md ${
              isLight
                ? "bg-white/85 text-slate-800 shadow-2xs"
                : "bg-slate-900/80 text-slate-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                parsedCoords.isLive
                  ? "bg-emerald-500 animate-ping"
                  : "bg-amber-500"
              }`}
            />
            <span>
              {parsedCoords.lat.toFixed(4)}° N, {parsedCoords.lon.toFixed(4)}° E
            </span>
            <span className="text-[10px] opacity-65">
              ({parsedCoords.isLive ? "LIVE GPS" : "DEFAULT SECTOR"})
            </span>
          </div>

          <button
            type="button"
            onClick={handleLockGps}
            disabled={isLocating}
            className="px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>
              {isLocating ? "Locking Satellite..." : "Lock My Live GPS"}
            </span>
          </button>

          <a
            href={googleMapsSearchHospitalsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition ${
              isLight
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <Hospital className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nearby Hospitals</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </a>
        </div>
      </div>

      {/* Quick Tactical Sectors & 3D Earth Pivot Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider opacity-70">
            Rotate 3D Earth:
          </span>
          {QUICK_SECTORS.map((sec) => {
            const isCurrent = gpsCoords?.trim() === sec.coords;
            return (
              <button
                key={sec.name}
                type="button"
                onClick={() => onGpsCoordsChange(sec.coords)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-cyan-600 text-white shadow-xs"
                    : isLight
                    ? "bg-white/85 text-slate-700 hover:bg-white border border-slate-200/60"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {sec.name}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div
          className={`p-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md ${
            isLight
              ? "bg-slate-200/70 text-slate-700"
              : "bg-slate-900/90 text-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => setViewModeTab("dual")}
            className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
              viewModeTab === "dual"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "hover:text-cyan-500"
            }`}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setViewModeTab("globe")}
            className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
              viewModeTab === "globe"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "hover:text-cyan-500"
            }`}
          >
            3D Planetary Radar
          </button>
          <button
            type="button"
            onClick={() => setViewModeTab("map")}
            className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
              viewModeTab === "map"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "hover:text-cyan-500"
            }`}
          >
            Street Map
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tactical Radar + Live Map | Right Responder Dispatch & Ripple Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Live OpenStreetMap + Tactical Radar HUD */}
        <div
          className={`lg:col-span-7 rounded-3xl overflow-hidden relative min-h-[380px] flex flex-col justify-between p-4 backdrop-blur-md ${
            isLight
              ? "bg-white/80 shadow-sm"
              : "bg-slate-950/75"
          }`}
        >
          {/* Live Tactical Display (3D Planetary HUD or OpenStreetMap Layer) */}
          {viewModeTab === "globe" ? (
            <div className="relative w-full h-[340px] rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-cyan-500/30 bg-cyan-950/10">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  3D PLANETARY RADAR ACTIVE
                </span>
                <span className="opacity-70">
                  SECTOR: {parsedCoords.lat.toFixed(4)}° N, {parsedCoords.lon.toFixed(4)}° E
                </span>
              </div>

              {/* Central Tactical Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-cyan-500/40 flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 rounded-full border border-amber-500/40 flex items-center justify-center">
                    <Crosshair className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono opacity-80 self-end">
                Move cursor for inertial parallax · Click any sector above to rotate 3D Earth
              </div>
            </div>
          ) : (
            <div className="relative w-full h-[340px] rounded-2xl overflow-hidden">
              <iframe
                title="ResQvanta Live Emergency Sector Map"
                src={osmEmbedUrl}
                className={`w-full h-full border-0 ${
                  isLight ? "" : "invert-90 hue-rotate-180 contrast-95"
                }`}
                loading="lazy"
              />

              {/* Tactical Radar Concentric Ripple Rings Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="w-72 h-72 rounded-full border border-cyan-500/35 flex items-center justify-center relative">
                  <div className="w-48 h-48 rounded-full border border-amber-500/45 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-red-500/60 bg-red-500/10 animate-pulse flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-red-600 shadow-lg shadow-red-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Overlay Legend */}
              <div
                className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl text-[11px] font-mono backdrop-blur-md flex items-center gap-3 ${
                  isLight
                    ? "bg-white/90 text-slate-900 shadow-xs"
                    : "bg-slate-950/85 text-slate-100"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  1st Order (0.5km)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  2nd Order (2km)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  3rd Order (5km)
                </span>
              </div>
            </div>
          )}

          {/* Bottom Map Action Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
              <span className="font-semibold">
                Active Route Target: {selectedNode.name} (
                {selectedNode.distanceKm} km · ~{selectedNode.etaMin} min ETA)
              </span>
            </div>
            <a
              href={selectedNode.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Launch Turn-by-Turn GPS</span>
            </a>
          </div>
        </div>

        {/* Right 5 Columns: Nearest Emergency Responders & Predictive Ripple Effect */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Nearest Emergency Dispatch Nodes */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Nearest Emergency Response Units
            </div>

            <div className="space-y-2">
              {responderNodes.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const Icon =
                  node.category === "MEDICAL"
                    ? Hospital
                    : node.category === "FIRE"
                    ? Flame
                    : node.category === "POLICE"
                    ? ShieldAlert
                    : Radio;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedNodeId(node.id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl backdrop-blur-md transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? isLight
                          ? "bg-cyan-600 text-white shadow-sm"
                          : "bg-cyan-500/25 text-white ring-1 ring-cyan-400/50"
                        : isLight
                        ? "bg-white/80 text-slate-900 hover:bg-white shadow-2xs"
                        : "bg-slate-950/70 text-slate-200 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {node.name}
                        </div>
                        <div
                          className={`text-[11px] font-mono mt-0.5 ${
                            isSelected ? "opacity-90" : "opacity-70"
                          }`}
                        >
                          {node.distanceKm} km away · ~{node.etaMin} min ETA
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={node.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={`Navigate to ${node.name}`}
                        className={`p-2 rounded-full transition ${
                          isSelected
                            ? "bg-white/20 hover:bg-white/30 text-white"
                            : isLight
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${node.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{node.phone}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1st, 2nd & 3rd Order Predictive Ripple Effect Box */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-md space-y-2.5 ${
              isLight
                ? "bg-white/80 text-slate-900 shadow-2xs"
                : "bg-slate-950/75 text-slate-100"
            }`}
          >
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Predictive Spatial Ripple Telemetry
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="font-bold text-red-600 dark:text-red-400">
                  1st Order (0–5 mins):{" "}
                </span>
                <span>
                  {activeReport
                    ? activeReport.urgency_rationale
                    : "Immediate perimeter safety & primary life-preservation triage at epicenter."}
                </span>
              </div>
              <div>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  2nd Order (5–20 mins):{" "}
                </span>
                <span>
                  Clear emergency access corridor for incoming 108/112 units and
                  prevent secondary bystander hazards.
                </span>
              </div>
              <div>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  3rd Order (20–60 mins):{" "}
                </span>
                <span>
                  Trauma center intake handoff with verified ResQvanta 112
                  dispatch brief.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
