"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { TopNav } from "@/components/ui/TopNav";
import { InputConsole } from "@/components/ui/InputConsole";
import { ActionCard } from "@/components/ui/ActionCard";
import { TriageReport, SeverityLevel } from "@/types/triage";

// Dynamically import SceneCanvas with SSR disabled to guarantee zero hydration errors
const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-950/40" />
});

export default function ResQvantaApp() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [language, setLanguage] = useState("English");
  const [gpsActive, setGpsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  
  const [triageReport, setTriageReport] = useState<TriageReport | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);

  // 3D Core status mapping
  const coreStatus: "IDLE" | "SCANNING" | SeverityLevel = isLoading
    ? "SCANNING"
    : triageReport
    ? triageReport.severity_level
    : "IDLE";

  // Main Triage API trigger
  const handleAnalyze = async (payload: {
    text: string;
    imageBase64: string | null;
    imageMimeType: string | null;
    gpsCoords: string | null;
  }) => {
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
    } catch (err: any) {
      alert(`Triage Error: ${err.message || "Failed to analyze incident."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-triage loop: resolve missing details
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
    } catch (err: any) {
      alert(`Update Error: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* 1. 3D Spatial Background Layer (Toggable for 2D Lite Mode) */}
      {is3DMode && (
        <div className="fixed inset-0 z-0 pointer-events-auto">
          <SceneCanvas status={coreStatus} />
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <TopNav
        is3DMode={is3DMode}
        onToggle3D={() => setIs3DMode(!is3DMode)}
        language={language}
        onLanguageChange={setLanguage}
        gpsActive={gpsActive}
      />

      {/* 3. Main HUD Content Overlay */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pointer-events-none">
        
        {/* Mobile Dedicated 3D Viewport Window (<768px) */}
        {is3DMode && (
          <div className="block md:hidden h-52 w-full rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950/60 mb-6 pointer-events-auto">
            <SceneCanvas status={coreStatus} />
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
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Spatial Telemetry Standby</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    Select a 1-tap scenario on the left, upload an incident photograph, or type a description to initiate Gemini multimodal triage.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-cyan-400/80 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  STATUS: WAITING FOR DISTRESS SIGNAL
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/80 py-4 px-6 text-center text-[11px] text-slate-500 font-mono">
        ResQvanta AI // PromptWars 2026 × ALTA School of Technology · Built with Google Antigravity &amp; Gemini 2.5 Flash
      </footer>

    </div>
  );
}
