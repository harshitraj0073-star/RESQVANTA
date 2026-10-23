"use client";

import React from "react";
import {
  ShieldAlert,
  PhoneCall,
  Eye,
  Layers,
  Sun,
  Moon,
  Globe,
  Clock,
} from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  UIStrings,
} from "@/lib/translations";
import { GEMINI_MODEL_ID } from "@/lib/geminiSchema";

interface TopNavProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  is3DMode: boolean;
  onToggle3D: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  viewMode: "hero" | "workspace" | "radar";
  onViewModeChange: (mode: "hero" | "workspace" | "radar") => void;
  onOpenHistory?: () => void;
  t: UIStrings;
  historyCount: number;
}

export function TopNav({
  theme,
  onToggleTheme,
  is3DMode,
  onToggle3D,
  language,
  onLanguageChange,
  viewMode,
  onViewModeChange,
  onOpenHistory,
  t,
  historyCount,
}: TopNavProps) {
  const isLight = theme === "light";

  return (
    <header
      className={`h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isLight
          ? "bg-white/65 border-b border-slate-900/5 text-slate-900"
          : "bg-[#04070f]/65 border-b border-white/5 text-slate-100"
      }`}
    >
      {/* Brand */}
      <button
        type="button"
        onClick={() => onViewModeChange("hero")}
        className="flex items-center space-x-3 cursor-pointer text-left group"
      >
        <div className="btn-3d-cyan w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-105 shadow-md">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-base">
              ResQvanta{" "}
              <span
                className={`text-xs font-mono font-semibold ${
                  isLight ? "text-cyan-700" : "text-cyan-400"
                }`}
              >
                AI
              </span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1.5 ${
                isLight
                  ? "bg-cyan-500/10 text-cyan-800"
                  : "bg-cyan-500/10 text-cyan-300"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              {GEMINI_MODEL_ID}
            </span>
          </div>
          <p
            className={`text-[10px] hidden md:block ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {t.brandSubtitle}
          </p>
        </div>
      </button>

      {/* Center 3D Floating Navigation */}
      <nav
        aria-label="Primary View Navigation"
        className="hidden lg:flex items-center space-x-2"
      >
        <button
          type="button"
          onClick={() => onViewModeChange("hero")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
            viewMode === "hero"
              ? "btn-3d-cyan text-white shadow-md"
              : "btn-3d-slate"
          }`}
        >
          {t.navShowroom}
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("workspace")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
            viewMode === "workspace"
              ? "btn-3d-cyan text-white shadow-md"
              : "btn-3d-slate"
          }`}
        >
          {t.navWorkspace}
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("radar")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
            viewMode === "radar"
              ? "btn-3d-cyan text-white shadow-md"
              : "btn-3d-slate"
          }`}
        >
          Radar Map
        </button>

        <button
          type="button"
          onClick={() =>
            onOpenHistory ? onOpenHistory() : onViewModeChange("radar")
          }
          className="btn-3d-slate px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
        >
          <span>{t.navHistory}</span>
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
      </nav>

      {/* Right Controls: 4-Language Selector, Light/Dark Toggle, 3D/2D Toggle, Call 112 */}
      <div className="flex items-center space-x-2">
        {/* 4-Language Selector */}
        <div className="relative flex items-center">
          <Globe
            className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <select
            value={language}
            onChange={(e) =>
              onLanguageChange(e.target.value as SupportedLanguage)
            }
            aria-label="Select Language (English, Hindi, Marathi, Gujarati)"
            className={`pl-7 pr-2.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer focus:outline-none ${
              isLight
                ? "bg-slate-200/70 text-slate-900 hover:bg-slate-200"
                : "bg-slate-900/70 text-slate-200 hover:bg-slate-800"
            }`}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className={
                  isLight ? "bg-white text-slate-900" : "bg-slate-950 text-white"
                }
              >
                {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile History Trigger (when there are incidents) */}
        {historyCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onOpenHistory ? onOpenHistory() : onViewModeChange("radar")
            }
            aria-label="View Incident History"
            title="View Incident History"
            className={`lg:hidden flex items-center justify-center p-2 rounded-full transition cursor-pointer ${
              isLight
                ? "bg-slate-200/70 text-slate-900 hover:bg-slate-200"
                : "bg-slate-900/70 text-cyan-300 hover:bg-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            isLight ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
            isLight
              ? "bg-slate-200/70 text-slate-900 hover:bg-slate-200"
              : "bg-slate-900/70 text-amber-300 hover:bg-slate-800"
          }`}
        >
          {isLight ? (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">{t.themeDark}</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.themeLight}</span>
            </>
          )}
        </button>

        {/* 3D / 2D Lite Toggle */}
        <button
          type="button"
          onClick={onToggle3D}
          aria-label="Toggle 3D background"
          title="Toggle 3D Core vs 2D Lite Mode"
          className={`hidden sm:flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full transition cursor-pointer ${
            isLight
              ? "bg-slate-200/70 text-slate-700 hover:bg-slate-200"
              : "bg-slate-900/70 text-slate-300 hover:bg-slate-800"
          }`}
        >
          {is3DMode ? (
            <Layers className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          <span className="hidden md:inline">
            {is3DMode ? t.view3D : t.view2D}
          </span>
        </button>

        {/* Always-Visible Call 112 Emergency Button */}
        <a
          href="tel:112"
          aria-label="Call 112 National Emergency Services"
          className="btn-3d-red flex items-center space-x-1.5 text-white text-xs font-bold px-3.5 sm:px-4 py-1.5 rounded-full shadow-lg shrink-0 cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.call112}</span>
          <span className="sm:hidden font-mono">112</span>
        </a>
      </div>
    </header>
  );
}
