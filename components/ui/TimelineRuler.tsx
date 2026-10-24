"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { GEOLOGICAL_ERAS, resolveEra, GeologicalEra } from "@/lib/earthEras";

interface TimelineRulerProps {
  progress: number;
  onProgressChange: (progress: number) => void;
  theme: "light" | "dark";
}

const TOTAL_TICKS = 48;

export function TimelineRuler({
  progress,
  onProgressChange,
  theme,
}: TimelineRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isLight = theme === "light";

  const { currentEra } = resolveEra(progress);

  const calculateProgressFromPointer = useCallback(
    (clientX: number) => {
      if (!rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const clamped = Math.max(0, Math.min(1, rawX / rect.width));
      onProgressChange(clamped);
    },
    [onProgressChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    calculateProgressFromPointer(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    calculateProgressFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`w-full max-w-xl mx-auto flex flex-col items-center select-none p-5 rounded-3xl backdrop-blur-xl transition-all duration-300 border border-transparent shadow-xl pointer-events-auto ${
        isLight
          ? "bg-white/85 text-slate-900 shadow-slate-200/50"
          : "bg-slate-950/85 text-slate-100 shadow-cyan-950/20"
      }`}
    >
      {/* 1. Dynamic Typographical Header (Centered) */}
      <div className="text-center space-y-1 pb-3">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight transition-all duration-300">
          {currentEra.title}
        </h2>
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium opacity-85 transition-all duration-300">
          <span className="font-bold text-cyan-600 dark:text-cyan-400">
            {currentEra.highlight}
          </span>
          <span className="opacity-40">·</span>
          <span>{currentEra.subtitle}</span>
        </div>
      </div>

      {/* 2. Interactive Ruler Scrubber */}
      <div
        ref={rulerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full relative h-16 flex items-end justify-between cursor-ew-resize group px-2"
        role="slider"
        aria-label="Geological Earth Timeline Scrubbing Ruler"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
      >
        {/* Fine Ruler Ticks */}
        <div className="w-full flex items-end justify-between h-10 border-b border-transparent">
          {Array.from({ length: TOTAL_TICKS }).map((_, idx) => {
            const tickProgress = idx / (TOTAL_TICKS - 1);
            const isMajor = idx % 6 === 0;
            const isMedium = idx % 3 === 0;
            const height = isMajor ? "h-8" : isMedium ? "h-5" : "h-3";
            const isActive = tickProgress <= progress;

            return (
              <div
                key={idx}
                className={`w-[1.5px] rounded-full transition-all duration-150 ${height} ${
                  isActive
                    ? isLight
                      ? "bg-slate-900"
                      : "bg-cyan-400"
                    : isLight
                    ? "bg-slate-300/80 group-hover:bg-slate-400"
                    : "bg-slate-800 group-hover:bg-slate-700"
                }`}
              />
            );
          })}
        </div>

        {/* Active Cursor Needle */}
        <div
          className="absolute bottom-0 -translate-x-1/2 pointer-events-none transition-all duration-75 flex flex-col items-center"
          style={{ left: `${progress * 100}%` }}
        >
          <div
            className={`w-[2.5px] h-12 rounded-full shadow-md ${
              isLight ? "bg-black" : "bg-cyan-400 shadow-cyan-500/50"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full mt-0.5 ${
              isLight ? "bg-black" : "bg-cyan-400"
            }`}
          />
        </div>
      </div>

      {/* 3. Ruler Anchor Labels */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono opacity-70 px-1 pt-1.5">
        <span>13.8B years ago</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
          <span className="font-bold">Scrub to Travel Through Time</span>
        </div>
        <span>Today</span>
      </div>

      {/* 4. Quick Era Preset Jump Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
        {GEOLOGICAL_ERAS.map((era) => {
          const isSelected = currentEra.id === era.id;
          return (
            <button
              key={era.id}
              type="button"
              onClick={() => onProgressChange(era.progress)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer border border-transparent ${
                isSelected
                  ? isLight
                    ? "bg-slate-950 text-white shadow-xs scale-105"
                    : "bg-cyan-500 text-slate-950 shadow-xs scale-105 font-black"
                  : isLight
                  ? "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {era.title.split(" ")[0]} {era.title.split(" ")[1] || ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
