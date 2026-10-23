"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { TopNav } from "@/components/ui/TopNav";
import { InputConsole } from "@/components/ui/InputConsole";
import { ActionCard } from "@/components/ui/ActionCard";
import { TriageReport, SeverityLevel } from "@/types/triage";
import { PRESET_SCENARIOS } from "@/lib/presets";
import { ArrowRight, ShieldAlert, Sparkles, Radio, CheckCircle2, PhoneCall, Layers } from "lucide-react";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-950/40" />
});

export default function ResQvantaApp() {
  const [viewMode, setViewMode] = useState<"hero" | "workspace" | "radar">("hero");
  const [is3DMode, setIs3DMode] = useState(true);
  const [language, setLanguage] = useState("English");
  const [gpsActive, setGpsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

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
  }) => {
    setViewMode("workspace");
    setIsLoading(true);
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
      alert(`Triage Error: ${err.message || "Failed to analyze incident."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveMissing = async (additionalDetails: string) => {
    if (!lastPayload) return;
    setIsResolving(true);

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

      if (!res.ok) throw new Error("Failed to re-triage with updated context.");
      const updatedData: TriageReport = await res.json();
      setTriageReport(updatedData);
      setIncidentFeed((prev) => [updatedData, ...prev.slice(1)]);
    } catch (err: any) {
      alert(`Update Error: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 relative overflow-x-hidden flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Interactive 3D WebGL Spatial Background */}
      {is3DMode && (
        <div className="fixed inset-0 z-0 pointer-events-auto">
          <SceneCanvas status={coreStatus} viewMode={viewMode} />
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <TopNav
        is3DMode={is3DMode}
        onToggle3D={() => setIs3DMode(!is3DMode)}
        language={language}
        onLanguageChange={setLanguage}
        gpsActive={gpsActive}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 3. Main View Controller */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col justify-center pointer-events-none">
        
        {/* ==================== VIEW 1: 3D HERO LANDING ==================== */}
        {viewMode === "hero" && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 my-auto py-8">
            {/* Left Hero Pitch */}
            <div className="max-w-xl space-y-6 pointer-events-auto bg-slate-950/65 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNIVERSAL EMERGENCY TRIAGE BRIDGE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                When Seconds Matter,{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Clarity Matters More.
                </span>
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                People in crises panic—sending incomplete Hinglish voice notes, chaotic text, or blurry photos.{" "}
                <strong className="text-white">ResQvanta AI</strong> uses Google Gemini 2.5 Flash to transform raw human distress into structured, epistemically verified life-saving protocols and 112-ready dispatch packets.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setViewMode("workspace")}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-cyan-500/25 border border-cyan-400/30 flex items-center space-x-2 transition transform active:scale-95 cursor-pointer"
                >
                  <span>Initialize Incident Triage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    handleAnalyze({
                      text: PRESET_SCENARIOS[0].text,
                      imageBase64: null,
                      imageMimeType: null,
                      gpsCoords: "18.5913° N, 73.9146° E (Lohegaon, Pune)"
                    });
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700 transition cursor-pointer"
                >
                  ⚡ 1-Tap Live Demo
                </button>
              </div>

              {/* 3 Pillar Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-left">
                <div>
                  <div className="text-xs font-bold text-cyan-400 font-mono">MULTIMODAL</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Voice, Hinglish &amp; Photos</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-400 font-mono">EPISTEMIC</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Facts vs AI Inferences</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">112 READY</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Instant Dispatch Packet</div>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Callout HUD */}
            <div className="pointer-events-auto lg:max-w-xs w-full space-y-3">
              <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Interactive 3D Spatial Core
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Drag anywhere on the background globe to orbit the 1,600-node Fibonacci threat array.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: INCIDENT WORKSPACE ==================== */}
        {viewMode === "workspace" && (
          <div>
            {/* Mobile Dedicated 3D Viewport Window (<768px) */}
            {is3DMode && (
              <div className="block md:hidden h-48 w-full rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950/60 mb-5 pointer-events-auto">
                <SceneCanvas status={coreStatus} viewMode="workspace" />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 Cols): Multimodal Distress Ingestion Console */}
              <div className="lg:col-span-5 pointer-events-auto">
                <InputConsole
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  onGpsChange={setGpsActive}
                />
              </div>

              {/* Right Column (7 Cols): Dynamic Structured Action Card */}
              <div className="lg:col-span-7 pointer-events-auto">
                {triageReport ? (
                  <ActionCard
                    report={triageReport}
                    onResolveMissingInfo={handleResolveMissing}
                    isResolving={isResolving}
                  />
                ) : (
                  <div className="bg-slate-900/65 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Layers className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Spatial Triage Console Ready</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                        Select a 1-tap scenario on the left, dictate via voice, or drop an incident photograph to execute Gemini 2.5 Flash structured verification.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400/80 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      STATUS: STANDBY // 60FPS WEBGL ACTIVE
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 3: 112 DISPATCH RADAR COCKPIT ==================== */}
        {viewMode === "radar" && (
          <div className="pointer-events-auto bg-slate-900/75 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>112 COMMAND &amp; CONTROL TELEMETRY</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">Live Incident Triage Queue</h2>
              </div>
              <button
                onClick={() => setViewMode("workspace")}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono hover:bg-cyan-500/30 transition cursor-pointer"
              >
                + Ingest New Distress Signal
              </button>
            </div>

            {incidentFeed.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No incidents analyzed in this session yet. Go to the Incident Workspace and run a scenario to populate the command radar.
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
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                        {item.severity_level} ({item.severity_score}/10)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Confidence: {item.confidence_score}%
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{item.incident_title}</div>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.executive_summary}</p>
                    <div className="text-[10px] font-mono text-cyan-400 pt-1">
                      📍 {item.location_status.detected_location} → Click to view full verification card
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. Mobile Bottom Quick Switcher + Safety Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div>
          ResQvanta AI // PromptWars 2026 × ALTA School of Technology
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setViewMode("hero")} className="hover:text-cyan-400 cursor-pointer">Overview</button>
          <button onClick={() => setViewMode("workspace")} className="hover:text-cyan-400 cursor-pointer">Workspace</button>
          <button onClick={() => setViewMode("radar")} className="hover:text-cyan-400 cursor-pointer">112 Radar ({incidentFeed.length})</button>
        </div>
      </footer>

    </div>
  );
}
