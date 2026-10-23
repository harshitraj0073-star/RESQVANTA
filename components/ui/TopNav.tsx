"use client";

import React from "react";
import {
  ShieldAlert,
  PhoneCall,
  Sun,
  Moon,
  Globe,
  Clock,
  Layers,
} from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  UIStrings,
} from "@/lib/translations";
import { GEMINI_MODEL_ID } from "@/lib/geminiSchema";
import { ShinyButton } from "@/components/ui/ShinyButton";

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
      className={`h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-2xl transition-colors border-b border-transparent ${
        isLight
          ? "bg-white/60 text-slate-900 shadow-xs"
          : "bg-[#060b14]/65 text-slate-100 shadow-lg"
      }`}
    >
      {/* Brand */}
      <button
        type="button"
        onClick={() => onViewModeChange("hero")}
        className="flex items-center space-x-3 cursor-pointer text-left group"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-105 shadow-md bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          <ShieldAlert className="w-5 h-5" />
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
                  : "bg-cyan-500/15 text-cyan-300"
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

      {/* Center Shiny Floating Navigation */}
      <nav
        aria-label="Primary View Navigation"
        className="hidden lg:flex items-center space-x-2"
      >
        <ShinyButton
          variant={viewMode === "hero" ? "cyan" : "slate"}
          size="sm"
          onClick={() => onViewModeChange("hero")}
        >
          {t.navShowroom}
        </ShinyButton>

        <ShinyButton
          variant={viewMode === "workspace" ? "cyan" : "slate"}
          size="sm"
          onClick={() => onViewModeChange("workspace")}
        >
          {t.navWorkspace}
        </ShinyButton>

        <ShinyButton
          variant={viewMode === "radar" ? "cyan" : "slate"}
          size="sm"
          onClick={() => onViewModeChange("radar")}
        >
          Radar Map
        </ShinyButton>

        <ShinyButton
          variant="slate"
          size="sm"
          onClick={() => (onOpenHistory ? onOpenHistory() : onViewModeChange("radar"))}
        >
          <span>{t.navHistory}</span>
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </ShinyButton>
      </nav>

      {/* Right Controls: Language, Theme, 3D Earth, Call 112 */}
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
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            aria-label="Select Language"
            className={`pl-7 pr-2.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer border border-transparent focus:outline-none ${
              isLight
                ? "bg-slate-200/60 text-slate-900 hover:bg-slate-200/80"
                : "bg-slate-900/60 text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className={isLight ? "bg-white text-slate-900" : "bg-slate-950 text-white"}
              >
                {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile History Trigger */}
        {historyCount > 0 && (
          <button
            type="button"
            onClick={() => (onOpenHistory ? onOpenHistory() : onViewModeChange("radar"))}
            aria-label="View Incident History"
            className={`lg:hidden flex items-center justify-center p-2 rounded-full border border-transparent transition cursor-pointer ${
              isLight ? "bg-slate-200/70 text-slate-900" : "bg-slate-900/70 text-cyan-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Light / Dark Mode Toggle */}
        <ShinyButton
          variant="slate"
          size="sm"
          onClick={onToggleTheme}
          aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className="px-2.5"
        >
          {isLight ? (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline text-slate-700">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline text-amber-300">Light</span>
            </>
          )}
        </ShinyButton>

        {/* 3D Earth Trigger */}
        <ShinyButton
          variant={is3DMode ? "cyan" : "slate"}
          size="sm"
          onClick={onToggle3D}
          className="hidden sm:inline-flex"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3D Earth</span>
        </ShinyButton>

        {/* Emergency Dial 112 Button (Ali Imam Shiny Red Variant) */}
        <ShinyButton
          variant="red"
          size="sm"
          href="tel:112"
          className="font-extrabold shadow-md"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>Call 112</span>
        </ShinyButton>
      </div>
    </header>
  );
}

export default TopNav;
