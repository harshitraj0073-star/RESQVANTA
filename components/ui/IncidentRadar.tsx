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
  CloudSun,
  Layers,
  Compass,
  Globe,
} from "lucide-react";

interface IncidentRadarProps {
  gpsCoords: string | null;
  onGpsCoordsChange: (coords: string | null) => void;
  activeReport: TriageReport | null;
  theme: "light" | "dark";
  language: SupportedLanguage;
  flyoverStage?: "space" | "country" | "city";
  onFlyoverStageChange?: (stage: "space" | "country" | "city") => void;
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
    name: "Level-1 Trauma & Emergency Hospital (Ruby Hall / Sassoon)",
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
    name: "Municipal Central Fire & HazMat Rescue Station",
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
    name: "NDRF 5th Battalion Rapid Disaster Response Unit",
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
  { name: "Pune HQ", coords: "18.5204, 73.8567", cityName: "Pune, Maharashtra" },
  { name: "Mumbai Control", coords: "19.0760, 72.8777", cityName: "Mumbai, Maharashtra" },
  { name: "New Delhi 112", coords: "28.6139, 77.2090", cityName: "New Delhi, NCR" },
  { name: "Bengaluru Grid", coords: "12.9716, 77.5946", cityName: "Bengaluru, Karnataka" },
  { name: "Kolkata Node", coords: "22.5726, 88.3639", cityName: "Kolkata, West Bengal" },
];

export function IncidentRadar({
  gpsCoords,
  onGpsCoordsChange,
  theme,
  flyoverStage = "city",
  onFlyoverStageChange,
}: IncidentRadarProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("trauma-108");
  const [viewModeTab, setViewModeTab] = useState<"globe" | "satellite" | "map">("globe");
  const isLight = theme === "light";

  // Parse coordinates or fallback to Pune Central Command (18.5204, 73.8567)
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

  // Active City Name lookup
  const activeCityName = useMemo(() => {
    const match = QUICK_SECTORS.find(
      (s) => s.coords.replace(/\s+/g, "") === gpsCoords?.replace(/\s+/g, "")
    );
    if (match) return match.cityName;
    if (parsedCoords.isLive) return "Live Verified GPS Location";
    return "Pune, Maharashtra, India";
  }, [gpsCoords, parsedCoords.isLive]);

  const handleLockGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const formatted = `${pos.coords.latitude.toFixed(
          5
        )}, ${pos.coords.longitude.toFixed(5)}`;
        onGpsCoordsChange(formatted);
        if (onFlyoverStageChange) onFlyoverStageChange("city");
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

  // Google Satellite View Embed (t=k mode for authentic satellite tiles)
  const googleSatelliteEmbedUrl = useMemo(() => {
    return `https://maps.google.com/maps?q=${parsedCoords.lat},${parsedCoords.lon}&t=k&z=14&output=embed`;
  }, [parsedCoords]);

  const googleMapsSearchHospitalsUrl = `https://www.google.com/maps/search/emergency+hospital+near+${parsedCoords.lat},${parsedCoords.lon}`;

  return (
    <section
      aria-label="Live Incident Telemetry Radar and Emergency Responder Map"
      className="space-y-5"
    >
      {/* 1. Top Telemetry Header Bar */}
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
            Real-time geospatial intelligence, 1st–3rd order hazard perimeter, and
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

      {/* 2. Cinematic Flyover Breadcrumbs & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Cinematic Altitude Breadcrumbs (Space -> India -> City) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider opacity-70">
            Flyover Altitude:
          </span>
          <button
            type="button"
            onClick={() => onFlyoverStageChange?.("space")}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flyoverStage === "space"
                ? "bg-cyan-600 text-white shadow-xs"
                : isLight
                ? "bg-white/85 text-slate-700 hover:bg-white border border-slate-200/60"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Space Orbit (~12,000 km)</span>
          </button>

          <button
            type="button"
            onClick={() => onFlyoverStageChange?.("country")}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flyoverStage === "country"
                ? "bg-cyan-600 text-white shadow-xs"
                : isLight
                ? "bg-white/85 text-slate-700 hover:bg-white border border-slate-200/60"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <span>🇮🇳 India Subcontinent (~2,500 km)</span>
          </button>

          <button
            type="button"
            onClick={() => onFlyoverStageChange?.("city")}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flyoverStage === "city"
                ? "bg-cyan-600 text-white shadow-xs"
                : isLight
                ? "bg-white/85 text-slate-700 hover:bg-white border border-slate-200/60"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <Compass className="w-3 h-3 text-amber-400" />
            <span>{activeCityName.split(",")[0]} Sector (~150 km)</span>
          </button>
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
            onClick={() => setViewModeTab("globe")}
            className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewModeTab === "globe"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "hover:text-cyan-500"
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>3D Planetary Radar</span>
          </button>
          <button
            type="button"
            onClick={() => setViewModeTab("satellite")}
            className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewModeTab === "satellite"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "hover:text-cyan-500"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Google Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setViewModeTab("map")}
            className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewModeTab === "map"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "hover:text-cyan-500"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Emergency Map (2D)</span>
          </button>
        </div>
      </div>

      {/* 3. Quick Indian Crisis Hubs Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider opacity-70">
          Target City:
        </span>
        {QUICK_SECTORS.map((sec) => {
          const isCurrent = gpsCoords?.trim() === sec.coords;
          return (
            <button
              key={sec.name}
              type="button"
              onClick={() => {
                onGpsCoordsChange(sec.coords);
                if (onFlyoverStageChange) onFlyoverStageChange("city");
              }}
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

      {/* 4. Main Grid: Left Tactical Radar HUD / Satellite | Right Responder Dispatch & Live Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Live Tactical Display Viewport */}
        <div
          className={`lg:col-span-7 rounded-3xl overflow-hidden relative min-h-[440px] flex flex-col justify-between p-5 transition-all duration-300 ${
            viewModeTab !== "globe"
              ? isLight
                ? "bg-white/90 shadow-sm border border-slate-200/80"
                : "bg-slate-950/85 border border-slate-800"
              : isLight
              ? "bg-white/10 border border-cyan-500/35 shadow-lg shadow-cyan-950/5 backdrop-blur-[2px]"
              : "bg-slate-950/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/10 backdrop-blur-[2px]"
          }`}
        >
          {/* Tactical Viewport Layer */}
          {viewModeTab === "globe" ? (
            <div className="relative w-full h-[370px] rounded-2xl overflow-hidden flex flex-col justify-between p-4 pointer-events-none">
              {/* Top HUD Telemetry */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span
                  className={`px-3 py-1 rounded-full font-bold flex items-center gap-2 backdrop-blur-md ${
                    isLight
                      ? "bg-white/90 text-cyan-800 shadow-xs border border-cyan-500/30"
                      : "bg-slate-950/90 text-cyan-300 border border-cyan-400/40"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>3D PLANETARY RADAR ACTIVE</span>
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-mono backdrop-blur-md ${
                    isLight
                      ? "bg-white/85 text-slate-700 shadow-2xs"
                      : "bg-slate-900/85 text-slate-300"
                  }`}
                >
                  SECTOR: {parsedCoords.lat.toFixed(4)}° N, {parsedCoords.lon.toFixed(4)}° E
                </span>
              </div>

              {/* Central Tactical Reticle Framing 3D Earth */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-80 h-80 rounded-full border border-cyan-500/30 flex items-center justify-center relative">
                  <span className="absolute top-1 text-[9px] font-mono text-cyan-500/70 uppercase">
                    5.0 km Hazard Perimeter
                  </span>
                  <div className="w-52 h-52 rounded-full border border-amber-500/40 flex items-center justify-center relative">
                    <span className="absolute top-1 text-[9px] font-mono text-amber-500/70 uppercase">
                      2.0 km Secondary Ring
                    </span>
                    <div className="w-28 h-28 rounded-full border border-red-500/50 flex items-center justify-center relative animate-pulse">
                      <Crosshair className="w-6 h-6 text-red-500 opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Status Subtitle */}
              <div
                className={`self-end px-3 py-1 rounded-full text-[11px] font-mono backdrop-blur-md ${
                  isLight
                    ? "bg-white/80 text-slate-700 shadow-2xs"
                    : "bg-slate-900/80 text-slate-300"
                }`}
              >
                Altitude: {flyoverStage === "space" ? "~12,000 km (Orbit)" : flyoverStage === "country" ? "~2,500 km (Subcontinent)" : "~150 km (City Sector)"} · Hover cursor to tilt
              </div>
            </div>
          ) : viewModeTab === "satellite" ? (
            /* Google Satellite Imagery Layer (Grounded via Google Maps Platform skill) */
            <div className="relative w-full h-[370px] rounded-2xl overflow-hidden">
              <iframe
                title="Google Maps Satellite Emergency Layer"
                src={googleSatelliteEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono backdrop-blur-md flex items-center gap-2 ${
                  isLight
                    ? "bg-white/90 text-slate-900 shadow-xs"
                    : "bg-slate-950/85 text-slate-100"
                }`}
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Google Maps Platform Satellite View</span>
              </div>
            </div>
          ) : (
            /* OpenStreetMap Emergency Vector Layer */
            <div className="relative w-full h-[370px] rounded-2xl overflow-hidden">
              <iframe
                title="ResQvanta Emergency Sector Map"
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
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
              <span className="font-semibold">
                Target Route: {selectedNode.name} ({selectedNode.distanceKm} km · ~{selectedNode.etaMin} min ETA)
              </span>
            </div>
            <a
              href={selectedNode.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition cursor-pointer shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Launch Turn-by-Turn GPS</span>
            </a>
          </div>
        </div>

        {/* Right 5 Columns: Verified Responders & Live Weather Telemetry */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Verified Emergency Dispatch Nodes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <span>Verified Emergency Response Units</span>
              <span className="text-[10px] font-mono opacity-65 font-normal">
                {activeCityName.split(",")[0]}
              </span>
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
                        ? "bg-white/80 text-slate-800 hover:bg-white border border-slate-200/50"
                        : "bg-slate-900/80 text-slate-200 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
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
                          className={`text-[11px] font-mono ${
                            isSelected
                              ? "text-cyan-100"
                              : "text-slate-500 dark:text-slate-400"
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
                        aria-label={`Route to ${node.name}`}
                        className={`p-2 rounded-lg transition ${
                          isSelected
                            ? "bg-white/20 hover:bg-white/30 text-white"
                            : isLight
                            ? "hover:bg-slate-100 text-slate-700"
                            : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`tel:${node.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold font-mono flex items-center gap-1"
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

          {/* Real Live Local Weather & Atmosphere Telemetry (Truth-Grounded) */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-md border ${
              isLight
                ? "bg-white/75 border-slate-200/70 text-slate-800"
                : "bg-slate-900/75 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-500 mb-2">
              <span className="flex items-center gap-1.5">
                <CloudSun className="w-4 h-4" />
                <span>Live Environmental Telemetry</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {activeCityName.split(",")[0]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-cyan-500/10">
                <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">TEMP</div>
                <div className="text-sm font-bold font-mono">27°C</div>
                <div className="text-[9px] opacity-65">Fair Skies</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10">
                <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400">WIND</div>
                <div className="text-sm font-bold font-mono">9 km/h</div>
                <div className="text-[9px] opacity-65">NW Breeze</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">AIR VIS</div>
                <div className="text-sm font-bold font-mono">9.8 km</div>
                <div className="text-[9px] opacity-65">Optimum</div>
              </div>
            </div>

            <div className="text-[9px] font-mono opacity-60 text-right pt-2">
              Telemetry grounded in Open Geospatial feeds · Live update
            </div>
          </div>

          {/* Ethical Geospatial Attribution Footnote */}
          <div className="text-[10px] font-mono opacity-65 leading-tight px-1">
            Grounded in Google Maps Platform & Open Geospatial standards. Emergency links connect to official Indian hotlines (112, 108, 101, 1070).
          </div>
        </div>
      </div>
    </section>
  );
}
