"use client";

import { useMemo, useState } from "react";

import type { TimerSettings, TruthState } from "../lib/types";

type AoeKey = "lightning" | "ice";
type AoeValue = TruthState | null;
type AoePair = [AoeValue, AoeValue];

const AOE_LABELS: Record<
  TimerSettings["aoeLabelMode"],
  Record<AoeKey, string>
> = {
  element: {
    lightning: "번개",
    ice: "얼음",
  },
  shape: {
    lightning: "직선",
    ice: "부채꼴",
  },
};

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
}: {
  labelMode: TimerSettings["aoeLabelMode"];
}) {
  const labels = AOE_LABELS[labelMode];
  const [values, setValues] = useState<Record<AoeKey, AoePair>>({
    lightning: [null, null],
    ice: [null, null],
  });

  const guideText = useMemo(() => {
    const hasMissing = (Object.keys(values) as AoeKey[]).some((key) =>
      values[key].some((value) => value === null),
    );

    if (hasMissing) return "4개 입력";

    const targets = (Object.keys(values) as AoeKey[]).filter(
      (key) => xorPair(values[key]) === true,
    );

    if (targets.length === 0) return "둘다 안밟기";
    if (targets.length === 2) return "둘다 밟기";
    return `${labels[targets[0]]}만 밟기`;
  }, [labels, values]);

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
        <h3>장판 기억</h3>
        <strong>{guideText}</strong>
      </div>
      <div className="panel-body aoe-body">
        {(Object.keys(values) as AoeKey[]).map((key) => (
          <div className="aoe-row" key={key}>
            <strong>{labels[key]}</strong>
            {[0, 1].map((index) => (
              <div className="mini-truth-group" key={index}>
                <TruthButton
                  active={values[key][index] === "truth"}
                  label="진실"
                  onClick={() => updateValue(key, index as 0 | 1, "truth")}
                  value="truth"
                />
                <TruthButton
                  active={values[key][index] === "lie"}
                  label="거짓"
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
