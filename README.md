# ResQvanta AI — 3D Holographic Emergency Triage & Dispatch Bridge

> **From Human Panic to Verified Action.**  
> Built for **PromptWars 2026 × ALTA School of Technology** (Hack2Skill).  
> **Vertical:** Societal Benefit — Universal Bridge Between Human Intent and Complex Systems.

---

## 🚨 The Problem
During disasters and accidents (the "Golden Hour"), humans panic. Bystanders submit chaotic, multilingual (English, Hindi, Hinglish, Marathi) messages or blurry photos. Meanwhile, national dispatch centers (112 / 108 / NDRF) require structured, verified incident parameters: What is the hazard? Who is trapped? What critical facts are missing?

**ResQvanta AI** acts as the universal bridge: ingesting messy multimodal input and instantaneously outputting an epistemically honest triage card, interactive 3D spatial threat telemetry, and a one-click 112 dispatch packet.

---

## ⚡ Core Architecture & Highlights

1. **Epistemic Verification Matrix (Anti-Hallucination):**
   - Strictly separates **User Reported Facts**, **AI Visual Inferences**, and **Critical Missing Info**.
   - Includes an interactive **Re-Triage Loop** allowing users to supply missing parameters to raise the confidence score dynamically.
   - Built-in Non-Emergency guardrail (e.g. spilled coffee safely flagged as non-emergency).

2. **Zero-Lag 60FPS 3D Spatial Threat Core:**
   - Procedural WebGL Fibonacci particle globe & rotating telemetry rings in Three.js (`@react-three/fiber`).
   - Capped DPR (`1.5`), zero heavy 50MB 3D model downloads, zero GPU choke.
   - Dynamically shifts state: `IDLE (Cyan)` → `SCANNING (Indigo)` → `CRITICAL (Red)` → `SAFE (Emerald)`.
   - 1-Click **2D Lite Mode** toggle for emergency low-battery conservation.

3. **Multimodal Ingestion Engine:**
   - Multilingual text & Hinglish voice recognition via Web Speech API.
   - Client-side image compression & analysis via Google Gemini 2.5 Flash (`@google/genai`).
   - Device GPS coordinate lock.

4. **112 / 108 Rapid Action Suite:**
   - Standardized 1-click Dispatch Packet copyable directly to 112 operators.
   - Direct clickable `tel:112` and `tel:108` emergency triggers.

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Glassmorphic HUD Design System
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **AI Engine:** Google Gemini 2.5 Flash via `@google/genai` SDK
- **Icons & Telemetry:** Lucide Icons

---

## 🚀 Getting Started Locally

1. Clone repository:
   ```bash
   git clone https://github.com/harshitraj0073-star/RESQVANTA.git
   cd RESQVANTA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create `.env.local`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Author
**Harshit Raj**  
B.Tech Computer Science & Engineering, Ajeenkya DY Patil University (ADYPU), Pune  
GitHub: [@harshitraj0073-star](https://github.com/harshitraj0073-star)
