"use client";

import React, { useState, useEffect } from "react";
import { TriageReport } from "@/types/triage";
import { UIStrings } from "@/lib/translations";
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
} from "lucide-react";

interface ActionCardProps {
  report: TriageReport;
  onResolveMissingInfo: (additionalDetails: string) => void;
  isResolving: boolean;
  theme: "light" | "dark";
  t: UIStrings;
}

export function ActionCard({
  report,
  onResolveMissingInfo,
  isResolving,
  theme,
  t,
}: ActionCardProps) {
  // Default to Quick View so emergency instructions appear first without clutter
  const [detailMode, setDetailMode] = useState<"quick" | "detailed">("quick");
  const [correctionInput, setCorrectionInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedTraceIdx, setSelectedTraceIdx] = useState<number | null>(0);
  const [editableBrief, setEditableBrief] = useState(
    report.dispatch_packet_text
  );

  const isLight = theme === "light";

  useEffect(() => {
    setEditableBrief(report.dispatch_packet_text);
    setSelectedTraceIdx(report.evidence_trace?.length ? 0 : null);
  }, [report]);

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
          title: `112 Emergency Brief: ${report.incident_title}`,
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

  // Ensure max 3 immediate actions
  const topActions = (report.immediate_actions || []).slice(0, 3);

  return (
    <section
      aria-label="Emergency Guidance and Evidence"
      className={`rounded-3xl p-5 md:p-7 backdrop-blur-md transition-colors space-y-6 ${
        isLight
          ? "bg-white/75 text-slate-900 shadow-lg shadow-slate-900/5"
          : "bg-[#080d1a]/70 text-slate-100"
      }`}
    >
      {/* ==================== EMERGENCY-FIRST HEADER ==================== */}
      <div className="space-y-3">
        {/* A. Advisory Urgency Pill + View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full ${urgencyBadgeStyles(
                report.severity_level
              )}`}
            >
              {t.urgencyLabels[report.severity_level] || report.severity_level}
            </span>
            <span
              className={`text-[11px] ${
                isLight ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {t.urgencyAdvisoryNote}
            </span>
          </div>

          {/* Quick View vs Detailed View Toggle (Zero Extra API Calls) */}
          <div
            className={`inline-flex rounded-full p-1 text-xs ${
              isLight ? "bg-slate-200/80" : "bg-white/10"
            }`}
          >
            <button
              type="button"
              onClick={() => setDetailMode("quick")}
              className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
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
              className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
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

        {/* B. Short Emergency Headline */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
          {report.incident_title}
        </h2>

        {/* One-Sentence Urgency Rationale */}
        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            isLight ? "text-slate-700" : "text-slate-300"
          }`}
        >
          {report.urgency_rationale}
        </p>
      </div>

      {/* ==================== C. UP TO 3 IMMEDIATE ACTIONS ==================== */}
      <div className="space-y-3">
        <h3
          className={`text-xs font-bold uppercase tracking-wider ${
            isLight ? "text-cyan-700" : "text-cyan-400"
          }`}
        >
          {t.whatToDoNowHeading}
        </h3>

        <div className="space-y-2.5">
          {topActions.map((act, index) => (
            <div
              key={act.step_number || index}
              className={`p-4 rounded-2xl flex items-start gap-3.5 transition ${
                isLight
                  ? "bg-slate-100/90 text-slate-900"
                  : "bg-white/5 text-white"
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
                      isLight ? "text-slate-600" : "text-slate-400"
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

      {/* ==================== D. PRIMARY EMERGENCY CONTROLS ==================== */}
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
          className={`flex items-center space-x-1.5 text-xs font-bold px-4 py-3 rounded-full transition cursor-pointer ${
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
          className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-3 rounded-full transition ${
            isLight
              ? "bg-slate-200/90 text-slate-800 hover:bg-slate-300"
              : "bg-white/10 text-slate-200 hover:bg-white/15"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.shareSmsBtn}</span>
        </a>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-3 rounded-full transition ${
            isLight
              ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
              : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t.shareWhatsappBtn}</span>
        </a>
      </div>

      {/* ==================== E. SHORT UNCERTAINTY STATEMENT ==================== */}
      <div
        className={`flex items-center justify-between gap-2 text-xs pt-2 ${
          isLight ? "text-slate-600" : "text-slate-400"
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
          className={`inline-flex items-center gap-1 font-semibold underline cursor-pointer shrink-0 ${
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

      {/* ==================== F. EXPANDABLE DETAILED VIEW ==================== */}
      {detailMode === "detailed" && (
        <div
          className={`pt-5 space-y-6 border-t ${
            isLight ? "border-slate-900/10" : "border-white/10"
          }`}
        >
          {/* 1. Incident Summary, Location & People Affected */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
              {t.summaryAndLocationHeading}
            </h4>
            <p className="text-xs leading-relaxed">{report.executive_summary}</p>
            <div className="flex flex-wrap gap-4 text-xs pt-1 opacity-85">
              <div>
                <strong>Location:</strong>{" "}
                {report.location_status.detected_location}
              </div>
              <div>
                <strong>People:</strong>{" "}
                {report.people_affected?.reported_summary} (
                {report.people_affected?.uncertainty})
              </div>
            </div>
          </div>

          {/* 2. Three-Column Evidence & Uncertainty Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
              {t.evidenceMatrixHeading}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Reported Facts */}
              <div
                className={`p-4 rounded-2xl ${
                  isLight ? "bg-slate-100/90" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.reportedInfoCol}</span>
                </div>
                <p className="text-[10px] opacity-70 mt-0.5 mb-2">
                  {t.reportedInfoSub}
                </p>
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
              </div>

              {/* AI-Identified Risks */}
              <div
                className={`p-4 rounded-2xl ${
                  isLight ? "bg-slate-100/90" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.aiRisksCol}</span>
                </div>
                <p className="text-[10px] opacity-70 mt-0.5 mb-2">
                  {t.aiRisksSub}
                </p>
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

              {/* Missing Information */}
              <div
                className={`p-4 rounded-2xl ${
                  isLight ? "bg-slate-100/90" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.missingInfoCol}</span>
                </div>
                <p className="text-[10px] opacity-70 mt-0.5 mb-2">
                  {t.missingInfoSub}
                </p>
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

          {/* 3. Evidence Trace */}
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
                      className={`text-left text-xs px-3 py-1.5 rounded-full transition cursor-pointer ${
                        isSelected
                          ? "bg-cyan-600 text-white font-semibold"
                          : isLight
                          ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300"
                          : "bg-white/10 text-slate-300 hover:bg-white/15"
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
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      isLight ? "bg-slate-100" : "bg-white/5"
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
                    <div className="opacity-85">
                      <strong>Source Quote:</strong> &ldquo;
                      {
                        report.evidence_trace[selectedTraceIdx]
                          .supporting_quote_or_observation
                      }
                      &rdquo;
                    </div>
                    {report.evidence_trace[selectedTraceIdx]
                      .uncertainty_note && (
                      <div className="text-amber-600 dark:text-amber-300">
                        <strong>Uncertainty:</strong>{" "}
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

          {/* 4. Interactive User Correction Loop */}
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
                className={`flex-1 rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none ${
                  isLight
                    ? "bg-white text-slate-900 placeholder-slate-400 shadow-inner"
                    : "bg-slate-950/80 text-slate-100 placeholder-slate-500"
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

          {/* 5. Safety Warnings */}
          {report.critical_warnings.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{t.warningsHeading}</span>
              </h4>
              <div
                className={`p-3.5 rounded-2xl space-y-1.5 text-xs ${
                  isLight
                    ? "bg-red-50 text-red-900"
                    : "bg-red-950/30 text-red-200"
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

          {/* 6. Full Editable 112 Emergency Brief */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase opacity-80">
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
              className={`w-full rounded-2xl p-3 text-xs font-mono leading-relaxed focus:outline-none ${
                isLight
                  ? "bg-white text-slate-900 shadow-inner"
                  : "bg-slate-950/80 text-slate-200"
              }`}
            />

            <p className="text-[11px] opacity-65">{t.nonDispatchDisclaimer}</p>
          </div>
        </div>
      )}
    </section>
  );
}
