import type {
  DebuffName,
  Round,
  TimerSettings,
  TimerState,
  TruthState,
} from "./types";

export const STORAGE_KEY = "dmu-p4-timer-state-v3";

export const defaultSettings: TimerSettings = {
  alertLeadSeconds: 5,
  displayMode: "icon-only",
  registrationMode: "instant",
  alertSound: "tts",
  durationMode: "panel",
  theme: "dark",
  nameLanguage: "ko",
};

export const roundLabels: Record<Round, string> = {
  1: "1차",
  2: "2차",
  3: "3차",
  4: "4차",
  5: "5차",
};

export const debuffsByRound: Record<Exclude<Round, 5>, DebuffName[]> = {
  1: [
    "Forked Lightning",
    "Compressed Water",
    "Cursed Shriek",
    "Acceleration Bomb",
  ],
  2: ["Entropy", "Dynamic Fluid"],
  3: [
    "Forked Lightning",
    "Compressed Water",
    "Cursed Shriek",
    "Acceleration Bomb",
  ],
  4: ["Entropy", "Dynamic Fluid"],
};

export const woundDebuffs = ["Black Wound", "White Wound"] as const;
export const finalDebuffs = ["Allagan Field", "Beyond Death"] as const;

export type WoundDebuff = (typeof woundDebuffs)[number];
export type FinalDebuff = (typeof finalDebuffs)[number];

export const truthLabels: Record<TruthState, string> = {
  truth: "진실",
  lie: "거짓",
};

export const debuffMeta: Record<
  DebuffName,
  { short: string; color: string; icon: string }
> = {
  "Forked Lightning": {
    short: "Lightning",
    color: "#facc15",
    icon: "/debuffs/forked-lightning.png",
  },
  "Compressed Water": {
    short: "Water",
    color: "#38bdf8",
    icon: "/debuffs/compressed-water.png",
  },
  "Cursed Shriek": {
    short: "Shriek",
    color: "#f97316",
    icon: "/debuffs/cursed-shriek.png",
  },
  "Acceleration Bomb": {
    short: "Bomb",
    color: "#fb7185",
    icon: "/debuffs/acceleration-bomb.png",
  },
  Entropy: {
    short: "Entropy",
    color: "#ef4444",
    icon: "/debuffs/entropy.png",
  },
  "Dynamic Fluid": {
    short: "Fluid",
    color: "#2dd4bf",
    icon: "/debuffs/dynamic-fluid.png",
  },
  "Black Wound": {
    short: "Black",
    color: "#60a5fa",
    icon: "/debuffs/black-wound.png",
  },
  "White Wound": {
    short: "White",
    color: "#f9a8d4",
    icon: "/debuffs/white-wound.png",
  },
  "Allagan Field": {
    short: "Field",
    color: "#facc15",
    icon: "/debuffs/allagan-field.png",
  },
  "Beyond Death": {
    short: "Death",
    color: "#c084fc",
    icon: "/debuffs/beyond-death.png",
  },
};

export const initialState: TimerState = {
  startedAt: null,
  entries: [],
  selectedRound: 1,
  alertReady: false,
  firedAlerts: {},
  logs: [],
  settings: defaultSettings,
};
