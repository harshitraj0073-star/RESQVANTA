"use client";

import React, { useState, useRef } from "react";
import { PRESET_SCENARIOS, PresetScenario } from "@/lib/presets";
import {
  UploadCloud,
  Mic,
  MicOff,
  MapPin,
  X,
  Sparkles,
  Loader2,
  Trash2,
  PhoneCall
} from "lucide-react";

interface InputConsoleProps {
  onAnalyze: (payload: {
    text: string;
    imageBase64: string | null;
    imageMimeType: string | null;
    gpsCoords: string | null;
    manualLocation: string;
  }) => void;
  isLoading: boolean;
  onGpsChange: (hasGps: boolean) => void;
}

export function InputConsole({ onAnalyze, isLoading, onGpsChange }: InputConsoleProps) {
  const [inputText, setInputText] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<string | null>(null);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (p: PresetScenario) => {
    setInputText(p.text);
    setErrorMessage(null);
  };

  const handleClearAll = () => {
    setInputText("");
    setManualLocation("");
    setImageBase64(null);
    setImageMimeType(null);
    setGpsCoords(null);
    setGpsNotice(null);
    setErrorMessage(null);
    onGpsChange(false);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Invalid file type. Please choose a JPEG, PNG, or WebP photo.");
      return;
    }
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL(file.type, 0.85);
        setImageBase64(compressedDataUrl);
        setImageMimeType(file.type);
      };
      img.onerror = () => {
        setErrorMessage("Could not read this image file. Please try another photo.");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setErrorMessage(
        "Voice transcription is not supported in this browser. Please type your description below."
      );
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    if (!isRecording) {
      setErrorMessage(null);
      recognition.start();
      setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => {
        setIsRecording(false);
        setErrorMessage("Microphone permission denied or speech not recognized.");
      };
      recognition.onend = () => setIsRecording(false);
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const shareBrowserLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice("Browser location sharing is not supported. Please type your location manually.");
      return;
    }

    setGpsNotice("Requesting browser permission for location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setGpsCoords(coords);
        setGpsNotice(null);
        onGpsChange(true);
      },
      () => {
        setGpsCoords(null);
        setGpsNotice(
          "Location permission was declined or unavailable. Please type your landmark or address manually below."
        );
        onGpsChange(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageBase64) {
      setErrorMessage("Please describe what is happening or attach a photo before analyzing.");
      return;
    }
    setErrorMessage(null);
    onAnalyze({
      text: inputText,
      imageBase64,
      imageMimeType,
      gpsCoords,
      manualLocation: manualLocation.trim()
    });
  };

  return (
    <div className="bg-[#090d16]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Describe the Situation
            </h2>
            <p className="text-xs text-slate-400">
              Type in English, Hindi, or Hinglish, use voice, or attach a photo
            </p>
          </div>
          {(inputText || imageBase64 || manualLocation || gpsCoords) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-300 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Fictional Test Scenarios */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300">
              Judge Demo Scenarios (Fictional Test Cases):
            </span>
            <span className="text-[10px] font-mono text-cyan-400">LIVE GEMINI API</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {PRESET_SCENARIOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-left px-3 py-2 rounded-xl border transition cursor-pointer flex items-center justify-between ${p.badgeColor}`}
              >
                <div>
                  <div className="text-xs font-bold">{p.title}</div>
                  <div className="text-[10px] opacity-80">{p.subtitle}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30">
                  Load
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Free-form Text Input */}
          <div>
            <label htmlFor="incident-text" className="block text-xs font-medium text-slate-300 mb-1">
              What is happening? (Review before analyzing)
            </label>
            <div className="relative">
              <textarea
                id="incident-text"
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example: Apartment ke basement mein paani bhar gaya hai aur electric meter se sparks aa rahe hain..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
              />

              {/* Voice & Location Buttons */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer ${
                    isRecording
                      ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                      : "bg-slate-900 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                  title="Optional voice transcription"
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? "Listening..." : "Voice"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Manual Location + Optional Browser Location */}
          <div className="space-y-1.5">
            <label htmlFor="manual-location" className="block text-xs font-medium text-slate-300">
              Location or Landmark (Optional)
            </label>
            <div className="flex gap-2">
              <input
                id="manual-location"
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="Type street, building, floor, or highway landmark..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={shareBrowserLocation}
                className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  gpsCoords
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{gpsCoords ? "Location Shared" : "Share My Location"}</span>
              </button>
            </div>

            {gpsCoords && (
              <div className="text-[11px] font-mono text-cyan-300 flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                <span>📍 Browser GPS: {gpsCoords}</span>
                <button
                  type="button"
                  onClick={() => {
                    setGpsCoords(null);
                    onGpsChange(false);
                  }}
                  className="text-slate-400 hover:text-white underline text-[10px]"
                >
                  Remove
                </button>
              </div>
            )}

            {gpsNotice && (
              <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-1.5">
                {gpsNotice}
              </div>
            )}
          </div>

          {/* Photo Attachment */}
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
              <div className="relative rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-2.5 flex items-center space-x-3">
                <img
                  src={imageBase64}
                  alt="Uploaded scene preview"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    Photo Ready for Review
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Note: AI image interpretation may contain uncertainty.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageBase64(null);
                    setImageMimeType(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 text-center cursor-pointer bg-slate-950/40 hover:bg-cyan-950/10 transition group"
              >
                <div className="flex items-center justify-center space-x-2 text-slate-300 group-hover:text-cyan-300">
                  <UploadCloud className="w-4 h-4" />
                  <span className="text-xs font-medium">Attach Photo (Optional)</span>
                </div>
              </button>
            )}
          </div>

          {/* Honest Error / Validation Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200"
            >
              {errorMessage}
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide uppercase shadow-xl shadow-cyan-500/15 border border-cyan-300/40 transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Analyzing with Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Analyze with Gemini</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Persistent Emergency First Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <span>In immediate danger? Do not wait for AI analysis.</span>
        <a
          href="tel:112"
          className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-bold shrink-0"
        >
          <PhoneCall className="w-3 h-3" />
          <span>Call 112 Now</span>
        </a>
      </div>
    </div>
  );
}
