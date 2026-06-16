"use client";

import { Copy } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { getEntryActionText } from "../lib/actions";
import { copyCallText, text } from "../lib/i18n";
import type { DebuffEntry, Language } from "../lib/types";

type OneLineSummaryProps = {
  entries: DebuffEntry[];
  language: Language;
  partyChatCopy: boolean;
  partySoundCopy: boolean;
};

function OneLineSummaryImpl({
  entries,
  language,
  partyChatCopy,
  partySoundCopy,
}: OneLineSummaryProps) {
  const [copied, setCopied] = useState(false);

  const timelineEntries = useMemo(
    () =>
      entries
      .filter((entry) => entry.kind === "timeline")
      .filter((entry) => entry.notify && entry.expiresAt)
      .sort((a, b) => (a.expiresAt ?? 0) - (b.expiresAt ?? 0)),
    [entries],
  );

  const summary = useMemo(() => {
    return timelineEntries
      .filter((entry) => entry.round !== 5)
      .filter((entry) => entry.debuff !== "Acceleration Bomb")
      .map((entry) => getEntryActionText(entry, entries))
      .filter((action): action is string => Boolean(action))
      .map((action) => copyCallText(language, action))
      .join(" / ");
  }, [entries, language, timelineEntries]);

  const personalMechanics = useMemo(() => {
    const finalAction = timelineEntries
      .filter((entry) => entry.round === 5)
      .map((entry) => getEntryActionText(entry, entries))
      .find((action): action is string => Boolean(action));
    const bombAction = timelineEntries
      .filter((entry) => entry.debuff === "Acceleration Bomb")
      .map((entry) => getEntryActionText(entry, entries))
      .find((action): action is string => Boolean(action));

    return [finalAction, bombAction]
      .filter((action): action is string => Boolean(action))
      .map((action) => copyCallText(language, action))
      .join(" / ");
  }, [entries, language, timelineEntries]);

  const copyText = [
    partyChatCopy ? "/p " : "",
    summary,
    partySoundCopy ? " <se.1>" : "",
  ].join("");

  const handleCopy = async () => {
    if (!copyText) return;

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="panel one-line-panel">
      <div className="panel-head">
        <div className="one-line-title">
          <h3>{text(language, "partyCall")}</h3>
          <button
            aria-label={text(language, "copyPartyCall")}
            className="icon-button compact"
            disabled={!summary}
            onClick={handleCopy}
            type="button"
          >
            <Copy size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="personal-mechanics">
          <span>{text(language, "personalMechanic")}</span>
          <strong>{personalMechanics || text(language, "none")}</strong>
        </div>
      </div>
      <div className="panel-body one-line-body">
        <p className="one-line-text">
          {copyText || text(language, "noSummary")}
        </p>
        {copied ? (
          <span className="copy-feedback">{text(language, "copied")}</span>
        ) : null}
      </div>
    </section>
  );
}

export const OneLineSummary = memo(OneLineSummaryImpl);
