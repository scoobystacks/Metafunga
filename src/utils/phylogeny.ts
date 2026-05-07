import type { Fungus, Rank } from "../types";
import { RANKS } from "../types";

export function deepestSharedRank(guess: Fungus, target: Fungus): Rank | null {
  // Walk from most specific (species) toward most general (phylum).
  // Kingdom is always "Fungi" for both, so we stop at phylum.
  for (let i = RANKS.length - 1; i >= 1; i--) {
    const rank = RANKS[i];
    if (guess.taxonomy[rank] === target.taxonomy[rank]) {
      return rank;
    }
  }
  // They share only kingdom (always true) — return null to mean "kingdom only"
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
