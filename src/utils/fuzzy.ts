import type { Fungus } from "../types";

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

function matchesQuery(query: string, candidate: string, maxDist: number): boolean {
  const q = query.toLowerCase();
  const c = candidate.toLowerCase();
  if (c.includes(q)) return true;
  if (q.length < 4) return false;
  // Check each word in candidate
  for (const word of c.split(/\s+/)) {
    if (levenshtein(q, word) <= maxDist) return true;
  }
  // Also check prefix windows of candidate for longer phrases
  if (q.length <= c.length && levenshtein(q, c.slice(0, q.length)) <= maxDist) return true;
  return false;
}

export function fuzzySearch(query: string, fungus: Fungus, maxDist = 2): boolean {
  const names = [
    fungus.commonName,
    fungus.scientificName,
    ...fungus.aliases,
    ...fungus.synonyms,
  ];
  return names.some((n) => matchesQuery(query, n, maxDist));
}
