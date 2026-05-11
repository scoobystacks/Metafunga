import type { Fungus, Guess, Rank } from "../types";
import { RANKS } from "../types";

export function deepestSharedRank(guess: Fungus, target: Fungus): Rank | null {
  for (let i = RANKS.length - 1; i >= 1; i--) {
    const rank = RANKS[i];
    if (guess.taxonomy[rank] === target.taxonomy[rank]) {
      return rank;
    }
  }
  return null;
}

export function ranksRevealedByMatch(matchRank: Rank | null): Set<Rank> {
  const revealed = new Set<Rank>(["kingdom"] as Rank[]);
  if (matchRank === null) return revealed;

  const matchIndex = RANKS.indexOf(matchRank);
  for (let i = 0; i <= matchIndex; i++) {
    revealed.add(RANKS[i]);
  }
  return revealed;
}

export function mergeRevealedRanks(existing: Set<Rank>, incoming: Set<Rank>): Set<Rank> {
  return new Set([...existing, ...incoming]);
}

export function rankLabel(rank: Rank): string {
  const labels: Record<Rank, string> = {
    kingdom: "Kingdom",
    phylum: "Phylum",
    class: "Class",
    order: "Order",
    family: "Family",
    genus: "Genus",
    species: "Species",
  };
  return labels[rank];
}

export function matchDescription(rank: Rank | null): string {
  if (rank === null) return "Kingdom match only";
  const labels: Record<Rank, string> = {
    kingdom: "Kingdom match",
    phylum: "Phylum match",
    class: "Class match",
    order: "Order match",
    family: "Family match",
    genus: "Genus match",
    species: "Exact match!",
  };
  return labels[rank];
}

export function matchDepth(rank: Rank | null): number {
  if (rank === null) return 0;
  return RANKS.indexOf(rank);
}

export function deepestRevealedRank(revealedRanks: Set<Rank>): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (revealedRanks.has(RANKS[i])) return RANKS[i];
  }
  return "kingdom";
}

export function nextHintableRank(revealedRanks: Set<Rank>): Rank | null {
  for (let i = 0; i < RANKS.length; i++) {
    if (!revealedRanks.has(RANKS[i])) return RANKS[i];
  }
  return null;
}

export function wikipediaUrl(value: string): string {
  return `https://en.wikipedia.org/wiki/${value.replace(/ /g, "_")}`;
}

export interface GuessCluster {
  rank: Rank;
  value: string;
  attachRank: Rank;
  guessFungusIds: string[];
}

export function computeGuessClusters(
  guesses: Guess[],
  target: Fungus,
  fungiMap: Map<string, Fungus>
): GuessCluster[] {
  const wrong = guesses.filter((g) => g.fungusId !== target.id);
  if (wrong.length < 2) return [];

  const clusterMap = new Map<string, { rank: Rank; value: string; ids: Set<string> }>();

  for (let i = 0; i < wrong.length; i++) {
    for (let j = i + 1; j < wrong.length; j++) {
      const f1 = fungiMap.get(wrong[i].fungusId);
      const f2 = fungiMap.get(wrong[j].fungusId);
      if (!f1 || !f2) continue;

      // Deepest pairwise shared rank between the two wrong guesses
      let sharedRank: Rank | null = null;
      for (let k = RANKS.length - 1; k >= 0; k--) {
        if (f1.taxonomy[RANKS[k]] === f2.taxonomy[RANKS[k]]) {
          sharedRank = RANKS[k];
          break;
        }
      }
      if (!sharedRank) continue;

      const sharedValue = f1.taxonomy[sharedRank];
      // Skip if this rank/value is on the target's own taxonomy path
      if (target.taxonomy[sharedRank] === sharedValue) continue;

      const key = `${sharedRank}:${sharedValue}`;
      if (!clusterMap.has(key)) {
        clusterMap.set(key, { rank: sharedRank, value: sharedValue, ids: new Set() });
      }
      const c = clusterMap.get(key)!;
      c.ids.add(wrong[i].fungusId);
      c.ids.add(wrong[j].fungusId);
    }
  }

  const result: GuessCluster[] = [];

  for (const [, { rank, value, ids }] of clusterMap) {
    if (ids.size < 2) continue;

    // attachRank: deepest rank where every cluster member shares the target's value
    const rankIdx = RANKS.indexOf(rank);
    let attachRank: Rank = RANKS[0];
    for (let k = rankIdx - 1; k >= 0; k--) {
      const r = RANKS[k];
      const allShare = [...ids].every((id) => {
        const f = fungiMap.get(id);
        return f && f.taxonomy[r] === target.taxonomy[r];
      });
      if (allShare) {
        attachRank = r;
        break;
      }
    }

    result.push({ rank, value, attachRank, guessFungusIds: [...ids] });
  }

  return result;
}
