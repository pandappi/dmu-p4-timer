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
export type EntryKind = "input" | "timeline";
export type AssistMode = "personal" | "raid";
export type Language = "ko" | "en";

export type DebuffEntry = {
  id: string;
  kind: EntryKind;
  round: Round;
  debuff: DebuffName;
  duration: number | null;
  appliedAt: number;
  expiresAt: number | null;
  notify: boolean;
  source: "manual" | "auto";
  truthState: TruthState;
  timelineSeconds: number | null;
  actionText: string | null;
};

export type TimerLog = {
  id: string;
  message: string;
};

export type TimerSettings = {
  alertLeadSeconds: number;
  assistMode: AssistMode;
  language: Language;
  registrationMode: "confirm" | "instant";
  alertSound: "off" | "tts";
  ttsVolume: number;
  vibrationEnabled: boolean;
  theme: "dark" | "light";
  aoeLabelMode: "element" | "shape";
  partyChatCopy: boolean;
  partySoundCopy: boolean;
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
