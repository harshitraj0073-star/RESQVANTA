"use client";

import React, { useState } from "react";
import { TriageReport } from "@/types/triage";
import { SupportedLanguage, UIStrings } from "@/lib/translations";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Download,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  MessageSquare,
  Share2,
  FileSearch,
  ChevronDown,
  ChevronUp,
  Globe,
  Camera,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ActionCardProps {
  report: TriageReport;
  onResolveMissingInfo: (additionalDetails: string) => void;
  onTranslateActiveReport: () => void;
  isResolving: boolean;
  language: SupportedLanguage;
  theme: "light" | "dark";
  t: UIStrings;
}

export function ActionCard({
  report,
  onResolveMissingInfo,
  onTranslateActiveReport,
  isResolving,
  language,
  theme,
  t,
}: ActionCardProps) {
  const [detailMode, setDetailMode] = useState<"quick" | "detailed">("quick");
  const [quickQuestionInput, setQuickQuestionInput] = useState("");
  const [correctionInput, setCorrectionInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedTraceIdx, setSelectedTraceIdx] = useState<number | null>(0);
  const [prevReportId, setPrevReportId] = useState(report.requestId);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [editableBrief, setEditableBrief] = useState(
    report.dispatch_packet_text
  );

  if (report.requestId !== prevReportId) {
    setPrevReportId(report.requestId);
    setEditableBrief(report.dispatch_packet_text);
    setSelectedTraceIdx(report.evidence_trace?.length ? 0 : null);
  }

  const isLight = theme === "light";

  const toggleSpeechReadout = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const actionTexts = (report.immediate_actions || [])
      .slice(0, 3)
      .map((a, i) => `${i + 1}. ${a.instruction}`)
      .join(". ");

    const textToSpeak = `${report.incident_title}. ${report.urgency_rationale}. ${actionTexts}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language || "en-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(editableBrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBrief = () => {
    const blob = new Blob([editableBrief], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ResQvanta_112_Brief_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `112 Brief: ${report.incident_title}`,
          text: editableBrief,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopyBrief();
    }
  };

  const urgencyBadgeStyles = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-600 text-white";
      case "HIGH":
        return "bg-amber-500 text-slate-950";
      case "MODERATE":
      case "UNCERTAIN":
        return "bg-yellow-500 text-slate-950";
      case "LOW":
      case "NON_EMERGENCY":
      default:
        return "bg-emerald-600 text-white";
    }
  };

  const smsLink = `sms:?body=${encodeURIComponent(editableBrief)}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    editableBrief
  )}`;

  const topActions = (report.immediate_actions || []).slice(0, 3);
  const primaryMissingQuestion =
    report.important_question ||
    report.verification_matrix?.missing_critical_info?.[0] ||
    null;

  const isDifferentLanguage =
    report.response_language && report.response_language !== language;

  return (
    <section
      aria-label="Solution-First Guidance and Evidence"
      className="space-y-5 py-2"
    >
      {/* If user switched UI language after generating report, offer 1-click translation */}
      {isDifferentLanguage && (
        <div
          className={`px-4 py-2.5 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs ${
            isLight
              ? "bg-cyan-50/90 text-cyan-950"
              : "bg-cyan-950/60 text-cyan-100"
          }`}
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Globe className="w-4 h-4 text-cyan-500" />
            <span>{t.translateResultPrompt}</span>
          </span>
          <button
            type="button"
            disabled={isResolving}
            onClick={onTranslateActiveReport}
            className="px-3.5 py-1 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer transition disabled:opacity-50"
          >
            {isResolving ? t.updatingAnalysisBtn : t.translateResultBtn}
          </button>
        </div>
      )}

      {/* Grounded Input Snapshot Pill — Proves this result matches the exact submitted text */}
      <div
        className={`px-3.5 py-2 rounded-2xl backdrop-blur-md text-xs flex flex-wrap items-center justify-between gap-2 ${
          isLight
            ? "bg-white/75 text-slate-700 shadow-2xs"
            : "bg-slate-950/65 text-slate-300"
        }`}
      >
        <div className="truncate max-w-full">
          <span className="font-bold text-cyan-600 dark:text-cyan-400">
            {t.resultForInputLabel}{" "}
          </span>
          <span className="italic">
            &ldquo;{report.submittedTextSnapshot}&rdquo;
          </span>
        </div>
        <span className="text-[10px] font-mono opacity-60 shrink-0">
          ID: {report.requestId.slice(-6)}
        </span>
      </div>

      {/* ==================== 1. HEADLINE & URGENCY ==================== */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs ${urgencyBadgeStyles(
                report.severity_level
              )}`}
            >
              {t.urgencyLabels[report.severity_level] || report.severity_level}
            </span>
            <span
              className={`text-[11px] font-medium ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              {t.urgencyAdvisoryNote}
            </span>
          </div>

          {/* Quick View vs Detailed Evidence Toggle */}
          <div
            className={`inline-flex rounded-full p-1 text-xs backdrop-blur-md ${
              isLight ? "bg-white/80 shadow-2xs" : "bg-slate-950/70"
            }`}
          >
            <button
              type="button"
              onClick={() => setDetailMode("quick")}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                detailMode === "quick"
                  ? isLight
                    ? "bg-slate-900 text-white"
                    : "bg-cyan-500 text-slate-950 font-bold"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {t.quickViewTab}
            </button>
            <button
              type="button"
              onClick={() => setDetailMode("detailed")}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                detailMode === "detailed"
                  ? isLight
                    ? "bg-slate-900 text-white"
                    : "bg-cyan-500 text-slate-950 font-bold"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {t.detailedViewTab}
            </button>
          </div>
        </div>

        {/* Short Situation Headline */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
          {report.incident_title}
        </h2>

        {/* Concise 1-Sentence Rationale */}
        <p
          className={`text-xs sm:text-sm font-medium leading-relaxed ${
            isLight ? "text-slate-700" : "text-slate-200"
          }`}
        >
          {report.urgency_rationale}
        </p>
      </div>

      {/* ==================== 2. WHAT TO DO RIGHT NOW (UP TO 3 STEPS) ==================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3
            className={`text-xs font-extrabold uppercase tracking-wider ${
              isLight ? "text-cyan-700" : "text-cyan-400"
            }`}
          >
            {t.whatToDoNowHeading}
          </h3>

          {/* Voice Read Aloud Button for Panic / Visual Impairment Accessibility */}
          <button
            type="button"
            onClick={toggleSpeechReadout}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              isSpeaking
                ? "bg-red-600 text-white animate-pulse"
                : isLight
                ? "bg-cyan-100 hover:bg-cyan-200 text-cyan-900"
                : "bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200"
            }`}
            aria-label={isSpeaking ? "Stop Voice Readout" : "Listen to Emergency Actions"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen Aloud</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2.5">
          {topActions.map((act, index) => (
            <div
              key={act.step_number || index}
              className={`p-4 rounded-2xl backdrop-blur-md flex items-start gap-3.5 transition ${
                isLight
                  ? "bg-white/85 text-slate-950 shadow-sm"
                  : "bg-slate-950/75 text-white"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full text-sm font-extrabold flex items-center justify-center shrink-0 ${
                  isLight
                    ? "bg-cyan-600 text-white"
                    : "bg-cyan-500 text-slate-950"
                }`}
              >
                {index + 1}
              </span>
              <div className="space-y-0.5">
                <div className="text-sm sm:text-base font-bold leading-snug">
                  {act.instruction}
                </div>
                {act.rationale && (
                  <div
                    className={`text-xs ${
                      isLight ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    {act.rationale}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 3. MOST IMPORTANT FOLLOW-UP QUESTION ==================== */}
      {primaryMissingQuestion && report.is_valid_emergency && (
        <div
          className={`p-4 rounded-2xl backdrop-blur-md space-y-2.5 ${
            isLight
              ? "bg-amber-50/90 text-slate-900 shadow-2xs"
              : "bg-amber-950/45 text-slate-100"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              {t.importantQuestionHeading}: {primaryMissingQuestion}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={quickQuestionInput}
              onChange={(e) => setQuickQuestionInput(e.target.value)}
              placeholder={t.answerQuestionPlaceholder}
              className={`flex-1 rounded-full px-3.5 py-2 text-xs focus:outline-none ${
                isLight
                  ? "bg-white text-slate-950 placeholder-slate-500"
                  : "bg-slate-950/85 text-white placeholder-slate-400"
              }`}
            />
            <button
              type="button"
              disabled={!quickQuestionInput.trim() || isResolving}
              onClick={() => {
                onResolveMissingInfo(quickQuestionInput.trim());
                setQuickQuestionInput("");
              }}
              className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
            >
              {isResolving ? t.updatingAnalysisBtn : t.answerQuestionBtn}
            </button>
          </div>
        </div>
      )}

      {/* ==================== 4. PRIMARY EMERGENCY CONTROLS ==================== */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <a
          href="tel:112"
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full shadow-md transition transform active:scale-95"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{t.call112}</span>
        </a>

        <button
          type="button"
          onClick={handleCopyBrief}
          className={`flex items-center space-x-1.5 text-xs font-bold px-4 py-3 rounded-full backdrop-blur-md transition cursor-pointer ${
            isLight
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          }`}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copied ? t.copiedBriefBtn : t.copyBriefBtn}</span>
        </button>

        <a
          href={smsLink}
          className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-3 rounded-full backdrop-blur-md transition ${
            isLight
              ? "bg-white/85 text-slate-900 hover:bg-white shadow-2xs"
              : "bg-slate-950/75 text-slate-200 hover:bg-slate-900"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.shareSmsBtn}</span>
        </a>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-3 rounded-full backdrop-blur-md transition ${
            isLight
              ? "bg-emerald-100/90 text-emerald-950 hover:bg-emerald-200"
              : "bg-emerald-950/65 text-emerald-300 hover:bg-emerald-900/75"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t.shareWhatsappBtn}</span>
        </a>
      </div>

      {/* ==================== 5. UNCERTAINTY STATEMENT & EXPAND TOGGLE ==================== */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 text-xs pt-1 ${
          isLight ? "text-slate-700" : "text-slate-300"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>{t.uncertaintyBanner}</span>
        </span>

        <button
          type="button"
          onClick={() =>
            setDetailMode(detailMode === "quick" ? "detailed" : "quick")
          }
          className={`inline-flex items-center gap-1 font-bold underline cursor-pointer shrink-0 ${
            isLight ? "text-cyan-700" : "text-cyan-400"
          }`}
        >
          <span>
            {detailMode === "quick" ? t.detailedViewTab : t.quickViewTab}
          </span>
          {detailMode === "quick" ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* ==================== 6. EXPANDABLE DETAILED EVIDENCE VIEW ==================== */}
      {detailMode === "detailed" && (
        <div className="pt-4 space-y-5">
          {/* Incident Summary, Location & People */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-md space-y-2 ${
              isLight ? "bg-white/80 shadow-2xs" : "bg-slate-950/70"
            }`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
              {t.summaryAndLocationHeading}
            </h4>
            <p className="text-xs leading-relaxed">{report.executive_summary}</p>
            <div className="flex flex-wrap gap-4 text-xs pt-1 opacity-90">
              <div>
                <strong>{t.locationFieldLabel}</strong>{" "}
                {report.location_status.detected_location}
              </div>
              <div>
                <strong>{t.peopleFieldLabel}</strong>{" "}
                {report.people_affected?.reported_summary} (
                {report.people_affected?.uncertainty})
              </div>
            </div>
          </div>

          {/* Three-Column Evidence Matrix (+ Image Observations if present) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {t.evidenceMatrixHeading}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column 1: Reported Facts & Image Observations */}
              <div
                className={`p-4 rounded-2xl backdrop-blur-md space-y-2 ${
                  isLight ? "bg-white/80 shadow-2xs" : "bg-slate-950/70"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.reportedInfoCol}</span>
                </div>
                <p className="text-[10px] opacity-70">{t.reportedInfoSub}</p>
                <ul className="space-y-1.5 text-xs">
                  {report.verification_matrix.user_reported_facts.map(
                    (fact, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    )
                  )}
                </ul>

                {report.verification_matrix.image_observations &&
                  report.verification_matrix.image_observations.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-300">
                        <Camera className="w-3 h-3" />
                        <span>{t.imageObservationsCol}</span>
                      </div>
                      <ul className="space-y-1 text-xs">
                        {report.verification_matrix.image_observations.map(
                          (obs, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-cyan-500 font-bold">•</span>
                              <span>{obs}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Column 2: AI-Identified Risks */}
              <div
                className={`p-4 rounded-2xl backdrop-blur-md space-y-2 ${
                  isLight ? "bg-white/80 shadow-2xs" : "bg-slate-950/70"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.aiRisksCol}</span>
                </div>
                <p className="text-[10px] opacity-70">{t.aiRisksSub}</p>
                <ul className="space-y-1.5 text-xs">
                  {report.verification_matrix.ai_visual_or_context_inferences.map(
                    (inf, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{inf}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Column 3: Missing Information */}
              <div
                className={`p-4 rounded-2xl backdrop-blur-md space-y-2 ${
                  isLight ? "bg-white/80 shadow-2xs" : "bg-slate-950/70"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.missingInfoCol}</span>
                </div>
                <p className="text-[10px] opacity-70">{t.missingInfoSub}</p>
                <ul className="space-y-1.5 text-xs">
                  {report.verification_matrix.missing_critical_info.map(
                    (missing, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">?</span>
                        <span>{missing}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Evidence Trace */}
          {report.evidence_trace && report.evidence_trace.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-cyan-500" />
                <span>{t.evidenceTraceHeading}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {report.evidence_trace.map((item, idx) => {
                  const isSelected = selectedTraceIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTraceIdx(idx)}
                      className={`text-left text-xs px-3 py-1.5 rounded-full backdrop-blur-md transition cursor-pointer ${
                        isSelected
                          ? "bg-cyan-600 text-white font-semibold"
                          : isLight
                          ? "bg-white/80 text-slate-800 hover:bg-white shadow-2xs"
                          : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      {item.claim}
                    </button>
                  );
                })}
              </div>

              {selectedTraceIdx !== null &&
                report.evidence_trace[selectedTraceIdx] && (
                  <div
                    className={`p-3.5 rounded-2xl backdrop-blur-md text-xs space-y-1 ${
                      isLight ? "bg-white/85 shadow-2xs" : "bg-slate-950/75"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">
                        {report.evidence_trace[selectedTraceIdx].claim}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                        {report.evidence_trace[
                          selectedTraceIdx
                        ].verification_status.replace("_", " ")}{" "}
                        ·{" "}
                        {report.evidence_trace[
                          selectedTraceIdx
                        ].source_type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="opacity-90">
                      <strong>{t.sourceQuoteLabel}</strong> &ldquo;
                      {
                        report.evidence_trace[selectedTraceIdx]
                          .supporting_quote_or_observation
                      }
                      &rdquo;
                    </div>
                    {report.evidence_trace[selectedTraceIdx]
                      .uncertainty_note && (
                      <div className="text-amber-600 dark:text-amber-300">
                        <strong>{t.uncertaintyNoteLabel}</strong>{" "}
                        {
                          report.evidence_trace[selectedTraceIdx]
                            .uncertainty_note
                        }
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}

          {/* User Correction Loop */}
          <div className="space-y-2">
            <label
              htmlFor="correction-input"
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{t.correctionHeading}</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="correction-input"
                type="text"
                value={correctionInput}
                onChange={(e) => setCorrectionInput(e.target.value)}
                placeholder={t.correctionPlaceholder}
                className={`flex-1 rounded-2xl px-3.5 py-2.5 text-xs backdrop-blur-md focus:outline-none ${
                  isLight
                    ? "bg-white/85 text-slate-950 placeholder-slate-500 shadow-2xs"
                    : "bg-slate-950/75 text-white placeholder-slate-400"
                }`}
              />
              <button
                type="button"
                disabled={!correctionInput.trim() || isResolving}
                onClick={() => {
                  onResolveMissingInfo(correctionInput.trim());
                  setCorrectionInput("");
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-full transition cursor-pointer shrink-0"
              >
                {isResolving ? t.updatingAnalysisBtn : t.updateAnalysisBtn}
              </button>
            </div>
          </div>

          {/* Safety Warnings */}
          {report.critical_warnings.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{t.warningsHeading}</span>
              </h4>
              <div
                className={`p-3.5 rounded-2xl backdrop-blur-md space-y-1.5 text-xs ${
                  isLight
                    ? "bg-red-50/90 text-red-950"
                    : "bg-red-950/45 text-red-200"
                }`}
              >
                {report.critical_warnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-bold">✕</span>
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Editable 112 Emergency Brief */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase opacity-85">
                {t.editableBriefHeading}
              </h4>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="p-1.5 rounded-full hover:bg-cyan-500/20 cursor-pointer"
                  title="Share Brief"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBrief}
                  className="p-1.5 rounded-full hover:bg-cyan-500/20 cursor-pointer"
                  title="Download Brief"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={editableBrief}
              onChange={(e) => setEditableBrief(e.target.value)}
              aria-label={t.editableBriefHeading}
              className={`w-full rounded-2xl p-3 text-xs font-mono leading-relaxed backdrop-blur-md focus:outline-none ${
                isLight
                  ? "bg-white/85 text-slate-900 shadow-2xs"
                  : "bg-slate-950/75 text-slate-200"
              }`}
            />

            <p className="text-[11px] opacity-75">{t.nonDispatchDisclaimer}</p>
          </div>
        </div>
      )}
    </section>
  );
}
