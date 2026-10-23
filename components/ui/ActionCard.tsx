"use client";

import React, { useState, useEffect } from "react";
import { TriageReport } from "@/types/triage";
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
  FileSearch
} from "lucide-react";

interface ActionCardProps {
  report: TriageReport;
  onResolveMissingInfo: (additionalDetails: string) => void;
  isResolving: boolean;
}

export function ActionCard({ report, onResolveMissingInfo, isResolving }: ActionCardProps) {
  const [correctionInput, setCorrectionInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedTraceIdx, setSelectedTraceIdx] = useState<number | null>(0);
  const [editableBrief, setEditableBrief] = useState(report.dispatch_packet_text);
  const [preparedAt, setPreparedAt] = useState("");

  useEffect(() => {
    setEditableBrief(report.dispatch_packet_text);
    setPreparedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
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
    a.download = `ResQvanta_112_Emergency_Brief_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `112 Emergency Brief: ${report.incident_title}`,
          text: editableBrief
        });
      } catch {
        // User cancelled share sheet
      }
    } else {
      handleCopyBrief();
    }
  };

  const severityBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "HIGH":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MODERATE":
      case "UNCERTAIN":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-500/40";
      case "LOW":
      case "NON_EMERGENCY":
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const urgencyLabel = (level: string) => {
    if (level === "NON_EMERGENCY") return "No Emergency Established";
    return `${level.charAt(0) + level.slice(1).toLowerCase()} Urgency`;
  };

  const smsLink = `sms:?body=${encodeURIComponent(editableBrief)}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(editableBrief)}`;

  return (
    <div className="bg-[#090d16]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-5 md:p-6 shadow-2xl space-y-6">
      {/* 1. Honest Safety Notice */}
      <div className="px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            AI-Structured Evidence Brief · Not a substitute for emergency services · Does not automatically notify 112
          </span>
        </span>
        <a
          href="tel:112"
          className="text-[11px] font-bold text-red-400 hover:text-red-300 underline"
        >
          Call 112 Directly
        </a>
      </div>

      {/* 2. Urgency Assessment (Plain-English Tier + Rationale, No Arbitrary Score) */}
      <div className="border-b border-slate-800/80 pb-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${severityBadge(
                report.severity_level
              )}`}
            >
              {urgencyLabel(report.severity_level)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              [{report.incident_category}]
            </span>
          </div>
          {preparedAt && (
            <span className="text-[11px] font-mono text-slate-400">
              Prepared at {preparedAt}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">
          {report.incident_title}
        </h3>
        <p className="text-xs text-slate-200 leading-relaxed">
          {report.executive_summary}
        </p>

        {/* Urgency Rationale + Location & People Summary */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1.5 text-xs">
          <div>
            <span className="font-semibold text-cyan-300">Why this urgency level: </span>
            <span className="text-slate-300">{report.urgency_rationale}</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-[11px] text-slate-400">
            <div>
              <strong className="text-slate-200">Location:</strong>{" "}
              {report.location_status.detected_location}{" "}
              {!report.location_status.is_location_precise && "(Needs exact landmark)"}
            </div>
            <div>
              <strong className="text-slate-200">People Affected:</strong>{" "}
              {report.people_affected?.reported_summary || "Not specified"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Three-Column Evidence Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Evidence &amp; Uncertainty Matrix
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            Separates Facts from AI Interpretations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column 1: REPORTED INFORMATION */}
          <div className="p-3.5 rounded-2xl bg-slate-950/65 border border-cyan-500/25">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Reported Information</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Directly stated by user or observed in attached photo
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-200">
              {report.verification_matrix.user_reported_facts.length > 0 ? (
                report.verification_matrix.user_reported_facts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No direct statements reported yet.</li>
              )}
            </ul>
          </div>

          {/* Column 2: AI-IDENTIFIED RISKS */}
          <div className="p-3.5 rounded-2xl bg-slate-950/65 border border-amber-500/25">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>AI-Identified Risks</span>
            </div>
            <p className="text-[10px] text-amber-200/70 mb-2">
              AI interpretations of possible hazards — not confirmed facts
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-200">
              {report.verification_matrix.ai_visual_or_context_inferences.length > 0 ? (
                report.verification_matrix.ai_visual_or_context_inferences.map((inf, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{inf}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No additional risks inferred.</li>
              )}
            </ul>
          </div>

          {/* Column 3: MISSING INFORMATION */}
          <div className="p-3.5 rounded-2xl bg-slate-950/65 border border-rose-500/25">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Missing Information</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Important unanswered questions — never invented by AI
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-200">
              {report.verification_matrix.missing_critical_info.length > 0 ? (
                report.verification_matrix.missing_critical_info.map((missing, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">?</span>
                    <span>{missing}</span>
                  </li>
                ))
              ) : (
                <li className="text-emerald-400 italic">
                  Key questions have been addressed by user updates.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Interactive Evidence Trace (Click a Claim to Inspect Source) */}
      {report.evidence_trace && report.evidence_trace.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileSearch className="w-4 h-4 text-cyan-400" />
              <span>Evidence Trace (Click any claim to see its exact source)</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">TRANSPARENCY AUDIT</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {report.evidence_trace.map((item, idx) => {
              const isSelected = selectedTraceIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTraceIdx(idx)}
                  className={`text-left text-[11px] px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-400 font-semibold"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {item.claim}
                </button>
              );
            })}
          </div>

          {selectedTraceIdx !== null && report.evidence_trace[selectedTraceIdx] && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-white">
                  Claim: {report.evidence_trace[selectedTraceIdx].claim}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Status: {report.evidence_trace[selectedTraceIdx].verification_status.replace("_", " ")} · Source:{" "}
                  {report.evidence_trace[selectedTraceIdx].source_type.replace("_", " ")}
                </span>
              </div>
              <div className="text-slate-300 text-[11px]">
                <strong className="text-slate-400">Supporting Source Quote / Observation:</strong>{" "}
                &ldquo;{report.evidence_trace[selectedTraceIdx].supporting_quote_or_observation}&rdquo;
              </div>
              {report.evidence_trace[selectedTraceIdx].uncertainty_note && (
                <div className="text-amber-300 text-[11px]">
                  <strong>Uncertainty Note:</strong>{" "}
                  {report.evidence_trace[selectedTraceIdx].uncertainty_note}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Interactive Correction Loop */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="correction-input"
            className="text-xs font-bold text-amber-200 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Correct or Add Details (Updates Analysis):</span>
          </label>
          <span className="text-[10px] font-mono text-amber-300/90">USER CORRECTION LOOP</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="correction-input"
            type="text"
            value={correctionInput}
            onChange={(e) => setCorrectionInput(e.target.value)}
            placeholder='Example: "They are on the second floor, not in the basement, and power is now turned off."'
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="button"
            disabled={!correctionInput.trim() || isResolving}
            onClick={() => {
              onResolveMissingInfo(correctionInput.trim());
              setCorrectionInput("");
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
          >
            {isResolving ? "Updating with Gemini..." : "Update Analysis"}
          </button>
        </div>
      </div>

      {/* 6. Actionable Guidance & Safety Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-emerald-400">
            Immediate Safety Guidance
          </h4>
          <div className="space-y-2">
            {report.immediate_actions.map((act) => (
              <div
                key={act.step_number}
                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {act.step_number}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{act.instruction}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{act.rationale}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-red-400 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>What Avoid / Safety Warnings</span>
          </h4>
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
            {report.critical_warnings.length > 0 ? (
              report.critical_warnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-200">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>{warn}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No special hazard warnings noted.</div>
            )}
          </div>
        </div>
      </div>

      {/* 7. Editable 112 Emergency Brief & Share Actions */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase text-cyan-300">
              112 Emergency Brief (Editable Before Sharing)
            </h4>
            <p className="text-[11px] text-slate-400">
              Review or edit this summary before copying or sending via SMS / WhatsApp
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">USER-CONTROLLED SHARE</span>
        </div>

        <textarea
          rows={4}
          value={editableBrief}
          onChange={(e) => setEditableBrief(e.target.value)}
          aria-label="Editable 112 Emergency Brief"
          className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBrief}
              className="flex items-center space-x-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied Brief" : "Copy Report"}</span>
            </button>

            <a
              href={smsLink}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Prepare SMS</span>
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium px-3 py-2 rounded-xl border border-emerald-500/30 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prepare WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleNativeShare}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Share via Browser"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownloadBrief}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Download Brief (.txt)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:112"
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-red-600/25 border border-red-400 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 112</span>
            </a>
          </div>
        </div>

        <p className="text-[10px] text-slate-500">
          Note: Preparing an SMS or WhatsApp message lets you share information with contacts or responders; it does not automatically dispatch 112 services. Always call 112 directly for official emergency dispatch.
        </p>
      </div>
    </div>
  );
}
