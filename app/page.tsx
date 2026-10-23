"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { TopNav } from "@/components/ui/TopNav";
import { InputConsole } from "@/components/ui/InputConsole";
import { ActionCard } from "@/components/ui/ActionCard";
import { IncidentRadar } from "@/components/ui/IncidentRadar";
import { CornerGlobeOrb } from "@/components/overlays/CornerGlobeOrb";
import { HistoryDrawer } from "@/components/overlays/HistoryDrawer";
import { CommandSpaceBackground } from "@/components/scene/CommandSpaceBackground";
import { LiquidSculptureHero } from "@/components/scene/LiquidSculptureHero";
import { ShinyButton } from "@/components/ui/ShinyButton";
import { TriageReport, SeverityLevel } from "@/types/triage";
import { PRESET_SCENARIOS } from "@/lib/presets";
import { CORE_HOTSPOTS } from "@/components/scene/HolographicCore";
import { SupportedLanguage, UI_TRANSLATIONS } from "@/lib/translations";
import { GEMINI_MODEL_ID } from "@/lib/geminiSchema";
import {
  ArrowRight,
  Sparkles,
  PhoneCall,
  Layers,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Radar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Activity,
} from "lucide-react";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

type AnalysisLifecycle = "idle" | "validating" | "analyzing" | "success" | "error";

interface AnalysisPayload {
  text: string;
  imageBase64: string | null;
  imageMimeType: string | null;
  gpsCoords: string | null;
  manualLocation: string;
}

export default function ResQvantaApp() {
  const [viewMode, setViewMode] = useState<"hero" | "workspace" | "radar">(
    "hero"
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0);

  const ROTATING_HAZARDS = [
    "Urban Flooding",
    "Highway Crashes",
    "Electrical Fires",
    "Industrial HazMat",
    "Debris Collapses",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resqvanta_theme");
        if (saved === "dark" || saved === "light") return saved;
      } catch {
        // SSR
      }
    }
    return "light";
  });
  const [is3DMode, setIs3DMode] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(
    "multimodal"
  );
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resqvanta_lang");
        if (
          saved === "en-IN" ||
          saved === "hi-IN" ||
          saved === "mr-IN" ||
          saved === "gu-IN"
        ) {
          return saved;
        }
      } catch {
        // SSR
      }
    }
    return "en-IN";
  });

  // Unified Controlled Draft State
  const [inputText, setInputText] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<string | null>(null);
  const [flyoverStage, setFlyoverStage] = useState<"space" | "country" | "city">("city");

  // Strict Analysis Lifecycle & Request Isolation
  const [lifecycle, setLifecycle] = useState<AnalysisLifecycle>("idle");
  const [pendingSnapshotText, setPendingSnapshotText] = useState<string>("");
  const [isResolving, setIsResolving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [triageReport, setTriageReport] = useState<TriageReport | null>(null);
  const [incidentFeed, setIncidentFeed] = useState<TriageReport[]>([]);
  const [lastPayload, setLastPayload] = useState<AnalysisPayload | null>(null);

  // Refs to guarantee zero race conditions or stale overwrites
  const activeRequestIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

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
  const isLoading = lifecycle === "validating" || lifecycle === "analyzing";

  const coreStatus: "IDLE" | "SCANNING" | SeverityLevel = isLoading
    ? "SCANNING"
    : triageReport
    ? triageReport.severity_level
    : "IDLE";

  // Check if user modified the input draft after the current report was generated
  const isDraftModified = Boolean(
    triageReport &&
      inputText.trim() &&
      inputText.trim() !== lastPayload?.text?.trim()
  );

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    activeRequestIdRef.current = null;
    setLifecycle("idle");
    setPendingSnapshotText("");
  };

  // Core Request Lifecycle: idle -> validating -> analyzing -> success / error
  const handleAnalyze = async (payload: {
    text: string;
    imageBase64: string | null;
    imageMimeType: string | null;
    gpsCoords: string | null;
    manualLocation?: string;
    targetLangOverride?: SupportedLanguage;
  }) => {
    // 1. Cancel any obsolete in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Capture snapshot & generate unique request ID
    setLifecycle("validating");
    const cleanText = payload.text.trim();
    const requestId = `req_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    activeRequestIdRef.current = requestId;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 3. Immediately clear any previous/stale report so old advice NEVER appears as current
    setTriageReport(null);
    setApiError(null);
    setPendingSnapshotText(cleanText || "[Scene Photo]");
    setLastPayload({
      text: cleanText,
      imageBase64: payload.imageBase64,
      imageMimeType: payload.imageMimeType,
      gpsCoords: payload.gpsCoords,
      manualLocation: payload.manualLocation || "",
    });
    setViewMode("workspace");
    setLifecycle("analyzing");

    const effectiveLang = payload.targetLangOverride || language;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          requestId,
          text: cleanText,
          imageBase64: payload.imageBase64,
          imageMimeType: payload.imageMimeType,
          gpsCoords: payload.gpsCoords,
          manualLocation: payload.manualLocation || "",
          language: effectiveLang,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || `Server returned HTTP ${res.status}`
        );
      }

      const data: TriageReport = await res.json();

      // 4. Verify response belongs to the latest active request
      if (
        activeRequestIdRef.current !== requestId ||
        data.requestId !== requestId
      ) {
        return; // Discard obsolete response
      }

      setTriageReport(data);
      setIncidentFeed((prev) => [
        data,
        ...prev.filter((item) => item.requestId !== data.requestId),
      ]);
      setLifecycle("success");
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") {
        return;
      }
      if (activeRequestIdRef.current !== requestId) {
        return;
      }
      setLifecycle("error");
      const message =
        err instanceof Error
          ? err.message
          : "Could not complete Gemini analysis. If this is an emergency, please call 112 immediately.";
      setApiError(message);
    }
  };

  const handleResolveMissing = async (additionalDetails: string) => {
    if (!lastPayload || isResolving) return;
    setIsResolving(true);
    setApiError(null);

    const requestId = `req_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    activeRequestIdRef.current = requestId;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lastPayload,
          requestId,
          followUpContext: additionalDetails,
          language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update analysis.");
      }
      const updatedData: TriageReport = await res.json();

      if (activeRequestIdRef.current !== requestId) return;

      setTriageReport(updatedData);
      setIncidentFeed((prev) => [updatedData, ...prev]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not update report with correction.";
      setApiError(message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleTranslateActiveReport = () => {
    if (!lastPayload) return;
    handleAnalyze({
      ...lastPayload,
      targetLangOverride: language,
    });
  };

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden flex flex-col justify-between transition-colors ${
        isLight
          ? "bg-[#f6f8fb] text-slate-900 selection:bg-cyan-600 selection:text-white"
          : "bg-[#04070f] text-slate-100 selection:bg-cyan-400 selection:text-slate-950"
      }`}
    >
      {/* 1. Cinematic 3D Command Space Horizon Background (Active Across All Pages) */}
      <CommandSpaceBackground theme={theme} />

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
        onOpenHistory={() => setIsHistoryOpen(true)}
        t={t}
        historyCount={incidentFeed.length}
      />

      {/* 3. Truly Open-Canvas Floating Content Layer (No Bulky Opaque Panels) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-4 pb-24 lg:py-6 flex flex-col justify-center pointer-events-none">
        {/* ==================== ACT 1: THE LUXURY ENTRANCE ==================== */}
        {viewMode === "hero" && (
          <LiquidSculptureHero
            theme={theme}
            backdropText="RESQVANTA"
            className="w-full my-auto py-2"
          >
            {/* Centered Symmetrical Showroom Stack */}
            <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center space-y-6 py-6 pointer-events-auto">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-xl border border-transparent ${
                    isLight
                      ? "bg-white/80 text-cyan-800 shadow-sm"
                      : "bg-slate-950/70 text-cyan-300 shadow-sm"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {t.modelBadgePrefix} ({GEMINI_MODEL_ID})
                  </span>
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  <span className={isLight ? "text-slate-600" : "text-slate-400"}>
                    TRIAGE:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-transparent text-cyan-500 dark:text-cyan-300 font-semibold transition-all">
                    {ROTATING_HAZARDS[rotatingWordIndex]}
                  </span>
                </div>
              </div>

              <h1
                className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-center max-w-3xl ${
                  isLight ? "drop-shadow-xs" : "drop-shadow-md"
                }`}
              >
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
                className={`text-sm sm:text-base max-w-2xl font-medium leading-relaxed text-center ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                {t.heroSupportText}
              </p>

              {/* 21st.dev Shiny CTAs Centered */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
                <ShinyButton
                  variant="cyan"
                  size="lg"
                  onClick={() => {
                    const demoPreset = PRESET_SCENARIOS[0];
                    const demoText = demoPreset.text;
                    const demoLocation =
                      demoPreset.defaultLocation || "Pune Sector — Lower Ground Floor Basement";
                    setInputText(demoText);
                    setManualLocation(demoLocation);
                    handleAnalyze({
                      text: demoText,
                      imageBase64: null,
                      imageMimeType: null,
                      gpsCoords: null,
                      manualLocation: demoLocation,
                    });
                  }}
                  className="shadow-xl"
                >
                  <span>⚡ {t.btnLiveDemo}</span>
                </ShinyButton>

                <ShinyButton
                  variant="slate"
                  size="lg"
                  onClick={() => setViewMode("workspace")}
                >
                  <span>{t.btnEnterWorkspace}</span>
                  <ArrowRight className="w-4 h-4" />
                </ShinyButton>

                <ShinyButton
                  variant="red"
                  size="lg"
                  href="tel:112"
                  className="shadow-xl"
                >
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  <span>{t.emergencyCallNow}</span>
                </ShinyButton>
              </div>

              {/* 3-Step Process Flow in Borderless Glass Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-3xl pt-2">
                <div
                  className={`p-4 rounded-3xl backdrop-blur-2xl border border-transparent text-left shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all ${
                    isLight ? "bg-white/70" : "bg-slate-900/40"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                    01 · INPUT
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold">Speak or Snap</h4>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                    Hinglish/regional voice or camera photo.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-3xl backdrop-blur-2xl border border-transparent text-left shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all ${
                    isLight ? "bg-white/70" : "bg-slate-900/40"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                    02 · REASON
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold">Gemini 3.5 Flash</h4>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                    Extracts severity, hazards & missing info.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-3xl backdrop-blur-2xl border border-transparent text-left shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all ${
                    isLight ? "bg-white/70" : "bg-slate-900/40"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                    03 · ACTION
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold">112 Brief & SMS</h4>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                    3 priority actions + operator dispatch text.
                  </p>
                </div>
              </div>

              {/* Verified Metrics Row (Borderless Glass) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-1">
                <div
                  className={`p-3 rounded-2xl text-center backdrop-blur-2xl border border-transparent shadow-lg ${
                    isLight ? "bg-white/60" : "bg-slate-900/40"
                  }`}
                >
                  <div className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">
                    1.2s
                  </div>
                  <div className="text-[9px] uppercase font-mono opacity-70">
                    Triage Speed
                  </div>
                </div>
                <div
                  className={`p-3 rounded-2xl text-center backdrop-blur-2xl border border-transparent shadow-lg ${
                    isLight ? "bg-white/60" : "bg-slate-900/40"
                  }`}
                >
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    4 Languages
                  </div>
                  <div className="text-[9px] uppercase font-mono opacity-70">
                    Hi / Mr / Gu / En
                  </div>
                </div>
                <div
                  className={`p-3 rounded-2xl text-center backdrop-blur-2xl border border-transparent shadow-lg ${
                    isLight ? "bg-white/60" : "bg-slate-900/40"
                  }`}
                >
                  <div className="text-base font-extrabold text-amber-500">
                    100%
                  </div>
                  <div className="text-[9px] uppercase font-mono opacity-70">
                    Offline SMS
                  </div>
                </div>
                <div
                  className={`p-3 rounded-2xl text-center backdrop-blur-2xl border border-transparent shadow-lg ${
                    isLight ? "bg-white/60" : "bg-slate-900/40"
                  }`}
                >
                  <div className="text-base font-extrabold text-blue-500">
                    WGS84
                  </div>
                  <div className="text-[9px] uppercase font-mono opacity-70">
                    Spatial Mesh
                  </div>
                </div>
              </div>

              {/* Interactive Architecture / Hotspots Selector in Borderless Bento */}
              <div className="w-full max-w-3xl pt-2 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span
                    className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                      isLight ? "text-cyan-800" : "text-cyan-400"
                    }`}
                  >
                    {t.hotspotsHeader}
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    {t.hotspotsHint}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="tablist">
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
                        className={`text-left p-4 rounded-3xl transition cursor-pointer border border-transparent backdrop-blur-2xl ${
                          isSelected
                            ? "bg-cyan-500/25 text-white shadow-[0_0_28px_rgba(6,182,212,0.3)]"
                            : isLight
                            ? "bg-white/60 text-slate-800 hover:bg-white/90"
                            : "bg-slate-900/40 text-slate-200 hover:bg-slate-900/70"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold mb-1">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-cyan-400 text-slate-950"
                                : "bg-cyan-500/15 text-cyan-400"
                            }`}
                          >
                            {spot.label}
                          </span>
                          <span className="truncate">{title}</span>
                        </div>
                        <p className="text-[11px] opacity-75 leading-relaxed line-clamp-2">
                          {desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
        </LiquidSculptureHero>
      )}

      {/* ==================== ACT 2 & 3: CENTERED WORKSPACE & SOLUTION-FIRST OUTPUT ==================== */}
        {viewMode === "workspace" && (
          <div className="max-w-4xl w-full mx-auto space-y-5 pointer-events-auto my-auto py-2">
            {/* Prototype Transparency & 112 Advisory Banner (Borderless Glass) */}
            <div
              className={`rounded-3xl p-3.5 px-5 flex items-center justify-between gap-3 text-xs border border-transparent backdrop-blur-2xl shadow-xl ${
                isLight ? "bg-white/75 text-slate-800" : "bg-slate-900/50 text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong className="text-amber-500">Disaster Assistance Prototype</strong>: Generates operator-ready briefs. For immediate life-saving aid, always call <strong>112</strong> directly.
                </span>
              </div>
              <ShinyButton
                variant="red"
                size="sm"
                href="tel:112"
                className="font-bold text-xs shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                <span>Call 112</span>
              </ShinyButton>
            </div>

            {/* API Error Alert (if any) */}
            {apiError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-red-600 text-white text-xs flex items-center justify-between gap-4 shadow-md"
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

            {/* Centered Single-Column Input Console */}
            <InputConsole
              inputText={inputText}
              onInputTextChange={setInputText}
              manualLocation={manualLocation}
              onManualLocationChange={setManualLocation}
              imageBase64={imageBase64}
              imageMimeType={imageMimeType}
              onImageChange={(b64, mime) => {
                setImageBase64(b64);
                setImageMimeType(mime);
              }}
              gpsCoords={gpsCoords}
              onGpsCoordsChange={setGpsCoords}
              onAnalyze={handleAnalyze}
              onCancelAnalysis={handleCancelAnalysis}
              isLoading={isLoading}
              isDraftModified={isDraftModified}
              language={language}
              theme={theme}
              t={t}
            />

            {/* Honest Loading State (Directly Underneath Composer) */}
            {isLoading && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-4 border animate-in fade-in ${
                  isLight
                    ? "bg-white/80 border-slate-200 text-slate-900 shadow-sm"
                    : "bg-[#121e30]/85 border-white/10 text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-500 shrink-0" />
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold">
                      {t.analyzingSnapshotTitle}
                    </h3>
                    <p className="text-xs opacity-75">
                      {t.analyzingSnapshotSub}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                    isLight ? "bg-slate-100/90" : "bg-white/5"
                  }`}
                >
                  <div className="font-bold text-cyan-600 dark:text-cyan-400">
                    {t.resultForInputLabel}
                  </div>
                  <div className="italic">
                    &ldquo;{pendingSnapshotText}&rdquo;
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span>{t.immediateDangerNote}</span>
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-1.5 bg-red-600 text-white font-bold px-3.5 py-1.5 rounded-full"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t.call112}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Solution-First Output Cascading Downwards */}
            {triageReport && !isLoading && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ActionCard
                  report={triageReport}
                  onResolveMissingInfo={handleResolveMissing}
                  onTranslateActiveReport={handleTranslateActiveReport}
                  isResolving={isResolving}
                  language={language}
                  theme={theme}
                  t={t}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(true)}
                    className="btn-3d-slate inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    <span>📋 View Session History ({incidentFeed.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("radar")}
                    className="btn-3d-cyan inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold shadow-xl transition cursor-pointer"
                  >
                    <Radar className="w-4 h-4" />
                    <span>Inspect Live Sector Radar & Hospital Map →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW 3: LIVE TELEMETRY RADAR MAP & SESSION HISTORY ==================== */}
        {viewMode === "radar" && (
          <div className="pointer-events-auto space-y-8 py-4">
            {/* Live Spatial Incident Radar & Google Maps Emergency Routing */}
            <IncidentRadar
              gpsCoords={gpsCoords}
              onGpsCoordsChange={setGpsCoords}
              activeReport={triageReport}
              theme={theme}
              language={language}
              flyoverStage={flyoverStage}
              onFlyoverStageChange={setFlyoverStage}
            />

            <div className="space-y-4 pt-2 border-t border-slate-500/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold">{t.historyHeading}</h2>
                <button
                  type="button"
                  onClick={() => setViewMode("workspace")}
                  className="px-5 py-2.5 rounded-full bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition cursor-pointer self-start"
                >
                  {t.newAnalysisBtn}
                </button>
              </div>

            {incidentFeed.length === 0 ? (
              <div className="py-12 opacity-75 text-xs font-medium">
                {t.historyEmpty}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {incidentFeed.map((item) => (
                  <div
                    key={item.requestId}
                    className={`p-4 rounded-2xl backdrop-blur-md transition space-y-2 ${
                      isLight
                        ? "bg-white/80 text-slate-900 shadow-2xs"
                        : "bg-slate-950/70 text-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">
                        {t.urgencyLabels[item.severity_level] ||
                          item.severity_level}
                      </span>
                      <span className="text-[10px] font-mono opacity-65">
                        ID: {item.requestId.slice(-6)}
                      </span>
                    </div>
                    <div className="text-sm font-bold">
                      {item.incident_title}
                    </div>
                    <div className="text-xs italic opacity-80 truncate">
                      &ldquo;{item.submittedTextSnapshot}&rdquo;
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono opacity-65">
                        {item.response_language || "en-IN"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          // View historical snapshot without overwriting user's current unsaved draft unless desired
                          setTriageReport(item);
                          setViewMode("workspace");
                        }}
                        className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                      >
                        {t.viewHistoricalReportBtn} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
      </main>

      {/* 4. Mobile Floating Navigation Dock (< lg screens) */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-xl shadow-lg border transition-all"
        style={{
          backgroundColor: isLight
            ? "rgba(255, 255, 255, 0.9)"
            : "rgba(4, 7, 15, 0.9)",
          borderColor: isLight
            ? "rgba(203, 213, 225, 0.85)"
            : "rgba(30, 41, 59, 0.85)",
        }}
      >
        <button
          type="button"
          onClick={() => setViewMode("hero")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            viewMode === "hero"
              ? isLight
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-cyan-500/25 text-white ring-1 ring-cyan-400/50"
              : isLight
              ? "text-slate-600 hover:text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>{t.navShowroom}</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("workspace")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            viewMode === "workspace"
              ? isLight
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-cyan-500/25 text-white ring-1 ring-cyan-400/50"
              : isLight
              ? "text-slate-600 hover:text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-500" />
          <span>{t.navWorkspace}</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("radar")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            viewMode === "radar"
              ? isLight
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-cyan-500/25 text-white ring-1 ring-cyan-400/50"
              : isLight
              ? "text-slate-600 hover:text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Radar className="w-3.5 h-3.5 text-cyan-500" />
          <span>
            {t.navHistory}
            {incidentFeed.length > 0 && ` (${incidentFeed.length})`}
          </span>
        </button>
      </nav>

      {/* 5. Minimal Footer */}
      <footer
        className={`relative z-10 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs backdrop-blur-sm ${
          isLight
            ? "bg-white/40 text-slate-700"
            : "bg-[#04070f]/40 text-slate-300"
        }`}
      >
        <div>
          ResQvanta AI — {t.brandSubtitle} · {GEMINI_MODEL_ID}
        </div>
        <div className="flex items-center space-x-4 font-semibold">
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

      {/* 6. Independent Slide-Over History Drawer (Isolated Draft State) */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        incidents={incidentFeed}
        onSelectIncident={(rep) => {
          setTriageReport(rep);
          setViewMode("workspace");
        }}
        onClearHistory={() => setIncidentFeed([])}
        theme={theme}
        language={language}
        t={t}
      />

      {/* 7. Floating Interactive 3D Corner Globe Orb (Accessible Across All Views) */}
      <CornerGlobeOrb
        gpsCoords={gpsCoords}
        activeReport={triageReport}
        theme={theme}
        language={language}
        t={t}
        flyoverStage={flyoverStage}
        onFlyoverStageChange={setFlyoverStage}
        coreStatus={coreStatus}
      />
    </div>
  );
}
