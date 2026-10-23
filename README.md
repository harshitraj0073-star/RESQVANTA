# ResQvanta AI — Universal Emergency Information & Triage Assistant

> **From Human Panic to Informed Action.**  
> Built for **PromptWars 2026 × ALTA School of Technology** (Hack2Skill).  
> **Vertical:** Societal Benefit — Universal Bridge Between Human Intent and Complex Systems.  
> **Live Submission ID:** `6ad993efe245c1eabf8596d7`  
> **Repository:** [https://github.com/harshitraj0073-star/RESQVANTA](https://github.com/harshitraj0073-star/RESQVANTA)

---

## 🚨 The Problem & Societal Mission
During emergencies, accidents, and disasters (the critical "Golden Hour"), human panic sets in. Bystanders communicate in chaotic, multilingual, and emotionally charged fragments ("my friend is drowning", "गाड़ी पलट गई है", "गॅस गळती होत आहे", "શોર્ટ સર્કિટ થઈ છે"). Meanwhile, emergency responders and national dispatch centers (such as India's **112**, **108**, and fire/rescue services) require structured, verified incident parameters:
- *What is the acute hazard?*
- *Who is trapped or hurt?*
- *What critical facts are still missing?*
- *What immediate, life-preserving action must be taken in the next 60 seconds?*

**ResQvanta AI** serves as the universal bridge: transforming chaotic, multimodal human input into grounded, situation-specific immediate safety guidance, an epistemic verification matrix, and a one-click 112 emergency dispatch packet in under 2 seconds.

---

## 🌟 Key Innovations & Judge Highlights

### 1. Grounded Google Gemini Intelligence (Under 2.5s Latency)
- Powered by Google's latest **Gemini 3.5 Flash** (with resilient automatic fallback to **Gemini 3.5 Flash-Lite**) via the official `@google/genai` SDK.
- **Strictly Situation-Specific:** Every emergency generates customized, context-aware instructions (e.g. water rescue advice for drowning, circuit breaker cutoff for electrical sparks, firm wound pressure for arterial bleeding).
- **Epistemic Anti-Hallucination Matrix:** Explicitly separates *User-Reported Facts*, *AI Visual Inferences*, and *Critical Missing Information*.
- **Calibrated Non-Emergency Guardrail:** Minor daily problems (e.g., spilled coffee on a desk) are properly classified as `NON_EMERGENCY`, protecting emergency dispatch centers from false alarms while providing sensible cleanup advice.

### 2. 4-Language Native Indian Multilingual Engine
Complete end-to-end localization across both UI controls and Gemini AI reasoning:
- 🇮🇳 **English (India)** (`en-IN`)
- 🇮🇳 **Hindi / हिन्दी** (`hi-IN`)
- 🇮🇳 **Marathi / मराठी** (`mr-IN`)
- 🇮🇳 **Gujarati / ગુજરાતી** (`gu-IN`)
- **1-Click Dynamic Report Translation:** Translate active incident reports instantly into any selected language.

### 3. Solution-First Action Cards & Instant 112 Dispatch Bridge
- **Max 3 Immediate Actions:** Delivers bite-sized, high-contrast, numbered steps focused on immediate survival rather than overwhelming walls of text.
- **Critical Safety Warnings:** Prominently flags high-risk actions to avoid (e.g., *"Do not jump in water without life ring"*, *"Do not use water on electrical/grease fire"*).
- **One-Click Dispatch Packet:** Pre-formatted incident brief ready to copy or share via **WhatsApp**, **SMS**, or text download for immediate transmission to 112 / 108 / NDRF operators.

### 4. Interactive Re-Triage Loop
- Detects the single most critical missing detail (e.g., exact highway milestone, consciousness of victim) and prompts the user.
- Upon answering, ResQvanta dynamically updates the verification matrix and refines the response in real time.

### 5. Luxurious Dual Theme Modes & 3D Threat Core
- **Light Mode:** Ultra-luxurious, futuristic pearl-white & electric cyan palette with deep charcoal typography.
- **Dark Mode:** Cinematic deep-navy canvas with amber/cyan spatial lighting.
- **Interactive 3D WebGL Threat Core:** Procedural Fibonacci particle globe in Three.js (`@react-three/fiber`) that dynamically shifts color based on threat level:
  - `IDLE (Cyan)` → `SCANNING (Indigo)` → `CRITICAL (Red)` → `SAFE (Emerald)`.
- **2D Lite Mode:** 1-click low-battery toggle for power-saving during disaster scenarios.

### 6. Multimodal Ingestion Engine
- **Voice Transcription:** Speech-to-text via Web Speech API supporting English, Hindi, Marathi, and Gujarati.
- **Visual Evidence Upload:** Client-side compressed photo analysis directly through Gemini vision.
- **GPS Coordinates & Landmark Input:** One-tap browser geolocation lock with manual landmark fallbacks.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 |
| **AI Engine** | Google Gemini 3.5 Flash & 3.5 Flash-Lite via `@google/genai` |
| **Styling & UI** | Tailwind CSS v4, Glassmorphic Floating HUD, Lucide Icons |
| **3D Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Validation** | Zod Schema Validation & Structured Output Enforcement |
| **Localization** | 4-Language String Dictionary & Context-Engineered Prompting |
| **Testing** | Node.js Test Runner & TypeScript (`tsx`) |

---

## 🧪 Testing & Verification Guide for Judges

### Running the Test Suite
ResQvanta comes with an automated unit test suite verifying schema constraints, multilingual UI dictionaries, and 3-step action caps:
```bash
npm test
```

### Type Checking & Linting
Verify complete zero-error static analysis:
```bash
npm run lint
npm run build
```

### Try These Scenarios in the Web App
1. **Critical Water Rescue (English):**  
   *Input:* `"my friend is drowning what to do right now"`  
   *Result:* Immediate water rescue protocol (Reach, Throw, Row, Go; 112 dispatch; hypothermia/CPR guidance).
2. **Road Crash in Hindi (हिन्दी):**  
   *Input:* `"सड़क पर बाइक और ऑटो की टक्कर हो गई है, एक व्यक्ति बेहोश पड़ा है"`  
   *Result:* Hindi response with 112 call priority, safe traffic diversion, and warning not to move the unconscious victim.
3. **LPG Gas Leak in Marathi (मराठी):**  
   *Input:* `"माझ्या स्वयंपाकघरात एलपीजी गॅस सिलेंडरमधून वास येतोय आणि शिटी वाजतेय"`  
   *Result:* Marathi response advising regulator cutoff, open ventilation, emergency call to 1906, and warning not to touch electrical switches.
4. **Electrical Short Circuit in Gujarati (ગુજરાતી):**  
   *Input:* `"ઘરના મીટર બોર્ડમાં શોર્ટ સર્કિટ થઈ છે અને તણખા નીકળી રહ્યા છે"`  
   *Result:* Gujarati response advising main switch cutoff, safe distance, and warning against using water on live sparks.
5. **Calibrated Non-Emergency:**  
   *Input:* `"I spilled coffee on my keyboard and desk"`  
   *Result:* Correctly classified as `NON_EMERGENCY`; provides practical drying instructions without triggering false 112 calls.

---

## 🚀 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshitraj0073-star/RESQVANTA.git
   cd RESQVANTA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create `.env.local`:
   ```bash
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Author & Submission Details
- **Developer:** Harshit Raj
- **Institution:** Ajeenkya DY Patil University (ADYPU), Pune
- **Event:** PromptWars × ALTA School of Technology (Hack2Skill)
- **Submission ID:** `6ad993efe245c1eabf8596d7`
- **GitHub:** [@harshitraj0073-star](https://github.com/harshitraj0073-star)
