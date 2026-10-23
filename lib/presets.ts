import type { SupportedLanguage } from "./translations";

export interface PresetScenario {
  id: string;
  accentColor: string;
  text: string;
  defaultLocation?: string;
  localized: Record<
    SupportedLanguage,
    {
      title: string;
      subtitle: string;
      category: string;
    }
  >;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "flood-electric",
    accentColor: "text-red-600 dark:text-red-400",
    text: "Basement mein paani bhar gaya hai aur meter se sparks aa rahe hain. Ek elderly person andar ho sakta hai.",
    defaultLocation: "Pune Sector — Lower Ground Floor Basement",
    localized: {
      "en-IN": {
        title: "Scenario A: Flood & Electrical Danger",
        subtitle: "Hinglish + Unconfirmed Elderly Person",
        category: "Critical Hazard",
      },
      "hi-IN": {
        title: "परिदृश्य A: जलभराव और बिजली का खतरा",
        subtitle: "हिंग्लिश + बुजुर्ग व्यक्ति के होने की आशंका",
        category: "गंभीर खतरा",
      },
      "mr-IN": {
        title: "उदाहरण A: पूर आणि विजेचा धोका",
        subtitle: "हिंग्लिश + ज्येष्ठ व्यक्ती अडकल्याची शक्यता",
        category: "गंभीर धोका",
      },
      "gu-IN": {
        title: "દૃશ્ય A: પાણી ભરાવું અને વીજળીનું જોખમ",
        subtitle: "હિંગ્લિશ + વૃદ્ધ વ્યક્તિ અંદર હોવાની શક્યતા",
        category: "ગંભીર જોખમ",
      },
    },
  },
  {
    id: "highway-crash",
    accentColor: "text-amber-600 dark:text-amber-400",
    text: "A truck and car collided near the highway divider. Someone may be trapped, but I cannot see inside the vehicle.",
    defaultLocation: "Mumbai-Pune Expressway (KM 42 Divider)",
    localized: {
      "en-IN": {
        title: "Scenario B: Highway Accident",
        subtitle: "Divider Collision + Unknown Entrapment",
        category: "Road Incident",
      },
      "hi-IN": {
        title: "परिदृश्य B: हाईवे सड़क दुर्घटना",
        subtitle: "डिवाइडर के पास टक्कर + अज्ञात स्थिति",
        category: "सड़क दुर्घटना",
      },
      "mr-IN": {
        title: "उदाहरण B: महामार्ग अपघात",
        subtitle: "दुभाजकाजवळ धडक + अनिश्चित स्थिती",
        category: "रस्ता अपघात",
      },
      "gu-IN": {
        title: "દૃશ્ય B: હાઇવે અકસ્માત",
        subtitle: "ડિવાઇડર પાસે અથડામણ + અજ્ઞાત સ્થિતિ",
        category: "માર્ગ અકસ્માત",
      },
    },
  },
  {
    id: "coffee-spill",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    text: "I accidentally spilled coffee on my desk. Nobody is hurt and there is no fire.",
    defaultLocation: "Tech Park Workstation (Non-Emergency)",
    localized: {
      "en-IN": {
        title: "Scenario C: Coffee Spill (False Alarm)",
        subtitle: "Tests Non-Emergency Guardrail",
        category: "Ordinary Situation",
      },
      "hi-IN": {
        title: "परिदृश्य C: डेस्क पर कॉफ़ी गिरना (सामान्य)",
        subtitle: "गैर-आपातकालीन सुरक्षा जांच",
        category: "सामान्य स्थिति",
      },
      "mr-IN": {
        title: "उदाहरण C: डेस्कवर कॉफी सांडणे (सामान्य)",
        subtitle: "बिगर-आपत्कालीन चाचणी",
        category: "सामान्य स्थिती",
      },
      "gu-IN": {
        title: "દૃશ્ય C: ડેસ્ક પર કોફી ઢોળાવી (સામાન્ય)",
        subtitle: "બિન-કટોકટી ચકાસણી",
        category: "સામાન્ય પરિસ્થિતિ",
      },
    },
  },
];

export const DEMO_PRESETS = PRESET_SCENARIOS;
