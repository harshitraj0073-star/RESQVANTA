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
  t,
  historyCount,
}: TopNavProps) {
  const isLight = theme === "light";

  return (
    <header
      className={`h-14 sm:h-16 px-2.5 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md transition-colors w-full overflow-hidden ${
        isLight
          ? "bg-white/80 border-b border-slate-900/5 text-slate-900"
          : "bg-[#04070f]/80 border-b border-white/5 text-slate-100"
      }`}
    >
      {/* Brand (Compacts cleanly on extra-small mobile) */}
      <button
        type="button"
        onClick={() => onViewModeChange("hero")}
        className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer text-left group shrink-0"
      >
        <div
          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition group-hover:scale-105 shrink-0 ${
            isLight
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-cyan-500/20 text-cyan-300"
          }`}
        >
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="font-extrabold tracking-tight text-sm sm:text-base">
              ResQvanta{" "}
              <span
                className={`text-[10px] sm:text-xs font-mono font-semibold ${
                  isLight ? "text-cyan-700" : "text-cyan-400"
                }`}
              >
                AI
              </span>
            </span>
            <span
              className={`text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1.5 ${
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
            className={`text-[9px] sm:text-[10px] hidden lg:block ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {t.brandSubtitle}
          </p>
        </div>
      </button>

      {/* Center Floating Navigation (Tablet md: and Desktop lg:) */}
      <nav
        aria-label="Primary View Navigation"
        className="hidden md:flex items-center space-x-1"
      >
        {(
          [
            { id: "hero", label: t.navShowroom },
            { id: "workspace", label: t.navWorkspace },
            {
              id: "radar",
              label:
                historyCount > 0
                  ? `${t.navHistory} (${historyCount})`
                  : t.navHistory,
            },
          ] as const
        ).map((tab) => {
          const active = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewModeChange(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                active
                  ? isLight
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-cyan-500/20 text-cyan-300 font-semibold"
                  : isLight
                  ? "text-slate-600 hover:text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Compact cluster guaranteed to never overflow on any mobile */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* 4-Language Selector (Compact short-code on mobile, full name on tablet+) */}
        <div className="relative flex items-center">
          <Globe
            className={`w-3.5 h-3.5 absolute left-2 pointer-events-none ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <select
            value={language}
            onChange={(e) =>
              onLanguageChange(e.target.value as SupportedLanguage)
            }
            aria-label="Select Language"
            className={`pl-6 pr-2 sm:pl-7 sm:pr-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer focus:outline-none ${
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
                {lang.code.split("-")[0].toUpperCase()} - {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            isLight ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className={`flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer shrink-0 ${
            isLight
              ? "bg-slate-200/70 text-slate-900 hover:bg-slate-200"
              : "bg-slate-900/70 text-amber-300 hover:bg-slate-800"
          }`}
        >
          {isLight ? (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden xl:inline ml-1.5">{t.themeDark}</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline ml-1.5">{t.themeLight}</span>
            </>
          )}
        </button>

        {/* 3D / 2D Toggle (Desktop/Tablet) */}
        <button
          type="button"
          onClick={onToggle3D}
          aria-label="Toggle 3D background"
          title="Toggle 3D Core vs 2D Lite Mode"
          className={`hidden sm:flex items-center space-x-1 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition cursor-pointer shrink-0 ${
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
          <span className="hidden xl:inline">
            {is3DMode ? t.view3D : t.view2D}
          </span>
        </button>

        {/* Always-Visible Call 112 Emergency Button (Guaranteed never cut off) */}
        <a
          href="tel:112"
          aria-label="Call 112 National Emergency Services"
          className="flex items-center space-x-1 sm:space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-sm transition transform active:scale-95 shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.call112}</span>
          <span className="sm:hidden font-mono text-[11px]">112</span>
        </a>
      </div>
    </header>
  );
}
