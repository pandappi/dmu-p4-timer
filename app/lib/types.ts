export type Round = 1 | 2 | 3 | 4 | 5;

export type DebuffName =
  | "Forked Lightning"
  | "Compressed Water"
  | "Cursed Shriek"
  | "Acceleration Bomb"
  | "Entropy"
  | "Dynamic Fluid"
  | "Black Wound"
  | "White Wound"
  | "Allagan Field"
  | "Beyond Death";

export type TruthState = "truth" | "lie";

export type DebuffEntry = {
  id: string;
  round: Round;
  debuff: DebuffName;
  duration: number | null;
  appliedAt: number;
  expiresAt: number | null;
  notify: boolean;
  source: "manual" | "auto";
  truthState: TruthState;
};

export type TimerLog = {
  id: string;
  message: string;
};

export type TimerSettings = {
  alertLeadSeconds: number;
  displayMode: "icon-label" | "icon-only";
  registrationMode: "confirm" | "instant";
  alertSound: "beep" | "tts";
  durationMode: "panel" | "split-select" | "split-grid";
  theme: "dark" | "light";
  nameLanguage: "ko" | "en";
};

export type TimerState = {
  startedAt: number | null;
  entries: DebuffEntry[];
  selectedRound: Round;
  alertReady: boolean;
  firedAlerts: Record<string, true>;
  logs: TimerLog[];
  settings: TimerSettings;
};
