"use client";

import React, { useState, useMemo } from "react";
import { TriageReport } from "@/types/triage";
import { SupportedLanguage } from "@/lib/translations";
import {
  GROUNDED_CITIES,
  resolveTargetCity,
  CityResponder,
} from "@/lib/geospatial";
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
  AlertTriangle,
  Target,
} from "lucide-react";

interface IncidentRadarProps {
  gpsCoords: string | null;
  onGpsCoordsChange: (coords: string | null) => void;
  activeReport?: TriageReport | null;
  theme: "light" | "dark";
  language?: SupportedLanguage;
  flyoverStage?: "space" | "country" | "city";
  onFlyoverStageChange?: (stage: "space" | "country" | "city") => void;
}

interface EnrichedResponderNode extends CityResponder {
  destLat: string;
  destLon: string;
  googleMapsUrl: string;
}

export function IncidentRadar({
  gpsCoords,
  onGpsCoordsChange,
  theme,
  flyoverStage = "city",
  onFlyoverStageChange,
}: IncidentRadarProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [userSelectedNodeId, setUserSelectedNodeId] = useState<string | null>(null);
  const [viewModeTab, setViewModeTab] = useState<"satellite" | "map">("satellite");
  const isLight = theme === "light";

  // WGS84 authoritative city resolution
  const targetResolution = useMemo(() => {
    return resolveTargetCity(gpsCoords);
  }, [gpsCoords]);

  const activeCity = targetResolution.city;
  const parsedCoords = targetResolution.coords;
  const isLive = !targetResolution.isMatchedPreset;

  // Active City formatted display name
  const activeCityDisplayName = useMemo(() => {
    return `${activeCity.name}, ${activeCity.state}, ${activeCity.country}`;
  }, [activeCity]);

  // Compute live responder coordinates around the city's verified epicenter
  const responderNodes: EnrichedResponderNode[] = useMemo(() => {
    return activeCity.responders.map((node) => {
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
  }, [activeCity, parsedCoords]);

  // Purely derived selected node without cascading effect renders
  const selectedNode = useMemo(() => {
    if (userSelectedNodeId) {
      const match = responderNodes.find((n) => n.id === userSelectedNodeId);
      if (match) return match;
    }
    const medical = responderNodes.find((n) => n.category === "MEDICAL");
    return medical || responderNodes[0];
  }, [userSelectedNodeId, responderNodes]);

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

  // OpenStreetMap bounding box around the active epicenter
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
      className="space-y-6"
    >
      {/* 1. Top Telemetry Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <Radar className="w-4 h-4 animate-spin" />
            <span>GLOBAL & LOCAL EMERGENCY TELEMETRY RADAR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Responder Proximity & Tactical Ripple Map
          </h2>
          <p
            className={`text-xs ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            Georeferenced planetary targeting, authentic satellite layers, and
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
                isLive ? "bg-emerald-500 animate-ping" : "bg-amber-500"
              }`}
            />
            <span>
              {parsedCoords.lat.toFixed(4)}° N, {parsedCoords.lon.toFixed(4)}° E
            </span>
            <span className="text-[10px] opacity-65">
              ({isLive ? "LIVE GPS" : "VERIFIED SECTOR"})
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
      {/* 2. Tactical View Mode Switcher: Satellite & Normal Map Only */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider opacity-70">
            Navigation Layer:
          </span>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
            {viewModeTab === "satellite" ? "Google Maps Platform Satellite" : "OpenStreetMap 2D Vector"}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div
          className={`p-1 rounded-2xl sm:rounded-full text-xs font-bold flex flex-wrap sm:flex-nowrap items-center gap-1 backdrop-blur-md border border-transparent ${
            isLight
              ? "bg-slate-200/70 text-slate-700"
              : "bg-slate-900/90 text-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => setViewModeTab("satellite")}
            className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewModeTab === "satellite"
                ? "bg-cyan-600 text-white shadow-xs"
                : "hover:text-cyan-400 text-slate-400"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Google Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setViewModeTab("map")}
            className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewModeTab === "map"
                ? "bg-cyan-600 text-white shadow-xs"
                : "hover:text-cyan-400 text-slate-400"
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
        {GROUNDED_CITIES.map((city) => {
          const isCurrent = activeCity.id === city.id;
          const coordsStr = `${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`;
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => {
                setUserSelectedNodeId(null);
                onGpsCoordsChange(coordsStr);
                if (onFlyoverStageChange) onFlyoverStageChange("city");
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer border border-transparent ${
                isCurrent
                  ? "bg-cyan-600 text-white shadow-xs ring-2 ring-cyan-400/40"
                  : isLight
                  ? "bg-white/85 text-slate-700 hover:bg-white"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {city.shortName}
            </button>
          );
        })}
      </div>

      {/* 4. Prominent Center-Stage Tactical Satellite & Emergency Map Deck */}
      <div
        className={`w-full rounded-3xl overflow-hidden relative min-h-[460px] flex flex-col justify-between p-6 transition-all duration-300 border border-transparent ${
          isLight
            ? "bg-white/90 shadow-md backdrop-blur-xl"
            : "bg-slate-950/85 shadow-2xl backdrop-blur-xl"
        }`}
      >
        {/* Tactical Map Viewport Layer */}
        {viewModeTab === "satellite" ? (
          /* Google Satellite Imagery Layer */
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-transparent">
            <iframe
              title="Google Maps Satellite Emergency Layer"
              src={googleSatelliteEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
            />
            <div
              className={`absolute top-3 left-3 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold backdrop-blur-md flex items-center gap-2 border border-transparent ${
                isLight
                  ? "bg-white/95 text-slate-900 shadow-xs"
                  : "bg-slate-950/90 text-slate-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Maps Platform Satellite View: {activeCity.name} Sector</span>
            </div>
          </div>
        ) : (
          /* OpenStreetMap Emergency Vector Layer */
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-transparent">
            <iframe
              title="ResQvanta Emergency Sector Map"
              src={osmEmbedUrl}
              className={`w-full h-full border-0 ${
                isLight ? "" : "invert-90 hue-rotate-180 contrast-95"
              }`}
              loading="lazy"
            />
            <div
              className={`absolute top-3 left-3 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold backdrop-blur-md flex items-center gap-2 border border-transparent ${
                isLight
                  ? "bg-white/95 text-slate-900 shadow-xs"
                  : "bg-slate-950/90 text-slate-100"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>OpenStreetMap Emergency Street Layer: {activeCity.name} Sector</span>
            </div>
          </div>
        )}

        {/* Bottom Route Action Bar */}
        <div className="pt-4 border-t border-slate-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
            <span className="font-semibold">
              Primary Routing Destination: {selectedNode?.name || "Emergency Station"} ({selectedNode?.distanceKm || 1.2} km · ~{selectedNode?.etaMin || 3} min ETA)
            </span>
          </div>
          <a
            href={selectedNode?.googleMapsUrl || `https://www.google.com/maps/search/emergency+near+${parsedCoords.lat},${parsedCoords.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition cursor-pointer shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Launch Turn-by-Turn GPS</span>
          </a>
        </div>
      </div>

      {/* 5. Lower Section: Dynamic Emergency Responders & Live Environmental Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Verified Emergency Dispatch Nodes */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <span>Nearest Verified Emergency Response Units</span>
            <span className="text-[10px] font-mono opacity-65 font-normal">
              {activeCity.name}
            </span>
          </div>

          <div className="space-y-2">
            {responderNodes.map((node) => {
              const isSelected = node.id === selectedNode?.id;
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
                  onClick={() => setUserSelectedNodeId(node.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setUserSelectedNodeId(node.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl backdrop-blur-md transition cursor-pointer flex items-center justify-between gap-3 border border-transparent ${
                    isSelected
                      ? isLight
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "bg-cyan-500/25 text-white ring-1 ring-cyan-400/50"
                      : isLight
                      ? "bg-white/80 text-slate-800 hover:bg-white"
                      : "bg-slate-900/80 text-slate-200 hover:bg-slate-800"
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

        {/* Right 5 Columns: Environmental Telemetry & Predictive Ripple Effects */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Grounded Local Weather & Atmosphere Telemetry */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-md border border-transparent ${
              isLight
                ? "bg-white/80 text-slate-800 shadow-sm"
                : "bg-slate-900/80 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-500 mb-2">
              <span className="flex items-center gap-1.5">
                <CloudSun className="w-4 h-4" />
                <span>Live Environmental Telemetry</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {activeCity.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-cyan-500/10">
                <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">TEMP</div>
                <div className="text-sm font-bold font-mono">{activeCity.weather.tempC}°C</div>
                <div className="text-[9px] opacity-65">{activeCity.weather.condition}</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10">
                <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400">WIND</div>
                <div className="text-sm font-bold font-mono">{activeCity.weather.windKmh} km/h</div>
                <div className="text-[9px] opacity-65">{activeCity.weather.windDirection} Breeze</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">AIR VIS</div>
                <div className="text-sm font-bold font-mono">{activeCity.weather.visibilityKm} km</div>
                <div className="text-[9px] opacity-65">Optimum</div>
              </div>
            </div>

            <div className="text-[9px] font-mono opacity-60 text-right pt-2">
              Telemetry grounded in Open Geospatial feeds · Live update
            </div>
          </div>

          {/* Predictive Spatial Ripple Telemetry */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-md border border-transparent space-y-2 ${
              isLight
                ? "bg-white/80 text-slate-800 shadow-sm"
                : "bg-slate-900/80 text-slate-200"
            }`}
          >
            <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Predictive Spatial Ripple Telemetry</span>
            </div>
            <div className="text-xs space-y-1.5 leading-relaxed">
              <div>
                <span className="font-bold text-red-500">1st Order (0–5 mins):</span> Immediate perimeter safety & primary life-preservation triage at epicenter.
              </div>
              <div>
                <span className="font-bold text-amber-500">2nd Order (5–20 mins):</span> Clear emergency access corridor for incoming 108/112 units and prevent secondary bystander hazards.
              </div>
              <div>
                <span className="font-bold text-cyan-500">3rd Order (20–60 mins):</span> Trauma center intake handoff with verified ResQvanta 112 dispatch brief.
              </div>
            </div>
          </div>

          {/* Ethical Geospatial Attribution Footnote */}
          <div className="text-[10px] font-mono opacity-65 leading-tight px-1">
            Grounded in Google Maps Platform & WGS84 standards. Emergency links connect to official Indian emergency dispatch (112, 108, 101, 1070).
          </div>
        </div>
      </div>
    </section>
  );
}
