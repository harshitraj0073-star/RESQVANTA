"use client";

import React from "react";
import { ShieldAlert, PhoneCall, Eye, Layers, Compass, Radio } from "lucide-react";

interface TopNavProps {
  is3DMode: boolean;
  onToggle3D: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  gpsActive: boolean;
  viewMode: "hero" | "workspace" | "radar";
  onViewModeChange: (mode: "hero" | "workspace" | "radar") => void;
}

export function TopNav({
  is3DMode,
  onToggle3D,
  language,
  onLanguageChange,
  viewMode,
  onViewModeChange,
}: TopNavProps) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#050811]/85 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      {/* Brand */}
      <div
        onClick={() => onViewModeChange("hero")}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-slate-800 flex items-center justify-center shadow-lg shadow-cyan-500/15 border border-cyan-400/40 group-hover:scale-105 transition">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-white text-base">
              ResQvanta <span className="text-cyan-400 text-xs font-mono font-normal">AI</span>
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Powered by Google Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden md:block">
            From Chaos to Action · Universal Emergency Information Assistant
          </p>
        </div>
      </div>

      {/* Center View Mode Switcher */}
      <nav aria-label="View Switcher" className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl space-x-1">
        <button
          onClick={() => onViewModeChange("hero")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            viewMode === "hero"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          1. Showroom Intro
        </button>
        <button
          onClick={() => onViewModeChange("workspace")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
            viewMode === "workspace"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>2. Incident Workspace</span>
        </button>
        <button
          onClick={() => onViewModeChange("radar")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
            viewMode === "radar"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>3. Session History</span>
        </button>
      </nav>

      {/* Action Badges & Always-Visible 112 Call Option */}
      <div className="flex items-center space-x-2 md:space-x-2.5">
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label="Select Output Language"
          className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          <option value="English">English</option>
          <option value="Hindi">हिंदी (Hindi)</option>
          <option value="Marathi">मराठी (Marathi)</option>
        </select>

        {/* 3D / 2D Lite Mode Toggle */}
        <button
          onClick={onToggle3D}
          className={`flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
            is3DMode
              ? "bg-slate-900 text-cyan-300 border-cyan-500/30 hover:bg-slate-800"
              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          }`}
          title="Switch between 3D Core and Lightweight 2D Mode"
        >
          {is3DMode ? <Layers className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{is3DMode ? "3D View" : "2D Lite"}</span>
        </button>

        {/* Always-Visible Emergency Call 112 CTA */}
        <a
          href="tel:112"
          aria-label="Call 112 National Emergency Number immediately"
          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-lg shadow-red-600/30 border border-red-400 transition transform active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 112</span>
        </a>
      </div>
    </header>
  );
}
