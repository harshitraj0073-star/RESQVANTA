export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  accentColor: string;
  text: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "flood-electric",
    title: "Scenario A: Flood & Electrical Danger",
    subtitle: "Hinglish + Unconfirmed Elderly Person",
    category: "Critical Hazard",
    accentColor: "text-red-500 dark:text-red-400",
    text: "Basement mein paani bhar gaya hai aur meter se sparks aa rahe hain. Ek elderly person andar ho sakta hai."
  },
  {
    id: "highway-crash",
    title: "Scenario B: Highway Accident",
    subtitle: "Divider Collision + Unknown Entrapment",
    category: "Road Incident",
    accentColor: "text-amber-600 dark:text-amber-400",
    text: "A truck and car collided near the highway divider. Someone may be trapped, but I cannot see inside the vehicle."
  },
  {
    id: "coffee-spill",
    title: "Scenario C: Coffee Spill (False Alarm)",
    subtitle: "Tests Non-Emergency Guardrail",
    category: "False-Alarm Check",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    text: "I accidentally spilled coffee on my desk. Nobody is hurt and there is no fire."
  }
];

export const DEMO_PRESETS = PRESET_SCENARIOS;
