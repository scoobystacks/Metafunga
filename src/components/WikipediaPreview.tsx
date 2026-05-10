import { useEffect, useState } from "react";

interface Props {
  title: string;
}

// Module-level cache so repeated reveals don't re-fetch
const cache = new Map<string, string>();

export function WikipediaPreview({ title }: Props) {
  const [extract, setExtract] = useState<string | null>(cache.get(title) ?? null);
  const [loading, setLoading] = useState(!cache.has(title));

  useEffect(() => {
    if (cache.has(title)) {
      setExtract(cache.get(title)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    const encoded = encodeURIComponent(title.replace(/ /g, "_"));
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
      .then((r) => r.json())
      .then((data) => {
        const text: string = data.extract ?? "";
        cache.set(title, text);
        setExtract(text);
      })
      .catch(() => {
        cache.set(title, "");
        setExtract("");
      })
      .finally(() => setLoading(false));
  }, [title]);

  if (loading) {
    return (
      <div className="text-xs text-spore-400 italic animate-pulse py-1">
        Loading…
      </div>
    );
  }

  if (!extract) return null;

  // Show only first sentence or first 300 chars
  const firstSentence = extract.split(/(?<=[.!?])\s/)[0] ?? extract;
  const display = firstSentence.length > 320 ? firstSentence.slice(0, 317) + "…" : firstSentence;

  return (
    <p className="text-xs text-spore-600 italic leading-relaxed bg-spore-50 rounded-lg p-2 border border-spore-100">
      {display}
    </p>
  );
}
