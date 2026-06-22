type HighlightedActionTextProps = {
  fallback?: string;
  text: string | null;
};

function renderKoreanWaveAction(text: string) {
  const match = text.match(/^물(-?)(쉐어|산개) 번개(-?)(쉐어|산개)$/);
  if (!match) return null;

  const [, waterJoiner, waterAction, lightningJoiner, lightningAction] = match;

  return (
    <>
      물{waterJoiner}
      <span className="wave-action-effect water">{waterAction}</span> 번개
      {lightningJoiner}
      <span className="wave-action-effect lightning">{lightningAction}</span>
    </>
  );
}

function renderEnglishWaveAction(text: string) {
  const match = text.match(/^(Water) (stack|spread) (Lightning) (stack|spread)$/);
  if (!match) return null;

  const [, waterLabel, waterAction, lightningLabel, lightningAction] = match;

  return (
    <>
      {waterLabel}{" "}
      <span className="wave-action-effect water">{waterAction}</span>{" "}
      {lightningLabel}{" "}
      <span className="wave-action-effect lightning">{lightningAction}</span>
    </>
  );
}

export function HighlightedActionText({
  fallback = "—",
  text,
}: HighlightedActionTextProps) {
  if (!text) return <>{fallback}</>;

  return (
    <>
      {renderKoreanWaveAction(text) ?? renderEnglishWaveAction(text) ?? text}
    </>
  );
}
