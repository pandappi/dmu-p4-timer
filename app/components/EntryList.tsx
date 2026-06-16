import { memo } from "react";

import {
  actionDisplayText,
  debuffDisplayName,
  roundLabel,
  text,
  truthLabel,
} from "../lib/i18n";
import { debuffMeta } from "../lib/constants";
import type { DebuffEntry, Language } from "../lib/types";
import { formatClock, formatDurationLabel } from "../lib/utils";

type EntryListProps = {
  entries: DebuffEntry[];
  language: Language;
  now: number;
};

function EntryListImpl({ entries, language, now }: EntryListProps) {
  const inputEntries = entries.filter((entry) => entry.kind === "input");

  return (
    <section className="panel compact-list">
      <div className="panel-head">
        <h3>{text(language, "inputDone")}</h3>
        <span>{inputEntries.length}</span>
      </div>
      <div className="panel-body entry-list">
        {inputEntries.length === 0 ? (
          <p className="hint">{text(language, "noInput")}</p>
        ) : (
          inputEntries.map((entry) => {
            const remaining = entry.expiresAt
              ? (entry.expiresAt - now) / 1000
              : null;
            return (
              <div className="entry" key={entry.id}>
                <img
                  alt=""
                  className="entry-icon"
                  src={debuffMeta[entry.debuff].icon}
                />
                <div>
                  <strong>
                    {actionDisplayText(language, entry.actionText) ??
                      debuffDisplayName(language, entry.debuff)}
                  </strong>
                  <small>
                    {[
                      roundLabel(language, entry.round),
                      entry.round === 5
                        ? null
                        : truthLabel(language, entry.truthState),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </div>
                <div className={entry.notify ? "entry-time" : "entry-time off"}>
                  {remaining !== null
                    ? formatClock(remaining)
                    : entry.duration !== null
                      ? formatDurationLabel(entry.duration, language)
                      : text(language, "recorded")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export const EntryList = memo(EntryListImpl);
