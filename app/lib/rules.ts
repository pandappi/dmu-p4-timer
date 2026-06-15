import { debuffsByRound } from "./constants";
import type { DebuffName, Round } from "./types";

export function getDuration(
  round: Round,
  debuff: DebuffName,
  selectedDuration?: number,
) {
  if (round === 1) {
    if (debuff === "Cursed Shriek") return 60;
    return selectedDuration ?? null;
  }

  if (round === 2) {
    if (debuff === "Entropy") return 60;
    if (debuff === "Dynamic Fluid") return 84;
  }

  if (round === 3) {
    if (debuff === "Cursed Shriek") return 69;
    return selectedDuration ?? null;
  }

  if (round === 4) {
    if (debuff === "Entropy") return 45;
    if (debuff === "Dynamic Fluid") return 69;
  }

  if (round === 5) {
    if (debuff === "Allagan Field" || debuff === "Beyond Death") return 15;
    return null;
  }

  return null;
}

export function inferRound3Duration(round1Duration: number) {
  if (round1Duration === 51) return 61;
  if (round1Duration === 76) return 36;
  return null;
}

export function inferRound4(round2Debuff: DebuffName) {
  if (round2Debuff === "Entropy") {
    return { debuff: "Dynamic Fluid" as const, duration: 69 };
  }

  if (round2Debuff === "Dynamic Fluid") {
    return { debuff: "Entropy" as const, duration: 45 };
  }

  return null;
}

export function getRound3Candidates(round1Debuff?: DebuffName) {
  if (
    round1Debuff === "Forked Lightning" ||
    round1Debuff === "Compressed Water"
  ) {
    return ["Acceleration Bomb", "Cursed Shriek"] satisfies DebuffName[];
  }

  if (
    round1Debuff === "Acceleration Bomb" ||
    round1Debuff === "Cursed Shriek"
  ) {
    return ["Forked Lightning", "Compressed Water"] satisfies DebuffName[];
  }

  return debuffsByRound[3];
}

export function getNextRound(round: Round): Round {
  return Math.min(5, round + 1) as Round;
}
