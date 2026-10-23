"use client";

import React, { useState } from "react";
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
  AlertOctagon
} from "lucide-react";

interface ActionCardProps {
  report: TriageReport;
  onResolveMissingInfo: (additionalDetails: string) => void;
  isResolving: boolean;
}

export function ActionCard({ report, onResolveMissingInfo, isResolving }: ActionCardProps) {
  const [missingInput, setMissingInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyPacket = () => {
    navigator.clipboard.writeText(report.dispatch_packet_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([report.dispatch_packet_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ResQvanta_Dispatch_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "MODERATE":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      case "LOW":
      case "NON_EMERGENCY":
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <div className="bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-2xl space-y-6">
      
      {/* 1. Mandatory Epistemic Banner */}
      <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>AI Triage Assessment · Confirm details before acting · Does not auto-dispatch 112 units</span>
        </span>
        <span className="text-[10px] font-mono text-cyan-400 hidden sm:inline">VERIFICATION PROTOCOL</span>
      </div>

      {/* 2. Incident Header & Severity Radar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${severityBadge(report.severity_level)}`}>
              {report.severity_level}
            </span>
            <span className="text-xs text-slate-400 font-mono">[{report.incident_category}]</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">{report.incident_title}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{report.executive_summary}</p>
        </div>

        {/* Severity & Confidence Gauges */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400">SEVERITY SCORE</div>
            <div className="text-2xl font-black font-mono text-white">
              {report.severity_score} <span className="text-xs text-slate-500 font-normal">/ 10</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              Confidence: {report.confidence_score}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Epistemic Verification Matrix (3-Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* User Reported */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-cyan-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>User Reported Facts</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            {report.verification_matrix.user_reported_facts.length > 0 ? (
              report.verification_matrix.user_reported_facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No direct facts isolated.</li>
            )}
          </ul>
        </div>

        {/* AI Inferred */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-indigo-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Context / Vision</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            {report.verification_matrix.ai_visual_or_context_inferences.length > 0 ? (
              report.verification_matrix.ai_visual_or_context_inferences.map((inf, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{inf}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No secondary inferences required.</li>
            )}
          </ul>
        </div>

        {/* Missing Info */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Missing Critical Info</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            {report.verification_matrix.missing_critical_info.length > 0 ? (
              report.verification_matrix.missing_critical_info.map((missing, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{missing}</span>
                </li>
              ))
            ) : (
              <li className="text-emerald-400 italic">All key triage parameters answered!</li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. Interactive Missing Information Resolver */}
      {report.verification_matrix.missing_critical_info.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Resolve Missing Information:</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400/80">RE-TRIAGE LOOP</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={missingInput}
              onChange={(e) => setMissingInput(e.target.value)}
              placeholder="e.g. Landmark is Lane 3 near temple, 1 rider conscious, bleeding from knee..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              disabled={!missingInput.trim() || isResolving}
              onClick={() => {
                onResolveMissingInfo(missingInput);
                setMissingInput("");
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
            >
              {isResolving ? "Updating..." : "Update & Re-Verify"}
            </button>
          </div>
        </div>
      )}

      {/* 5. Immediate Life-Saving Actions & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Immediate Actions */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
            <span>Immediate Life-Saving Directives</span>
          </h4>
          <div className="space-y-2">
            {report.immediate_actions.map((act) => (
              <div
                key={act.step_number}
                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {act.step_number}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{act.instruction}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{act.rationale}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings / What NOT to do */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase text-red-400 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Critical Warnings (DO NOT DO)</span>
          </h4>
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
            {report.critical_warnings.map((warn, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-200">
                <span className="text-red-400 font-bold">✕</span>
                <span>{warn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Formatted Dispatch Packet Export Widget */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleCopyPacket}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy 112 Dispatch Packet"}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Download Plain Text Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {report.recommended_authorities.map((auth, i) => (
            <a
              key={i}
              href={`tel:${auth.number}`}
              className="flex items-center space-x-1 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
              title={auth.reason}
            >
              <PhoneCall className="w-3 h-3 text-cyan-400" />
              <span>{auth.name}: {auth.number}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
