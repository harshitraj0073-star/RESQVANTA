"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { TopNav } from "@/components/ui/TopNav";
import { InputConsole } from "@/components/ui/InputConsole";
import { ActionCard } from "@/components/ui/ActionCard";
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
  Loader2,
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

      {/* 3. Truly Open-Canvas Floating Content Layer (No Bulky Opaque Panels) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col justify-center pointer-events-none">
        {/* ==================== ACT 1: THE LUXURY ENTRANCE ==================== */}
        {viewMode === "hero" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-4">
            {/* Left Floating Typography (Open Canvas over 3D Core) */}
            <div className="lg:col-span-7 space-y-5 pointer-events-auto py-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md ${
                    isLight
                      ? "bg-white/80 text-cyan-800 shadow-2xs"
                      : "bg-slate-950/70 text-cyan-300"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {t.modelBadgePrefix} ({GEMINI_MODEL_ID})
                  </span>
                </span>
              </div>

              <h1
                className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] ${
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
                className={`text-sm sm:text-base max-w-xl font-medium leading-relaxed ${
                  isLight ? "text-slate-700" : "text-slate-200"
                }`}
              >
                {t.heroSupportText}
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const demoText = PRESET_SCENARIOS[0].text;
                    setInputText(demoText);
                    setManualLocation("Fictional Demo Scenario A");
                    handleAnalyze({
                      text: demoText,
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
                  className={`px-6 py-3.5 rounded-full font-bold text-xs backdrop-blur-md transition flex items-center space-x-2 cursor-pointer ${
                    isLight
                      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  <span>{t.btnEnterWorkspace}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Emergency-First Skip Link */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium">
                <span className={isLight ? "text-slate-700" : "text-slate-300"}>
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

            {/* Right Floating Hotspot Selector */}
            <div className="lg:col-span-5 pointer-events-auto space-y-2.5">
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
                      className={`w-full text-left p-4 rounded-2xl backdrop-blur-md transition cursor-pointer ${
                        isSelected
                          ? isLight
                            ? "bg-cyan-600 text-white shadow-md"
                            : "bg-cyan-500/25 text-white"
                          : isLight
                          ? "bg-white/75 text-slate-800 hover:bg-white/95 shadow-2xs"
                          : "bg-slate-950/65 text-slate-200 hover:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isSelected
                              ? isLight
                                ? "bg-white text-cyan-700"
                                : "bg-cyan-400 text-slate-950"
                              : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
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
                              : "text-slate-100"
                            : isLight
                            ? "text-slate-600"
                            : "text-slate-300"
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
        )}

        {/* ==================== ACT 2 & 3: WORKSPACE & SOLUTION-FIRST OUTPUT ==================== */}
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Open-Canvas Multimodal Input Console */}
              <div className="lg:col-span-5 pointer-events-auto">
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
              </div>

              {/* Right Column: Active Loading Snapshot OR Fresh Result OR Ready State */}
              <div className="lg:col-span-7 pointer-events-auto">
                {isLoading ? (
                  /* HONEST LOADING STATE: Never displays an old incident while analyzing! */
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-3xl p-8 backdrop-blur-md space-y-5 ${
                      isLight
                        ? "bg-white/75 text-slate-900 shadow-sm"
                        : "bg-slate-950/70 text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-500 shrink-0" />
                      <div>
                        <h3 className="text-base font-extrabold">
                          {t.analyzingSnapshotTitle}
                        </h3>
                        <p className="text-xs opacity-75">
                          {t.analyzingSnapshotSub}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs space-y-1 ${
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

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span>{t.immediateDangerNote}</span>
                      <a
                        href="tel:112"
                        className="inline-flex items-center gap-1.5 bg-red-600 text-white font-bold px-4 py-2 rounded-full"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{t.call112}</span>
                      </a>
                    </div>
                  </div>
                ) : triageReport ? (
                  <ActionCard
                    report={triageReport}
                    onResolveMissingInfo={handleResolveMissing}
                    onTranslateActiveReport={handleTranslateActiveReport}
                    isResolving={isResolving}
                    language={language}
                    theme={theme}
                    t={t}
                  />
                ) : (
                  <div className="py-12 px-6 text-center flex flex-col items-center justify-center min-h-[320px] space-y-3">
                    <div
                      className={`w-12 h-12 rounded-2xl backdrop-blur-md flex items-center justify-center ${
                        isLight
                          ? "bg-white/80 text-cyan-700 shadow-2xs"
                          : "bg-slate-950/70 text-cyan-300"
                      }`}
                    >
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h3 className="text-base font-extrabold">
                        {t.readyTitle}
                      </h3>
                      <p
                        className={`text-xs font-medium leading-relaxed ${
                          isLight ? "text-slate-700" : "text-slate-300"
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

        {/* ==================== VIEW 3: COMPACT FLOATING SESSION HISTORY ==================== */}
        {viewMode === "radar" && (
          <div className="pointer-events-auto space-y-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-extrabold">{t.historyHeading}</h2>
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
        )}
      </main>

      {/* 4. Minimal Footer */}
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
    </div>
  );
}
