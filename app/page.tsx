"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { TopNav } from "@/components/ui/TopNav";
import { InputConsole } from "@/components/ui/InputConsole";
import { ActionCard } from "@/components/ui/ActionCard";
import { TriageReport, SeverityLevel } from "@/types/triage";
import { PRESET_SCENARIOS } from "@/lib/presets";
import { CORE_HOTSPOTS } from "@/components/scene/HolographicCore";
import {
  ArrowRight,
  Sparkles,
  Radio,
  PhoneCall,
  Layers,
  AlertCircle
} from "lucide-react";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#04070f]" />
});

export default function ResQvantaApp() {
  const [viewMode, setViewMode] = useState<"hero" | "workspace" | "radar">("hero");
  const [is3DMode, setIs3DMode] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>("multimodal");
  const [language, setLanguage] = useState("English");
  const [gpsActive, setGpsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [triageReport, setTriageReport] = useState<TriageReport | null>(null);
  const [incidentFeed, setIncidentFeed] = useState<TriageReport[]>([]);
  const [lastPayload, setLastPayload] = useState<any>(null);

  const coreStatus: "IDLE" | "SCANNING" | SeverityLevel = isLoading
    ? "SCANNING"
    : triageReport
    ? triageReport.severity_level
    : "IDLE";

  const handleAnalyze = async (payload: {
    text: string;
    imageBase64: string | null;
    imageMimeType: string | null;
    gpsCoords: string | null;
    manualLocation?: string;
  }) => {
    setViewMode("workspace");
    setIsLoading(true);
    setApiError(null);
    setLastPayload(payload);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          language
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server returned HTTP ${res.status}`);
      }

      const data: TriageReport = await res.json();
      setTriageReport(data);
      setIncidentFeed((prev) => [data, ...prev]);
    } catch (err: any) {
      setApiError(
        err.message ||
          "Could not complete Gemini analysis. If this is an emergency, please call 112 immediately."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveMissing = async (additionalDetails: string) => {
    if (!lastPayload || isResolving) return;
    setIsResolving(true);
    setApiError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lastPayload,
          followUpContext: additionalDetails,
          language
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update analysis.");
      }
      const updatedData: TriageReport = await res.json();
      setTriageReport(updatedData);
      setIncidentFeed((prev) => [updatedData, ...prev.slice(1)]);
    } catch (err: any) {
      setApiError(err.message || "Could not update report with correction.");
    } finally {
      setIsResolving(false);
    }
  };

  const currentHotspotObj =
    CORE_HOTSPOTS.find((h) => h.id === activeHotspot) || CORE_HOTSPOTS[0];

  return (
    <div className="min-h-screen bg-[#04070f] text-slate-100 relative overflow-x-hidden flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* 1. Luxury Showroom 3D WebGL Spatial Background */}
      {is3DMode && (
        <div className="fixed inset-0 z-0 pointer-events-auto">
          <SceneCanvas
            status={coreStatus}
            viewMode={viewMode}
            activeHotspot={activeHotspot}
            onSelectHotspot={setActiveHotspot}
          />
        </div>
      )}

      {/* 2. Top Navigation Bar (With Always-Visible Call 112 Button) */}
      <TopNav
        is3DMode={is3DMode}
        onToggle3D={() => setIs3DMode(!is3DMode)}
        language={language}
        onLanguageChange={setLanguage}
        gpsActive={gpsActive}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 3. Main Three-Act Experience Controller */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col justify-center pointer-events-none">
        {/* ==================== ACT 1: THE LUXURY ENTRANCE ==================== */}
        {viewMode === "hero" && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 my-auto py-6">
            {/* Left Showroom Pitch Card */}
            <div className="max-w-xl space-y-5 pointer-events-auto bg-[#070b14]/85 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powered by Google Gemini 3.8 Flash</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ResQvanta AI — From Chaos to Action
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                From Human Panic to{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-amber-300 bg-clip-text text-transparent">
                  Informed Action.
                </span>
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                Transform uncertain situations into structured information and clearer next steps.{" "}
                <strong className="text-white">ResQvanta AI</strong> takes messy multilingual text, voice, or photos and separates reported facts from AI-identified risks—helping you prepare a clear 112 Emergency Brief.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleAnalyze({
                      text: PRESET_SCENARIOS[0].text,
                      imageBase64: null,
                      imageMimeType: null,
                      gpsCoords: null,
                      manualLocation: "Fictional Demo Scenario A"
                    });
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wide uppercase shadow-xl shadow-cyan-500/20 border border-cyan-300 transition transform active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>⚡ 1-Tap Live Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("workspace")}
                  className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition flex items-center space-x-2 cursor-pointer"
                >
                  <span>Enter Incident Workspace</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

              {/* Direct Emergency Contact Option (Never Delayed by Intro) */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  Facing a real-world emergency right now? Skip the assistant:
                </span>
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 112 Emergency Services</span>
                </a>
              </div>
            </div>

            {/* Right Interactive Hotspot Inspector (Works with 3D Clicks, Keyboard, and Mobile/2D Mode) */}
            <div className="pointer-events-auto lg:max-w-sm w-full space-y-3">
              <div className="bg-[#070b14]/85 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                    Interactive Architecture Hotspots
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Click or Tab
                  </span>
                </div>

                {/* Accessible Hotspot Selector Buttons (Also serves as Mobile / 2D Lite alternative) */}
                <div className="grid grid-cols-1 gap-2" role="tablist" aria-label="System Architecture Hotspots">
                  {CORE_HOTSPOTS.map((spot) => {
                    const isSelected = currentHotspotObj.id === spot.id;
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveHotspot(spot.id)}
                        className={`text-left p-3 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-400/60 text-white"
                            : "bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                              {spot.label}
                            </span>
                            <span>{spot.shortTitle}</span>
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-cyan-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                          {spot.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ACT 2 & ACT 3: WORKSPACE & EVIDENCE MATRIX ==================== */}
        {viewMode === "workspace" && (
          <div className="space-y-4">
            {apiError && (
              <div
                role="alert"
                className="pointer-events-auto p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{apiError}</span>
                </div>
                <a
                  href="tel:112"
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold shrink-0"
                >
                  Call 112
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 Cols): Multimodal Ingestion Console */}
              <div className="lg:col-span-5 pointer-events-auto">
                <InputConsole
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  onGpsChange={setGpsActive}
                />
              </div>

              {/* Right Column (7 Cols): Evidence Matrix & 112 Emergency Brief */}
              <div className="lg:col-span-7 pointer-events-auto">
                {triageReport ? (
                  <ActionCard
                    report={triageReport}
                    onResolveMissingInfo={handleResolveMissing}
                    isResolving={isResolving}
                  />
                ) : (
                  <div className="bg-[#090d16]/85 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Layers className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Evidence &amp; Uncertainty Engine Ready
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                        Choose one of the three fictional demo scenarios on the left (Flood, Road Accident, or Coffee Spill) or enter your own description, then click{" "}
                        <strong className="text-slate-200">Analyze with Gemini</strong>.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-slate-800">
                      {isLoading
                        ? "PROCESSING LIVE WITH GEMINI 3.8 FLASH..."
                        : "READY · SEPARATES REPORTED FACTS FROM AI INTERPRETATIONS"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 3: SESSION HISTORY ==================== */}
        {viewMode === "radar" && (
          <div className="pointer-events-auto bg-[#090d16]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  <span>ANALYZED REPORTS IN THIS SESSION</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Session Incident Briefs
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewMode("workspace")}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition cursor-pointer"
              >
                + New Incident Analysis
              </button>
            </div>

            {incidentFeed.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No scenarios analyzed in this session yet. Open the Incident Workspace to test a scenario.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incidentFeed.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setTriageReport(item);
                      setViewMode("workspace");
                    }}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                        {item.severity_level}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.incident_category}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{item.incident_title}</div>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.executive_summary}</p>
                    <div className="text-[10px] font-mono text-cyan-400 pt-1">
                      📍 {item.location_status.detected_location} → Open Evidence Matrix
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-[#04070f]/90 backdrop-blur-md py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <div>
          ResQvanta AI — From Chaos to Action · Powered by Google Gemini 3.8 Flash
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setViewMode("hero")}
            className="hover:text-cyan-400 cursor-pointer"
          >
            1. Showroom Intro
          </button>
          <button
            type="button"
            onClick={() => setViewMode("workspace")}
            className="hover:text-cyan-400 cursor-pointer"
          >
            2. Incident Workspace
          </button>
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className="hover:text-cyan-400 cursor-pointer"
          >
            3. Session History ({incidentFeed.length})
          </button>
        </div>
      </footer>
    </div>
  );
}
