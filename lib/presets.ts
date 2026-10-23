export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badgeColor: string;
  text: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "flood-electric",
    title: "Scenario A: Flood & Electrical Danger",
    subtitle: "Hinglish + Unconfirmed Entrapment",
    category: "Critical Hazard",
    badgeColor: "text-red-300 border-red-500/30 bg-red-500/10 hover:bg-red-500/20",
    text: "Apartment ke basement mein paani bhar gaya hai aur electric meter se sparks aa rahe hain. Ek elderly person andar ho sakta hai."
  },
  {
    id: "highway-crash",
    title: "Scenario B: Road Accident",
    subtitle: "Unknown Injuries + Divider Trap",
    category: "Road Incident",
    badgeColor: "text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20",
    text: "There has been a highway accident. One vehicle may be trapped near the divider. I have a photo but don't know whether anyone is injured."
  },
  {
    id: "coffee-spill",
    title: "Scenario C: Coffee Spill (False Alarm)",
    subtitle: "Tests Non-Emergency Guardrail",
    category: "False-Alarm Check",
    badgeColor: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
    text: "I spilled my coffee near my laptop. Nobody is hurt and there's no electrical fire."
  }
];

export const DEMO_PRESETS = PRESET_SCENARIOS;
