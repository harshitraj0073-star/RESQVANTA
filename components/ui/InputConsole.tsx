"use client";

import React, { useState, useRef } from "react";
import { PRESET_SCENARIOS, PresetScenario } from "@/lib/presets";
import { UploadCloud, Mic, MicOff, MapPin, X, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";

interface InputConsoleProps {
  onAnalyze: (payload: {
    text: string;
    imageBase64: string | null;
    imageMimeType: string | null;
    gpsCoords: string | null;
  }) => void;
  isLoading: boolean;
  onGpsChange: (hasGps: boolean) => void;
}

export function InputConsole({ onAnalyze, isLoading, onGpsChange }: InputConsoleProps) {
  const [inputText, setInputText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Preset chip loader
  const handleSelectPreset = (p: PresetScenario) => {
    setInputText(p.text);
  };

  // 2. Client-side Image compression via HTML5 canvas (keeps payload < 1MB)
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL(file.type, 0.85);
        setImageBase64(compressedDataUrl);
        setImageMimeType(file.type);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 3. Web Speech API Voice Dictation
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please type your emergency description.");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // Supports Indian English / Hinglish phonetics

    if (!isRecording) {
      recognition.start();
      setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  // 4. Browser GPS Lock
  const lockGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setGpsCoords(coords);
        onGpsChange(true);
      },
      (err) => {
        console.warn("GPS lock denied or timed out:", err);
        setGpsCoords("Approx. Pune, Maharashtra (Default / Perm. Denied)");
        onGpsChange(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageBase64) {
      alert("Please enter a description or upload an incident photo.");
      return;
    }
    onAnalyze({
      text: inputText,
      imageBase64,
      imageMimeType,
      gpsCoords
    });
  };

  return (
    <div className="bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Distress Ingestion Console</span>
            </h2>
            <p className="text-xs text-slate-400">Natural voice, multilingual text, or hazard photographs</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            MULTIMODAL
          </span>
        </div>

        {/* Preset Chips */}
        <div className="mb-4">
          <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase">
            ⚡ 1-Tap Realistic Scenarios:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SCENARIOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition hover:brightness-125 cursor-pointer ${p.badgeColor}`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe what is happening... (English, हिंदी, Hinglish, Marathi: e.g. Water entering building, electric sparking near gate...)"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
            />

            {/* Quick Micro-Toolbar inside textarea footer */}
            <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="Voice Dictation"
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={lockGps}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  gpsCoords
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="Lock Device GPS"
              >
                <MapPin className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* GPS Coordinates readout if locked */}
          {gpsCoords && (
            <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between px-2.5 py-1 rounded bg-cyan-950/30 border border-cyan-800/40">
              <span>📍 Coordinates: {gpsCoords}</span>
              <button
                type="button"
                onClick={() => {
                  setGpsCoords(null);
                  onGpsChange(false);
                }}
                className="text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          )}

          {/* Drag & Drop Photo Zone */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
              }}
            />

            {imageBase64 ? (
              <div className="relative rounded-2xl border border-cyan-500/40 bg-slate-950/60 p-2 flex items-center space-x-3">
                <img
                  src={imageBase64}
                  alt="Incident Preview"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Incident Photo Attached</div>
                  <div className="text-[10px] font-mono text-emerald-400">Resized & Compressed (&lt;1MB)</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageBase64(null);
                    setImageMimeType(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 text-center cursor-pointer bg-slate-950/40 hover:bg-cyan-950/10 transition group"
              >
                <div className="flex items-center justify-center space-x-2 text-slate-400 group-hover:text-cyan-300">
                  <UploadCloud className="w-4 h-4" />
                  <span className="text-xs font-medium">Attach Hazard Image / Document</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG, WebP (Auto-compressed client-side)</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-cyan-500/20 border border-cyan-400/30 transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini 2.5 Epistemic Triage Running...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Structure Incident</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Safety Notice */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 leading-tight">
        ⚠️ <strong>Non-Dispatch Notice:</strong> ResQvanta organizes chaotic incident data for quick clarity. In acute life-threatening emergencies, immediately dial <strong>112</strong>.
      </div>
    </div>
  );
}
