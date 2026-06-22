import {
  debuffKorean,
  getWaveTimingLabel,
} from "./actions";
import { roundLabels, truthLabels } from "./constants";
import type { DebuffName, Language, Round, TruthState } from "./types";

type TextKey =
  | "settings"
  | "reset"
  | "select"
  | "debuff"
  | "truthChoice"
  | "register"
  | "auto"
  | "none"
  | "notTarget"
  | "inputDone"
  | "noInput"
  | "recorded"
  | "timeline"
  | "aoeMemory"
  | "waiting"
  | "dodgeBoth"
  | "takeBoth"
  | "partyCall"
  | "copyPartyCall"
  | "personalMechanic"
  | "noSummary"
  | "copied"
  | "useMode"
  | "personalMode"
  | "partyMode"
  | "personalModeHelp"
  | "partyModeHelp"
  | "partyCallCopyOptions"
  | "partyChatCopy"
  | "addSound"
  | "registrationMode"
  | "instant"
  | "confirmButton"
  | "instantHelp"
  | "theme"
  | "dark"
  | "light"
  | "soundAlert"
  | "tts"
  | "off"
  | "soundHelp"
  | "ttsVolume"
  | "vibration"
  | "on"
  | "aoeLabel"
  | "elementLabels"
  | "shapeLabels"
  | "fifthDebuffSkip"
  | "skip"
  | "doNotSkip"
  | "fifthDebuffSkipHelp"
  | "round2TruthPreselect"
  | "round2TruthPreselectHelp"
  | "round2TruthPreselectPrompt"
  | "inputAlertBuffer"
  | "inputAlertHelp"
  | "round5FalseCheck"
  | "timelineFalseCheck"
  | "testAlert"
  | "alertTestHelp"
  | "contact"
  | "eyeCommon"
  | "round3WaveAuto"
  | "round3BombAuto"
  | "round3NeedRound1"
  | "round5Same"
  | "completeHint"
  | "round1WaveDuration"
  | "raidBombChoice"
  | "assignmentDuration"
  | "round3RaidBombDuration"
  | "round3AssignmentDuration"
  | "round4AutoDuration";

const TEXT: Record<Language, Record<TextKey, string>> = {
  ko: {
    settings: "설정",
    reset: "초기화",
    select: "선택",
    debuff: "디버프",
    truthChoice: "진실 거짓 선택",
    register: "등록",
    auto: "자동",
    none: "없음",
    notTarget: "미대상",
    inputDone: "입력됨",
    noInput: "아직 입력된 조건이 없습니다.",
    recorded: "기록",
    timeline: "처리 순서",
    aoeMemory: "장판 기억",
    waiting: "입력 대기중...",
    dodgeBoth: "둘다 안밟기",
    takeBoth: "둘다 밟기",
    partyCall: "파티콜 요약",
    copyPartyCall: "파티콜 요약 복사",
    personalMechanic: "개인기믹",
    noSummary: "요약할 처리법이 없습니다.",
    copied: "복사됨",
    useMode: "사용 모드",
    personalMode: "개인모드",
    partyMode: "파티모드",
    personalModeHelp: "개인에게 부여된 디버프 타임라인만 확인합니다.",
    partyModeHelp:
      "파티 전체 디버프 타임라인을 확인합니다. 1차 물/번개 시간은 필수로 확인하고, 가속도폭탄은 개인마다 처리법이 달라 파티콜에 섞지 않는 편이 안전합니다.",
    partyCallCopyOptions: "파티콜 요약 복사 옵션",
    partyChatCopy: "파티말로 복사",
    addSound: "소리 넣기",
    registrationMode: "등록 방식",
    instant: "선택 즉시",
    confirmButton: "등록 버튼",
    instantHelp: "선택 즉시는 필요한 입력이 모두 정해지는 순간 다음 차수로 넘어갑니다.",
    theme: "테마",
    dark: "다크",
    light: "라이트",
    soundAlert: "소리 알림",
    tts: "TTS",
    off: "끄기",
    soundHelp:
      "TTS는 처리 시점에 처리법(예: “산개”)을 읽어줍니다. 알림 테스트를 누르지 않아도 먼저 재생을 시도합니다.",
    ttsVolume: "TTS 음량",
    vibration: "진동",
    on: "켜기",
    aoeLabel: "장판 표기",
    elementLabels: "번개/얼음",
    shapeLabels: "직선/부채꼴",
    fifthDebuffSkip: "5차 디버프 입력 스킵",
    skip: "스킵",
    doNotSkip: "스킵 안함",
    fifthDebuffSkipHelp:
      "5차 디버프 정보를 입력하지 않고 4차 디버프 입력 직후 타이머를 시작합니다. 5차 디버프 처리는 직접 확인해야 합니다. 4차 디버프 정보는 실제 부여 시간보다 빠르게 입력할 수 있으니, 입력/알림 여유 시간을 짧게 잡아 테스트하며 맞춰보세요.",
    round2TruthPreselect: "2차 진실/거짓 미리 선택",
    round2TruthPreselectHelp:
      "1차 입력 중 2차 진실/거짓을 미리 선택해두면, 2차 입력 화면에 자동으로 채워집니다. 미리 선택하지 않아도 1차 입력은 그대로 진행됩니다.",
    round2TruthPreselectPrompt: "2차 진실/거짓 미리 선택",
    inputAlertBuffer: "입력/알림 여유 시간",
    inputAlertHelp:
      "인게임 디버프 확인 후 어시스트에 입력하기까지 걸리는 시간과 미리 알려줄 시간을 합한 값입니다. 시점 영상을 보며 자신에게 맞게 -10~15초 사이로 조정해보세요.",
    round5FalseCheck: "5차 디버프 부여 후 무의 범람(파랑/보라)의 거짓 여부도 확인해야 합니다.",
    timelineFalseCheck: "무의 범람(파랑/보라) 거짓 여부 확인 필요",
    testAlert: "알림 테스트",
    alertTestHelp:
      "소리가 나지 않으면 브라우저가 자동 재생을 막은 상태일 수 있습니다. 설정에서 알림 테스트를 한 번 눌러 TTS 재생을 확인해주세요.",
    contact: "문의",
    eyeCommon: "마안 대상자는 공통 처리입니다. 징 여부만 확인하세요.",
    round3WaveAuto: "물/번개 시간은 1차 입력 시간으로 자동 결정됩니다.",
    round3BombAuto: "1차 물/번개 대상자는 3차 가속도폭탄 대상자입니다.",
    round3NeedRound1: "1차 입력을 먼저 완료하면 3차 입력 방식이 결정됩니다.",
    round5Same: "5차 디버프는 진실/거짓과 관계없이 같은 방식으로 처리합니다.",
    completeHint: "선택이 완료되면 다음 차수로 넘어갑니다.",
    round1WaveDuration: "물 번개 부여 당시 지속시간 선택",
    raidBombChoice: "리딩자 가속도폭탄 선택",
    assignmentDuration: "부여 당시 지속시간 선택",
    round3RaidBombDuration: "3차 리딩자 가속도폭탄 지속시간 선택",
    round3AssignmentDuration: "3차 부여 당시 지속시간 선택",
    round4AutoDuration: "자동 결정 시간",
  },
  en: {
    settings: "Settings",
    reset: "Reset",
    select: "Select",
    debuff: "Debuffs",
    truthChoice: "True False selection",
    register: "Register",
    auto: "Auto",
    none: "None",
    notTarget: "N/A",
    inputDone: "Inputs",
    noInput: "No inputs yet.",
    recorded: "Saved",
    timeline: "Timeline",
    aoeMemory: "AOE Memory",
    waiting: "Waiting for input...",
    dodgeBoth: "Dodge both",
    takeBoth: "Soak both",
    partyCall: "Party Call",
    copyPartyCall: "Copy party call",
    personalMechanic: "Personal",
    noSummary: "No call to summarize.",
    copied: "Copied",
    useMode: "Use Mode",
    personalMode: "Personal Mode",
    partyMode: "Party Mode",
    personalModeHelp: "Shows only the debuff timeline assigned to you.",
    partyModeHelp:
      "Shows the full party debuff timeline. Confirm the Round 1 Water/Lightning timer. Acceleration Bomb is personal, so keep it out of the party call to avoid confusion.",
    partyCallCopyOptions: "Party Call Copy Options",
    partyChatCopy: "Copy as /p",
    addSound: "Add sound",
    registrationMode: "Input Mode",
    instant: "Instant",
    confirmButton: "Confirm Button",
    instantHelp: "Instant mode advances as soon as the required inputs are complete.",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    soundAlert: "Sound Alert",
    tts: "TTS",
    off: "Off",
    soundHelp:
      "TTS reads the mechanic call, such as “Spread”, when it is time to resolve. It tries to play even before Test Alert is pressed.",
    ttsVolume: "TTS Volume",
    vibration: "Vibration",
    on: "On",
    aoeLabel: "AOE Labels",
    elementLabels: "Lightning/Ice",
    shapeLabels: "Line/Cone",
    fifthDebuffSkip: "Skip Round 5 Debuff Input",
    skip: "Skip",
    doNotSkip: "Do not skip",
    fifthDebuffSkipHelp:
      "Starts the timer right after Round 4 input without entering Round 5 debuff info. Handle the Round 5 debuff yourself. Round 4 can be entered before the actual debuff appears, so test with a shorter Input/Alert Buffer and tune it to your POV.",
    round2TruthPreselect: "Preselect Round 2 True/False",
    round2TruthPreselectHelp:
      "While entering Round 1, you can preselect Round 2 True/False. It will be filled automatically on the Round 2 input screen. Round 1 can still advance without it.",
    round2TruthPreselectPrompt: "Preselect Round 2 True/False",
    inputAlertBuffer: "Input/Alert Buffer",
    inputAlertHelp:
      "Use the combined seconds for reading your in-game debuff, entering it here, and how early you want the assist to call it. Tune -10 to 15s while reviewing POV footage.",
    round5FalseCheck: "After Round 5 debuffs are assigned, also check whether Flood of Naught (blue/purple) is False.",
    timelineFalseCheck: "Check Flood of Naught (blue/purple) false state",
    testAlert: "Test Alert",
    alertTestHelp:
      "If TTS does not play, the browser may be blocking autoplay. Open Settings and press Test Alert once to unlock speech playback.",
    contact: "Contact",
    eyeCommon: "Gaze is handled by the shared rule. Check only whether you have the marker.",
    round3WaveAuto: "Water/Lightning timing is auto-decided from the Round 1 timer.",
    round3BombAuto: "Round 1 Water/Lightning targets become Round 3 Acceleration Bomb targets.",
    round3NeedRound1: "Complete Round 1 first to decide the Round 3 input.",
    round5Same: "Round 5 resolves the same way regardless of True/False.",
    completeHint: "Advances when the selection is complete.",
    round1WaveDuration: "Select Water/Lightning assignment timer",
    raidBombChoice: "Leader Acceleration Bomb",
    assignmentDuration: "Select assignment timer",
    round3RaidBombDuration: "Select Round 3 leader Acceleration Bomb timer",
    round3AssignmentDuration: "Select Round 3 assignment timer",
    round4AutoDuration: "Auto-decided timer",
  },
};

const ACTION_TEXT_EN: Record<string, string> = {
  "쉐어": "Stack",
  "산개": "Spread",
  "멈추기": "Stop",
  "움직이기": "Move",
  "뒤돌기": "Look away",
  "마안보기": "Face gaze",
  "도넛장판": "Donut",
  "원형장판피하기": "Out",
  "파랑": "Blue",
  "보라": "Purple",
  "파랑 맞기": "Blue side",
  "보라 맞기": "Purple side",
  "물-쉐어 번개-산개": "Water stack Lightning spread",
  "물-산개 번개-쉐어": "Water spread Lightning stack",
};

export function text(language: Language, key: TextKey) {
  return TEXT[language][key];
}

export function roundLabel(language: Language, round: Round) {
  return language === "ko" ? roundLabels[round] : `Round ${round}`;
}

export function truthLabel(language: Language, truthState: TruthState) {
  return language === "ko"
    ? truthLabels[truthState]
    : truthState === "truth"
      ? "True"
      : "False";
}

export function debuffDisplayName(language: Language, debuff: DebuffName) {
  return language === "ko" ? debuffKorean[debuff] : debuff;
}

export function actionDisplayText(language: Language, action: string | null) {
  if (!action) return null;
  return language === "ko" ? action : (ACTION_TEXT_EN[action] ?? action);
}

export function copyCallText(language: Language, action: string) {
  const display = actionDisplayText(language, action) ?? action;
  if (language === "ko") {
    return display
      .replaceAll("-", "")
      .replace("파랑 맞기", "파랑맞기")
      .replace("보라 맞기", "보라맞기");
  }
  return display;
}

export function waveTimingLabel(language: Language, seconds: number | null) {
  const label = getWaveTimingLabel(seconds);
  if (language === "ko") return label;
  if (label === "빠른") return "Fast";
  if (label === "느린") return "Slow";
  return "TBD";
}

export function aoeLabelText(
  language: Language,
  labelMode: "element" | "shape",
  key: "lightning" | "ice",
) {
  if (labelMode === "element") {
    if (language === "ko") return key === "lightning" ? "번개" : "얼음";
    return key === "lightning" ? "Lightning" : "Ice";
  }
  if (language === "ko") return key === "lightning" ? "직선" : "부채꼴";
  return key === "lightning" ? "Line" : "Cone";
}
