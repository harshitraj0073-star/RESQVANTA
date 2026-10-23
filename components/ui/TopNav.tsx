"use client";

import React from "react";
import { ShieldAlert, Activity, PhoneCall, Eye, Layers } from "lucide-react";

interface TopNavProps {
  is3DMode: boolean;
  onToggle3D: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  gpsActive: boolean;
}

export function TopNav({
  is3DMode,
  onToggle3D,
  language,
  onLanguageChange,
  gpsActive,
}: TopNavProps) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-white text-base">
              ResQvanta <span className="text-cyan-400 text-xs font-mono font-normal">AI</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              GEMINI 2.5 FLASH
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">From Human Panic to Verified Action</p>
        </div>
      </div>

      {/* Action Badges & Toggles */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* GPS Indicator */}
        <div
          className={`hidden sm:flex items-center space-x-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition ${
            gpsActive
              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
              : "bg-slate-900 text-slate-400 border-slate-800"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{gpsActive ? "GPS LOCKED" : "GPS READY"}</span>
        </div>

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          <option value="English">English</option>
          <option value="Hindi">हिंदी (Hindi)</option>
          <option value="Marathi">मराठी (Marathi)</option>
        </select>

        {/* 3D / 2D Lite Mode Toggle */}
        <button
          onClick={onToggle3D}
          className={`flex items-center space-x-1 text-xs font-mono px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
            is3DMode
              ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/20"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
          title="Toggle 3D WebGL vs High-Contrast 2D Mode for low-battery emergency conservation"
        >
          {is3DMode ? <Layers className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{is3DMode ? "3D SPATIAL" : "2D LITE"}</span>
        </button>

        {/* Emergency Call 112 CTA */}
        <a
          href="tel:112"
          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono px-3 py-1.5 rounded-lg shadow-lg shadow-red-600/30 border border-red-400 transition transform active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
          <span>CALL 112</span>
        </a>
      </div>
    </header>
  );
}
