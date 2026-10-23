"use client";

import React, { useState, useRef, useEffect } from "react";
import { PRESET_SCENARIOS, PresetScenario } from "@/lib/presets";
import { SupportedLanguage, UIStrings } from "@/lib/translations";
import {
  UploadCloud,
  Mic,
  MicOff,
  MapPin,
  X,
  Sparkles,
  Loader2,
  Trash2,
  PhoneCall,
} from "lucide-react";
import { ShinyButton } from "@/components/ui/ShinyButton";

interface MinimalSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: { results?: Array<Array<{ transcript?: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeech {
  SpeechRecognition?: new () => MinimalSpeechRecognition;
  webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
}

type VoiceStatus =
  | "ready"
  | "requesting"
  | "listening"
  | "transcribed"
  | "denied"
  | "failed"
  | "unsupported";

interface InputConsoleProps {
  inputText: string;
  onInputTextChange: (val: string) => void;
  manualLocation: string;
  onManualLocationChange: (val: string) => void;
  imageBase64: string | null;
  imageMimeType: string | null;
  onImageChange: (base64: string | null, mime: string | null) => void;
  gpsCoords: string | null;
  onGpsCoordsChange: (coords: string | null) => void;
  onAnalyze: (payload: {
    text: string;
    imageBase64: string | null;
    imageMimeType: string | null;
    gpsCoords: string | null;
    manualLocation: string;
  }) => void;
  onCancelAnalysis: () => void;
  isLoading: boolean;
  isDraftModified: boolean;
  language: SupportedLanguage;
  theme: "light" | "dark";
  t: UIStrings;
}

export function InputConsole({
  inputText,
  onInputTextChange,
  manualLocation,
  onManualLocationChange,
  imageBase64,
  imageMimeType,
  onImageChange,
  gpsCoords,
  onGpsCoordsChange,
  onAnalyze,
  onCancelAnalysis,
  isLoading,
  isDraftModified,
  language,
  theme,
  t,
}: InputConsoleProps) {
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const DYNAMIC_PLACEHOLDERS = [
    t.inputPlaceholder,
    "E.g. 'Basement mein paani bhar gaya hai aur meter se sparks aa rahe hain...'",
    "E.g. 'Highway collision near divider, 2 passengers trapped inside vehicle...'",
    "E.g. 'Dense chemical haze and fire spreading from 2nd floor warehouse...'",
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);
  const isLight = theme === "light";

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % DYNAMIC_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [DYNAMIC_PLACEHOLDERS.length]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSelectPreset = (p: PresetScenario) => {
    onInputTextChange(p.text);
    if (p.defaultLocation) {
      onManualLocationChange(p.defaultLocation);
    }
    setErrorMessage(null);
  };

  const handleClearAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    onInputTextChange("");
    onManualLocationChange("");
    onImageChange(null, null);
    onGpsCoordsChange(null);
    setGpsNotice(null);
    setVoiceStatus("ready");
    setErrorMessage(null);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid JPEG, PNG, or WebP image.");
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
        onImageChange(compressedDataUrl, file.type);
      };
      img.onerror = () => {
        setErrorMessage("Could not process image file. Please try another photo.");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const win = window as unknown as WindowWithSpeech;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceStatus("unsupported");
      return;
    }

    if (voiceStatus === "listening" || voiceStatus === "requesting") {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setVoiceStatus("ready");
      return;
    }

    try {
      setErrorMessage(null);
      setVoiceStatus("requesting");

      const recognition = new SpeechRec();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onstart = () => {
        setVoiceStatus("listening");
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onInputTextChange(
            inputText.trim() ? `${inputText.trim()} ${transcript}` : transcript
          );
          setVoiceStatus("transcribed");
        } else {
          setVoiceStatus("failed");
        }
      };

      recognition.onerror = (event) => {
        const err = event?.error;
        if (err === "not-allowed" || err === "service-not-allowed") {
          setVoiceStatus("denied");
        } else if (err === "language-not-supported") {
          setVoiceStatus("unsupported");
        } else {
          setVoiceStatus("failed");
        }
      };

      recognition.onend = () => {
        setVoiceStatus((current) =>
          current === "listening" || current === "requesting"
            ? "ready"
            : current
        );
      };

      recognition.start();
    } catch {
      setVoiceStatus("failed");
    }
  };

  const shareBrowserLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice("Browser geolocation is not supported on this device.");
      return;
    }

    setGpsNotice("Requesting location permission...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        onGpsCoordsChange(coords);
        setGpsNotice(null);
      },
      () => {
        onGpsCoordsChange(null);
        setGpsNotice(
          "Location permission declined. Please type your landmark or address manually."
        );
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!inputText.trim() && !imageBase64) {
      setErrorMessage("Please enter a description or attach a photo first.");
      return;
    }
    setErrorMessage(null);
    onAnalyze({
      text: inputText.trim(),
      imageBase64,
      imageMimeType,
      gpsCoords,
      manualLocation: manualLocation.trim(),
    });
  };

  return (
    <section
      aria-label={t.inputHeading}
      className="rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-slate-900/40 dark:bg-[#080e1a]/60 border border-transparent hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] transition-all duration-300"
    >
      {/* Top Header & Clear Draft */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.inputHeading}</h2>
          <p
            className={`text-xs mt-0.5 ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            {t.inputSubheading}
          </p>
        </div>
        {(inputText || imageBase64 || manualLocation || gpsCoords) && (
          <ShinyButton
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>{t.clearBtn}</span>
          </ShinyButton>
        )}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="incident-text" className="text-xs font-bold">
              {t.whatHappenedLabel}
            </label>
            <span
              className={`text-[10px] font-mono font-semibold ${
                isLight ? "text-cyan-700" : "text-cyan-400"
              }`}
            >
              {language}
            </span>
          </div>

          <div className="relative">
            <textarea
              id="incident-text"
              rows={4}
              value={inputText}
              onChange={(e) => onInputTextChange(e.target.value)}
              placeholder={inputText ? "" : DYNAMIC_PLACEHOLDERS[placeholderIndex]}
              className={`w-full rounded-2xl p-4 pb-14 text-xs sm:text-sm leading-relaxed backdrop-blur-xl transition resize-none focus:outline-none border border-transparent ${
                isLight
                  ? "bg-slate-100/90 text-slate-950 placeholder-slate-400 focus:bg-white shadow-inner"
                  : "bg-slate-950/70 text-white placeholder-slate-500 focus:bg-slate-950/90 shadow-inner"
              }`}
            />

            {/* Voice Control Bar inside Textarea with 3D Ripple Feedback */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
              <div className="text-[11px] truncate">
                {voiceStatus === "listening" && (
                  <span className="text-red-500 font-bold animate-pulse">
                    ● {t.voiceListening} ({language})
                  </span>
                )}
                {voiceStatus === "transcribed" && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ {t.voiceTranscribed}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={toggleSpeechRecognition}
                aria-label={
                  voiceStatus === "listening" ? t.voiceStop : t.voiceReady
                }
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                  voiceStatus === "listening" || voiceStatus === "requesting"
                    ? "btn-3d-red text-white"
                    : "btn-3d-slate"
                }`}
              >
                {voiceStatus === "listening" && (
                  <span className="absolute -inset-1 rounded-full border-2 border-red-500/60 animate-ping pointer-events-none" />
                )}
                {voiceStatus === "listening" ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{t.voiceStop}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {voiceStatus === "requesting"
                        ? t.voiceRequesting
                        : t.voiceReady}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Notice if user modified the draft after a report was generated */}
          {isDraftModified && !isLoading && (
            <div className="text-xs font-medium text-amber-600 dark:text-amber-300 px-1">
              ● {t.draftModifiedNotice}
            </div>
          )}

          {/* Honest Voice Feedback */}
          {(voiceStatus === "denied" ||
            voiceStatus === "failed" ||
            voiceStatus === "unsupported") && (
            <div
              role="status"
              className={`text-xs px-3.5 py-2 rounded-2xl backdrop-blur-md ${
                isLight
                  ? "bg-amber-100/90 text-amber-950"
                  : "bg-amber-950/60 text-amber-200"
              }`}
            >
              {voiceStatus === "denied" && t.voicePermissionDenied}
              {voiceStatus === "failed" && t.voiceFailed}
              {voiceStatus === "unsupported" && t.voiceUnsupported}
            </div>
          )}
        </div>

        {/* Location Row */}
        <div className="space-y-1.5">
          <label htmlFor="manual-location" className="block text-xs font-bold">
            {t.locationLabel}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="manual-location"
              type="text"
              value={manualLocation}
              onChange={(e) => onManualLocationChange(e.target.value)}
              placeholder={t.locationPlaceholder}
              className={`flex-1 rounded-2xl px-3.5 py-2.5 text-xs backdrop-blur-md focus:outline-none border border-transparent ${
                isLight
                  ? "bg-slate-100/90 text-slate-950 placeholder-slate-500 shadow-inner"
                  : "bg-slate-950/70 text-white placeholder-slate-400 shadow-inner"
              }`}
            />
            <ShinyButton
              type="button"
              variant={gpsCoords ? "emerald" : "slate"}
              size="sm"
              onClick={shareBrowserLocation}
              className="rounded-2xl shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {gpsCoords ? t.locationSharedBtn : t.shareLocationBtn}
              </span>
            </ShinyButton>
          </div>

          {gpsCoords && (
            <div className="text-[11px] font-mono text-cyan-400 flex items-center justify-between px-2 py-0.5">
              <span>📍 GPS: {gpsCoords}</span>
              <button
                type="button"
                onClick={() => onGpsCoordsChange(null)}
                className="underline text-[10px] cursor-pointer hover:text-red-400"
              >
                {t.clearBtn}
              </button>
            </div>
          )}

          {gpsNotice && (
            <div className="text-[11px] text-amber-500 px-2 font-medium">
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
            <div
              className={`rounded-2xl p-2.5 flex items-center space-x-3 border border-transparent ${
                isLight ? "bg-white/80 shadow-md" : "bg-slate-900/80 shadow-md"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageBase64}
                alt="Uploaded scene preview"
                className="w-12 h-12 object-cover rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">
                  {t.photoReadyLabel}
                </div>
                <div
                  className={`text-[10px] ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {t.photoUncertaintyNote}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onImageChange(null, null)}
                aria-label="Remove photo"
                className="p-1.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <ShinyButton
              type="button"
              variant="slate"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>{t.attachPhotoBtn}</span>
            </ShinyButton>
          )}
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-lg"
          >
            {errorMessage}
          </div>
        )}

        {/* Submit / Cancel Buttons using 21st.dev ShinyButton */}
        <div className="flex items-center gap-2.5">
          <ShinyButton
            type="submit"
            disabled={isLoading}
            variant="cyan"
            size="lg"
            className="flex-1 w-full font-extrabold tracking-wider uppercase shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.analyzingBtn}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.analyzeBtn}</span>
              </>
            )}
          </ShinyButton>

          {isLoading && (
            <ShinyButton
              type="button"
              variant="red"
              size="lg"
              onClick={onCancelAnalysis}
              className="px-5 font-bold shrink-0"
            >
              {t.cancelAnalysisBtn}
            </ShinyButton>
          )}
        </div>
      </form>

      {/* 21st.dev Shiny Scenario Chips */}
      <div className="space-y-2 pt-1">
        <span
          className={`text-[11px] font-extrabold uppercase tracking-wider block ${
            isLight ? "text-slate-600" : "text-slate-400"
          }`}
        >
          {t.demoSectionTitle}
        </span>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_SCENARIOS.map((p) => {
            const loc = p.localized[language] || p.localized["en-IN"];
            const icon =
              p.id === "flood-electric"
                ? "🌊"
                : p.id === "highway-crash"
                ? "🚗"
                : "☕";
            const shortTitle = loc.title.includes(":")
              ? loc.title.split(":")[1].trim()
              : loc.title;
            return (
              <ShinyButton
                key={p.id}
                type="button"
                variant="slate"
                size="sm"
                onClick={() => handleSelectPreset(p)}
                className="rounded-full px-3.5 py-1.5"
              >
                <span>{icon}</span>
                <span className="font-semibold">{shortTitle}</span>
              </ShinyButton>
            );
          })}
        </div>
      </div>

      {/* Emergency First Direct Call Link */}
      <div className="pt-1 flex items-center justify-between gap-2 text-xs">
        <span className={isLight ? "text-slate-700" : "text-slate-300"}>
          {t.immediateDangerNote}
        </span>
        <ShinyButton
          variant="red"
          size="sm"
          href="tel:112"
          className="font-bold text-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>{t.call112}</span>
        </ShinyButton>
      </div>
    </section>
  );
}
