"use client";

import { useMemo, useState } from "react";

import { aoeLabelText, text, truthLabel } from "../lib/i18n";
import type { Language, TimerSettings, TruthState } from "../lib/types";

type AoeKey = "lightning" | "ice";
type AoeValue = TruthState | null;
type AoePair = [AoeValue, AoeValue];

function xorPair([first, second]: AoePair) {
  if (!first || !second) return null;
  return first !== second;
}

function TruthButton({
  active,
  label,
  onClick,
  value,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  value: TruthState;
}) {
  return (
    <button
      className={`mini-truth ${value} ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function AoeGuide({
  labelMode,
  language,
}: {
  labelMode: TimerSettings["aoeLabelMode"];
  language: Language;
}) {
  const [values, setValues] = useState<Record<AoeKey, AoePair>>({
    lightning: [null, null],
    ice: [null, null],
  });
  const hasMissing = (Object.keys(values) as AoeKey[]).some((key) =>
    values[key].some((value) => value === null),
  );

  const guideText = useMemo(() => {
    if (hasMissing) return text(language, "waiting");

    const targets = (Object.keys(values) as AoeKey[]).filter(
      (key) => xorPair(values[key]) === true,
    );

    if (targets.length === 0) return text(language, "dodgeBoth");
    if (targets.length === 2) return text(language, "takeBoth");
    const label = aoeLabelText(language, labelMode, targets[0]);
    return language === "ko" ? `${label}만 밟기` : `Soak ${label} only`;
  }, [hasMissing, labelMode, language, values]);

  const updateValue = (key: AoeKey, index: 0 | 1, value: TruthState) => {
    setValues((current) => {
      const nextPair: AoePair = [...current[key]] as AoePair;
      nextPair[index] = value;
      return { ...current, [key]: nextPair };
    });
  };

  return (
    <section className="panel aoe-panel">
      <div className="panel-head">
        <h3>{text(language, "aoeMemory")}</h3>
        <strong className={hasMissing ? "pending" : "ready"}>{guideText}</strong>
      </div>
      <div className="panel-body aoe-body">
        {(Object.keys(values) as AoeKey[]).map((key) => (
          <div className="aoe-row" key={key}>
            <strong>{aoeLabelText(language, labelMode, key)}</strong>
            {[0, 1].map((index) => (
              <div className="mini-truth-group" key={index}>
                <TruthButton
                  active={values[key][index] === "truth"}
                  label={truthLabel(language, "truth")}
                  onClick={() => updateValue(key, index as 0 | 1, "truth")}
                  value="truth"
                />
                <TruthButton
                  active={values[key][index] === "lie"}
                  label={truthLabel(language, "lie")}
                  onClick={() => updateValue(key, index as 0 | 1, "lie")}
                  value="lie"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
