"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TopNav } from "@/components/ui/TopNav";
import { InputConsole } from "@/components/ui/InputConsole";
import { ActionCard } from "@/components/ui/ActionCard";
import { TriageReport, SeverityLevel } from "@/types/triage";
import { PRESET_SCENARIOS } from "@/lib/presets";
import { CORE_HOTSPOTS } from "@/components/scene/HolographicCore";
import {
  SupportedLanguage,
  UI_TRANSLATIONS,
} from "@/lib/translations";
import { GEMINI_MODEL_ID } from "@/lib/geminiSchema";
import {
  ArrowRight,
  Sparkles,
  PhoneCall,
  Layers,
  AlertCircle,
} from "lucide-react";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

export default function ResQvantaApp() {
  const [viewMode, setViewMode] = useState<"hero" | "workspace" | "radar">(
    "hero"
  );
  // Default to Light Mode unless user already saved a preference
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [is3DMode, setIs3DMode] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(
    "multimodal"
  );
  const [language, setLanguage] = useState<SupportedLanguage>("en-IN");
  const [gpsActive, setGpsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [triageReport, setTriageReport] = useState<TriageReport | null>(null);
  const [incidentFeed, setIncidentFeed] = useState<TriageReport[]>([]);
  const [lastPayload, setLastPayload] = useState<any>(null);

  // Sync persisted theme & language on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("resqvanta_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        setTheme("light");
        document.documentElement.setAttribute("data-theme", "light");
      }

      const savedLang = localStorage.getItem("resqvanta_lang");
      if (
        savedLang === "en-IN" ||
        savedLang === "hi-IN" ||
        savedLang === "mr-IN" ||
        savedLang === "gu-IN"
      ) {
        setLanguage(savedLang);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("resqvanta_theme", nextTheme);
    } catch {
      // ignore
    }
  };

  const handleLanguageChange = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    try {
      localStorage.setItem("resqvanta_lang", nextLang);
    } catch {
      // ignore
    }
  };

  const t = UI_TRANSLATIONS[language];
  const isLight = theme === "light";

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
    if (isLoading) return;
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
          language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || `Server returned HTTP ${res.status}`
        );
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
          language,
        }),
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

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden flex flex-col justify-between transition-colors ${
        isLight
          ? "bg-[#f6f8fb] text-slate-900 selection:bg-cyan-600 selection:text-white"
          : "bg-[#04070f] text-slate-100 selection:bg-cyan-400 selection:text-slate-950"
      }`}
    >
      {/* 1. Theme-Aware Interactive 3D Background (Visible across all screens) */}
      {is3DMode && (
        <div className="fixed inset-0 z-0 pointer-events-auto">
          <SceneCanvas
            status={coreStatus}
            viewMode={viewMode}
            theme={theme}
            activeHotspot={activeHotspot}
            onSelectHotspot={setActiveHotspot}
            t={t}
          />
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <TopNav
        theme={theme}
        onToggleTheme={handleToggleTheme}
        is3DMode={is3DMode}
        onToggle3D={() => setIs3DMode(!is3DMode)}
        language={language}
        onLanguageChange={handleLanguageChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        t={t}
        historyCount={incidentFeed.length}
      />

      {/* 3. Open Borderless Content Layer */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col justify-center pointer-events-none">
        {/* ==================== ACT 1: THE LUXURY ENTRANCE ==================== */}
        {viewMode === "hero" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-4">
            {/* Left Floating Typography & Primary Actions */}
            <div
              className={`lg:col-span-7 space-y-5 pointer-events-auto rounded-3xl p-6 md:p-9 backdrop-blur-md transition-colors ${
                isLight
                  ? "bg-white/65 shadow-xl shadow-slate-900/5"
                  : "bg-[#060a14]/60"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                    isLight
                      ? "bg-cyan-600/10 text-cyan-800"
                      : "bg-cyan-400/10 text-cyan-300"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {t.modelBadgePrefix} ({GEMINI_MODEL_ID})
                  </span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12]">
                {t.heroHeadlinePart1}{" "}
                <span
                  className={
                    isLight
                      ? "text-cyan-700"
                      : "bg-gradient-to-r from-cyan-300 via-cyan-400 to-amber-300 bg-clip-text text-transparent"
                  }
                >
                  {t.heroHeadlineHighlight}
                </span>
              </h1>

              <p
                className={`text-sm sm:text-base max-w-xl leading-relaxed ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                {t.heroSupportText}
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
                      manualLocation: "Fictional Demo Scenario A",
                    });
                  }}
                  className="px-6 py-3.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide uppercase shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>⚡ {t.btnLiveDemo}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("workspace")}
                  className={`px-6 py-3.5 rounded-full font-semibold text-xs transition flex items-center space-x-2 cursor-pointer ${
                    isLight
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <span>{t.btnEnterWorkspace}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Emergency-First Skip Link */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className={isLight ? "text-slate-600" : "text-slate-400"}>
                  {t.emergencySkipPrompt}
                </span>
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.emergencyCallNow}</span>
                </a>
              </div>
            </div>

            {/* Right Floating Hotspot Selector (Keyboard + Mobile Accessible) */}
            <div className="lg:col-span-5 pointer-events-auto space-y-2.5">
              <div
                className={`rounded-3xl p-5 backdrop-blur-md space-y-3 ${
                  isLight
                    ? "bg-white/65 shadow-lg shadow-slate-900/5"
                    : "bg-[#060a14]/60"
                }`}
              >
                <div className="flex items-center justify-between px-1">
                  <span
                    className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                      isLight ? "text-cyan-700" : "text-cyan-400"
                    }`}
                  >
                    {t.hotspotsHeader}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">
                    {t.hotspotsHint}
                  </span>
                </div>

                <div
                  className="space-y-2"
                  role="tablist"
                  aria-label={t.hotspotsHeader}
                >
                  {CORE_HOTSPOTS.map((spot) => {
                    const isSelected = activeHotspot === spot.id;
                    const title = t.hotspots[spot.titleKey];
                    const desc = t.hotspots[spot.descKey];
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveHotspot(spot.id)}
                        className={`w-full text-left p-3.5 rounded-2xl transition cursor-pointer ${
                          isSelected
                            ? isLight
                              ? "bg-cyan-600 text-white shadow-sm"
                              : "bg-cyan-500/20 text-white"
                            : isLight
                            ? "bg-slate-100/80 text-slate-700 hover:bg-slate-200/70"
                            : "bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              isSelected
                                ? isLight
                                  ? "bg-white text-cyan-700"
                                  : "bg-cyan-400 text-slate-950"
                                : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                            }`}
                          >
                            {spot.label}
                          </span>
                          <span>{title}</span>
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isSelected
                              ? isLight
                                ? "text-cyan-50"
                                : "text-slate-200"
                              : isLight
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          {desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ACT 2 & 3: WORKSPACE & EMERGENCY-FIRST RESULTS ==================== */}
        {viewMode === "workspace" && (
          <div className="space-y-4">
            {apiError && (
              <div
                role="alert"
                className="pointer-events-auto p-4 rounded-2xl bg-red-600 text-white text-xs flex items-center justify-between gap-4 shadow-md"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
                <a
                  href="tel:112"
                  className="px-3.5 py-1.5 rounded-full bg-white text-red-700 font-bold shrink-0"
                >
                  {t.call112}
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Multimodal Input Console */}
              <div className="lg:col-span-5 pointer-events-auto">
                <InputConsole
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  onGpsChange={setGpsActive}
                  language={language}
                  theme={theme}
                  t={t}
                />
              </div>

              {/* Right Column: Emergency-First Action Card */}
              <div className="lg:col-span-7 pointer-events-auto">
                {triageReport ? (
                  <ActionCard
                    report={triageReport}
                    onResolveMissingInfo={handleResolveMissing}
                    isResolving={isResolving}
                    theme={theme}
                    t={t}
                  />
                ) : (
                  <div
                    className={`rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] space-y-4 backdrop-blur-md ${
                      isLight
                        ? "bg-white/65 text-slate-900 shadow-lg shadow-slate-900/5"
                        : "bg-[#080d1a]/60 text-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isLight
                          ? "bg-cyan-600/10 text-cyan-700"
                          : "bg-cyan-400/10 text-cyan-300"
                      }`}
                    >
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="max-w-md space-y-1.5">
                      <h3 className="text-base font-bold">{t.readyTitle}</h3>
                      <p
                        className={`text-xs leading-relaxed ${
                          isLight ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        {t.readyDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 3: COMPACT SESSION HISTORY ==================== */}
        {viewMode === "radar" && (
          <div
            className={`pointer-events-auto rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6 ${
              isLight
                ? "bg-white/75 text-slate-900 shadow-lg shadow-slate-900/5"
                : "bg-[#080d1a]/70 text-slate-100"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold">{t.historyHeading}</h2>
              <button
                type="button"
                onClick={() => setViewMode("workspace")}
                className="px-4 py-2 rounded-full bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition cursor-pointer"
              >
                {t.newAnalysisBtn}
              </button>
            </div>

            {incidentFeed.length === 0 ? (
              <div className="text-center py-12 opacity-65 text-xs">
                {t.historyEmpty}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incidentFeed.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTriageReport(item);
                      setViewMode("workspace");
                    }}
                    className={`text-left p-4 rounded-2xl transition cursor-pointer space-y-1.5 ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200/80"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">
                        {t.urgencyLabels[item.severity_level] ||
                          item.severity_level}
                      </span>
                      <span className="text-[10px] font-mono opacity-60">
                        {item.incident_category}
                      </span>
                    </div>
                    <div className="text-sm font-bold">
                      {item.incident_title}
                    </div>
                    <p className="text-xs opacity-75 line-clamp-2">
                      {item.urgency_rationale}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Mobile & Desktop Minimal Footer */}
      <footer
        className={`relative z-10 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs backdrop-blur-sm ${
          isLight
            ? "bg-white/50 text-slate-600"
            : "bg-[#04070f]/50 text-slate-400"
        }`}
      >
        <div>
          ResQvanta AI — {t.brandSubtitle} · {GEMINI_MODEL_ID}
        </div>
        <div className="flex items-center space-x-4 font-medium">
          <button
            type="button"
            onClick={() => setViewMode("hero")}
            className="hover:underline cursor-pointer"
          >
            {t.navShowroom}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("workspace")}
            className="hover:underline cursor-pointer"
          >
            {t.navWorkspace}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className="hover:underline cursor-pointer"
          >
            {t.navHistory} ({incidentFeed.length})
          </button>
        </div>
      </footer>
    </div>
  );
}
