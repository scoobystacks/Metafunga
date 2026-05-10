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
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

// Allowed edit distance scales with query length to prevent short-query false positives
function allowedDist(queryLen: number): number {
  if (queryLen < 5) return 0; // no fuzzy for very short queries
  if (queryLen < 6) return 1; // 1 typo for 5-char queries
  return 2;                   // 2 typos for 6+ char queries
}

function matchesName(query: string, candidate: string): boolean {
  const q = query.toLowerCase();
  const c = candidate.toLowerCase();

  // Exact substring always wins
  if (c.includes(q)) return true;

  const dist = allowedDist(q.length);
  if (dist === 0) return false;

  // Compare against individual words, skipping words that are too short or
  // too different in length from the query (length diff alone would exceed budget)
  for (const word of c.split(/\s+/)) {
    if (word.length < 4) continue;
    if (Math.abs(word.length - q.length) > dist) continue;
    if (levenshtein(q, word) <= dist) return true;
  }

  return false;
}

export function fuzzySearch(query: string, fungus: Fungus): boolean {
  const names = [
    fungus.commonName,
    fungus.scientificName,
    ...fungus.aliases,
    ...fungus.synonyms,
  ];
  return names.some((n) => matchesName(query, n));
}
