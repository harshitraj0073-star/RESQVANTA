export interface PresetScenario {
  id: string;
  title: string;
  category: string;
  badgeColor: string;
  text: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "flood-electric",
    title: "Flood + Sparking Meter",
    category: "Critical Hazard",
    badgeColor: "text-red-400 border-red-500/30 bg-red-500/10",
    text: "Water is entering our ground floor near Lohegaon main road after heavy rain, my grandfather cannot walk fast and the main electric meter box on the wall is sparking violently!"
  },
  {
    id: "highway-crash",
    title: "Highway Crash (Hinglish)",
    category: "Trauma / Traffic",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    text: "Pune Nagar highway pe bada accident hua hai near Viman Nagar chowk, bike aur truck ki takkar hui hai, 2 log road pe gire hai bleeding ho rahi hai aur traffic jam lag gaya hai, samajh nahi aa raha kya karu!"
  },
  {
    id: "coffee-spill",
    title: "Non-Emergency Test",
    category: "Guardrail Check",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    text: "I spilled cold coffee on my laptop notebook on my study desk and there is a small stain on the paper."
  }
];
