export type Rank = "kingdom" | "phylum" | "class" | "order" | "family" | "genus" | "species";

export const RANKS: Rank[] = ["kingdom", "phylum", "class", "order", "family", "genus", "species"];

export interface Taxonomy {
  kingdom: "Fungi";
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface Morphology {
  capShape: string;
  gillAttachment: string;
  sporeColor: string;
  hasRing: boolean;
  hasVolva: boolean;
}

export type Edibility = "choice" | "edible" | "inedible" | "toxic" | "deadly" | "psychoactive";
export type Ecology = "mycorrhizal" | "saprotrophic" | "parasitic";

export type Difficulty = "easy" | "medium" | "hard";

export interface Fungus {
  id: string;
  scientificName: string;
  commonName: string;
  aliases: string[];
  synonyms: string[];
  taxonomy: Taxonomy;
  edibility: Edibility;
  ecology: Ecology;
  habitat: string;
  naRange: string;
  morphology: Morphology;
  imageUrl: string;
  imageAttribution: string;
  crossSectionUrl: string | null;
  gbifId: number;
  /** 0 = ubiquitous, 100 = extremely rare */
  rarity: number;
  /** 0 = unknown, 100 = household name */
  fame: number;
  difficulty: Difficulty;
  funFact: string;
}

export interface Guess {
  fungusId: string;
  scientificName: string;
  commonName: string;
  deepestMatchRank: Rank | null;
}

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  targetId: string;
  guesses: Guess[];
  revealedRanks: Set<Rank>;
  hintRevealedRanks: Set<Rank>;
  hintsUsed: number;
  status: GameStatus;
  dayNumber: number;
}
