import type { Fungus, Rank } from "../types";
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
