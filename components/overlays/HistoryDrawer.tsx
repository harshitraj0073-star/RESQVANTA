"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Copy,
  Check,
  Share2,
  Trash2,
  AlertTriangle,
  FileText,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import { TriageReport } from "@/types/triage";
import { SupportedLanguage, UIStrings } from "@/lib/translations";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: TriageReport[];
  onSelectIncident: (report: TriageReport) => void;
  onClearHistory: () => void;
  theme: "light" | "dark";
  language: SupportedLanguage;
  t: UIStrings;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  incidents,
  onSelectIncident,
  onClearHistory,
  theme,
  language,
  t,
}: HistoryDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isLight = theme === "light";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "MODERATE":
      case "UNCERTAIN":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Past Incident History"
        className={`relative z-10 w-full max-w-md h-full flex flex-col shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-right ${
          isLight
            ? "bg-white/95 text-slate-900 border-l border-slate-200"
            : "bg-[#0b1220]/95 text-slate-100 border-l border-white/10"
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Incident History
              </h2>
              <p className="text-xs text-slate-400">
                {incidents.length}{" "}
                {incidents.length === 1 ? "record" : "records"} in this session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {incidents.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                title="Clear incident history"
                className="p-1.5 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history drawer"
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Incidents List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {incidents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-400 max-w-xs">
                No past incidents recorded yet. Analyze an emergency to generate
                a verifiable triage brief.
              </p>
            </div>
          ) : (
            incidents.map((incident, idx) => {
              const isCopied = copiedId === incident.requestId;
              return (
                <div
                  key={incident.requestId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight
                      ? "bg-slate-50/80 border-slate-200 hover:border-cyan-500/40"
                      : "bg-[#121e30]/80 border-white/5 hover:border-cyan-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getUrgencyBadge(
                        incident.severity_level
                      )}`}
                    >
                      {incident.severity_level}
                    </span>
                    <span className="text-[10px] font-mono opacity-60">
                      #{idx + 1} · {incident.requestId.slice(-6)}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold line-clamp-1 mb-1">
                    {incident.incident_title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 italic mb-3">
                    &ldquo;{incident.submittedTextSnapshot}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-inherit gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectIncident(incident);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Brief</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            incident.requestId,
                            incident.dispatch_packet_text
                          )
                        }
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
                        title="Copy 112 SMS Brief"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px] font-mono">
                          {isCopied ? "Copied" : "112 Brief"}
                        </span>
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          incident.dispatch_packet_text
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition"
                        title="Share via WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Emergency Call */}
        <div className="p-4 border-t border-inherit bg-inherit flex items-center justify-between text-xs">
          <span className="text-slate-400">Immediate danger?</span>
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112 Directly</span>
          </a>
        </div>
      </div>
    </div>
  );
}
